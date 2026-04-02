import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )},
];

export default function Sidebar({ onClose }) {
  const { pathname } = useLocation();

  return (
    <aside className="w-[260px] h-full bg-white border-r border-slate-200/80 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white text-sm font-bold">HH</span>
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-800 leading-tight">Heaven Night</h1>
            <p className="text-[11px] text-slate-400 leading-tight">Room Management</p>
          </div>
        </div>
        {/* Close button for mobile */}
        <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-slate-100">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2">
        <p className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 mb-1 ${
              pathname === item.path
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className={pathname === item.path ? 'text-emerald-600' : 'text-slate-400'}>{item.icon}</span>
            <span className="text-[13px]">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-slate-700 truncate">Hotel Admin</p>
            <p className="text-[11px] text-slate-400 truncate">admin@heavenheight.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
