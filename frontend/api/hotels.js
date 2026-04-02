import { getData } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = await getData();
    const hotels = db.hotels.map((h) => {
      const catIds = db.categories.filter((c) => c.hotelId === h.id).map((c) => c.id);
      const allRooms = db.rooms.filter((r) => catIds.includes(r.categoryId));
      return {
        ...h,
        totalRooms: allRooms.length,
        bookedRooms: allRooms.filter((r) => r.status === 'booked').length,
        availableRooms: allRooms.filter((r) => r.status === 'available').length,
      };
    });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
