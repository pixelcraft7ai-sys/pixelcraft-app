module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.end('API is working CJS headers');
};
