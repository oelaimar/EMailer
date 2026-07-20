const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, provider: true, name: true, status: true,
  proxyIp: true, proxyPort: true, proxyUsername: true,
  providerConfig: true, createdBy: true, createdAt: true, updatedAt: true,
  _count: { select: { instances: true } },
};

const PROVIDERS = ['aws', 'azure', 'do', 'hetzner', 'linode', 'ovh', 'scaleway', 'vultr', 'atlantic', 'idcloud', 'google'];

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, provider, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(provider && { provider }),
      ...(search && { OR: [{ name: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'provider', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.cloudAccount.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.cloudAccount.count({ where }),
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
    const item = await prisma.cloudAccount.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Cloud account not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { provider, name, status, apiKey, apiSecret, proxyIp, proxyPort, proxyUsername, proxyPassword, providerConfig } = req.body;
    if (!provider) return res.status(400).json({ error: 'Provider is required.' });
    if (!PROVIDERS.includes(provider)) return res.status(400).json({ error: 'Invalid provider.' });
    if (!name) return res.status(400).json({ error: 'Account name is required.' });

    const item = await prisma.cloudAccount.create({
      data: {
        provider, name,
        status: status || 'Activated',
        apiKey, apiSecret,
        proxyIp, proxyPort: proxyPort ? parseInt(proxyPort, 10) : null,
        proxyUsername, proxyPassword,
        providerConfig: providerConfig || undefined,
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'CloudAccount', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, status, apiKey, apiSecret, proxyIp, proxyPort, proxyUsername, proxyPassword, providerConfig } = req.body;

    const item = await prisma.cloudAccount.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(apiKey !== undefined && { apiKey }),
        ...(apiSecret !== undefined && { apiSecret }),
        ...(proxyIp !== undefined && { proxyIp }),
        ...(proxyPort !== undefined && { proxyPort: proxyPort ? parseInt(proxyPort, 10) : null }),
        ...(proxyUsername !== undefined && { proxyUsername }),
        ...(proxyPassword !== undefined && { proxyPassword }),
        ...(providerConfig !== undefined && { providerConfig }),
      },
      select,
    });

    logAction(req.user?.email, 'CloudAccount', 'update', item.id, item.name, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.cloudAccount.delete({ where: { id } });
    logAction(req.user?.email, 'CloudAccount', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Cloud account deleted.' });
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
        await prisma.cloudAccount.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.cloudAccount.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.cloudAccount.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.listByProvider = async (req, res, next) => {
  try {
    const { provider } = req.params;
    if (!PROVIDERS.includes(provider)) return res.status(400).json({ error: 'Invalid provider.' });

    const data = await prisma.cloudAccount.findMany({
      where: { provider, status: 'Activated' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
};
