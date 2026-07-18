const prisma = require('../config/database');
const { paginate, buildSort } = require('../utils/helpers');
const multer = require('multer');
const path = require('path');

const dataListSelect = {
  id: true, name: true, emailCount: true, country: true, vertical: true,
  isp: true, encryptEmails: true, status: true, createdBy: true,
  createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { country: { contains: search } },
          { vertical: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'emailCount', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.dataList.findMany({ where, orderBy, skip, take: limit, select: dataListSelect }),
      prisma.dataList.count({ where }),
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
    const list = await prisma.dataList.findUnique({ where: { id }, select: dataListSelect });
    if (!list) return res.status(404).json({ error: 'Data list not found.' });
    res.json(list);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, country, vertical, isp, encryptEmails, status } = req.body;
    if (!name) return res.status(400).json({ error: 'List name is required.' });

    const list = await prisma.dataList.create({
      data: {
        name,
        country,
        vertical,
        isp,
        encryptEmails: encryptEmails || 'Disabled',
        status: status || 'Activated',
        createdBy: req.user?.email || 'admin',
      },
      select: dataListSelect,
    });

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, country, vertical, isp, encryptEmails, status } = req.body;

    const list = await prisma.dataList.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(country !== undefined && { country }),
        ...(vertical !== undefined && { vertical }),
        ...(isp !== undefined && { isp }),
        ...(encryptEmails !== undefined && { encryptEmails }),
        ...(status !== undefined && { status }),
      },
      select: dataListSelect,
    });

    res.json(list);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.dataList.delete({ where: { id } });
    res.json({ message: 'Data list deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.upload = async (req, res, next) => {
  try {
    const { name, country, vertical, isp, encryptEmails, initialType, fileType, duplicate, allowDuplicates, filterData } = req.body;

    if (!name) return res.status(400).json({ error: 'List name is required.' });

    let emailCount = 0;
    if (req.file) {
      const content = require('fs').readFileSync(req.file.path, 'utf-8');
      emailCount = content.split('\n').filter((line) => line.trim()).length;
    }

    const list = await prisma.dataList.create({
      data: {
        name,
        country,
        vertical,
        isp,
        encryptEmails: encryptEmails || 'Disabled',
        emailCount,
        status: 'Activated',
        createdBy: req.user?.email || 'admin',
      },
      select: dataListSelect,
    });

    res.status(201).json(list);
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
        await prisma.dataList.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.dataList.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.dataList.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};
