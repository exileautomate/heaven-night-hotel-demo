import { getData, setData } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { roomId } = req.body;
  if (!roomId) return res.status(400).json({ error: 'roomId required' });

  try {
    const db = await getData();
    const room = db.rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    room.status = room.status === 'available' ? 'booked' : 'available';
    await setData(db);

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
