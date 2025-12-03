import React, { useState, useEffect, useRef } from 'react';
import { addMinutes, format } from 'date-fns';
import { InteractiveText } from './InteractiveText';

interface TimeControlProps {
  time: Date;
  onChange: (newTime: Date) => void;
  className?: string;
  isEndTime?: boolean;
}

export const TimeControl: React.FC<TimeControlProps> = ({ time, onChange, className, isEndTime }) => {
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to deactivate
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive) return;
    e.preventDefault(); // Prevent page scroll
    
    // Scroll UP (negative delta) -> Increase time
    // Scroll DOWN (positive delta) -> Decrease time
    const direction = e.deltaY < 0 ? 1 : -1;
    const minutesToAdd = direction * 5; // 5 minute increments
    
    const newTime = addMinutes(time, minutesToAdd);
    onChange(newTime);
  };

  return (
    <div 
      ref={containerRef}
      onClick={() => setIsActive(true)}
      onWheel={handleWheel}
      className={`
        relative cursor-pointer select-none transition-all duration-300 rounded-lg px-2 py-1 -mr-2
        ${isActive ? 'bg-black/5 ring-1 ring-black/10' : 'hover:bg-gray-50'}
        ${className}
      `}
      title="Click to edit, then scroll to change time"
    >
      <InteractiveText text={format(time, 'HH:mm')} />
      
      {/* Active Indicator */}
      {isActive && (
        <div className={`
          absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full 
          ${isEndTime ? 'bg-red-500' : 'bg-black'} 
          animate-pulse
        `}></div>
      )}
    </div>
  );
};