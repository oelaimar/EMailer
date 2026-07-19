const prisma = require('../config/database');
const dns = require('dns').promises;
const imapService = require('../services/imapService');

exports.spfCheck = async (req, res, next) => {
  try {
    const { domains } = req.body;
    if (!domains || typeof domains !== 'string') return res.status(400).json({ error: 'Domains string is required.' });

    const domainList = domains.split('\n').map((d) => d.trim()).filter(Boolean);
    const results = [];

    for (const domain of domainList) {
      try {
        const records = await dns.resolveTxt(domain);
        const spf = records.flat().find((r) => r.startsWith('v=spf1'));
        results.push({ domain, spf: spf || 'No SPF record found', status: spf ? 'Pass' : 'Fail' });
      } catch (error) {
        results.push({ domain, spf: 'DNS lookup failed', status: 'Error' });
      }
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

exports.blacklistCheck = async (req, res, next) => {
  try {
    const { type, text } = req.body;
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text is required.' });

    const itemList = text.split('\n').map((t) => t.trim()).filter(Boolean);
    const blacklistDomains = [
      'zen.spamhaus.org', 'bl.spamcop.net', 'b.barracudacentral.org',
      'dnsbl-1.uceprotect.net', 'dnsbl.sorbs.net', 'spam.dnsbl.sorbs.net',
    ];

    const results = [];

    for (const item of itemList) {
      const itemResults = [];
      if (type === 'ips') {
        const reversedIp = item.split('.').reverse().join('.');
        for (const bl of blacklistDomains) {
          try {
            await dns.resolve(`${reversedIp}.${bl}`);
            itemResults.push({ blacklist: bl, status: 'Listed' });
          } catch {
            itemResults.push({ blacklist: bl, status: 'Clean' });
          }
        }
      } else {
        try {
          const addresses = await dns.resolve4(item);
          const ip = addresses[0];
          const reversedIp = ip.split('.').reverse().join('.');
          const blacklistDomains = [
            'zen.spamhaus.org', 'bl.spamcop.net', 'b.barracudacentral.org',
            'dnsbl-1.uceprotect.net', 'dnsbl.sorbs.net',
          ];
          for (const bl of blacklistDomains) {
            try {
              await dns.resolve(`${reversedIp}.${bl}`);
              itemResults.push({ blacklist: bl, status: 'Listed' });
            } catch {
              itemResults.push({ blacklist: bl, status: 'Clean' });
            }
          }
        } catch {
          itemResults.push({ blacklist: 'DNS', status: 'Could not resolve domain to IP' });
        }
      }
      results.push({ item, type, results: itemResults });
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

exports.extractValues = async (req, res, next) => {
  try {
    const { type, unique, text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });

    let results = [];
    const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
    const ipv6Regex = /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const senderRegex = /From:\s*(.+)/gi;

    switch (type) {
      case 'all-ips':
        results = text.match(ipv4Regex) || [];
        break;
      case 'all-ips-v4':
        results = text.match(ipv4Regex) || [];
        break;
      case 'all-ips-v6':
        results = text.match(ipv6Regex) || [];
        break;
      case 'all-emails':
        results = text.match(emailRegex) || [];
        break;
      case 'all-senders': {
        const matches = text.matchAll(senderRegex);
        results = [...matches].map((m) => m[1].trim());
        break;
      }
      default:
        results = text.match(ipv4Regex) || [];
    }

    if (unique === 'enabled') {
      results = [...new Set(results)];
    }

    res.json({ results: results.join('\n'), count: results.length });
  } catch (error) {
    next(error);
  }
};

exports.extractMailbox = async (req, res, next) => {
  try {
    const { mailboxId, limit: rawLimit } = req.body;
    if (!mailboxId) return res.status(400).json({ error: 'Mailbox ID is required.' });

    const mailbox = await prisma.mailbox.findUnique({ where: { id: parseInt(mailboxId, 10) } });
    if (!mailbox) return res.status(404).json({ error: 'Mailbox not found.' });

    const limit = Math.min(parseInt(rawLimit, 10) || 100, 500);
    const messages = await imapService.fetchMessageSummaries(mailbox, { limit });
    const emails = messages.map((m) => m.from).filter(Boolean);

    res.json({ results: [{ mailbox: mailbox.name, emails, count: emails.length }], total: emails.length });
  } catch (error) {
    next(error);
  }
};
