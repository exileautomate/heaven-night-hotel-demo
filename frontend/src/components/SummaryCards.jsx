export default function SummaryCards({ total, booked, available }) {
  const cards = [
    {
      label: 'Total Rooms',
      value: total,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
        </svg>
      ),
      accent: 'from-blue-500 to-indigo-500',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    {
      label: 'Booked',
      value: booked,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      accent: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-500',
      textColor: 'text-rose-700',
    },
    {
      label: 'Available',
      value: available,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-slate-400 font-medium">{card.label}</p>
              <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
            </div>
            <div className={`${card.iconBg} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
