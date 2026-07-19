const prisma = require('../config/database');
const { logAction } = require('./auditLogController');
const { paginate, buildSort } = require('../utils/helpers');

const domainSelect = {
  id: true, name: true, accountName: true, status: true, availability: true,
  expirationDate: true, hasBrand: true, flag: true, country: true,
  createdBy: true, createdAt: true, updatedAt: true,
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, status, availability, flag, sort, order } = req.query;

    const where = {
      ...(status && { status }),
      ...(availability && { availability }),
      ...(flag && { flag }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { accountName: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'name', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.domain.findMany({ where, orderBy, skip, take: limit, select: domainSelect }),
      prisma.domain.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const domain = await prisma.domain.findUnique({ where: { id }, select: domainSelect });
    if (!domain) return res.status(404).json({ error: 'Domain not found.' });
    res.json(domain);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, accountName, status, availability, expirationDate, country } = req.body;
    if (!name) return res.status(400).json({ error: 'Domain name is required.' });

    const domain = await prisma.domain.create({
      data: {
        name,
        accountName,
        status: status || 'Activated',
        availability: availability || 'Available',
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        country,
        createdBy: req.user?.email || 'admin',
      },
      select: domainSelect,
    });

    logAction(req.user?.email, 'Domain', 'create', domain.id, domain.name, req.user?.id).catch(() => {});
    res.status(201).json(domain);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { name, accountName, status, availability, expirationDate, country, hasBrand, flag } = req.body;

    const domain = await prisma.domain.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(accountName !== undefined && { accountName }),
        ...(status !== undefined && { status }),
        ...(availability !== undefined && { availability }),
        ...(expirationDate !== undefined && { expirationDate: expirationDate ? new Date(expirationDate) : null }),
        ...(country !== undefined && { country }),
        ...(hasBrand !== undefined && { hasBrand }),
        ...(flag !== undefined && { flag }),
      },
      select: domainSelect,
    });

    logAction(req.user?.email, 'Domain', 'update', domain.id, domain.name, req.user?.id).catch(() => {});
    res.json(domain);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.domain.delete({ where: { id } });
    logAction(req.user?.email, 'Domain', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Domain deleted.' });
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
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Activated' } });
        break;
      case 'inactivate':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Inactivated' } });
        break;
      case 'special':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Special' } });
        break;
      case 'privat':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { status: 'Privat' } });
        break;
      case 'available':
        await prisma.domain.updateMany({ where: { id: { in: intIds } }, data: { availability: 'Available' } });
        break;
      case 'delete':
        await prisma.domain.deleteMany({ where: { id: { in: intIds } } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid action.' });
    }

    res.json({ message: `Bulk ${action} completed.` });
  } catch (error) {
    next(error);
  }
};

exports.getRecords = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const records = await prisma.domainRecord.findMany({ where: { domainId: id }, orderBy: { type: 'asc' } });
    res.json(records);
  } catch (error) {
    next(error);
  }
};

exports.setRecords = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    const { records } = req.body;

    if (!records || !Array.isArray(records)) return res.status(400).json({ error: 'Records array is required.' });

    await prisma.domainRecord.deleteMany({ where: { domainId: id } });
    const created = await Promise.all(
      records.map((r) => prisma.domainRecord.create({
        data: {
          domainId: id,
          type: r.type,
          name: r.name,
          value: r.value,
          ttl: parseInt(r.ttl, 10) || 3600,
          priority: r.priority ? parseInt(r.priority, 10) : null,
          proxied: !!r.proxied,
        },
      }))
    );

    logAction(req.user?.email, 'DomainRecord', 'update', id, `Set ${created.length} records`, req.user?.id).catch(() => {});
    res.json(created);
  } catch (error) {
    next(error);
  }
};

exports.getAccountDomains = async (req, res, next) => {
  try {
    const domains = await prisma.domain.findMany({
      select: { id: true, name: true, accountName: true },
      orderBy: { name: 'asc' },
    });
    const grouped = {};
    for (const d of domains) {
      const key = d.accountName || 'Unassigned';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    }
    res.json(grouped);
  } catch (error) {
    next(error);
  }
};

