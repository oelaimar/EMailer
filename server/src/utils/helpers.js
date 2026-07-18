const paginate = (page = 1, limit = 25) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (p - 1) * l;
  return { page: p, limit: l, skip };
};

const buildSearch = (search, fields) => {
  if (!search) return {};
  return {
    OR: fields.map((field) => ({
      [field]: { contains: search },
    })),
  };
};

const buildSort = (sort, order, allowedFields) => {
  if (!sort || !allowedFields.includes(sort)) return { createdAt: 'desc' };
  return { [sort]: order === 'asc' ? 'asc' : 'desc' };
};

module.exports = { paginate, buildSearch, buildSort };
