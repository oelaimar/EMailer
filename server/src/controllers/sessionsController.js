const prisma = require('../config/database');
const { paginate } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);

    const [data, total] = await Promise.all([
      prisma.session.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              productionId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.session.count({ where: { isActive: true } }),
    ]);

    const formatted = data.map((s) => ({
      id: s.id,
      productionId: s.user?.productionId,
      firstName: s.user?.firstName,
      lastName: s.user?.lastName,
      email: s.user?.email,
      status: 'Active',
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
    }));

    res.json({ data: formatted, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.forceDisconnect = async (req, res, next) => {
  try {
    const { sessionIds } = req.body;
    if (!sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({ error: 'sessionIds array is required.' });
    }

    await prisma.session.updateMany({
      where: { id: { in: sessionIds.map((id) => parseInt(id)) } },
      data: { isActive: false },
    });

    res.json({ message: 'Sessions disconnected.' });
  } catch (error) {
    next(error);
  }
};
