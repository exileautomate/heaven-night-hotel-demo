import { useState } from 'react';

export default function RoomGrid({ category, onToggle, onDelete, interactive = false }) {
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const occupancyPercent = category.totalRooms > 0
    ? Math.round((category.availableRooms / category.totalRooms) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{category.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-[13px]">
            <span className="text-slate-400">{category.totalRooms} rooms</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span className="text-slate-500">{category.bookedRooms} booked</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-500">{category.availableRooms} free</span>
            </span>
          </div>
        </div>
        {/* Occupancy meter + Delete */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400">{occupancyPercent}%</span>
          <div className="w-24 h-[6px] bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          {interactive && onDelete && (
            <button
              onClick={() => {
                if (window.confirm(`Delete "${category.name}" and all its rooms?`)) {
                  onDelete(category.id);
                }
              }}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Room Tiles Grid */}
      <div className="p-5">
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
          {category.rooms.map((room) => {
            const isBooked = room.status === 'booked';
            const isHovered = hoveredRoom === room.id;

            return (
              <div
                key={room.id}
                className="relative"
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                <button
                  onClick={() => interactive && onToggle?.(room.id)}
                  disabled={!interactive}
                  className={`room-tile w-full aspect-square rounded-xl font-semibold text-[13px] flex items-center justify-center
                    ${isBooked
                      ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                      : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                    }
                    ${interactive ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {room.roomNumber}
                </button>

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-[11px] whitespace-nowrap z-20 shadow-lg pointer-events-none font-medium">
                    {room.roomNumber} · {isBooked ? 'Booked' : 'Available'}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-slate-800" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {category.rooms.length === 0 && (
          <p className="text-slate-300 text-sm py-8 text-center">No rooms in this category</p>
        )}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center gap-4 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500"></span> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500"></span> Booked
        </span>
        {interactive && <span className="ml-auto text-slate-300">Click a room to toggle</span>}
      </div>
    </div>
  );
}
