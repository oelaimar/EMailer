const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, ip: true, port: true, username: true, type: true, status: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, type, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(search && { OR: [{ ip: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'ip', 'port', 'type', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.proxy.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.proxy.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const item = await prisma.proxy.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Proxy not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { ip, port, username, password, type, status } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP is required.' });
    if (!port) return res.status(400).json({ error: 'Port is required.' });

    const item = await prisma.proxy.create({
      data: {
        ip,
        port: parseInt(port, 10),
        username: username || null,
        password: password || null,
        type: type || 'HTTP',
        status: status || 'Activated',
      },
      select,
    });

    logAction(req.user?.email, 'Proxy', 'create', item.id, item.ip, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { ip, port, username, password, type, status } = req.body;

    const item = await prisma.proxy.update({
      where: { id },
      data: {
        ...(ip !== undefined && { ip }),
        ...(port !== undefined && { port: parseInt(port, 10) }),
        ...(username !== undefined && { username: username || null }),
        ...(password !== undefined && { password: password || null }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
      },
      select,
    });

    logAction(req.user?.email, 'Proxy', 'update', item.id, item.ip, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.proxy.delete({ where: { id } });
    logAction(req.user?.email, 'Proxy', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Proxy deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.bulkAction = async (req, res, next) => {
  try {
    const { action, ids } = req.body;
    if (!action || !ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Action and IDs array are required.' });

    const intIds = ids.map((id) => parseInt(id, 10));

    switch (action) {
      case 'activate':
        await prisma.proxy.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.proxy.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.proxy.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.listByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const allowedTypes = ['HTTP', 'SOCKS5'];
    if (!allowedTypes.includes(type)) return res.status(400).json({ error: 'Invalid type.' });

    const data = await prisma.proxy.findMany({
      where: { type, status: 'Activated' },
      select: { id: true, ip: true, port: true, username: true },
      orderBy: { ip: 'asc' },
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

exports.installOnServers = async (req, res, next) => {
  try {
    const { serverIds, httpPort, socksPort, username, password } = req.body;
    if (!serverIds || !Array.isArray(serverIds) || serverIds.length === 0) {
      return res.status(400).json({ error: 'Select at least one server.' });
    }

    const intIds = serverIds.map((id) => parseInt(id, 10));
    const servers = await prisma.mtaServer.findMany({ where: { id: { in: intIds } } });

    if (servers.length === 0) return res.status(404).json({ error: 'No servers found.' });

    const sshService = require('../services/sshService');
    const results = [];

    for (const server of servers) {
      try {
        const installCmd = [
          'apt-get update -qq',
          'apt-get install -y -qq squid squid-common',
          `sed -i 's/#http_port 3128/http_port ${httpPort || 3128}/' /etc/squid/squid.conf`,
          socksPort ? `echo 'http_port ${socksPort}' >> /etc/squid/squid.conf` : '',
          username && password ? `echo 'http_access allow ${username}' >> /etc/squid/squid.conf` : '',
          'service squid restart',
        ].filter(Boolean).join(' && ');

        await sshService.executeCommand(server, installCmd);

        const proxyData = {
          ip: server.mainIp,
          port: parseInt(httpPort, 10) || 3128,
          username: username || null,
          password: password || null,
          type: 'HTTP',
          status: 'Activated',
        };

        const existing = await prisma.proxy.findFirst({ where: { ip: proxyData.ip, port: proxyData.port } });
        if (!existing) {
          await prisma.proxy.create({ data: proxyData });
        }

        results.push({ server: server.name, status: 'Success', message: `Squid installed on port ${httpPort || 3128}` });
      } catch (e) {
        results.push({ server: server.name, status: 'Failed', message: e.message });
      }
    }

    logAction(req.user?.email, 'Proxy', 'install', null, `Installed proxy on ${results.filter((r) => r.status === 'Success').length}/${servers.length} servers`, req.user?.id).catch(() => {});
    res.json({ results });
  } catch (error) {
    next(error);
  }
};
