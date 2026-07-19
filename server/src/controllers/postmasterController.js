const prisma = require('../config/database');
const imapService = require('../services/imapService');
const { logAction } = require('./auditLogController');

exports.getSources = async (req, res, next) => {
  try {
    const accounts = await prisma.postmasterAccount.findMany({
      where: { status: 'Activated' },
      select: { id: true, domain: true, serverName: true, providerName: true },
      orderBy: { domain: 'asc' },
    });
    res.json({ data: accounts });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { accountId, search, dateFrom, dateTo, limit } = req.body;
    if (!accountId) return res.status(400).json({ error: 'accountId is required.' });

    const where = { accountId: parseInt(accountId, 10), isDeleted: false };
    if (search) {
      where.OR = [
        { from: { contains: search } },
        { subject: { contains: search } },
        { messageId: { contains: search } },
      ];
    }
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.date.lte = to;
      }
    }

    const take = Math.min(parseInt(limit, 10) || 100, 10000);
    const [messages, total] = await Promise.all([
      prisma.postmasterMessage.findMany({
        where,
        orderBy: { date: 'desc' },
        take,
        select: {
          id: true, messageId: true, uid: true, from: true, subject: true, date: true,
          isBlacklisted: true, createdAt: true,
        },
      }),
      prisma.postmasterMessage.count({ where }),
    ]);

    const uniqueSenders = new Set(messages.map(m => m.from)).size;
    const blacklistedCount = messages.filter(m => m.isBlacklisted).length;

    const account = await prisma.postmasterAccount.findUnique({
      where: { id: parseInt(accountId, 10) },
      select: { lastChecked: true },
    });

    res.json({
      data: messages,
      summary: {
        messageCount: total,
        uniqueSenders,
        blacklistedCount,
        lastRefreshAt: account?.lastChecked,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshMailbox = async (req, res, next) => {
  const { accountId } = req.body;
  if (!accountId) return res.status(400).json({ error: 'accountId is required.' });

  const id = parseInt(accountId, 10);
  let run = null;
  try {
    const account = await prisma.postmasterAccount.findUnique({ where: { id } });
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    if (!account.imapHost || !account.username || !account.password) {
      return res.status(400).json({ error: 'IMAP credentials not configured.' });
    }

    run = await prisma.postmasterRun.create({
      data: { accountId: id, status: 'running' },
    });

    const imapMessages = await imapService.fetchMessageSummaries(account, { limit: 10000 });

    let newCount = 0;
    for (const msg of imapMessages) {
      const existing = await prisma.postmasterMessage.findUnique({
        where: { accountId_messageId: { accountId: id, messageId: msg.messageId } },
      });
      if (!existing) {
        await prisma.postmasterMessage.create({
          data: {
            accountId: id,
            messageId: msg.messageId,
            uid: msg.uid,
            from: msg.from,
            subject: msg.subject,
            date: msg.date,
          },
        });
        newCount++;
      }
    }

    await prisma.postmasterRun.update({
      where: { id: run.id },
      data: { status: 'completed', messageCount: imapMessages.length, newCount, finishedAt: new Date() },
    });

    await prisma.postmasterAccount.update({
      where: { id },
      data: { lastChecked: new Date(), connectionStatus: 'Connected', lastError: null },
    });

    await logAction(req.user?.email || 'system', 'Postmaster', 'Refresh', id, account.domain);

    const messages = await prisma.postmasterMessage.findMany({
      where: { accountId: id, isDeleted: false },
      orderBy: { date: 'desc' },
      take: 100,
      select: {
        id: true, messageId: true, uid: true, from: true, subject: true, date: true,
        isBlacklisted: true, createdAt: true,
      },
    });

    const total = await prisma.postmasterMessage.count({ where: { accountId: id, isDeleted: false } });
    const uniqueSenders = new Set(messages.map(m => m.from)).size;
    const blacklistedCount = messages.filter(m => m.isBlacklisted).length;

    res.json({
      data: messages,
      summary: { messageCount: total, uniqueSenders, blacklistedCount, lastRefreshAt: new Date() },
      message: `Refresh complete. ${newCount} new messages found.`,
    });
  } catch (error) {
    if (run) {
      try {
        await prisma.postmasterRun.update({
          where: { id: run.id },
          data: { status: 'failed', errorLog: error.message, finishedAt: new Date() },
        });
      } catch {}
    }
    try {
      await prisma.postmasterAccount.update({
        where: { id },
        data: { connectionStatus: 'Failed', lastError: error.message },
      });
    } catch {}
    next(error);
  }
};

exports.getMessageDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const messageId = parseInt(id, 10);
    if (isNaN(messageId)) return res.status(400).json({ error: 'Invalid ID.' });

    const message = await prisma.postmasterMessage.findUnique({ where: { id: messageId } });
    if (!message) return res.status(404).json({ error: 'Message not found.' });

    res.json({
      data: {
        id: message.id,
        messageId: message.messageId,
        from: message.from,
        to: message.to,
        subject: message.subject,
        date: message.date,
        bodyHtml: message.bodyHtml,
        bodyText: message.bodyText,
        rawHeaders: message.rawHeaders,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessages = async (req, res, next) => {
  try {
    const { messageIds, blacklist } = req.body;
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'messageIds array is required.' });
    }

    const ids = messageIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (ids.length === 0) return res.status(400).json({ error: 'No valid IDs.' });

    const messages = await prisma.postmasterMessage.findMany({
      where: { id: { in: ids } },
      select: { id: true, from: true, accountId: true },
    });

    if (blacklist) {
      const senders = [...new Set(messages.map(m => m.from).filter(Boolean))];
      if (senders.length > 0) {
        await prisma.blacklist.createMany({
          data: senders.map(email => ({ email, status: 'Activated' })),
          skipDuplicates: true,
        });
      }
      await prisma.postmasterMessage.updateMany({
        where: { id: { in: ids } },
        data: { isBlacklisted: true },
      });
    }

    await prisma.postmasterMessage.updateMany({
      where: { id: { in: ids } },
      data: { isDeleted: true },
    });

    await logAction(req.user?.email || 'system', 'Postmaster', blacklist ? 'Delete+Blacklist' : 'Delete', ids[0], `${ids.length} messages`);

    res.json({ message: `${ids.length} message(s) deleted.${blacklist ? ' Senders blacklisted.' : ''}` });
  } catch (error) {
    next(error);
  }
};

exports.exportReplyAccounts = async (req, res, next) => {
  try {
    const { accountId } = req.body;
    if (!accountId) return res.status(400).json({ error: 'accountId is required.' });

    const account = await prisma.postmasterAccount.findUnique({
      where: { id: parseInt(accountId, 10) },
      select: { domain: true, imapHost: true, imapPort: true, username: true, password: true, smtpHost: true, smtpPort: true },
    });
    if (!account) return res.status(404).json({ error: 'Account not found.' });

    const csv = `Domain,IMAP Host,IMAP Port,Username,SMTP Host,SMTP Port\n"${account.domain}","${account.imapHost || ''}","${account.imapPort || ''}","${account.username || ''}","${account.smtpHost || ''}","${account.smtpPort || ''}"`;
    const contentBase64 = Buffer.from(csv).toString('base64');

    await logAction(req.user?.email || 'system', 'Postmaster', 'Export', account.accountId, account.domain);

    res.json({
      data: {
        contentBase64,
        fileName: `postmaster_reply_accounts_${account.domain}.csv`,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRuns = async (req, res, next) => {
  try {
    const runs = await prisma.postmasterRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 200,
      select: {
        id: true, accountId: true, status: true, messageCount: true, newCount: true,
        errorLog: true, startedAt: true, finishedAt: true,
      },
    });

    const accountIds = [...new Set(runs.map(r => r.accountId))];
    const accounts = await prisma.postmasterAccount.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, domain: true },
    });
    const accountMap = Object.fromEntries(accounts.map(a => [a.id, a.domain]));

    const enriched = runs.map(r => ({ ...r, domain: accountMap[r.accountId] || 'Unknown' }));
    res.json({ data: enriched });
  } catch (error) {
    next(error);
  }
};

exports.getRunLogs = async (req, res, next) => {
  try {
    const { id } = req.params;
    const runId = parseInt(id, 10);
    if (isNaN(runId)) return res.status(400).json({ error: 'Invalid ID.' });

    const run = await prisma.postmasterRun.findUnique({
      where: { id: runId },
      select: { id: true, status: true, errorLog: true, messageCount: true, newCount: true, startedAt: true, finishedAt: true },
    });
    if (!run) return res.status(404).json({ error: 'Run not found.' });

    res.json({ data: run });
  } catch (error) {
    next(error);
  }
};

exports.testConnection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accountId = parseInt(id, 10);
    if (isNaN(accountId)) return res.status(400).json({ error: 'Invalid ID.' });

    const account = await prisma.postmasterAccount.findUnique({ where: { id: accountId } });
    if (!account) return res.status(404).json({ error: 'Account not found.' });
    if (!account.imapHost || !account.username || !account.password) {
      return res.status(400).json({ error: 'IMAP credentials not configured.' });
    }

    const result = await imapService.testConnection(account);

    await prisma.postmasterAccount.update({
      where: { id: accountId },
      data: {
        connectionStatus: result.success ? 'Connected' : 'Failed',
        lastError: result.success ? null : result.error,
        lastChecked: new Date(),
      },
    });

    res.json({
      success: result.success,
      exists: result.exists,
      error: result.error,
      message: result.success ? `Connected. ${result.exists} messages in INBOX.` : `Failed: ${result.error}`,
    });
  } catch (error) {
    next(error);
  }
};
