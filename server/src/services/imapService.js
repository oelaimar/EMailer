const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

function buildConfig(account) {
  const port = account.imapPort || 993;
  const secure = port === 993;
  return {
    host: account.imapHost,
    port,
    secure,
    auth: {
      user: account.username,
      pass: account.password,
    },
    logger: false,
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
  };
}

async function testConnection(account) {
  const client = new ImapFlow(buildConfig(account));
  try {
    await client.connect();
    const mailbox = await client.getMailbox('INBOX');
    await client.logout();
    return { success: true, exists: mailbox.exists };
  } catch (err) {
    try { await client.logout(); } catch {}
    return { success: false, error: err.message };
  }
}

async function fetchMessageSummaries(account, options = {}) {
  const client = new ImapFlow(buildConfig(account));
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const limit = options.limit || 100;
      const uids = [];
      for await (const msg of client.fetch('1:*', {
        envelope: true,
        uid: true,
        flags: true,
      })) {
        uids.push(msg);
        if (uids.length >= limit * 2) break;
      }

      const messages = uids.reverse().slice(0, limit).map((msg) => ({
        uid: msg.uid,
        messageId: msg.envelope?.messageId || `uid-${msg.uid}`,
        from: msg.envelope?.from?.map(f => f.mailbox + '@' + f.host).join(', ') || '',
        subject: msg.envelope?.subject || '',
        date: msg.envelope?.date || null,
        flags: Array.isArray(msg.flags) ? [...msg.flags] : [],
      }));

      return messages;
    } finally {
      lock.release();
    }
  } finally {
    try { await client.logout(); } catch {}
  }
}

async function fetchMessageDetail(account, uid) {
  const client = new ImapFlow(buildConfig(account));
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const msg = await client.fetchOne(uid, { source: true, uid: true }, { uid: true });
      if (!msg || !msg.source) return null;

      const parsed = await simpleParser(msg.source);
      return {
        uid,
        messageId: parsed.messageId || '',
        from: parsed.from?.text || '',
        to: parsed.to?.text || '',
        subject: parsed.subject || '',
        date: parsed.date || null,
        bodyHtml: parsed.html || '',
        bodyText: parsed.text || '',
        rawHeaders: msg.source.split('\r\n\r\n')[0] || '',
      };
    } finally {
      lock.release();
    }
  } finally {
    try { await client.logout(); } catch {}
  }
}

async function deleteMessage(account, uid) {
  const client = new ImapFlow(buildConfig(account));
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      await client.messageFlagsAdd(uid, ['\\Deleted'], { uid: true });
      await client.expunge();
      return true;
    } finally {
      lock.release();
    }
  } finally {
    try { await client.logout(); } catch {}
  }
}

module.exports = {
  testConnection,
  fetchMessageSummaries,
  fetchMessageDetail,
  deleteMessage,
};
