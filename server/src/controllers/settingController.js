const prisma = require('../config/database');
const { logAction } = require('./auditLogController');

exports.getAll = async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const result = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required.' });
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );

    await Promise.all(updates);
    res.json({ message: 'Settings updated successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await prisma.setting.findUnique({ where: { key } });
    res.json(setting ? { [key]: setting.value } : {});
  } catch (error) {
    next(error);
  }
};
