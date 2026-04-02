const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ====== IN-MEMORY DATABASE ======
let nextIds = { category: 4, room: 16 };

const db = {
  hotels: [
    { id: 1, name: 'Heaven Night Hotel', location: 'Mumbai' },
  ],
  categories: [
    { id: 1, hotelId: 1, name: 'Deluxe Room' },
    { id: 2, hotelId: 1, name: 'Super Deluxe' },
    { id: 3, hotelId: 1, name: 'Premium Suite' },
  ],
  rooms: [
    { id: 1, categoryId: 1, roomNumber: '101', status: 'booked' },
    { id: 2, categoryId: 1, roomNumber: '102', status: 'booked' },
    { id: 3, categoryId: 1, roomNumber: '103', status: 'booked' },
    { id: 4, categoryId: 1, roomNumber: '104', status: 'available' },
    { id: 5, categoryId: 1, roomNumber: '105', status: 'available' },
    { id: 6, categoryId: 1, roomNumber: '106', status: 'available' },
    { id: 7, categoryId: 1, roomNumber: '107', status: 'available' },
    { id: 8, categoryId: 2, roomNumber: '201', status: 'booked' },
    { id: 9, categoryId: 2, roomNumber: '202', status: 'available' },
    { id: 10, categoryId: 2, roomNumber: '203', status: 'available' },
    { id: 11, categoryId: 2, roomNumber: '204', status: 'available' },
    { id: 12, categoryId: 2, roomNumber: '205', status: 'available' },
    { id: 13, categoryId: 3, roomNumber: '301', status: 'available' },
    { id: 14, categoryId: 3, roomNumber: '302', status: 'available' },
    { id: 15, categoryId: 3, roomNumber: '303', status: 'available' },
  ],
};

// ====== HELPERS ======
function getHotelSummary(hotelId) {
  const catIds = db.categories.filter(c => c.hotelId === hotelId).map(c => c.id);
  const allRooms = db.rooms.filter(r => catIds.includes(r.categoryId));
  return {
    totalRooms: allRooms.length,
    bookedRooms: allRooms.filter(r => r.status === 'booked').length,
    availableRooms: allRooms.filter(r => r.status === 'available').length,
  };
}

function getCategoryWithRooms(categoryId) {
  const cat = db.categories.find(c => c.id === categoryId);
  if (!cat) return null;
  const rooms = db.rooms
    .filter(r => r.categoryId === categoryId)
    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
  return {
    ...cat,
    rooms,
    totalRooms: rooms.length,
    bookedRooms: rooms.filter(r => r.status === 'booked').length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
  };
}

// ====== API ROUTES (matching Vercel function paths) ======

// GET /api/hotels
app.get('/api/hotels', (req, res) => {
  res.json(db.hotels.map(h => ({ ...h, ...getHotelSummary(h.id) })));
});

// GET /api/hotel-data?id=1
app.get('/api/hotel-data', (req, res) => {
  const id = parseInt(req.query.id);
  if (!id) return res.status(400).json({ error: 'id query param required' });

  const hotel = db.hotels.find(h => h.id === id);
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  const cats = db.categories.filter(c => c.hotelId === id);
  res.json({
    ...hotel,
    ...getHotelSummary(id),
    categories: cats.map(c => getCategoryWithRooms(c.id)),
  });
});

// POST /api/toggle-room  { roomId }
app.post('/api/toggle-room', (req, res) => {
  const { roomId } = req.body;
  const room = db.rooms.find(r => r.id === roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  room.status = room.status === 'available' ? 'booked' : 'available';
  res.json({ success: true, room });
});

// POST /api/bulk-action  { roomIds, action }
app.post('/api/bulk-action', (req, res) => {
  const { roomIds, action } = req.body;
  if (!roomIds?.length || !['book', 'unbook'].includes(action)) {
    return res.status(400).json({ error: 'roomIds[] and action (book/unbook) required' });
  }

  let count = 0;
  roomIds.forEach(id => {
    const room = db.rooms.find(r => r.id === id);
    if (!room) return;
    const target = action === 'book' ? 'booked' : 'available';
    if (room.status !== target) { room.status = target; count++; }
  });

  res.json({ success: true, updated: count });
});

// POST /api/add-category  { hotelId, name, startNumber, count }
app.post('/api/add-category', (req, res) => {
  const { hotelId, name, startNumber, count } = req.body;

  if (!hotelId || !name || !startNumber || !count || count < 1) {
    return res.status(400).json({ error: 'hotelId, name, startNumber, count required' });
  }
  if (!db.hotels.find(h => h.id === hotelId)) {
    return res.status(404).json({ error: 'Hotel not found' });
  }

  const hotelCatIds = db.categories.filter(c => c.hotelId === hotelId).map(c => c.id);
  const existing = new Set(db.rooms.filter(r => hotelCatIds.includes(r.categoryId)).map(r => r.roomNumber));

  for (let i = 0; i < count; i++) {
    const num = String(parseInt(startNumber) + i);
    if (existing.has(num)) {
      return res.status(400).json({ error: `Room ${num} already exists` });
    }
  }

  const category = { id: nextIds.category++, hotelId, name };
  db.categories.push(category);

  for (let i = 0; i < count; i++) {
    db.rooms.push({
      id: nextIds.room++,
      categoryId: category.id,
      roomNumber: String(parseInt(startNumber) + i),
      status: 'available',
    });
  }

  res.status(201).json({ success: true, categoryId: category.id });
});

// POST /api/delete-category  { categoryId }
app.post('/api/delete-category', (req, res) => {
  const { categoryId } = req.body;
  if (!categoryId) return res.status(400).json({ error: 'categoryId required' });

  const catIndex = db.categories.findIndex(c => c.id === categoryId);
  if (catIndex === -1) return res.status(404).json({ error: 'Category not found' });

  // Remove category and its rooms
  db.categories.splice(catIndex, 1);
  db.rooms = db.rooms.filter(r => r.categoryId !== categoryId);

  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🏨 Heaven Night API → http://localhost:${PORT}`);
  console.log(`📡 Ready for local development`);
});
