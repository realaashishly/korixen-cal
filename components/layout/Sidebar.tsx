'use client';

import React from 'react';
import { Home, CreditCard, Settings, Crown, Sun, Moon } from 'lucide-react';
import Logo from '../Logo';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useApp();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden lg:flex w-24 py-8 flex-col items-center justify-between z-20 shrink-0 relative">
      <Logo />

      <nav className="flex flex-col gap-6 p-2 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/50 dark:border-white/5 shadow-depth-1">
          <Link 
            href="/dashboard"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${isActive('/dashboard') ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
            title="Calendar"
          >
            <Home size={20} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
          </Link>
          <Link 
            href="/subscriptions"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${isActive('/subscriptions') ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
            title="Subscriptions"
          >
            <CreditCard size={20} strokeWidth={isActive('/subscriptions') ? 2.5 : 2} />
          </Link>
          <Link 
            href="/settings"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${isActive('/settings') ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
            title="Settings"
          >
            <Settings size={20} strokeWidth={isActive('/settings') ? 2.5 : 2} />
          </Link>
          <Link 
            href="/pricing"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${isActive('/pricing') ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
            title="Pricing"
          >
            <Crown size={20} strokeWidth={isActive('/pricing') ? 2.5 : 2} />
          </Link>
      </nav>

      <button 
         onClick={toggleTheme}
         className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
         {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </aside>
  );
};

export default Sidebar;
