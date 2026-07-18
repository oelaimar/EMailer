const prisma = require('../config/database');
const { paginate, buildSort } = require('../utils/helpers');
const sshService = require('../services/sshService');

const mtaSelect = {
  id: true, name: true, serverProviderId: true, status: true, hostname: true,
  mainIp: true, sshPort: true, os: true, loginType: true, username: true,
  ips: true, sshStatus: true, country: true, expirationDate: true,
  lastChecked: true, installationStatus: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, os, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(os && { os }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { mainIp: { contains: search } },
          { hostname: { contains: search } },
          { country: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'mainIp', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.mtaServer.findMany({ where, orderBy, skip, take: limit, select: mtaSelect }),
      prisma.mtaServer.count({ where }),
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
    const server = await prisma.mtaServer.findUnique({ where: { id }, select: mtaSelect });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });
    res.json(server);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, serverProviderId, status, hostname, mainIp, sshPort, os, loginType, username, password, expirationDate } = req.body;
    if (!name || !mainIp) {
      return res.status(400).json({ error: 'Name and Main IP are required.' });
    }

    const server = await prisma.mtaServer.create({
      data: {
        name,
        serverProviderId: serverProviderId ? parseInt(serverProviderId, 10) : null,
        status: status || 'Activated',
        hostname,
        mainIp,
        sshPort: parseInt(sshPort, 10) || 22,
        os: os || 'ubuntu',
        loginType: loginType || 'user-pass',
        username: username || 'root',
        password,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
      select: mtaSelect,
    });

    res.status(201).json(server);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, serverProviderId, status, hostname, mainIp, sshPort, os, loginType, username, password, expirationDate } = req.body;

    const server = await prisma.mtaServer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(serverProviderId !== undefined && { serverProviderId: serverProviderId ? parseInt(serverProviderId, 10) : null }),
        ...(status !== undefined && { status }),
        ...(hostname !== undefined && { hostname }),
        ...(mainIp !== undefined && { mainIp }),
        ...(sshPort !== undefined && { sshPort: parseInt(sshPort, 10) }),
        ...(os !== undefined && { os }),
        ...(loginType !== undefined && { loginType }),
        ...(username !== undefined && { username }),
        ...(password !== undefined && { password }),
        ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
      },
      select: mtaSelect,
    });

    res.json(server);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.mtaServer.delete({ where: { id } });
    res.json({ message: 'MTA server deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.check = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    const result = await sshService.checkServer(server.mainIp, server.sshPort, server.username, server.password);

    await prisma.mtaServer.update({
      where: { id: server.id },
      data: { sshStatus: result.sshStatus, lastChecked: new Date(), status: result.status === 'ok' ? 'Activated' : 'Inactivated' },
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.bulkCheck = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'IDs array is required.' });

    const results = await Promise.all(
      ids.map(async (id) => {
        const parsedId = parseInt(id, 10);
        const server = await prisma.mtaServer.findUnique({ where: { id: parsedId } });
        if (server) {
          const result = await sshService.checkServer(server.mainIp, server.sshPort, server.username, server.password);
          await prisma.mtaServer.update({
            where: { id: server.id },
            data: { sshStatus: result.sshStatus, lastChecked: new Date() },
          });
          return { id: server.id, name: server.name, ...result };
        }
        return { id: parsedId, status: 'not_found' };
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
    if (!action || !ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Action and IDs array are required.' });

    const intIds = ids.map((id) => parseInt(id, 10));

    switch (action) {
      case 'activate':
        await prisma.mtaServer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.mtaServer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.mtaServer.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.beginInstallation = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    await prisma.mtaServer.update({ where: { id }, data: { installationStatus: 'Installing' } });

    const installScript = `bash <(curl -s https://raw.githubusercontent.com/mta/installer/main/install.sh) 2>&1`;

    try {
      const result = await sshService.executeCommand(server.mainIp, server.sshPort, server.username, server.password, installScript, 120000);
      await prisma.mtaServer.update({ where: { id }, data: { installationStatus: 'Installed' } });
      res.json({ status: 'ok', output: result.stdout });
    } catch (err) {
      await prisma.mtaServer.update({ where: { id }, data: { installationStatus: 'Failed' } });
      res.json({ status: 'error', output: err.message });
    }
  } catch (error) {
    next(error);
  }
};

exports.getInstallationLogs = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    try {
      const result = await sshService.executeCommand(server.mainIp, server.sshPort, server.username, server.password, 'cat /var/log/install.log 2>/dev/null || echo "No logs available"', 10000);
      res.json({ logs: result.stdout });
    } catch {
      res.json({ logs: 'Unable to fetch logs.' });
    }
  } catch (error) {
    next(error);
  }
};

exports.configureIps = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    const ips = await sshService.getServerIps(server.mainIp, server.sshPort, server.username, server.password);
    const updated = await prisma.mtaServer.update({
      where: { id },
      data: { ips: ips.join(', '), mainIp: ips[0] || server.mainIp },
      select: mtaSelect,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.extractRdns = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    try {
      const result = await sshService.executeCommand(server.mainIp, server.sshPort, server.username, server.password, `host ${server.mainIp} | awk '{print $NF}'`, 10000);
      res.json({ rdns: result.stdout });
    } catch {
      res.json({ rdns: 'Unable to extract RDNS.' });
    }
  } catch (error) {
    next(error);
  }
};

exports.generateDkim = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    try {
      const result = await sshService.executeCommand(server.mainIp, server.sshPort, server.username, server.password,
        'opendkim-genkey -s default -d $(hostname -f) && cat /etc/opendkim/keys/default.txt 2>/dev/null || echo "DKIM generation completed"', 15000);
      res.json({ dkim: result.stdout });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } catch (error) {
    next(error);
  }
};

exports.beginBulkInstallation = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'IDs array is required.' });

    const intIds = ids.map((id) => parseInt(id, 10));
    await prisma.mtaServer.updateMany({ where: { id: { in: intIds } }, data: { installationStatus: 'Installing' } });

    res.json({ message: 'Bulk installation started.', count: intIds.length });
  } catch (error) {
    next(error);
  }
};

exports.getBulkInstallationLogs = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'IDs array is required.' });

    const intIds = ids.map((id) => parseInt(id, 10));
    const servers = await prisma.mtaServer.findMany({ where: { id: { in: intIds } }, select: { id: true, name: true, installationStatus: true } });

    res.json({ servers });
  } catch (error) {
    next(error);
  }
};