exports.setMultiDomainsRecords = async (req, res, next) => {
  try {
    const { domainIds, operation, records } = req.body;
    if (!domainIds || !Array.isArray(domainIds) || !operation) {
      return res.status(400).json({ error: 'Domain IDs array and operation are required.' });
    }
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Records array is required.' });
    }

    const intIds = domainIds.map((id) => parseInt(id, 10));
    let affected = 0;

    for (const domainId of intIds) {
      switch (operation) {
        case 'add': {
          for (const r of records) {
            await prisma.domainRecord.create({
              data: {
                domainId,
                type: r.type,
                name: r.name,
                value: r.value,
                ttl: parseInt(r.ttl, 10) || 3600,
                priority: r.priority ? parseInt(r.priority, 10) : null,
                proxied: !!r.proxied,
              },
            });
            affected++;
          }
          break;
        }
        case 'edit': {
          for (const r of records) {
            const existing = await prisma.domainRecord.findFirst({
              where: { domainId, type: r.type, name: r.name },
            });
            if (existing) {
              await prisma.domainRecord.update({
                where: { id: existing.id },
                data: {
                  value: r.value || existing.value,
                  ttl: r.ttl ? parseInt(r.ttl, 10) : existing.ttl,
                  proxied: r.proxied !== undefined ? !!r.proxied : existing.proxied,
                },
              });
              affected++;
            }
          }
          break;
        }
        case 'delete': {
          for (const r of records) {
            const where = { domainId, type: r.type, name: r.name };
            if (r.value) where.value = r.value;
            const deleted = await prisma.domainRecord.deleteMany({ where });
            affected += deleted.count;
          }
          break;
        }
        default:
          return res.status(400).json({ error: 'Invalid operation. Use add, edit, or delete.' });
      }
    }

    logAction(req.user?.email, 'DomainRecord', `bulk-${operation}`, null, `${operation} ${affected} records across ${intIds.length} domains`, req.user?.id).catch(() => {});
    res.json({ message: `Bulk ${operation} completed. ${affected} records affected across ${intIds.length} domains.`, affected });
  } catch (error) {
    next(error);
  }
};

exports.listBrands = async (req, res, next) => {
  try {
    const domainBrands = await prisma.domainBrand.findMany({ orderBy: { createdAt: 'desc' } });
    const domainBrandNames = domainBrands.map((b) => b.name);

    const domainBrandsList = await prisma.domain.findMany({
      where: { hasBrand: true },
      select: { id: true, name: true },
    });

    const extraBrands = domainBrandsList
      .filter((d) => !domainBrandNames.includes(d.name))
      .map((d) => ({ id: `domain-${d.id}`, name: d.name, source: 'domain' }));

    res.json([...domainBrands, ...extraBrands]);
  } catch (error) {
    next(error);
  }
};

exports.createBrand = async (req, res, next) => {
  try {
    const { name, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Brand name is required.' });

    const brand = await prisma.domainBrand.create({
      data: { name, status: status || 'Activated' },
    });

    logAction(req.user?.email, 'DomainBrand', 'create', brand.id, brand.name, req.user?.id).catch(() => {});
    res.status(201).json(brand);
  } catch (error) {
    next(error);
  }
};

exports.deleteBrand = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.domainBrand.delete({ where: { id } });
    logAction(req.user?.email, 'DomainBrand', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Brand deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.listSubdomains = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const { search, sort, order } = req.query;

    const where = {
      ...(search && {
        OR: [
          { subdomain: { contains: search } },
        ],
      }),
    };

    const orderBy = buildSort(sort, order, ['id', 'subdomain', 'status', 'createdAt']);

    const [data, total] = await Promise.all([
      prisma.domainSubdomain.findMany({ where, orderBy, skip, take: limit }),
      prisma.domainSubdomain.count({ where }),
    ]);

    res.json({ data, total, page, limit });
  } catch (error) {
    next(error);
  }
};

exports.createSubdomain = async (req, res, next) => {
  try {
    const { domainId, subdomain, status } = req.body;
    if (!domainId || !subdomain) return res.status(400).json({ error: 'Domain ID and subdomain are required.' });

    const item = await prisma.domainSubdomain.create({
      data: {
        domainId: parseInt(domainId, 10),
        subdomain,
        status: status || 'Activated',
      },
    });

    logAction(req.user?.email, 'DomainSubdomain', 'create', item.id, item.subdomain, req.user?.id).catch(() => {});
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

exports.deleteSubdomain = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID parameter.' });
    await prisma.domainSubdomain.delete({ where: { id } });
    logAction(req.user?.email, 'DomainSubdomain', 'delete', id, null, req.user?.id).catch(() => {});
    res.json({ message: 'Subdomain deleted.' });
  } catch (error) {
    next(error);
  }
};
