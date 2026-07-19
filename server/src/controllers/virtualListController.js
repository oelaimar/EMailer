const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, name: true, smtpGroupId: true, mtaServerId: true,
  status: true, createdBy: true, createdAt: true, updatedAt: true,
  smtpGroup: { select: { id: true, name: true } },
  mtaServer: { select: { id: true, name: true } },
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ name: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.virtualList.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.virtualList.count({ where }),
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
    const item = await prisma.virtualList.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Virtual list not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, smtpGroupId, mtaServerId } = req.body;
    if (!name) return res.status(400).json({ error: 'Virtual list name is required.' });

    const item = await prisma.virtualList.create({
      data: {
        name,
        smtpGroupId: smtpGroupId ? parseInt(smtpGroupId, 10) : null,
        mtaServerId: mtaServerId ? parseInt(mtaServerId, 10) : null,
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'VirtualList', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, smtpGroupId, mtaServerId, status } = req.body;

    const item = await prisma.virtualList.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(smtpGroupId !== undefined && { smtpGroupId: smtpGroupId ? parseInt(smtpGroupId, 10) : null }),
        ...(mtaServerId !== undefined && { mtaServerId: mtaServerId ? parseInt(mtaServerId, 10) : null }),
        ...(status !== undefined && { status }),
      },
      select,
    });

    logAction(req.user?.email, 'VirtualList', 'update', item.id, item.name, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.virtualList.delete({ where: { id } });
    logAction(req.user?.email, 'VirtualList', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Virtual list deleted.' });
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
        await prisma.virtualList.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.virtualList.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.virtualList.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
