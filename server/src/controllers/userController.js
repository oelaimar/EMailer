const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate } = require('../utils/helpers');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status } = req.query;

    const where = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          productionId: true,
          superUserStatus: true,
          status: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, productionId, status } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'First name, last name, email and password are required.' });
    }

    const { validateEmail, validatePassword } = require('../utils/validation');
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, and a number.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        productionId: productionId ? parseInt(productionId, 10) : null,
        superUserStatus: 'Disabled',
        status: status || 'Activated',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        productionId: true,
        superUserStatus: true,
        status: true,
        createdAt: true,
      },
    });

    logAction(req.user?.email, 'User', 'create', user.id, user.email, req.user?.id).catch(() => {});
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        productionId: true,
        superUserStatus: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { firstName, lastName, email, password, productionId, superUserStatus, status } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (productionId !== undefined) updateData.productionId = productionId ? parseInt(productionId) : null;
    if (superUserStatus !== undefined) updateData.superUserStatus = superUserStatus;
    if (status !== undefined) updateData.status = status;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        productionId: true,
        superUserStatus: true,
        status: true,
        updatedAt: true,
      },
    });

    logAction(req.user?.email, 'User', 'update', user.id, user.email, req.user?.id).catch(() => {});
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.user.delete({ where: { id } });
    logAction(req.user?.email, 'User', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};
