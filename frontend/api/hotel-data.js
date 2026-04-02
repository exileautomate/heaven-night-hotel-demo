import { getData } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const hotelId = parseInt(req.query.id);
  if (!hotelId) return res.status(400).json({ error: 'id query param required' });

  try {
    const db = await getData();
    const hotel = db.hotels.find((h) => h.id === hotelId);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    const cats = db.categories.filter((c) => c.hotelId === hotelId);
    const categories = cats.map((cat) => {
      const rooms = db.rooms
        .filter((r) => r.categoryId === cat.id)
        .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
      return {
        ...cat,
        rooms,
        totalRooms: rooms.length,
        bookedRooms: rooms.filter((r) => r.status === 'booked').length,
        availableRooms: rooms.filter((r) => r.status === 'available').length,
      };
    });

    const allRooms = db.rooms.filter((r) => cats.some((c) => c.id === r.categoryId));
    res.json({
      ...hotel,
      categories,
      totalRooms: allRooms.length,
      bookedRooms: allRooms.filter((r) => r.status === 'booked').length,
      availableRooms: allRooms.filter((r) => r.status === 'available').length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
