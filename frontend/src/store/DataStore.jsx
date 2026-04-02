import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DataContext = createContext(null);

// ====== DEFAULT SEED DATA ======
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

const STORAGE_KEY = 'heaven_height_data';

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return JSON.parse(JSON.stringify(SEED_DATA));
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// BroadcastChannel for cross-tab real-time sync
let channel = null;
try {
  channel = new BroadcastChannel('heaven_height_sync');
} catch (e) {
  // BroadcastChannel not supported — single-tab only
}

export function DataProvider({ children }) {
  const [db, setDb] = useState(loadData);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Save to localStorage whenever db changes
  useEffect(() => {
    saveData(db);
  }, [db]);

  // Listen for cross-tab updates
  useEffect(() => {
    if (!channel) return;
    const handler = (e) => {
      if (e.data?.type === 'SYNC') {
        setDb(e.data.payload);
        setLastUpdate(new Date());
      }
    };
    channel.addEventListener('message', handler);
    return () => channel.removeEventListener('message', handler);
  }, []);

  // Broadcast changes to other tabs
  const broadcastUpdate = useCallback((newDb) => {
    if (channel) {
      channel.postMessage({ type: 'SYNC', payload: newDb });
    }
    setLastUpdate(new Date());
  }, []);

  // ====== COMPUTED HELPERS ======
  const getHotelSummary = useCallback(
    (hotelId) => {
      const catIds = db.categories.filter((c) => c.hotelId === hotelId).map((c) => c.id);
      const allRooms = db.rooms.filter((r) => catIds.includes(r.categoryId));
      return {
        totalRooms: allRooms.length,
        bookedRooms: allRooms.filter((r) => r.status === 'booked').length,
        availableRooms: allRooms.filter((r) => r.status === 'available').length,
      };
    },
    [db]
  );

  const getCategoryWithRooms = useCallback(
    (categoryId) => {
      const cat = db.categories.find((c) => c.id === categoryId);
      if (!cat) return null;
      const rooms = db.rooms
        .filter((r) => r.categoryId === categoryId)
        .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
      return {
        ...cat,
        rooms,
        totalRooms: rooms.length,
        bookedRooms: rooms.filter((r) => r.status === 'booked').length,
        availableRooms: rooms.filter((r) => r.status === 'available').length,
      };
    },
    [db]
  );

  // ====== ACTIONS ======
  const getHotels = useCallback(() => {
    return db.hotels.map((h) => ({ ...h, ...getHotelSummary(h.id) }));
  }, [db, getHotelSummary]);

  const getHotelData = useCallback(
    (hotelId) => {
      const hotel = db.hotels.find((h) => h.id === hotelId);
      if (!hotel) return null;
      const cats = db.categories.filter((c) => c.hotelId === hotelId);
      return {
        ...hotel,
        ...getHotelSummary(hotelId),
        categories: cats.map((c) => getCategoryWithRooms(c.id)),
      };
    },
    [db, getHotelSummary, getCategoryWithRooms]
  );

  const toggleRoom = useCallback(
    (roomId) => {
      setDb((prev) => {
        const newDb = JSON.parse(JSON.stringify(prev));
        const room = newDb.rooms.find((r) => r.id === roomId);
        if (!room) return prev;
        room.status = room.status === 'available' ? 'booked' : 'available';
        broadcastUpdate(newDb);
        return newDb;
      });
    },
    [broadcastUpdate]
  );

  const bulkAction = useCallback(
    (roomIds, action) => {
      setDb((prev) => {
        const newDb = JSON.parse(JSON.stringify(prev));
        let count = 0;
        roomIds.forEach((id) => {
          const room = newDb.rooms.find((r) => r.id === id);
          if (!room) return;
          const target = action === 'book' ? 'booked' : 'available';
          if (room.status !== target) {
            room.status = target;
            count++;
          }
        });
        if (count > 0) broadcastUpdate(newDb);
        return newDb;
      });
    },
    [broadcastUpdate]
  );

  const addCategory = useCallback(
    (hotelId, name, startNumber, count) => {
      let error = null;
      setDb((prev) => {
        const newDb = JSON.parse(JSON.stringify(prev));

        // Check duplicates
        const hotelCatIds = newDb.categories.filter((c) => c.hotelId === hotelId).map((c) => c.id);
        const existing = new Set(
          newDb.rooms.filter((r) => hotelCatIds.includes(r.categoryId)).map((r) => r.roomNumber)
        );

        for (let i = 0; i < count; i++) {
          const num = String(parseInt(startNumber) + i);
          if (existing.has(num)) {
            error = `Room ${num} already exists`;
            return prev;
          }
        }

        const catId = newDb.nextIds.category++;
        newDb.categories.push({ id: catId, hotelId, name });

        for (let i = 0; i < count; i++) {
          newDb.rooms.push({
            id: newDb.nextIds.room++,
            categoryId: catId,
            roomNumber: String(parseInt(startNumber) + i),
            status: 'available',
          });
        }

        broadcastUpdate(newDb);
        return newDb;
      });
      return error;
    },
    [broadcastUpdate]
  );

  const resetData = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(SEED_DATA));
    setDb(fresh);
    broadcastUpdate(fresh);
  }, [broadcastUpdate]);

  return (
    <DataContext.Provider
      value={{
        getHotels,
        getHotelData,
        toggleRoom,
        bulkAction,
        addCategory,
        resetData,
        lastUpdate,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
