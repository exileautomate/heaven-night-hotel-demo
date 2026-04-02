import { useEffect } from 'react';

export default function Toast({ type = 'success', message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-2.5
        ${type === 'success'
          ? 'bg-emerald-500 text-white'
          : 'bg-rose-500 text-white'
        }`}
    >
      <span className="text-base">{type === 'success' ? '✓' : '✕'}</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
