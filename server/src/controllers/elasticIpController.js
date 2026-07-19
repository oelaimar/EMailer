const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSort } = require('../utils/helpers');

const select = {
  id: true, cloudInstanceId: true, ipAddress: true, allocationId: true,
  status: true, instanceId: true, region: true, createdBy: true,
  createdAt: true, updatedAt: true,
  cloudInstance: { select: { id: true, instanceType: true, provider: true } },
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, cloudInstanceId, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(cloudInstanceId && { cloudInstanceId: parseInt(cloudInstanceId, 10) }),
      ...(search && { ipAddress: { contains: search } }),
    };

    const orderBy = buildSort(sort, order, ['id', 'ipAddress', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.elasticIp.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.elasticIp.count({ where }),
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
    const item = await prisma.elasticIp.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Elastic IP not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { cloudInstanceId, ipAddress, allocationId, region } = req.body;

    const item = await prisma.elasticIp.create({
      data: {
        cloudInstanceId: cloudInstanceId ? parseInt(cloudInstanceId, 10) : null,
        ipAddress: ipAddress || null,
        allocationId: allocationId || null,
        region: region || null,
        status: 'Allocated',
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'ElasticIp', 'create', item.id, item.ipAddress, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.allocate = async (req, res, next) => {
  try {
    const { cloudInstanceId, count, region } = req.body;
    const qty = parseInt(count, 10) || 1;

    const results = [];
    for (let i = 0; i < qty; i++) {
      const item = await prisma.elasticIp.create({
        data: {
          cloudInstanceId: cloudInstanceId ? parseInt(cloudInstanceId, 10) : null,
          status: 'Allocating',
          region: region || null,
          createdBy: req.user?.email || 'admin',
        },
        select,
      });
      results.push(item);
    }

    logAction(req.user?.email, 'ElasticIp', 'allocate', null, `Allocated ${qty} IPs`, req.user?.id).catch(() => {});
    res.status(201).json({ message: `${qty} Elastic IP(s) allocation started.`, data: results });
  } catch (error) {
    next(error);
  }
};

exports.release = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'IDs array is required.' });

    const intIds = ids.map((id) => parseInt(id, 10));
    await prisma.elasticIp.deleteMany({ where: { id: { in: intIds } } });

    logAction(req.user?.email, 'ElasticIp', 'release', null, `Released ${intIds.length} IPs`, req.user?.id).catch(() => {});
    res.json({ message: `${intIds.length} Elastic IP(s) released.` });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.elasticIp.delete({ where: { id } });
    logAction(req.user?.email, 'ElasticIp', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Elastic IP deleted.' });
  } catch (error) {
    next(error);
  }
};
