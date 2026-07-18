const prisma = require('../config/database');

exports.getStats = async (req, res, next) => {
  try {
    const activeServers = await prisma.smtpServer.count({ where: { status: 'Activated' } });

    res.json({
      activeServers,
      activeSponsors: 0,
      dailyTests: 0,
      dailySent: 0,
      dailyBounced: 0,
      monthlyLeads: 0,
      activeIPs: 0,
      activeOffers: 0,
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
