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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use native event listener with passive: false to ensure we can prevent default scroll
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Scroll UP (negative delta) -> Increase time
      // Scroll DOWN (positive delta) -> Decrease time
      const direction = e.deltaY < 0 ? 1 : -1;
      const minutesToAdd = direction * 5; // 5 minute increments
      
      const newTime = addMinutes(time, minutesToAdd);
      onChange(newTime);
    };

    element.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', onWheel);
    };
  }, [time, onChange]);

  return (
    <div 
      ref={containerRef}
      className={`
        relative cursor-ns-resize select-none transition-all duration-300 rounded-lg px-2 py-1 -mr-2
        hover:bg-gray-100 dark:hover:bg-zinc-800
        ${className}
      `}
      title="Scroll to change time"
    >
      <InteractiveText text={format(time, 'HH:mm')} />
    </div>
  );
};