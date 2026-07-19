const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, provider: true, cloudAccountId: true, numberOfInstances: true,
  regions: true, os: true, instanceType: true, privateIps: true,
  storage: true, status: true, createdBy: true, createdAt: true, updatedAt: true,
  cloudAccount: { select: { id: true, name: true } },
};

const PROVIDERS = ['aws', 'azure', 'do', 'hetzner', 'linode', 'ovh', 'scaleway', 'vultr', 'atlantic', 'idcloud', 'google'];

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, provider, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(provider && { provider }),
      ...(search && { OR: [{ instanceType: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'provider', 'instanceType', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.cloudInstance.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.cloudInstance.count({ where }),
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
    const item = await prisma.cloudInstance.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Cloud instance not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { provider, cloudAccountId, numberOfInstances, regions, os, instanceType, privateIps, storage } = req.body;
    if (!provider) return res.status(400).json({ error: 'Provider is required.' });
    if (!PROVIDERS.includes(provider)) return res.status(400).json({ error: 'Invalid provider.' });

    const item = await prisma.cloudInstance.create({
      data: {
        provider,
        cloudAccountId: cloudAccountId ? parseInt(cloudAccountId, 10) : null,
        numberOfInstances: parseInt(numberOfInstances, 10) || 1,
        regions: regions || undefined,
        os: os || 'ubuntu-22.04',
        instanceType,
        privateIps: parseInt(privateIps, 10) || 1,
        storage: parseInt(storage, 10) || 10,
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'CloudInstance', 'create', item.id, item.instanceType, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { cloudAccountId, numberOfInstances, regions, os, instanceType, privateIps, storage, status } = req.body;

    const item = await prisma.cloudInstance.update({
      where: { id },
      data: {
        ...(cloudAccountId !== undefined && { cloudAccountId: cloudAccountId ? parseInt(cloudAccountId, 10) : null }),
        ...(numberOfInstances !== undefined && { numberOfInstances: parseInt(numberOfInstances, 10) || 1 }),
        ...(regions !== undefined && { regions }),
        ...(os !== undefined && { os }),
        ...(instanceType !== undefined && { instanceType }),
        ...(privateIps !== undefined && { privateIps: parseInt(privateIps, 10) || 1 }),
        ...(storage !== undefined && { storage: parseInt(storage, 10) || 10 }),
        ...(status !== undefined && { status }),
      },
      select,
    });

    logAction(req.user?.email, 'CloudInstance', 'update', item.id, item.instanceType, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.cloudInstance.delete({ where: { id } });
    logAction(req.user?.email, 'CloudInstance', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Cloud instance deleted.' });
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
      case 'delete':
        await prisma.cloudInstance.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
