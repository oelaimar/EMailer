const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

exports.getBackendLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search } = req.query;
    const logFiles = [
      '/var/log/syslog',
      '/var/log/mail.log',
      '/var/log/auth.log',
    ];

    let allLines = [];
    for (const file of logFiles) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').filter(Boolean).map(line => ({
          source: path.basename(file),
          message: line,
        }));
        allLines = allLines.concat(lines);
      } catch { /* file not readable, skip */ }
    }

    if (search) {
      const s = search.toLowerCase();
      allLines = allLines.filter(l => l.message.toLowerCase().includes(s));
    }

    allLines.reverse();
    const total = allLines.length;
    const start = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const data = allLines.slice(start, start + parseInt(limit, 10));

    res.json({ data, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (error) {
    next(error);
  }
};

exports.getFrontendLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search } = req.query;

    const where = search ? {
      OR: [
        { message: { contains: search } },
        { url: { contains: search } },
      ],
    } : {};

    const [data, total] = await Promise.all([
      prisma.frontendLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.frontendLog.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.createFrontendLog = async (req, res, next) => {
  try {
    const { message, url, stack, userId } = req.body;
    const log = await prisma.frontendLog.create({
      data: { message, url, stack, userId: userId || null },
    });
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

exports.clearFrontendLogs = async (req, res, next) => {
  try {
    await prisma.frontendLog.deleteMany({});
    logAction(req.user?.email, 'FrontendLog', 'clear', null, 'Cleared all frontend logs', req.user?.id).catch(() => {});
    res.json({ message: 'Frontend logs cleared.' });
  } catch (error) {
    next(error);
  }
};
