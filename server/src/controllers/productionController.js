const prisma = require('../config/database');
const { paginate, buildSort } = require('../utils/helpers');

const processSelect = {
  id: true, processName: true, subject: true, fromEmail: true, fromName: true,
  replyTo: true, senderScore: true, throttle: true, speed: true,
  scheduleAt: true, repeat: true, status: true, createdBy: true,
  createdAt: true, updatedAt: true,
  dataList: { select: { id: true, name: true } },
  smtpGroup: { select: { id: true, name: true } },
  mtaServer: { select: { id: true, name: true } },
  offer: { select: { id: true, name: true } },
  virtualList: { select: { id: true, name: true } },
};

const productionSelect = {
  id: true, name: true, status: true, createdBy: true, createdAt: true, updatedAt: true,
  _count: { select: { processes: true } },
};

exports.listProductions = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ name: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.production.findMany({ where, orderBy, skip, take: limit, select: productionSelect }),
      prisma.production.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.getProduction = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const production = await prisma.production.findUnique({ where: { id }, select: { ...productionSelect, processes: { select: processSelect } } });
    if (!production) return res.status(404).json({ error: 'Production not found.' });
    res.json(production);
  } catch (error) {
    next(error);
  }
};

exports.createProduction = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Production name is required.' });

    const production = await prisma.production.create({
      data: { name, createdBy: req.user?.email || 'admin' },
      select: productionSelect,
    });

    res.status(201).json(production);
  } catch (error) {
    next(error);
  }
};

exports.updateProduction = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, status } = req.body;

    const production = await prisma.production.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
      },
      select: productionSelect,
    });

    res.json(production);
  } catch (error) {
    next(error);
  }
};

exports.removeProduction = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.production.delete({ where: { id } });
    res.json({ message: 'Production deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.listProcesses = async (req, res, next) => {
  try {
    const productionId = parseInt(req.params.id, 10);
    if (isNaN(productionId)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      productionId,
      ...(status && { status }),
      ...(search && { OR: [{ processName: { contains: search } }, { subject: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'processName', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.sendProcess.findMany({ where, orderBy, skip, take: limit, select: processSelect }),
      prisma.sendProcess.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.createProcess = async (req, res, next) => {
  try {
    const productionId = parseInt(req.params.id, 10);
    if (isNaN(productionId)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const {
      processName, subject, fromEmail, fromName, replyTo,
      senderScore, throttle, speed, scheduleAt, repeat,
      dataListId, smtpGroupId, mtaServerId, offerId, virtualListId,
    } = req.body;

    if (!processName) return res.status(400).json({ error: 'Process name is required.' });

    const process = await prisma.sendProcess.create({
      data: {
        productionId,
        processName,
        subject,
        fromEmail,
        fromName,
        replyTo,
        senderScore: senderScore ? parseInt(senderScore, 10) : null,
        throttle: parseInt(throttle, 10) || 0,
        speed: parseInt(speed, 10) || 100,
        scheduleAt: scheduleAt ? new Date(scheduleAt) : null,
        repeat,
        dataListId: dataListId ? parseInt(dataListId, 10) : null,
        smtpGroupId: smtpGroupId ? parseInt(smtpGroupId, 10) : null,
        mtaServerId: mtaServerId ? parseInt(mtaServerId, 10) : null,
        offerId: offerId ? parseInt(offerId, 10) : null,
        virtualListId: virtualListId ? parseInt(virtualListId, 10) : null,
        createdBy: req.user?.email || 'admin',
      },
      select: processSelect,
    });

    res.status(201).json(process);
  } catch (error) {
    next(error);
  }
};

exports.updateProcess = async (req, res, next) => {
  try {
    const id = parseInt(req.params.processId, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const {
      processName, subject, fromEmail, fromName, replyTo,
      senderScore, throttle, speed, scheduleAt, repeat, status,
      dataListId, smtpGroupId, mtaServerId, offerId, virtualListId,
    } = req.body;

    const process = await prisma.sendProcess.update({
      where: { id },
      data: {
        ...(processName !== undefined && { processName }),
        ...(subject !== undefined && { subject }),
        ...(fromEmail !== undefined && { fromEmail }),
        ...(fromName !== undefined && { fromName }),
        ...(replyTo !== undefined && { replyTo }),
        ...(senderScore !== undefined && { senderScore: senderScore ? parseInt(senderScore, 10) : null }),
        ...(throttle !== undefined && { throttle: parseInt(throttle, 10) || 0 }),
        ...(speed !== undefined && { speed: parseInt(speed, 10) || 100 }),
        ...(scheduleAt !== undefined && { scheduleAt: scheduleAt ? new Date(scheduleAt) : null }),
        ...(repeat !== undefined && { repeat }),
        ...(status !== undefined && { status }),
        ...(dataListId !== undefined && { dataListId: dataListId ? parseInt(dataListId, 10) : null }),
        ...(smtpGroupId !== undefined && { smtpGroupId: smtpGroupId ? parseInt(smtpGroupId, 10) : null }),
        ...(mtaServerId !== undefined && { mtaServerId: mtaServerId ? parseInt(mtaServerId, 10) : null }),
        ...(offerId !== undefined && { offerId: offerId ? parseInt(offerId, 10) : null }),
        ...(virtualListId !== undefined && { virtualListId: virtualListId ? parseInt(virtualListId, 10) : null }),
      },
      select: processSelect,
    });

    res.json(process);
  } catch (error) {
    next(error);
  }
};

exports.removeProcess = async (req, res, next) => {
  try {
    const id = parseInt(req.params.processId, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.sendProcess.delete({ where: { id } });
    res.json({ message: 'Send process deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.listMtaDrops = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ processName: { contains: search } }, { subject: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'processName', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.sendProcess.findMany({ where, orderBy, skip, take: limit, select: processSelect }),
      prisma.sendProcess.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.listMtaTests = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ processName: { contains: search } }, { subject: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'processName', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.sendProcess.findMany({ where, orderBy, skip, take: limit, select: processSelect }),
      prisma.sendProcess.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.listSmtpDrops = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ processName: { contains: search } }, { subject: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'processName', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.sendProcess.findMany({ where, orderBy, skip, take: limit, select: processSelect }),
      prisma.sendProcess.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.listSmtpTests = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && { OR: [{ processName: { contains: search } }, { subject: { contains: search } }] }),
    };

    const orderBy = buildSort(sort, order, ['id', 'processName', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.sendProcess.findMany({ where, orderBy, skip, take: limit, select: processSelect }),
      prisma.sendProcess.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    res.json({ message: 'Image uploaded successfully.', file: req.file.filename });
  } catch (error) {
    next(error);
  }
};

exports.processAction = async (req, res, next) => {
  try {
    const id = parseInt(req.params.processId, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });

    const { action } = req.body;
    if (!action || !['resume', 'pause', 'stop'].includes(action)) {
      return res.status(400).json({ error: 'Valid action (resume, pause, stop) is required.' });
    }

    const statusMap = { resume: 'Running', pause: 'Paused', stop: 'Stopped' };

    const process = await prisma.sendProcess.update({
      where: { id },
      data: { status: statusMap[action] },
      select: processSelect,
    });

    res.json(process);
  } catch (error) {
    next(error);
  }
};
