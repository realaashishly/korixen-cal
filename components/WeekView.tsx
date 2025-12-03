
import React from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, getColorForString } from '../types';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ date, events, onSelectDate }) => {
  const startDate = startOfWeek(date, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="h-auto lg:h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-zinc-800 pb-4 shrink-0 overflow-x-auto">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, date);
          const today = isToday(day);
          
          return (
            <div 
              key={day.toString()} 
              onClick={() => onSelectDate(day)}
              className={`text-center cursor-pointer group transition-all min-w-[40px] ${isSelected ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
            >
               <div className={`text-[10px] uppercase tracking-widest mb-2 font-bold ${today ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                 {format(day, 'EEE')}
               </div>
               <div className={`
                 mx-auto w-10 h-10 flex items-center justify-center rounded-full text-lg font-display font-bold transition-all
                 ${today ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : isSelected ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : 'text-gray-900 dark:text-zinc-200 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800'}
               `}>
                 {format(day, 'd')}
               </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-visible lg:overflow-y-auto hide-scrollbar pt-4">
         <div className="grid grid-cols-1 lg:grid-cols-7 gap-2 min-h-full">
            {weekDays.map((day) => {
               const dayEvents = events.filter(e => isSameDay(e.startTime, day));
               // Sort by time
               dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

               // On mobile, only show if events exist or if it's selected day? 
               // Showing all 7 columns on mobile stack is vertical list.
               
               return (
                 <div key={day.toString()} className="space-y-2 px-1 lg:h-full rounded-2xl bg-gray-50/50 dark:bg-zinc-900/50 p-2 transition-colors hover:bg-gray-100/50 dark:hover:bg-zinc-800/50">
                    <div className="lg:hidden text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{format(day, 'EEEE, MMM d')}</div>
                    {dayEvents.map(evt => (
                       <div key={evt.id} className={`
                          p-3 rounded-2xl text-xs border transition-all hover:scale-105 cursor-pointer shadow-sm
                          ${evt.type === 'meeting' ? 'bg-white dark:bg-zinc-800 border-blue-100 dark:border-blue-900/30 shadow-blue-50/20 dark:shadow-blue-900/10' : ''}
                          ${evt.type === 'task' ? 'bg-white dark:bg-zinc-800 border-orange-100 dark:border-orange-900/30 shadow-orange-50/20 dark:shadow-orange-900/10' : ''}
                          ${!['meeting', 'task'].includes(evt.type) ? 'bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700' : ''}
                       `}>
                          <div className="flex items-center gap-1.5 mb-2 opacity-80">
                            <div className={`w-1.5 h-1.5 rounded-full ${getColorForString(evt.department).split(' ')[0]}`}></div>
                            <span className="font-bold text-[10px] text-gray-500 dark:text-zinc-400">{format(evt.startTime, 'HH:mm')}</span>
                          </div>
                          <div className="font-bold text-gray-900 dark:text-zinc-200 leading-tight mb-1">{evt.title}</div>
                          {evt.department && (
                            <div className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{evt.department}</div>
                          )}
                       </div>
                    ))}
                    {dayEvents.length === 0 && (
                       <div className="h-8 lg:h-12 flex items-center justify-center opacity-30">
                          <div className="w-1 h-1 rounded-full bg-gray-100 dark:bg-zinc-800"></div>
                       </div>
                    )}
                 </div>
               )
            })}
         </div>
      </div>
    </div>
  );
};
export default WeekView;
