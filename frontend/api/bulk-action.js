import { getData, setData } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { roomIds, action } = req.body;
  if (!roomIds?.length || !['book', 'unbook'].includes(action)) {
    return res.status(400).json({ error: 'roomIds[] and action (book/unbook) required' });
  }

  try {
    const db = await getData();
    let count = 0;
    roomIds.forEach((id) => {
      const room = db.rooms.find((r) => r.id === id);
      if (!room) return;
      const target = action === 'book' ? 'booked' : 'available';
      if (room.status !== target) {
        room.status = target;
        count++;
      }
    });

    await setData(db);
    res.json({ success: true, updated: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
