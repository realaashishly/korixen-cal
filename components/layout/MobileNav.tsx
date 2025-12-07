'use client';

import React from 'react';
import { Home, CreditCard, Settings, Crown, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const MobileNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-black/90 dark:bg-white/90 backdrop-blur-xl rounded-full z-50 flex items-center justify-between px-6 shadow-2xl text-gray-400">
       <Link 
         href="/dashboard"
         className={`p-2 rounded-full transition-all ${isActive('/dashboard') ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
       >
          <Home size={24} strokeWidth={isActive('/dashboard') ? 3 : 2} />
       </Link>
       <Link 
         href="/subscriptions"
         className={`p-2 rounded-full transition-all ${isActive('/subscriptions') ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
       >
          <CreditCard size={24} strokeWidth={isActive('/subscriptions') ? 3 : 2} />
       </Link>
       
       <button 
         onClick={() => router.push('/dashboard?action=new')}
         className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center text-black dark:text-white shadow-lg -translate-y-4 border-4 border-[#FAFAFA] dark:border-zinc-950"
       >
          <Plus size={24} strokeWidth={3} />
       </button>

       <Link 
         href="/pricing"
         className={`p-2 rounded-full transition-all ${isActive('/pricing') ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
       >
          <Crown size={24} strokeWidth={isActive('/pricing') ? 3 : 2} />
       </Link>
       <Link 
         href="/settings"
         className={`p-2 rounded-full transition-all ${isActive('/settings') ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
       >
          <Settings size={24} strokeWidth={isActive('/settings') ? 3 : 2} />
       </Link>
    </nav>
  );
};

export default MobileNav;
