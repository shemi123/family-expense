import React from 'react';
import { Menu, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Family Space:
          </span>
          <span className="ml-1 text-sm font-bold text-slate-800">
            {user?.familyName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
          {user?.role === 'ADMIN' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Family Admin</span>
            </>
          ) : (
            <>
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Family Member</span>
            </>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          title="Log out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
};
