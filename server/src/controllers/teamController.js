const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSearch, buildSort } = require('../utils/helpers');

const select = {
  id: true, name: true, status: true, isps: true, createdBy: true, createdAt: true, updatedAt: true,
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
      prisma.team.findMany({ where, orderBy, skip, take: limit, select }),
      prisma.team.count({ where }),
    ]);

    const enriched = await Promise.all(data.map(async (t) => {
      const members = await prisma.teamUser.count({ where: { teamId: t.id } });
      const authorizations = await prisma.teamAuthorization.count({ where: { teamId: t.id } });
      return { ...t, teamMembersCount: members, teamLeadersCount: authorizations };
    }));

    res.json({ data: enriched, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const item = await prisma.team.findUnique({ where: { id }, select });
    if (!item) return res.status(404).json({ error: 'Team not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, status, isps } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const item = await prisma.team.create({
      data: {
        name,
        status: status || 'Activated',
        isps: isps || [],
        createdBy: req.user?.email || 'admin',
      },
      select,
    });

    logAction(req.user?.email, 'Team', 'create', item.id, item.name, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, status, isps } = req.body;

    const item = await prisma.team.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(isps !== undefined && { isps }),
      },
      select,
    });

    logAction(req.user?.email, 'Team', 'update', item.id, item.name, req.user?.id).catch(() => {});
    res.json(item);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.team.delete({ where: { id } });
    logAction(req.user?.email, 'Team', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Team deleted.' });
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
        await prisma.team.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.team.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'delete':
        await prisma.team.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const teamUsers = await prisma.teamUser.findMany({
      where: { teamId: id },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    res.json(teamUsers.map((tu) => tu.user));
  } catch (error) {
    next(error);
  }
};

exports.setUsers = async (req, res, next) => {
  try {
    const { teamId, userIds } = req.body;
    if (!teamId || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'teamId and userIds array are required.' });
    }

    const parsedTeamId = parseInt(teamId, 10);
    const parsedUserIds = userIds.map((id) => parseInt(id, 10));

    await prisma.$transaction(async (tx) => {
      await tx.teamUser.deleteMany({ where: { teamId: parsedTeamId } });
      if (parsedUserIds.length > 0) {
        await tx.teamUser.createMany({
          data: parsedUserIds.map((userId) => ({ teamId: parsedTeamId, userId })),
        });
      }
    });

    res.json({ message: 'Team users updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getAuthorizations = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const auths = await prisma.teamAuthorization.findMany({
      where: { teamId: id },
    });
    res.json(auths);
  } catch (error) {
    next(error);
  }
};

exports.setAuthorizations = async (req, res, next) => {
  try {
    const { teamId, authorizations } = req.body;
    if (!teamId || !authorizations || !Array.isArray(authorizations)) {
      return res.status(400).json({ error: 'teamId and authorizations array are required.' });
    }

    const parsedTeamId = parseInt(teamId, 10);

    await prisma.$transaction(async (tx) => {
      await tx.teamAuthorization.deleteMany({ where: { teamId: parsedTeamId } });
      if (authorizations.length > 0) {
        await tx.teamAuthorization.createMany({
          data: authorizations.map((auth) => ({
            teamId: parsedTeamId,
            userId: parseInt(auth.userId, 10),
            mtaServers: auth.mtaServers || [],
            smtpServers: auth.smtpServers || [],
            offers: auth.offers || [],
            dataLists: auth.dataLists || [],
          })),
        });
      }
    });

    res.json({ message: 'Team authorizations updated successfully.' });
  } catch (error) {
    next(error);
  }
};
