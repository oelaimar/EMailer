const prisma = require('../config/database');
const { paginate } = require('../utils/helpers');

exports.getFullReport = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, dateFrom, dateTo, sort, order } = req.query;

    const where = {
      ...(dateFrom && dateTo && {
        createdAt: { gte: new Date(dateFrom), lte: new Date(dateTo) },
      }),
      ...(search && {
        OR: [
          { processName: { contains: search } },
          { createdBy: { contains: search } },
        ],
      }),
    };

    const orderBy = sort ? { [sort]: order === 'desc' ? 'desc' : 'asc' } : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      prisma.sendProcess.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          production: { select: { name: true } },
          dataList: { select: { name: true } },
          smtpGroup: { select: { name: true } },
          mtaServer: { select: { name: true } },
          offer: { select: { name: true } },
        },
      }),
      prisma.sendProcess.count({ where }),
    ]);

    const report = data.map((p) => ({
      id: p.id,
      processName: p.processName,
      production: p.production?.name || '',
      dataList: p.dataList?.name || '',
      smtpGroup: p.smtpGroup?.name || '',
      mtaServer: p.mtaServer?.name || '',
      offer: p.offer?.name || '',
      status: p.status,
      speed: p.speed,
      throttle: p.throttle,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
    }));

    res.json({ data: report, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.getAdvancedReport = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, groupBy } = req.query;

    const where = {
      ...(dateFrom && dateTo && {
        createdAt: { gte: new Date(dateFrom), lte: new Date(dateTo) },
      }),
    };

    const processes = await prisma.sendProcess.findMany({
      where,
      include: {
        production: { select: { name: true } },
        dataList: { select: { name: true } },
        mtaServer: { select: { name: true } },
        offer: { select: { name: true } },
      },
    });

    const stats = {
      totalProcesses: processes.length,
      totalSent: processes.reduce((sum, p) => sum + (p.speed || 0), 0),
      byStatus: {},
      byMtaServer: {},
      byOffer: {},
    };

    processes.forEach((p) => {
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      if (p.mtaServer?.name) {
        stats.byMtaServer[p.mtaServer.name] = (stats.byMtaServer[p.mtaServer.name] || 0) + (p.speed || 0);
      }
      if (p.offer?.name) {
        stats.byOffer[p.offer.name] = (stats.byOffer[p.offer.name] || 0) + (p.speed || 0);
      }
    });

    res.json({ stats, processes: processes.slice(0, 100) });
  } catch (error) {
    next(error);
  }
};
