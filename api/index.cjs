module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'CJS API is working',
    env: process.env.DATABASE_URL ? 'DB_URL_SET' : 'DB_URL_MISSING'
  });
};
