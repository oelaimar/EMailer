const prisma = require('../config/database');
const { paginate, buildSort } = require('../utils/helpers');
const { logAction } = require('./auditLogController');

exports.listCommands = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, sort, order } = req.query;

    const where = {
      ...(search && {
        OR: [
          { serverName: { contains: search } },
          { command: { contains: search } },
          { target: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'serverName', 'command', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.pmtaCommand.findMany({ where, orderBy, skip, take: limit }),
      prisma.pmtaCommand.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.createCommand = async (req, res, next) => {
  try {
    const { serverName, command, target, isps } = req.body;
    if (!serverName || !command) return res.status(400).json({ error: 'Server name and command are required.' });

    const item = await prisma.pmtaCommand.create({
      data: {
        serverName,
        command,
        target: target || null,
        isps: isps || null,
        status: 'Pending',
        createdBy: req.user?.email || 'admin',
      },
    });

    res.status(201).json(item);
    logAction(req.user?.email, 'PmtaCommand', 'create', item.id, `${item.serverName}: ${item.command}`, req.user?.id).catch(() => {});
  } catch (error) {
    next(error);
  }
};

exports.listSchedules = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
    };

    const orderBy = buildSort(sort, order, ['id', 'serverName', 'command', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.pmtaSchedule.findMany({ where, orderBy, skip, take: limit }),
      prisma.pmtaSchedule.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const { serverName, command, delay, delayUnit } = req.body;
    if (!serverName || !command) return res.status(400).json({ error: 'Server name and command are required.' });

    const item = await prisma.pmtaSchedule.create({
      data: {
        serverName,
        command,
        delay: delay || 0,
        delayUnit: delayUnit || 'seconds',
        status: 'Pending',
        startTime: new Date(),
        createdBy: req.user?.email || 'admin',
      },
    });

    res.status(201).json(item);
    logAction(req.user?.email, 'PmtaSchedule', 'create', item.id, `${item.serverName}: ${item.command}`, req.user?.id).catch(() => {});
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.pmtaSchedule.delete({ where: { id } });
    logAction(req.user?.email, 'PmtaSchedule', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Schedule deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.stopSchedule = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const item = await prisma.pmtaSchedule.update({
      where: { id },
      data: { status: 'Stopped', finishTime: new Date() },
    });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.listTemplates = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const [data, total] = await Promise.all([
      prisma.pmtaTemplate.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.pmtaTemplate.count(),
    ]);
    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const { name, content, status } = req.body;
    if (!name || !content) return res.status(400).json({ error: 'Name and content are required.' });

    const item = await prisma.pmtaTemplate.create({
      data: {
        name,
        content,
        status: status || 'Activated',
        createdBy: req.user?.email || 'admin',
      },
    });

    res.status(201).json(item);
    logAction(req.user?.email, 'PmtaTemplate', 'create', item.id, item.name, req.user?.id).catch(() => {});
  } catch (error) {
    next(error);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, content, status } = req.body;

    const item = await prisma.pmtaTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
      },
    });

    res.json(item);
    logAction(req.user?.email, 'PmtaTemplate', 'update', item.id, item.name, req.user?.id).catch(() => {});
  } catch (error) {
    next(error);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.pmtaTemplate.delete({ where: { id } });
    logAction(req.user?.email, 'PmtaTemplate', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Template deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.listVmtas = async (req, res, next) => {
  try {
    const { vmtaType, serverName } = req.query;
    const where = {
      ...(vmtaType && { vmtaType }),
      ...(serverName && { serverName }),
    };
    const data = await prisma.pmtaVmta.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.createVmta = async (req, res, next) => {
  try {
    const { serverName, vmtaType, configData } = req.body;
    if (!serverName || !vmtaType) return res.status(400).json({ error: 'Server name and VMTA type are required.' });

    const item = await prisma.pmtaVmta.create({
      data: {
        serverName,
        vmtaType,
        configData: configData || {},
        createdBy: req.user?.email || 'admin',
      },
    });

    res.status(201).json(item);
    logAction(req.user?.email, 'PmtaVmta', 'create', item.id, `${item.serverName}: ${item.vmtaType}`, req.user?.id).catch(() => {});
  } catch (error) {
    next(error);
  }
};

exports.deleteVmta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.pmtaVmta.delete({ where: { id } });
    logAction(req.user?.email, 'PmtaVmta', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'VMTA deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.listConfigs = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, sort, order } = req.query;

    const where = {
      ...(search && {
        OR: [
          { key: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'key']);

    const [data, total] = await Promise.all([
      prisma.setting.findMany({ where, orderBy, skip, take: limit }),
      prisma.setting.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.updateConfig = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { value } = req.body;

    const setting = await prisma.setting.update({
      where: { id },
      data: { value: value || undefined },
    });

    logAction(req.user?.email, 'PmtaConfig', 'update', setting.id, setting.key, req.user?.id).catch(() => {});
    res.json(setting);
  } catch (error) {
    next(error);
  }
};

exports.listHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, sort, order } = req.query;

    const where = {
      recordType: { contains: 'Pmta' },
      ...(search && {
        OR: [
          { actionBy: { contains: search } },
          { recordName: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'actionBy', 'recordType', 'actionType', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy, skip, take: limit }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.createServerVmtas = async (req, res, next) => {
  try {
    const { serverNames, encryption, smtps } = req.body;
    if (!serverNames || !Array.isArray(serverNames) || serverNames.length === 0) {
      return res.status(400).json({ error: 'At least one server name is required.' });
    }
    if (!smtps || typeof smtps !== 'string') {
      return res.status(400).json({ error: 'SMTPs list is required (host port username password, one per line).' });
    }

    const lines = smtps.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return res.status(400).json({ error: 'No valid SMTP entries found.' });

    const created = [];
    for (const serverName of serverNames) {
      const configData = {
        encryption: encryption || 'none',
        smtps: lines.map((line) => {
          const parts = line.split(/\s+/);
          return { host: parts[0], port: parts[1] || '25', username: parts[2] || '', password: parts[3] || '' };
        }),
        rotation: true,
        createdAt: new Date().toISOString(),
      };

      const item = await prisma.pmtaVmta.create({
        data: {
          serverName,
          vmtaType: 'smtp',
          configData,
          createdBy: req.user?.email || 'admin',
        },
      });
      created.push(item);
    }

    logAction(req.user?.email, 'PmtaVmta', 'create', null, `Created SMTP VMTAs for ${serverNames.length} servers (${lines.length} entries, ${encryption || 'none'})`, req.user?.id).catch(() => {});
    res.status(201).json({ message: `Created ${created.length} SMTP VMTA rotation configs.`, data: created });
  } catch (error) {
    next(error);
  }
};

exports.resetServerVmtas = async (req, res, next) => {
  try {
    const { serverNames } = req.body;
    if (!serverNames || !Array.isArray(serverNames) || serverNames.length === 0) {
      return res.status(400).json({ error: 'At least one server name is required.' });
    }

    const deleted = await prisma.pmtaVmta.deleteMany({
      where: {
        serverName: { in: serverNames },
        vmtaType: 'smtp',
      },
    });

    logAction(req.user?.email, 'PmtaVmta', 'delete', null, `Reset SMTP VMTAs for ${serverNames.length} servers (${deleted.count} deleted)`, req.user?.id).catch(() => {});
    res.json({ message: `Deleted ${deleted.count} SMTP VMTA configs.`, count: deleted.count });
  } catch (error) {
    next(error);
  }
};

exports.getServerNames = async (req, res, next) => {
  try {
    const servers = await prisma.mtaServer.findMany({
      select: { id: true, name: true, mainIp: true },
      orderBy: { name: 'asc' },
    });
    res.json(servers);
  } catch (error) {
    next(error);
  }
};
