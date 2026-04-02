import { useState, useEffect, useCallback } from 'react';
import SummaryCards from '../components/SummaryCards';
import RoomGrid from '../components/RoomGrid';

export default function AgencyView() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchHotels = useCallback(async () => {
    try {
      const res = await fetch('/api/hotels');
      const data = await res.json();
      setHotels(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHotelData = useCallback(async (hotelId) => {
    try {
      const res = await fetch(`/api/hotel-data?id=${hotelId}`);
      const data = await res.json();
      setHotelData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Failed to fetch hotel data:', err);
    }
  }, []);

  // Initial fetch + polling every 3 seconds
  useEffect(() => {
    fetchHotels();
    const interval = setInterval(() => {
      fetchHotels();
      if (selectedHotel) fetchHotelData(selectedHotel);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchHotels, fetchHotelData, selectedHotel]);

  const selectHotel = (hotelId) => {
    setSelectedHotel(hotelId);
    fetchHotelData(hotelId);
  };

  // Time since last update display
  const [timeSince, setTimeSince] = useState('just now');
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      if (seconds < 5) setTimeSince('just now');
      else if (seconds < 60) setTimeSince(`${seconds}s ago`);
      else setTimeSince(`${Math.floor(seconds / 60)}m ago`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Travel Agency Portal</h1>
          <p className="text-slate-400 text-sm">Live room availability across all hotels</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">LIVE</span>
          </div>
          <span className="text-xs text-slate-500">Updated {timeSince}</span>
        </div>
      </div>

      {!selectedHotel ? (
        <>
          <h2 className="text-lg font-semibold text-slate-300">Select a Hotel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel) => (
              <button
                key={hotel.id}
                onClick={() => selectHotel(hotel.id)}
                className="text-left bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-white/30 hover:bg-slate-900 transition-all duration-200 group"
              >
                <h3 className="text-lg font-semibold group-hover:text-white transition-colors">{hotel.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{hotel.location}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-400">Total: {hotel.totalRooms}</span>
                  <span className="text-emerald-400">Available: {hotel.availableRooms}</span>
                  <span className="text-rose-400">Booked: {hotel.bookedRooms}</span>
                </div>
                <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${hotel.totalRooms > 0 ? (hotel.availableRooms / hotel.totalRooms) * 100 : 0}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
          {hotels.length === 0 && <p className="text-center text-slate-500 py-12">No hotels registered yet</p>}
        </>
      ) : (
        <>
          <button
            onClick={() => { setSelectedHotel(null); setHotelData(null); }}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back to Hotels
          </button>

          {hotelData ? (
            <>
              <div>
                <h2 className="text-xl font-bold">{hotelData.name}</h2>
                <p className="text-sm text-slate-400">{hotelData.location} · Read-only view</p>
              </div>
              <SummaryCards total={hotelData.totalRooms} booked={hotelData.bookedRooms} available={hotelData.availableRooms} />
              {hotelData.categories.map((cat) => (
                <RoomGrid key={cat.id} category={cat} interactive={false} />
              ))}
            </>
          ) : (
            <div className="h-64 bg-slate-800 rounded-xl animate-pulse" />
          )}
        </>
      )}
    </div>
  );
}
