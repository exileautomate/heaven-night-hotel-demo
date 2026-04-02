import { useState, useEffect, useCallback } from 'react';
import SummaryCards from '../components/SummaryCards';
import RoomGrid from '../components/RoomGrid';
import AddCategoryModal from '../components/AddCategoryModal';
import Toast from '../components/Toast';

const HOTEL_ID = 1;

export default function HotelDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/hotel-data?id=${HOTEL_ID}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleToggle = async (roomId) => {
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      for (const cat of updated.categories) {
        const room = cat.rooms.find((r) => r.id === roomId);
        if (room) {
          room.status = room.status === 'available' ? 'booked' : 'available';
          cat.bookedRooms = cat.rooms.filter((r) => r.status === 'booked').length;
          cat.availableRooms = cat.rooms.filter((r) => r.status === 'available').length;
          break;
        }
      }
      updated.bookedRooms = updated.categories.reduce((s, c) => s + c.bookedRooms, 0);
      updated.availableRooms = updated.categories.reduce((s, c) => s + c.availableRooms, 0);
      return updated;
    });

    try {
      await fetch('/api/toggle-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
    } catch {
      fetchData();
      showToast('error', 'Failed to update room');
    }
  };

  const handleAddCategory = async (formData) => {
    try {
      const res = await fetch('/api/add-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId: HOTEL_ID, ...formData }),
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
        showToast('success', 'Category created!');
      } else {
        const err = await res.json();
        showToast('error', err.error);
      }
    } catch {
      showToast('error', 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const res = await fetch('/api/delete-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });
      if (res.ok) {
        fetchData();
        showToast('success', 'Category deleted');
      } else {
        const err = await res.json();
        showToast('error', err.error);
      }
    } catch {
      showToast('error', 'Failed to delete category');
    }
  };

  const showToast = (type, message) => setToast({ type, message, key: Date.now() });

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-5 max-w-6xl">
        <div className="h-7 w-52 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
        <div className="h-56 bg-white rounded-2xl animate-pulse border border-slate-100" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-slate-400">Failed to load data</div>;

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{data.name}</h1>
          <p className="text-slate-400 text-[13px] mt-0.5">{data.location} · Hotel Dashboard</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-emerald-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      {/* Summary */}
      <SummaryCards total={data.totalRooms} booked={data.bookedRooms} available={data.availableRooms} />

      {/* Room Grids */}
      {data.categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm mb-4">No rooms added yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.categories.map((cat) => (
            <RoomGrid key={cat.id} category={cat} onToggle={handleToggle} onDelete={handleDeleteCategory} interactive={true} />
          ))}
        </div>
      )}

      {showModal && <AddCategoryModal onClose={() => setShowModal(false)} onSubmit={handleAddCategory} />}
      {toast && <Toast key={toast.key} type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
