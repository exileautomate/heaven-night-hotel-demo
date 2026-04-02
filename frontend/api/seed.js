import { setData, SEED_DATA } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await setData(JSON.parse(JSON.stringify(SEED_DATA)));
    res.json({ success: true, message: 'Data reset to seed values' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
