import { getData, setData } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { hotelId, name, startNumber, count } = req.body;
  if (!hotelId || !name || !startNumber || !count || count < 1) {
    return res.status(400).json({ error: 'hotelId, name, startNumber, count required' });
  }

  try {
    const db = await getData();

    if (!db.hotels.find((h) => h.id === hotelId)) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Check for duplicate room numbers
    const hotelCatIds = db.categories.filter((c) => c.hotelId === hotelId).map((c) => c.id);
    const existing = new Set(
      db.rooms.filter((r) => hotelCatIds.includes(r.categoryId)).map((r) => r.roomNumber)
    );

    for (let i = 0; i < count; i++) {
      const num = String(parseInt(startNumber) + i);
      if (existing.has(num)) {
        return res.status(400).json({ error: `Room ${num} already exists` });
      }
    }

    // Create category
    const catId = db.nextIds.category++;
    db.categories.push({ id: catId, hotelId, name });

    // Create rooms
    for (let i = 0; i < count; i++) {
      db.rooms.push({
        id: db.nextIds.room++,
        categoryId: catId,
        roomNumber: String(parseInt(startNumber) + i),
        status: 'available',
      });
    }

    await setData(db);
    res.status(201).json({ success: true, categoryId: catId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
