const prisma = require('../config/database');
const { paginate, buildSort } = require('../utils/helpers');

const domainSelect = {
  id: true, name: true, accountName: true, status: true, availability: true,
  expirationDate: true, hasBrand: true, flag: true, country: true,
  createdBy: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, availability, flag, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(availability && { availability }),
      ...(flag && { flag }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { accountName: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.domain.findMany({ where, orderBy, skip, take: limit, select: domainSelect }),
      prisma.domain.count({ where }),
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
    const domain = await prisma.domain.findUnique({ where: { id }, select: domainSelect });
    if (!domain) return res.status(404).json({ error: 'Domain not found.' });
    res.json(domain);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, accountName, status, availability, expirationDate, country } = req.body;
    if (!name) return res.status(400).json({ error: 'Domain name is required.' });

    const domain = await prisma.domain.create({
      data: {
        name,
        accountName,
        status: status || 'Activated',
        availability: availability || 'Available',
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        country,
        createdBy: req.user?.email || 'admin',
      },
      select: domainSelect,
    });

    res.status(201).json(domain);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, accountName, status, availability, expirationDate, country, hasBrand, flag } = req.body;

    const domain = await prisma.domain.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(accountName !== undefined && { accountName }),
        ...(status !== undefined && { status }),
        ...(availability !== undefined && { availability }),
        ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
        ...(country !== undefined && { country }),
        ...(hasBrand !== undefined && { hasBrand }),
        ...(flag !== undefined && { flag }),
      },
      select: domainSelect,
    });

    res.json(domain);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.domain.delete({ where: { id } });
    res.json({ message: 'Domain deleted.' });
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
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'special':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Special' } });
        break;
      case 'privat':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Privat' } });
        break;
      case 'available':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { availability: 'Available' } });
        break;
      case 'delete':
        await prisma.domain.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.getRecords = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const records = await prisma.domainRecord.findMany({ where: { domainId: id } });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

exports.setRecords = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { records } = req.body;

    if (!records || !Array.isArray(records)) return res.status(400).json({ error: 'Records array is required.' });

    await prisma.domainRecord.deleteMany({ where: { domainId: id } });
    const created = await Promise.all(
      records.map((r) => prisma.domainRecord.create({
        data: { domainId: id, type: r.type, name: r.name, value: r.value, ttl: r.ttl || 3600, priority: r.priority },
      }))
    );

    res.json(created);
  } catch (error) {
    next(error);
  }
};
