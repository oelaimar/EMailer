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
      const mtaServers = await prisma.mtaServer.findMany({ select: { ips: true, mainIp: true } });
      const allIps = new Set();
      mtaServers.forEach((s) => {
        if (s.mainIp) allIps.add(s.mainIp);
        if (s.ips && typeof s.ips === 'string') {
          s.ips.split(',').map(ip => ip.trim()).filter(Boolean).forEach(ip => allIps.add(ip));
        }
      });
      activeIPs = allIps.size;
    } catch { activeIPs = 0; }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [dailyDrops, dailyDelivered, monthlyLeads] = await Promise.all([
      prisma.sendProcess.count({ where: { createdAt: { gte: today } } }),
      prisma.sendProcess.count({ where: { createdAt: { gte: today }, status: 'Completed' } }),
      prisma.sendProcess.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    let monthlyEarnings = '0.00';
    try {
      const deliveredProcesses = await prisma.sendProcess.findMany({
        where: { createdAt: { gte: startOfMonth }, status: 'Completed' },
        select: { offerId: true, speed: true },
      });
      let totalEarnings = 0;
      const offerIds = [...new Set(deliveredProcesses.map(p => p.offerId).filter(Boolean))];
      if (offerIds.length > 0) {
        const offers = await prisma.offer.findMany({ where: { id: { in: offerIds } }, select: { id: true, payout: true } });
        const offerMap = new Map(offers.map(o => [o.id, o]));
        for (const p of deliveredProcesses) {
          if (p.offerId) {
            const offer = offerMap.get(p.offerId);
            if (offer && offer.payout) totalEarnings += parseFloat(offer.payout) * (p.speed || 0);
          }
        }
      }
      monthlyEarnings = totalEarnings.toFixed(2);
    } catch { monthlyEarnings = '0.00'; }

    res.json({
      activeServers,
      activeOffers,
      activeIPs,
      totalMtaServers,
      totalDomains,
      totalMailboxes,
      totalDataLists,
      totalUsers,
      dailySent: dailyDrops,
      monthlyLeads,
      dailyDrops,
      dailyDelivered,
      monthlyEarnings,
    });
  } catch (error) {
    next(error);
  }
};

exports.getCharts = async (req, res, next) => {
  try {
    const sentStats = [];
    const actionsStats = [];
    const dailyEarnings = [];
    const monthlyEarnings = [];

    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);

      const allProcesses = await prisma.sendProcess.findMany({
        where: { createdAt: { gte: weekAgo } },
        select: { createdAt: true, status: true },
      });

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const dayLabel = date.toISOString().split('T')[0];

        let sent = 0, completed = 0;
        for (const p of allProcesses) {
          if (p.createdAt >= date && p.createdAt < nextDate) {
            sent++;
            if (p.status === 'Completed') completed++;
          }
        }
        sentStats.push({ date: dayLabel, value: sent });
        actionsStats.push({ date: dayLabel, value: completed });
      }
    } catch { /* ignore chart errors */ }

    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const processes = await prisma.sendProcess.findMany({
        where: { createdAt: { gte: startOfMonth } },
        select: { createdAt: true, offerId: true, speed: true },
      });

      const offerIds = [...new Set(processes.map(p => p.offerId).filter(Boolean))];
      const offerMap = new Map();
      if (offerIds.length > 0) {
        const offers = await prisma.offer.findMany({ where: { id: { in: offerIds } }, select: { id: true, payout: true } });
        offers.forEach(o => offerMap.set(o.id, o));
      }

      const byDate = {};
      for (const p of processes) {
        const day = p.createdAt.toISOString().split('T')[0];
        if (!byDate[day]) byDate[day] = 0;
        if (p.offerId) {
          const offer = offerMap.get(p.offerId);
          if (offer && offer.payout) byDate[day] += parseFloat(offer.payout) * (p.speed || 0);
        }
      }

      for (const [date, value] of Object.entries(byDate)) {
        dailyEarnings.push({ date, value: value.toFixed(2) });
      }

      const totalEarnings = dailyEarnings.reduce((sum, d) => sum + parseFloat(d.value), 0);
      monthlyEarnings.push({ date: startOfMonth.toISOString().split('T')[0] + '-' + today.toISOString().split('T')[0], value: totalEarnings.toFixed(2) });
    } catch { /* ignore chart errors */ }

    res.json({ sentStats, actionsStats, dailyEarnings, monthlyEarnings });
  } catch (error) {
    next(error);
  }
};
