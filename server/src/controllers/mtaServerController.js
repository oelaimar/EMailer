const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
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

    const { validatePort } = require('../utils/validation');
    const parsedSshPort = parseInt(sshPort, 10) || 22;
    if (!validatePort(parsedSshPort)) {
      return res.status(400).json({ error: 'SSH port must be between 1 and 65535.' });
    }

    const server = await prisma.mtaServer.create({
      data: {
        name,
        serverProviderId: serverProviderId ? parseInt(serverProviderId, 10) : null,
        status: status || 'Activated',
        hostname,
        mainIp,
        sshPort: parsedSshPort,
        os: os || 'ubuntu',
        loginType: loginType || 'user-pass',
        username: username || 'root',
        password,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
      select: mtaSelect,
    });

    logAction(req.user?.email, 'MtaServer', 'create', server.id, server.name, req.user?.id).catch(() => {});
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

    logAction(req.user?.email, 'MtaServer', 'update', server.id, server.name, req.user?.id).catch(() => {});
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
    logAction(req.user?.email, 'MtaServer', 'delete', id, null, req.user?.id).catch(() => {});
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

exports.bulkAdd = async (req, res, next) => {
  try {
    const { prefix, serverProviderId, os, username, password, mainIps } = req.body;
    if (!prefix || !mainIps) {
      return res.status(400).json({ error: 'Prefix and Main IPs list are required.' });
    }

    const ipList = mainIps.split('\n').map(ip => ip.trim()).filter(Boolean);
    if (ipList.length === 0) {
      return res.status(400).json({ error: 'At least one IP is required.' });
    }

    const created = await prisma.$transaction(
      ipList.map((ip, i) =>
        prisma.mtaServer.create({
          data: {
            name: `${prefix}-${String(i + 1).padStart(3, '0')}`,
            serverProviderId: serverProviderId ? parseInt(serverProviderId, 10) : null,
            os: os || 'ubuntu',
            mainIp: ip,
            loginType: 'user-pass',
            username: username || 'root',
            password: password || null,
            status: 'Activated',
          },
          select: mtaSelect,
        })
      )
    );

    logAction(req.user?.email, 'MtaServer', 'bulk-create', null, `Bulk added ${created.length} servers with prefix "${prefix}"`, req.user?.id).catch(() => {});
    res.status(201).json({ message: `${created.length} servers created.`, servers: created });
  } catch (error) {
    next(error);
  }
};

exports.getServerInfo = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    const info = await sshService.getServerInfo(server.mainIp, server.sshPort, server.username, server.password);

    const domains = await prisma.domain.findMany({ where: { status: 'Activated' }, select: { id: true, name: true } });

    const existingIps = server.ips ? server.ips.split(',').map(ip => ip.trim()).filter(Boolean) : [server.mainIp];

    res.json({
      server: { id: server.id, name: server.name, mainIp: server.mainIp, os: server.os, ...info },
      domains: domains.map(d => ({ id: d.id, name: d.name })),
      ipsV4: info.ipsV4.length ? info.ipsV4 : existingIps,
      ipsV6: info.ipsV6,
    });
  } catch (error) {
    next(error);
  }
};

exports.configureAdditionalIps = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { lines } = req.body;
    if (!lines) return res.status(400).json({ error: 'IP lines are required.' });

    const server = await prisma.mtaServer.findUnique({ where: { id } });
    if (!server) return res.status(404).json({ error: 'MTA server not found.' });

    const result = await sshService.configureAdditionalIps(server.mainIp, server.sshPort, server.username, server.password, server.os, lines);

    if (result.status === 'ok') {
      const updated = await prisma.mtaServer.update({
        where: { id },
        data: { ips: lines.split('\n').map(l => l.trim()).filter(Boolean).join(', ') },
        select: mtaSelect,
      });
      res.json({ ...updated, output: result.output });
    } else {
      res.status(500).json({ error: result.output });
    }
  } catch (error) {
    next(error);
  }
};

exports.executeServersCommand = async (req, res, next) => {
  try {
    const { servers, action } = req.body;
    if (!servers || !Array.isArray(servers) || !action) {
      return res.status(400).json({ error: 'Servers array and action are required.' });
    }

    const results = await Promise.all(
      servers.map(async (serverId) => {
        const id = parseInt(serverId, 10);
        const server = await prisma.mtaServer.findUnique({ where: { id } });
        if (!server) return { id, name: `Server #${id}`, output: 'Server not found' };
        const result = await sshService.executeServersCommand(server.mainIp, server.sshPort, server.username, server.password, action);
        return { id: server.id, name: server.name, output: result.output };
      })
    );

    logAction(req.user?.email, 'MtaServer', 'execute-command', null, `Executed "${action}" on ${results.length} servers`, req.user?.id).catch(() => {});
    res.json({ results });
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

    const installScript = `bash <(curl -s https://raw.githubusercontent.com/mta/installer/main/install.sh) 2>&1`;

    const results = await Promise.all(
      intIds.map(async (id) => {
        const server = await prisma.mtaServer.findUnique({ where: { id } });
        if (!server) return { id, status: 'not_found', output: 'Server not found' };
        try {
          const result = await sshService.executeCommand(server.mainIp, server.sshPort, server.username, server.password, installScript, 120000);
          await prisma.mtaServer.update({ where: { id }, data: { installationStatus: 'Installed' } });
          return { id, status: 'ok', output: result.stdout };
        } catch (err) {
          await prisma.mtaServer.update({ where: { id }, data: { installationStatus: 'Failed' } });
          return { id, status: 'error', output: err.message };
        }
      })
    );

    logAction(req.user?.email, 'MtaServer', 'bulk-install', null, `Bulk install on ${intIds.length} servers`, req.user?.id).catch(() => {});
    res.json({ message: 'Bulk installation completed.', results });
  } catch (error) {
    next(error);
  }
};

exports.getBulkInstallationLogs = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'IDs array is required.' });

    const intIds = ids.map((id) => parseInt(id, 10));

    const results = await Promise.all(
      intIds.map(async (id) => {
        const server = await prisma.mtaServer.findUnique({ where: { id }, select: { id: true, name: true, installationStatus: true, mainIp: true, sshPort: true, username: true, password: true } });
        if (!server) return { id, name: `Server #${id}`, logs: 'Server not found' };
        const serverPassword = server.password;
        try {
          const result = await sshService.executeCommand(server.mainIp, server.sshPort, server.username, serverPassword, 'cat /var/log/install.log 2>/dev/null || echo "No logs available"', 10000);
          return { id: server.id, name: server.name, status: server.installationStatus, logs: result.stdout };
        } catch {
          return { id: server.id, name: server.name, status: server.installationStatus, logs: 'Unable to fetch logs.' };
        }
      })
    );

    res.json({ servers: results });
  } catch (error) {
    next(error);
  }
};
