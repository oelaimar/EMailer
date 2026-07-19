const prisma = require('../config/database');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, actionBy: true, userId: true, recordId: true, recordName: true, recordType: true, actionType: true, actionTime: true, createdAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, sort, order, recordType, actionType } = req.query;

    const where = {
      ...(recordType && { recordType }),
      ...(actionType && { actionType }),
      ...(search && {
        OR: [
          { actionBy: { contains: search } },
          { recordName: { contains: search } },
          { recordType: { contains: search } },
          { actionType: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'actionBy', 'recordType', 'actionType', 'actionTime']);

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.auditLog.count({ where }),
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
    const item = await prisma.auditLog.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Audit log not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { actionBy, userId, recordId, recordName, recordType, actionType } = req.body;

    const item = await prisma.auditLog.create({
      data: {
        actionBy: actionBy || req.user?.email || 'system',
        userId: userId || null,
        recordId: recordId || null,
        recordName: recordName || null,
        recordType: recordType || 'Unknown',
        actionType: actionType || 'unknown',
      },
      select,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.auditLog.delete({ where: { id } });
    res.json({ message: 'Audit log deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.bulkAction = async (req, res, next) => {
  try {
    const { action, ids } = req.body;
    if (!action || !ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Action and IDs array are required.' });

    const intIds = ids.map((id) => parseInt(id, 10));

    if (action === 'delete') {
      await prisma.auditLog.deleteMany({ where: { id: { in: intIds } } });
    } else {
      return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: 'Bulk delete completed.' });
  } catch (error) {
    next(error);
  }
};

exports.logAction = async (actionBy, recordType, actionType, recordId, recordName, userId) => {
  try {
    await prisma.auditLog.create({
      data: {
        actionBy: actionBy || 'system',
        userId: userId || null,
        recordId: recordId || null,
        recordName: recordName || null,
        recordType: recordType || 'Unknown',
        actionType: actionType || 'unknown',
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
