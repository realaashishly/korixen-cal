'use client';

import React, { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import MobileNav from '@/components/layout/MobileNav';
import { useApp } from '@/context/AppContext';
import Loader from '@/components/Loader';
import BuildingHome from '@/components/BuildingHome';
import { Check, Sun, Moon } from 'lucide-react';
import Logo from '@/components/Logo';
import useUser from '@/context/useUser';


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    appState,
    toastMsg,
    isDarkMode,
    toggleTheme,
    isCelebrating,
  } = useApp();



  if (appState === 'loading') return <Loader />;
  if (appState === 'building') return <BuildingHome />;

  return (
    <div className={`transition-colors duration-300 ease-in-out ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#FAFAFA] dark:bg-zinc-950 bg-dot-pattern lg:overflow-hidden text-[#09090b] dark:text-zinc-200 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">
        <div className="bg-noise opacity-[0.03] dark:opacity-[0.05]"></div>
        
        {/* Celebration Confetti Overlay */}
        {isCelebrating && (
             <div className="absolute inset-0 pointer-events-none z-100 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-2 h-2 rounded-full animate-[rain_3s_ease-out_forwards]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-10px`,
                            backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)],
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    ></div>
                ))}
                <style>{`
                    @keyframes rain {
                        to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                    }
                `}</style>
             </div>
        )}

        {toastMsg && (
          <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90%]">
            <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold border border-white/10">
                <Check size={16} />
                {toastMsg}
            </div>
          </div>
        )}
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-6 pb-2 z-30">
             <Logo />
             <button 
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
        </div>

        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 w-full lg:h-full overflow-visible lg:overflow-hidden relative z-10 pb-28 lg:pb-6">
            {children}
            <RightSidebar />
        </div>

        <MobileNav />

        <MobileNav />
      </div>
    </div>
  );
}
