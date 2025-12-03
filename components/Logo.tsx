import React from 'react';
import { Hexagon } from 'lucide-react';

const Logo = () => (
  <div className="w-12 h-12 flex items-center justify-center mb-0 lg:mb-6 group transition-transform hover:scale-110 duration-500 cursor-pointer">
     <div className="relative w-10 h-10 flex items-center justify-center">
       <Hexagon size={40} strokeWidth={1.5} className="text-black dark:text-white animate-[spin_10s_linear_infinite]" />
       <Hexagon size={20} strokeWidth={3} className="text-black dark:text-white absolute animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
       <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-black dark:bg-white rounded-full"></div>
       </div>
     </div>
  </div>
);

export default Logo;
