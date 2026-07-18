const prisma = require('../config/database');
const { paginate } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search } = req.query;

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.role.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.role.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, status, type, permissions } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Role name is required.' });
    }

    const role = await prisma.role.create({
      data: {
        name,
        status: status || 'Activated',
        type: type || 'Team Based Role',
        permissions: permissions || {},
      },
    });

    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ error: 'Role not found.' });
    res.json(role);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, status, type, permissions } = req.body;

    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(type !== undefined && { type }),
        ...(permissions !== undefined && { permissions }),
      },
    });

    res.json(role);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.role.delete({ where: { id } });
    res.json({ message: 'Role deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getRoleUsers = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const userRoles = await prisma.userRole.findMany({
      where: { roleId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(userRoles.map((ur) => ur.user));
  } catch (error) {
    next(error);
  }
};

exports.affectRoleToUsers = async (req, res, next) => {
  try {
    const { roleId, userIds } = req.body;
    if (!roleId || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'roleId and userIds array are required.' });
    }

    const parsedRoleId = parseInt(roleId, 10);
    const parsedUserIds = userIds.map((id) => parseInt(id, 10));

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { roleId: parsedRoleId } });
      await tx.userRole.createMany({
        data: parsedUserIds.map((userId) => ({
          roleId: parsedRoleId,
          userId,
        })),
      });
    });

    res.json({ message: 'Role affected to users successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.affectRolesToUser = async (req, res, next) => {
  try {
    const { userId, roleIds } = req.body;
    if (!userId || !roleIds || !Array.isArray(roleIds)) {
      return res.status(400).json({ error: 'userId and roleIds array are required.' });
    }

    const parsedUserId = parseInt(userId, 10);
    const parsedRoleIds = roleIds.map((id) => parseInt(id, 10));

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId: parsedUserId } });
      await tx.userRole.createMany({
        data: parsedRoleIds.map((roleId) => ({
          userId: parsedUserId,
          roleId,
        })),
      });
    });

    res.json({ message: 'Roles affected to user successfully.' });
  } catch (error) {
    next(error);
  }
};
