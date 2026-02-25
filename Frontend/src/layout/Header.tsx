import React from 'react';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import type { User } from '../types/index';

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-64 right-0 z-10 shadow-sm">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 max-w-md group focus-within:ring-2 focus-within:ring-teal-50 transition-all">
            <Search size={18} className="text-gray-400 group-focus-within:text-[#00B894] transition-colors" />
            <input
              type="text"
              placeholder="Search students, teachers, reports..."
              className="bg-transparent border-none outline-none text-sm w-full text-gray-600 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-2xl transition-all group cursor-pointer border-l border-gray-100 pl-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900 leading-none">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">
                {user?.utype || 'Guest'}
              </p>
            </div>
            <div className="w-9 h-9 bg-[#00B894] rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-100 group-hover:scale-105 transition-transform">
              <UserIcon size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
