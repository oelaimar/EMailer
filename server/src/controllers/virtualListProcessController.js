const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSort } = require('../utils/helpers');

const select = {
  id: true, virtualListId: true, processName: true, status: true,
  totalEmails: true, processedEmails: true, filteredEmails: true, errorCount: true,
  startedAt: true, completedAt: true, errorMessage: true, createdBy: true,
  createdAt: true, updatedAt: true,
  virtualList: { select: { id: true, name: true } },
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, virtualListId, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(virtualListId && { virtualListId: parseInt(virtualListId, 10) }),
      ...(search && { processName: { contains: search } }),
    };

    const orderBy = buildSort(sort, order, ['id', 'processName', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.virtualListProcess.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.virtualListProcess.count({ where }),
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
    const item = await prisma.virtualListProcess.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Process not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { virtualListId, processName } = req.body;
    if (!virtualListId) return res.status(400).json({ error: 'Virtual list is required.' });
    if (!processName) return res.status(400).json({ error: 'Process name is required.' });

    const item = await prisma.virtualListProcess.create({
      data: {
        virtualListId: parseInt(virtualListId, 10),
        processName,
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'VirtualListProcess', 'create', item.id, item.processName, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.startProcess = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const item = await prisma.virtualListProcess.update({
      where: { id },
      data: { status: 'Running', startedAt: new Date() },
      select,
    });

    logAction(req.user?.email, 'VirtualListProcess', 'start', item.id, item.processName, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.stopProcess = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const item = await prisma.virtualListProcess.update({
      where: { id },
      data: { status: 'Stopped', completedAt: new Date() },
      select,
    });

    logAction(req.user?.email, 'VirtualListProcess', 'stop', item.id, item.processName, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.virtualListProcess.delete({ where: { id } });
    logAction(req.user?.email, 'VirtualListProcess', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Process deleted.' });
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
      case 'stop':
        await prisma.virtualListProcess.updateMany({ where: { id: { in: intIds }, status: 'Running' }, data: { status: 'Stopped', completedAt: new Date() } });
        break;
      case 'delete':
        await prisma.virtualListProcess.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
