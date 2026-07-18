const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Unique constraint violation.',
      field: err.meta?.target?.[0] || 'unknown',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      error: 'Foreign key constraint violation. Referenced record does not exist.',
      field: err.meta?.field_name || 'unknown',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error.' : (err.message || 'Internal server error.'),
  });
};

module.exports = errorHandler;
