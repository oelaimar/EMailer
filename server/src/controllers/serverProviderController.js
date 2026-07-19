const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, name: true, status: true, createdBy: true, createdAt: true, updatedAt: true,
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
      prisma.serverProvider.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.serverProvider.count({ where }),
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
    const item = await prisma.serverProvider.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Server provider not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const item = await prisma.serverProvider.create({
      data: {
        name,
        status: status || 'Activated',
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'ServerProvider', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, status } = req.body;

    const item = await prisma.serverProvider.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
      },
      select,
    });

    logAction(req.user?.email, 'ServerProvider', 'update', item.id, item.name, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.serverProvider.delete({ where: { id } });
    logAction(req.user?.email, 'ServerProvider', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Server provider deleted.' });
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
        await prisma.serverProvider.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.serverProvider.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.serverProvider.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.bulkAdd = async (req, res, next) => {
  try {
    const { names } = req.body;
    if (!names || typeof names !== 'string') return res.status(400).json({ error: 'Names string is required.' });

    const nameList = names.split('\n').map((n) => n.trim()).filter(Boolean);
    if (nameList.length === 0) return res.status(400).json({ error: 'No valid names provided.' });

    const createdBy = req.user?.email || 'admin';
    const created = await prisma.serverProvider.createMany({
      data: nameList.map((name) => ({ name, status: 'Activated', createdBy })),
    });

    res.status(201).json({ message: `${created.count} server providers created.`, count: created.count });
  } catch (error) {
    next(error);
  }
};
