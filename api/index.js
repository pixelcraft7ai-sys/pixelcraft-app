export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('API is working ESM headers');
}
