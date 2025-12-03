import React from 'react';
import { Hexagon } from 'lucide-react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#FAFAFA] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-black/5 blur-3xl rounded-full scale-150 animate-pulse"></div>
        
        {/* Animated Hexagon Container */}
        <div className="relative w-24 h-24 flex items-center justify-center">
           <Hexagon 
             size={80} 
             strokeWidth={1}
             className="text-black animate-[spin_3s_linear_infinite]" 
           />
           <Hexagon 
             size={40} 
             strokeWidth={3}
             className="text-black absolute animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" 
           />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
           </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden">
        <h1 className="font-display font-bold text-4xl tracking-tighter text-black animate-[slideUp_0.8s_ease-out_forwards] translate-y-full opacity-0">
          KORIZEN
        </h1>
      </div>
      
      <p className="mt-2 text-gray-400 text-xs font-mono uppercase tracking-[0.3em] animate-[fadeIn_1s_ease-out_0.5s_forwards] opacity-0">
        AI Workspace
      </p>

      <style>{`
        @keyframes slideUp {
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loader;