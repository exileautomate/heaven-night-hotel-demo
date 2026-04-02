import { getData, setData } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { categoryId } = req.body;
  if (!categoryId) return res.status(400).json({ error: 'categoryId required' });

  try {
    const db = await getData();

    const catIndex = db.categories.findIndex((c) => c.id === categoryId);
    if (catIndex === -1) return res.status(404).json({ error: 'Category not found' });

    db.categories.splice(catIndex, 1);
    db.rooms = db.rooms.filter((r) => r.categoryId !== categoryId);

    await setData(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
