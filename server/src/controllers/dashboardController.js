const prisma = require('../config/database');

exports.getStats = async (req, res, next) => {
  try {
    const [activeServers, activeOffers, totalMtaServers, totalDomains, totalMailboxes, totalDataLists, totalUsers] = await Promise.all([
      prisma.smtpServer.count({ where: { status: 'Activated' } }),
      prisma.offer.count({ where: { status: 'Activated' } }),
      prisma.mtaServer.count(),
      prisma.domain.count(),
      prisma.mailbox.count(),
      prisma.dataList.count(),
      prisma.user.count(),
    ]);

    let activeIPs = 0;
    try {
      const mtaServers = await prisma.mtaServer.findMany({ select: { ips: true } });
      const allIps = new Set();
      mtaServers.forEach((s) => {
        if (Array.isArray(s.ips)) s.ips.forEach((ip) => { if (ip) allIps.add(ip); });
      });
      activeIPs = allIps.size;
    } catch { activeIPs = 0; }

    res.json({
      activeServers,
      activeOffers,
      activeIPs,
      totalMtaServers,
      totalDomains,
      totalMailboxes,
      totalDataLists,
      totalUsers,
      dailySent: 0,
      dailyBounced: 0,
      monthlyLeads: 0,
      dailyDrops: 0,
      dailyDelivered: 0,
      monthlyClicks: 0,
      monthlyEarnings: '0.00',
    });
  } catch (error) {
    next(error);
  }
};

exports.getCharts = async (req, res, next) => {
  try {
    res.json({
      sentStats: [],
      actionsStats: [],
      dailyEarnings: [],
      monthlyEarnings: [],
    });
  } catch (error) {
    next(error);
  }
};
