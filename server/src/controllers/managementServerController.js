const prisma = require('../config/database');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, name: true, providerId: true, status: true, expirationDate: true,
  hostname: true, mainIp: true, sshPort: true, loginType: true, username: true,
  sshStatus: true, lastChecked: true, createdBy: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ name: { contains: search } }, { mainIp: { contains: search } }, { hostname: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'mainIp', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.managementServer.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.managementServer.count({ where }),
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
    const item = await prisma.managementServer.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Management server not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, providerId, status, expirationDate, hostname, mainIp, sshPort, loginType, username, password, passphrase, pemFile } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    if (!mainIp) return res.status(400).json({ error: 'Main IP is required.' });

    const item = await prisma.managementServer.create({
      data: {
        name,
        providerId: providerId ? parseInt(providerId, 10) : null,
        status: status || 'Activated',
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        hostname: hostname || null,
        mainIp,
        sshPort: sshPort ? parseInt(sshPort, 10) : 22,
        loginType: loginType || 'user-pass',
        username: username || 'root',
        password: password || null,
        passphrase: passphrase || null,
        pemFile: pemFile || null,
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
    const { name, providerId, status, expirationDate, hostname, mainIp, sshPort, loginType, username, password, passphrase, pemFile } = req.body;

    const item = await prisma.managementServer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(providerId !== undefined && { providerId: providerId ? parseInt(providerId, 10) : null }),
        ...(status !== undefined && { status }),
        ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
        ...(hostname !== undefined && { hostname }),
        ...(mainIp !== undefined && { mainIp }),
        ...(sshPort !== undefined && { sshPort: parseInt(sshPort, 10) }),
        ...(loginType !== undefined && { loginType }),
        ...(username !== undefined && { username }),
        ...(password !== undefined && { password }),
        ...(passphrase !== undefined && { passphrase }),
        ...(pemFile !== undefined && { pemFile }),
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
    await prisma.managementServer.delete({ where: { id } });
    res.json({ message: 'Management server deleted.' });
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
        await prisma.managementServer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.managementServer.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.managementServer.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
