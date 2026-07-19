const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, name: true, url: true, status: true,
  createdBy: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ name: { contains: search } }, { url: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.affiliateNetwork.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.affiliateNetwork.count({ where }),
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
    const item = await prisma.affiliateNetwork.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Affiliate network not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, url, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Network name is required.' });

    const item = await prisma.affiliateNetwork.create({
      data: { name, url, status: status || 'Activated', createdBy: req.user?.email || 'admin' },
      select,
    });

    logAction(req.user?.email, 'AffiliateNetwork', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, url, status } = req.body;

    const item = await prisma.affiliateNetwork.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(url !== undefined && { url }),
        ...(status !== undefined && { status }),
      },
      select,
    });

    logAction(req.user?.email, 'AffiliateNetwork', 'update', item.id, item.name, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.affiliateNetwork.delete({ where: { id } });
    logAction(req.user?.email, 'AffiliateNetwork', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Affiliate network deleted.' });
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
        await prisma.affiliateNetwork.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.affiliateNetwork.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.affiliateNetwork.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
