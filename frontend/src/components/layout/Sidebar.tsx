import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  WalletCards,
  Repeat,
  Settings,
  Users,
  Calculator,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/expense-calculation', label: 'Expense Calculator', icon: Calculator },
    { to: '/budgets', label: 'Budgets', icon: PiggyBank },
    { to: '/accounts', label: 'Accounts', icon: WalletCards },
    { to: '/recurring', label: 'Recurring', icon: Repeat },
    { to: '/family', label: 'Family Members', icon: Users },
  ];


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/30">
            FB
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
              FamilyBudget
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Household Wealth</p>
          </div>
        </div>

        {/* Family Pill */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/50">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Active Household
          </p>
          <p className="text-sm font-semibold text-white truncate mt-0.5">
            {user?.familyName || 'My Family'}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] text-slate-300">
              Currency: {user?.currency || 'USD'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <span className="inline-block text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-slate-400">
              {user?.role}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
