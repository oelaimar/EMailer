const prisma = require('../config/database');

const roleCheck = (section, action) => {
  return async (req, res, next) => {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.user.id },
        include: { role: true },
      });

      if (userRoles.length === 0) {
        return res.status(403).json({ error: 'No roles assigned.' });
      }

      for (const ur of userRoles) {
        const permissions = ur.role.permissions;
        if (permissions && permissions[section] && permissions[section][action]) {
          return next();
        }
      }

      return res.status(403).json({ error: 'Insufficient permissions.' });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = roleCheck;
