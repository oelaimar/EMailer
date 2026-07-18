const prisma = require('../config/database');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const model = 'gSuiteAccount';
const select = {
  id: true, email: true, clientId: true, status: true, senderScore: true,
  createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ email: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'email', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma[model].findMany({ where, orderBy, skip, take: limit, select }),
      prisma[model].count({ where }),
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
    const item = await prisma[model].findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Account not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { email, clientId, clientSecret, refreshToken } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const item = await prisma[model].create({
      data: { email, clientId, clientSecret, refreshToken },
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
    const { email, clientId, clientSecret, refreshToken, status } = req.body;

    const item = await prisma[model].update({
      where: { id },
      data: {
        ...(email !== undefined && { email }),
        ...(clientId !== undefined && { clientId }),
        ...(clientSecret !== undefined && { clientSecret }),
        ...(refreshToken !== undefined && { refreshToken }),
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
    await prisma[model].delete({ where: { id } });
    res.json({ message: 'Account deleted.' });
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
        await prisma[model].updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma[model].updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma[model].deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
