const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, name: true, fromName: true, fromEmail: true,
  subject: true, delay: true, headers: true, message: true,
  status: true, createdBy: true, createdAt: true, updatedAt: true,
  lists: { select: { id: true, dataListId: true, dataList: { select: { id: true, name: true } } } },
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ name: { contains: search } }, { fromEmail: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'delay', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.autoResponder.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.autoResponder.count({ where }),
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
    const item = await prisma.autoResponder.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Auto responder not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, fromName, fromEmail, subject, delay, headers, message, dataLists } = req.body;
    if (!name) return res.status(400).json({ error: 'Auto responder name is required.' });

    const item = await prisma.autoResponder.create({
      data: {
        name, fromName, fromEmail, subject,
        delay: parseInt(delay, 10) || 0,
        headers, message,
        createdBy: req.user?.email || 'admin',
        ...(dataLists && dataLists.length > 0 && {
          lists: {
            create: dataLists.map((dataListId) => ({ dataListId: parseInt(dataListId, 10) })),
          },
        }),
      },
      select,
    });

    logAction(req.user?.email, 'AutoResponder', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, fromName, fromEmail, subject, delay, headers, message, status, dataLists } = req.body;

    const updateData = {
      ...(name !== undefined && { name }),
      ...(fromName !== undefined && { fromName }),
      ...(fromEmail !== undefined && { fromEmail }),
      ...(subject !== undefined && { subject }),
      ...(delay !== undefined && { delay: parseInt(delay, 10) || 0 }),
      ...(headers !== undefined && { headers }),
      ...(message !== undefined && { message }),
      ...(status !== undefined && { status }),
    };

    if (dataLists && Array.isArray(dataLists)) {
      await prisma.autoResponderList.deleteMany({ where: { autoResponderId: id } });
      if (dataLists.length > 0) {
        await prisma.autoResponderList.createMany({
          data: dataLists.map((dataListId) => ({ autoResponderId: id, dataListId: parseInt(dataListId, 10) })),
        });
      }
    }

    const item = await prisma.autoResponder.update({ where: { id }, data: updateData, select });
    logAction(req.user?.email, 'AutoResponder', 'update', item.id, item.name, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.autoResponder.delete({ where: { id } });
    logAction(req.user?.email, 'AutoResponder', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Auto responder deleted.' });
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
        await prisma.autoResponder.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.autoResponder.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.autoResponder.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
