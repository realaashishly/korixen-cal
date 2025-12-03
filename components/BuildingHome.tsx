import React from 'react';
import { Hexagon } from 'lucide-react';

const BuildingHome: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-zinc-950 items-center justify-center flex-col">
       <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-gray-100 dark:border-zinc-800 rounded-full"></div>
          <Hexagon size={64} strokeWidth={1} className="text-gray-200 dark:text-zinc-800 absolute animate-[spin_5s_linear_infinite]" />
          <Hexagon size={40} strokeWidth={2} className="text-black dark:text-white animate-pulse" />
       </div>
       <h2 className="text-2xl font-display font-bold animate-pulse text-black dark:text-white">Building your Home...</h2>
       <div className="w-64 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-black dark:bg-white animate-[loading_2s_ease-in-out_infinite] w-full origin-left scale-x-0"></div>
       </div>
       <style>{`
         @keyframes loading {
           0% { transform: scaleX(0); }
           50% { transform: scaleX(0.7); }
           100% { transform: scaleX(1); }
         }
       `}</style>
    </div>
  );
};

export default BuildingHome;
