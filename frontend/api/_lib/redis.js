import { Redis } from '@upstash/redis';

let redis;
try {
  redis = Redis.fromEnv();
} catch (e) {
  console.error('Redis connection failed:', e.message);
}

const DATA_KEY = 'heaven_height:data';

const SEED_DATA = {
  hotels: [{ id: 1, name: 'Heaven Night Hotel', location: 'Mumbai' }],
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

export async function getData() {
  if (!redis) throw new Error('Redis not configured');
  const data = await redis.get(DATA_KEY);
  if (!data) {
    await redis.set(DATA_KEY, SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function setData(data) {
  if (!redis) throw new Error('Redis not configured');
  await redis.set(DATA_KEY, data);
}

export { SEED_DATA };
