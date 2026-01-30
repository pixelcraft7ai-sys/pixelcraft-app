export default function handler(req, res) {
  res.status(200).json({ status: 'ok', message: 'Simple API is working' });
}
