import { useState } from 'react';

export default function AddCategoryModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [startNumber, setStartNumber] = useState('');
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !startNumber || !count) return;
    setLoading(true);
    await onSubmit({ name, startNumber: parseInt(startNumber), count: parseInt(count) });
    setLoading(false);
  };

  const previewRooms = () => {
    if (!startNumber || !count) return [];
    const s = parseInt(startNumber) || 0;
    const c = Math.min(parseInt(count) || 0, 20);
    return Array.from({ length: c }, (_, i) => String(s + i));
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl sm:rounded-2xl w-full max-w-md shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">New Room Category</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Deluxe Room"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all bg-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Start Room No.</label>
              <input
                type="number"
                value={startNumber}
                onChange={(e) => setStartNumber(e.target.value)}
                placeholder="101"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Count</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="7"
                min="1"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all bg-white"
                required
              />
            </div>
          </div>

          {/* Preview */}
          {previewRooms().length > 0 && (
            <div className="pt-1">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">Preview</p>
              <div className="flex flex-wrap gap-1.5">
                {previewRooms().map((num) => (
                  <span key={num} className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-lg text-xs font-semibold">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
