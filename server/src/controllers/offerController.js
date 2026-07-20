const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const offerSelect = {
  id: true, name: true, url: true, fromName: true, fromEmail: true,
  subject: true, replyTo: true, headers: true, status: true,
  createdBy: true, createdAt: true, updatedAt: true,
  suppressions: { select: { id: true, name: true, type: true, count: true } },
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ name: { contains: search } }, { fromEmail: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.offer.findMany({ where, orderBy, skip, take: limit, select: offerSelect }),
      prisma.offer.count({ where }),
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
    const offer = await prisma.offer.findUnique({ where: { id }, select: offerSelect });
    if (!offer) return res.status(404).json({ error: 'Offer not found.' });
    res.json(offer);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, url, fromName, fromEmail, subject, replyTo, headers } = req.body;
    if (!name) return res.status(400).json({ error: 'Offer name is required.' });

    const offer = await prisma.offer.create({
      data: {
        name, url, fromName, fromEmail, subject, replyTo, headers,
        createdBy: req.user?.email || 'admin',
      },
      select: offerSelect,
    });

    logAction(req.user?.email, 'Offer', 'create', offer.id, offer.name, req.user?.id).catch(() => {});
    res.status(201).json(offer);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, url, fromName, fromEmail, subject, replyTo, headers, status } = req.body;

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(url !== undefined && { url }),
        ...(fromName !== undefined && { fromName }),
        ...(fromEmail !== undefined && { fromEmail }),
        ...(subject !== undefined && { subject }),
        ...(replyTo !== undefined && { replyTo }),
        ...(headers !== undefined && { headers }),
        ...(status !== undefined && { status }),
      },
      select: offerSelect,
    });

    logAction(req.user?.email, 'Offer', 'update', offer.id, offer.name, req.user?.id).catch(() => {});
    res.json(offer);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.offer.delete({ where: { id } });
    logAction(req.user?.email, 'Offer', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Offer deleted.' });
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
        await prisma.offer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.offer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.offer.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.listSuppression = async (req, res, next) => {
  try {
    const offerId = parseInt(req.params.id, 10);
    if (isNaN(offerId)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const data = await prisma.suppression.findMany({ where: { offerId }, orderBy: { createdAt: 'desc' } });
    res.json({ data, total: data.length });
  } catch (error) {
    next(error);
  }
};

exports.addSuppression = async (req, res, next) => {
  try {
    const offerId = parseInt(req.params.id, 10);
    if (isNaN(offerId)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, type, data: suppressionData } = req.body;
    if (!name) return res.status(400).json({ error: 'Suppression name is required.' });

    const suppression = await prisma.suppression.create({
      data: {
        offerId,
        name,
        type: type || 'Email',
        data: suppressionData,
        count: suppressionData ? suppressionData.split('\n').filter(Boolean).length : 0,
      },
    });

    logAction(req.user?.email, 'Suppression', 'create', suppression.id, suppression.name, req.user?.id).catch(() => {});
    res.status(201).json(suppression);
  } catch (error) {
    next(error);
  }
};

exports.removeSuppression = async (req, res, next) => {
  try {
    const id = parseInt(req.params.suppressionId, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.suppression.delete({ where: { id } });
    res.json({ message: 'Suppression deleted.' });
  } catch (error) {
    next(error);
  }
};
