const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSort } = require('../utils/helpers');

const groupSelect = {
  id: true, name: true, encryption: true, status: true,
  createdBy: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.smtpGroup.findMany({ where, orderBy, skip, take: limit, select: groupSelect }),
      prisma.smtpGroup.count({ where }),
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
    const group = await prisma.smtpGroup.findUnique({ where: { id }, select: groupSelect });
    if (!group) return res.status(404).json({ error: 'SMTP group not found.' });
    res.json(group);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { names, name, encryption, status } = req.body;

    if (names && typeof names === 'string') {
      const nameList = names.split('\n').map((n) => n.trim()).filter(Boolean);
      if (!nameList.length) return res.status(400).json({ error: 'At least one group name is required.' });

      const created = [];
      for (const n of nameList) {
        const group = await prisma.smtpGroup.create({
          data: {
            name: n,
            encryption: encryption || 'None',
            status: status || 'Activated',
            createdBy: req.user?.email || 'admin',
          },
          select: groupSelect,
        }).catch(() => null);
        if (group) created.push(group);
      }
      return logAction(req.user?.email, 'SmtpGroup', 'create', created.id, created.name, req.user?.id).catch(() => {});
    res.status(201).json(created);
    }

    if (!name) return res.status(400).json({ error: 'Group name is required.' });

    const group = await prisma.smtpGroup.create({
      data: {
        name,
        encryption: encryption || 'None',
        status: status || 'Activated',
        createdBy: req.user?.email || 'admin',
      },
      select: groupSelect,
    });

    logAction(req.user?.email, 'SmtpGroup', 'create', group.id, group.name, req.user?.id).catch(() => {});
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, encryption, status } = req.body;

    const group = await prisma.smtpGroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(encryption !== undefined && { encryption }),
        ...(status !== undefined && { status }),
      },
      select: groupSelect,
    });

    logAction(req.user?.email, 'SmtpGroup', 'update', group.id, group.name, req.user?.id).catch(() => {});
    res.json(group);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.smtpGroup.delete({ where: { id } });
    logAction(req.user?.email, 'SmtpGroup', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'SMTP group deleted.' });
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
        await prisma.smtpGroup.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.smtpGroup.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.smtpGroup.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.listCustomVmtas = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const group = await prisma.smtpGroup.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: 'SMTP group not found.' });

    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, sort, order } = req.query;

    const where = {
      smtpGroupId: groupId,
      ...(search && {
        OR: [
          { name: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.customVmta.findMany({ where, orderBy, skip, take: limit }),
      prisma.customVmta.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.addCustomVmta = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const group = await prisma.smtpGroup.findUnique({ where: { id: groupId } });
    if (!group) return res.status(404).json({ error: 'SMTP group not found.' });

    const { name, ip, port, status } = req.body;
    if (!name) return res.status(400).json({ error: 'VMTA name is required.' });

    const item = await prisma.customVmta.create({
      data: {
        smtpGroupId: groupId,
        name,
        ip: ip || null,
        port: port ? parseInt(port, 10) : null,
        status: status || 'Activated',
        createdBy: req.user?.email || 'admin',
      },
    });

    logAction(req.user?.email, 'CustomVmta', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.deleteCustomVmta = async (req, res, next) => {
  try {
    const id = parseInt(req.params.vmtaId, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.customVmta.delete({ where: { id } });
    logAction(req.user?.email, 'CustomVmta', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Custom VMTA deleted.' });
  } catch (error) {
    next(error);
  }
};
