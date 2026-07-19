const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, registrar: true, name: true, status: true,
  apiKey: true, apiSecret: true, apiToken: true, username: true,
  createdBy: true, createdAt: true, updatedAt: true,
};

const REGISTRARS = ['cloudflare', 'godaddy', 'namecheap', 'namecom', 'dynadot', 'spaceship'];

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, registrar, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(registrar && { registrar }),
      ...(search && { OR: [{ name: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'registrar', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.registrarAccount.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.registrarAccount.count({ where }),
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
    const item = await prisma.registrarAccount.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Registrar account not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { registrar, name, status, apiKey, apiSecret, apiToken, username, password } = req.body;
    if (!registrar) return res.status(400).json({ error: 'Registrar is required.' });
    if (!REGISTRARS.includes(registrar)) return res.status(400).json({ error: 'Invalid registrar.' });
    if (!name) return res.status(400).json({ error: 'Account name is required.' });

    const item = await prisma.registrarAccount.create({
      data: {
        registrar, name,
        status: status || 'Activated',
        apiKey, apiSecret, apiToken, username, password,
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'RegistrarAccount', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, status, apiKey, apiSecret, apiToken, username, password } = req.body;

    const item = await prisma.registrarAccount.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(apiKey !== undefined && { apiKey }),
        ...(apiSecret !== undefined && { apiSecret }),
        ...(apiToken !== undefined && { apiToken }),
        ...(username !== undefined && { username }),
        ...(password !== undefined && { password }),
      },
      select,
    });

    logAction(req.user?.email, 'RegistrarAccount', 'update', item.id, item.name, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.registrarAccount.delete({ where: { id } });
    logAction(req.user?.email, 'RegistrarAccount', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Registrar account deleted.' });
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
        await prisma.registrarAccount.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.registrarAccount.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.registrarAccount.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.listByRegistrar = async (req, res, next) => {
  try {
    const { registrar } = req.params;
    if (!REGISTRARS.includes(registrar)) return res.status(400).json({ error: 'Invalid registrar.' });

    const data = await prisma.registrarAccount.findMany({
      where: { registrar, status: 'Activated' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
};
