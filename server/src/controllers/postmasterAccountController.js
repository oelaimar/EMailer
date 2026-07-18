const prisma = require('../config/database');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, domain: true, serverName: true, providerName: true,
  imapHost: true, imapPort: true, smtpHost: true, smtpPort: true,
  username: true, status: true, createdBy: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ domain: { contains: search } }, { serverName: { contains: search } }, { providerName: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'domain', 'serverName', 'providerName', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.postmasterAccount.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.postmasterAccount.count({ where }),
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
    const item = await prisma.postmasterAccount.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Postmaster account not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { domain, serverName, providerName, imapHost, imapPort, smtpHost, smtpPort, username, password, status } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain is required.' });

    const item = await prisma.postmasterAccount.create({
      data: {
        domain,
        serverName: serverName || null,
        providerName: providerName || null,
        imapHost: imapHost || null,
        imapPort: imapPort ? parseInt(imapPort, 10) : null,
        smtpHost: smtpHost || null,
        smtpPort: smtpPort ? parseInt(smtpPort, 10) : null,
        username: username || null,
        password: password || null,
        status: status || 'Activated',
        createdBy: req.user?.email || 'admin',
      },
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
    const { domain, serverName, providerName, imapHost, imapPort, smtpHost, smtpPort, username, password, status } = req.body;

    const item = await prisma.postmasterAccount.update({
      where: { id },
      data: {
        ...(domain !== undefined && { domain }),
        ...(serverName !== undefined && { serverName }),
        ...(providerName !== undefined && { providerName }),
        ...(imapHost !== undefined && { imapHost }),
        ...(imapPort !== undefined && { imapPort: imapPort ? parseInt(imapPort, 10) : null }),
        ...(smtpHost !== undefined && { smtpHost }),
        ...(smtpPort !== undefined && { smtpPort: smtpPort ? parseInt(smtpPort, 10) : null }),
        ...(username !== undefined && { username }),
        ...(password !== undefined && { password }),
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
    await prisma.postmasterAccount.delete({ where: { id } });
    res.json({ message: 'Postmaster account deleted.' });
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
        await prisma.postmasterAccount.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.postmasterAccount.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.postmasterAccount.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
