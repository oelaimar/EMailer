const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSort } = require('../utils/helpers');
const geoDbService = require('../services/geoDbService');
const geoJobRunner = require('../services/geoJobRunner');

const select = {
  id: true, name: true, status: true, sourceSchema: true, sourceTables: true,
  targetRows: true, targetGeos: true, batchSize: true, tablePattern: true, duplicateMode: true,
  movedRows: true, deletedRows: true, skippedRows: true,
  scheduledAt: true, startedAt: true, finishedAt: true,
  createdBy: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ name: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.geoManagerProcess.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.geoManagerProcess.count({ where }),
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
    const item = await prisma.geoManagerProcess.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Geo Manager process not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, sourceSchema, sourceTables, targetRows, targetGeos, batchSize, tablePattern, duplicateMode, scheduledAt } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const item = await prisma.geoManagerProcess.create({
      data: {
        name,
        sourceSchema: sourceSchema || null,
        sourceTables: sourceTables || [],
        targetRows: targetRows || 0,
        targetGeos: targetGeos || [],
        batchSize: batchSize || 500,
        tablePattern: tablePattern || 'e_',
        duplicateMode: duplicateMode || 'delete',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'GeoManagerProcess', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.getSourceTables = async (req, res, next) => {
  try {
    const { schema } = req.body;
    if (!schema) return res.status(400).json({ error: 'Schema is required.' });

    const tables = await geoDbService.getTables(schema);
    res.json({ data: tables });
  } catch (error) {
    next(error);
  }
};

exports.getSchemas = async (req, res, next) => {
  try {
    const schemas = await geoDbService.getSchemas();
    res.json({ data: schemas });
  } catch (error) {
    next(error);
  }
};

exports.getGeoSummary = async (req, res, next) => {
  try {
    const { schema, tables, geos } = req.body;
    if (!schema || !tables || !geos) {
      return res.status(400).json({ error: 'Schema, tables, and geos are required.' });
    }

    const summary = await geoDbService.getGeoSummary(schema, tables, geos);
    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
};

exports.start = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const result = await geoJobRunner.startJob(id);
    if (!result.started) {
      return res.status(400).json({ error: result.message });
    }

    const item = await prisma.geoManagerProcess.findUnique({ where: { id }, select });
    logAction(req.user?.email, 'GeoManagerProcess', 'start', item.id, item.name, req.user?.id).catch(() => {});

    res.json({ ...item, message: result.message });
  } catch (error) {
    next(error);
  }
};

exports.stop = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const result = geoJobRunner.stopJob(id);
    if (!result.stopped) {
      return res.status(400).json({ error: result.message });
    }

    const item = await prisma.geoManagerProcess.findUnique({ where: { id }, select });
    logAction(req.user?.email, 'GeoManagerProcess', 'stop', item.id, item.name, req.user?.id).catch(() => {});

    res.json({ ...item, message: result.message });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.geoManagerProcess.delete({ where: { id } });
    logAction(req.user?.email, 'GeoManagerProcess', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Geo Manager process deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const logs = await prisma.geoManagerLog.findMany({
      where: { processId: id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
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
      await prisma.geoManagerProcess.deleteMany({ where: { id: { in: intIds } } });
    } else {
      return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: 'Bulk delete completed.' });
  } catch (error) {
    next(error);
  }
};
