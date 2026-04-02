const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// ====== SEED DATA ======
const SEED_DATA = {
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
  nextIds: { category: 4, room: 16 },
};

// ====== STORAGE LAYER (Redis on Vercel, In-Memory locally) ======
const DATA_KEY = 'heaven_night:data';
let redis = null;
let memoryDb = JSON.parse(JSON.stringify(SEED_DATA));

// Try to load Upstash Redis if env vars exist
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const { Redis } = require('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('📦 Using Upstash Redis');
} else {
  console.log('📦 Using in-memory storage (no Redis env vars found)');
}

async function getData() {
  if (redis) {
    const data = await redis.get(DATA_KEY);
    if (!data) {
      await redis.set(DATA_KEY, JSON.stringify(SEED_DATA));
      return JSON.parse(JSON.stringify(SEED_DATA));
    }
    return typeof data === 'string' ? JSON.parse(data) : data;
  }
  return memoryDb;
}

async function setData(db) {
  if (redis) {
    await redis.set(DATA_KEY, JSON.stringify(db));
  } else {
    memoryDb = db;
  }
}

// ====== HELPERS ======
function getHotelSummary(db, hotelId) {
  const catIds = db.categories.filter(c => c.hotelId === hotelId).map(c => c.id);
  const allRooms = db.rooms.filter(r => catIds.includes(r.categoryId));
  return {
    totalRooms: allRooms.length,
    bookedRooms: allRooms.filter(r => r.status === 'booked').length,
    availableRooms: allRooms.filter(r => r.status === 'available').length,
  };
}

function getCategoryWithRooms(db, categoryId) {
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

// ====== API ROUTES ======

// GET /api/hotels
app.get('/api/hotels', async (req, res) => {
  try {
    const db = await getData();
    res.json(db.hotels.map(h => ({ ...h, ...getHotelSummary(db, h.id) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hotel-data?id=1
app.get('/api/hotel-data', async (req, res) => {
  try {
    const id = parseInt(req.query.id);
    if (!id) return res.status(400).json({ error: 'id query param required' });

    const db = await getData();
    const hotel = db.hotels.find(h => h.id === id);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    const cats = db.categories.filter(c => c.hotelId === id);
    res.json({
      ...hotel,
      ...getHotelSummary(db, id),
      categories: cats.map(c => getCategoryWithRooms(db, c.id)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/toggle-room  { roomId }
app.post('/api/toggle-room', async (req, res) => {
  try {
    const { roomId } = req.body;
    const db = await getData();
    const room = db.rooms.find(r => r.id === roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    room.status = room.status === 'available' ? 'booked' : 'available';
    await setData(db);
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bulk-action  { roomIds, action }
app.post('/api/bulk-action', async (req, res) => {
  try {
    const { roomIds, action } = req.body;
    if (!roomIds?.length || !['book', 'unbook'].includes(action)) {
      return res.status(400).json({ error: 'roomIds[] and action (book/unbook) required' });
    }

    const db = await getData();
    let count = 0;
    roomIds.forEach(id => {
      const room = db.rooms.find(r => r.id === id);
      if (!room) return;
      const target = action === 'book' ? 'booked' : 'available';
      if (room.status !== target) { room.status = target; count++; }
    });

    await setData(db);
    res.json({ success: true, updated: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/add-category  { hotelId, name, startNumber, count }
app.post('/api/add-category', async (req, res) => {
  try {
    const { hotelId, name, startNumber, count } = req.body;

    if (!hotelId || !name || !startNumber || !count || count < 1) {
      return res.status(400).json({ error: 'hotelId, name, startNumber, count required' });
    }

    const db = await getData();
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

    const category = { id: db.nextIds.category++, hotelId, name };
    db.categories.push(category);

    for (let i = 0; i < count; i++) {
      db.rooms.push({
        id: db.nextIds.room++,
        categoryId: category.id,
        roomNumber: String(parseInt(startNumber) + i),
        status: 'available',
      });
    }

    await setData(db);
    res.status(201).json({ success: true, categoryId: category.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/delete-category  { categoryId }
app.post('/api/delete-category', async (req, res) => {
  try {
    const { categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ error: 'categoryId required' });

    const db = await getData();
    const catIndex = db.categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) return res.status(404).json({ error: 'Category not found' });

    db.categories.splice(catIndex, 1);
    db.rooms = db.rooms.filter(r => r.categoryId !== categoryId);

    await setData(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/seed — Reset data
app.post('/api/seed', async (req, res) => {
  try {
    await setData(JSON.parse(JSON.stringify(SEED_DATA)));
    res.json({ success: true, message: 'Data reset to seed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🏨 Heaven Night API → http://localhost:${PORT}`);
  console.log(`📡 Ready`);
});
