const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSort } = require('../utils/helpers');
const { checkSmtpServer } = require('../services/smtpCheckService');

const smtpSelect = {
  id: true,
  name: true,
  host: true,
  port: true,
  encryption: true,
  status: true,
  username: true,
  proxyIp: true,
  proxyPort: true,
  proxyUsername: true,
  serverProviderId: true,
  expirationDate: true,
  lastChecked: true,
  createdAt: true,
  updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, encryption, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(encryption && { encryption }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { host: { contains: search } },
          { username: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'host', 'port', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.smtpServer.findMany({ where, orderBy, skip, take: limit, select: smtpSelect }),
      prisma.smtpServer.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, host, port, encryption, status, username, password, proxyIp, proxyPort, proxyUsername, proxyPassword, serverProviderId, expirationDate } = req.body;

    if (!name || !host) {
      return res.status(400).json({ error: 'Name and host are required.' });
    }

    const { validatePort } = require('../utils/validation');
    const parsedPort = parseInt(port, 10) || 25;
    if (!validatePort(parsedPort)) {
      return res.status(400).json({ error: 'Port must be between 1 and 65535.' });
    }

    const server = await prisma.smtpServer.create({
      data: {
        name,
        host,
        port: parsedPort,
        encryption: encryption || 'None',
        status: status || 'Activated',
        username,
        password,
        proxyIp,
        proxyPort: proxyPort ? parseInt(proxyPort, 10) : null,
        proxyUsername,
        proxyPassword,
        serverProviderId: serverProviderId ? parseInt(serverProviderId, 10) : null,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
      select: smtpSelect,
    });

    logAction(req.user?.email, 'SmtpServer', 'create', server.id, server.name, req.user?.id).catch(() => {});
    res.status(201).json(server);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.smtpServer.findUnique({ where: { id }, select: smtpSelect });
    if (!server) return res.status(404).json({ error: 'SMTP server not found.' });
    res.json(server);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, host, port, encryption, status, username, password, proxyIp, proxyPort, proxyUsername, proxyPassword, serverProviderId, expirationDate } = req.body;

    const server = await prisma.smtpServer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(host !== undefined && { host }),
        ...(port !== undefined && { port: parseInt(port, 10) }),
        ...(encryption !== undefined && { encryption }),
        ...(status !== undefined && { status }),
        ...(username !== undefined && { username }),
        ...(password !== undefined && { password }),
        ...(proxyIp !== undefined && { proxyIp }),
        ...(proxyPort !== undefined && { proxyPort: proxyPort ? parseInt(proxyPort, 10) : null }),
        ...(proxyUsername !== undefined && { proxyUsername }),
        ...(proxyPassword !== undefined && { proxyPassword }),
        ...(serverProviderId !== undefined && { serverProviderId: serverProviderId ? parseInt(serverProviderId, 10) : null }),
        ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
      },
      select: smtpSelect,
    });

    logAction(req.user?.email, 'SmtpServer', 'update', server.id, server.name, req.user?.id).catch(() => {});
    res.json(server);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.smtpServer.delete({ where: { id } });
    logAction(req.user?.email, 'SmtpServer', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'SMTP server deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.check = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.smtpServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'SMTP server not found.' });

    const result = await checkSmtpServer({
      host: server.host,
      port: server.port,
      encryption: server.encryption,
      username: server.username,
      password: server.password,
    });

    await prisma.smtpServer.update({
      where: { id: server.id },
      data: { status: result.status, lastChecked: new Date() },
    });

    res.json({ status: result.status, message: result.message });
  } catch (error) {
    next(error);
  }
};

exports.bulkCheck = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'IDs array is required.' });
    }

    const parsedIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
    if (parsedIds.length === 0) return res.status(400).json({ error: 'No valid IDs provided.' });

    const servers = await prisma.smtpServer.findMany({
      where: { id: { in: parsedIds } },
      select: { id: true, name: true, host: true, port: true, encryption: true, username: true, password: true },
    });
    const serverMap = new Map(servers.map((s) => [s.id, s]));

    const results = await Promise.all(
      parsedIds.map(async (id) => {
        const server = serverMap.get(id);
        if (!server) return { id, status: 'not_found' };
        const result = await checkSmtpServer({
          host: server.host,
          port: server.port,
          encryption: server.encryption,
          username: server.username,
          password: server.password,
        });
        await prisma.smtpServer.update({
          where: { id: server.id },
          data: { status: result.status, lastChecked: new Date() },
        });
        return { id: server.id, name: server.name, status: result.status, message: result.message };
      })
    );

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

exports.bulkAction = async (req, res, next) => {
  try {
    const { action, ids } = req.body;
    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Action and IDs array are required.' });
    }

    const intIds = ids.map((id) => parseInt(id, 10));

    switch (action) {
      case 'activate':
        await prisma.smtpServer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.smtpServer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.smtpServer.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
