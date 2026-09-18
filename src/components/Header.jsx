import { NAV_TABS } from '../lib/constants';

export default function Header({ activeTab, onTabChange, isAdmin, onLogout }) {
  const tabClass = (id) =>
    `rounded-lg border px-4 py-3 font-bold transition-all duration-300 ${
      activeTab === id
        ? 'border-slate-600 bg-slate-800/80 text-accent shadow-[0_0_15px_rgba(6,182,212,0.15)]'
        : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800/50 hover:text-white'
    }`;

  return (
    <header className="glass sticky top-0 z-40 grid grid-cols-1 items-center gap-4 border-b border-slate-800 px-6 py-3 lg:grid-cols-3">
      <div className="flex flex-col text-center lg:text-left">
        <h1 className="bg-gradient-to-r from-accent to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
          M3owL
        </h1>
        <p className="truncate text-xs text-slate-400">
          Jakub K. | Discord: <span className="font-mono text-white">_m3owl</span>
        </p>
      </div>

      <nav aria-label="Main" className="flex flex-wrap justify-center gap-2 lg:gap-4">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={tabClass(tab.id)}
          >
            {tab.label}
          </button>
        ))}

        {isAdmin && (
          <button
            type="button"
            onClick={() => onTabChange('admin')}
            aria-current={activeTab === 'admin' ? 'page' : undefined}
            className={tabClass('admin')}
          >
            Admin Panel
          </button>
        )}
      </nav>

      <div className="flex justify-center lg:justify-end">
        {isAdmin && (
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-red-600 bg-red-900/80 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-red-800"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
