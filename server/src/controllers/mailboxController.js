const prisma = require('../config/database');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, domainId: true, email: true, status: true, createdBy: true, createdAt: true, updatedAt: true,
  domain: { select: { id: true, name: true } },
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ email: { contains: search } }, { domain: { name: { contains: search } } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'email', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.mailbox.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.mailbox.count({ where }),
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
    const item = await prisma.mailbox.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Mailbox not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { domainId, email, status } = req.body;
    if (!domainId) return res.status(400).json({ error: 'Domain is required.' });
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const item = await prisma.mailbox.create({
      data: {
        domainId: parseInt(domainId, 10),
        email,
        status: status || 'Activated',
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { domainId, email, status } = req.body;

    const item = await prisma.mailbox.update({
      where: { id },
      data: {
        ...(domainId !== undefined && { domainId: parseInt(domainId, 10) }),
        ...(email !== undefined && { email }),
        ...(status !== undefined && { status }),
      },
      select,
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.mailbox.delete({ where: { id } });
    res.json({ message: 'Mailbox deleted.' });
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
        await prisma.mailbox.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.mailbox.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.mailbox.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.listDomains = async (req, res, next) => {
  try {
    const data = await prisma.domain.findMany({
      where: { status: 'Activated' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.json({ data });
  } catch (error) {
    next(error);
  }
};
