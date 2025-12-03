import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  currentDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  currentDate, 
  selectedDate, 
  events, 
  onSelectDate,
  onPrevMonth,
  onNextMonth
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(event.startTime, date));
  };

  return (
    <div className="w-full select-none bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-[24px] p-5 shadow-sm text-gray-900 dark:text-zinc-200 relative overflow-hidden group border border-gray-100/50 dark:border-zinc-800">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-lg font-display font-bold tracking-tight text-gray-900 dark:text-zinc-200">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <div className="flex items-center gap-1">
           <button onClick={onPrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white">
             <ChevronLeft size={16} />
           </button>
           <button onClick={onNextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400 hover:text-black dark:hover:text-white">
             <ChevronRight size={16} />
           </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2 relative z-10">
        {weekDays.map((day, i) => (
          <div key={`${day}-${i}`} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1 relative z-10">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);

          return (
            <div 
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className="flex flex-col items-center justify-center relative cursor-pointer group/day"
            >
              <div className={`
                w-8 h-8 flex items-center justify-center rounded-xl text-xs transition-all duration-200 relative
                ${isSelected 
                   ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/10 font-bold scale-110' 
                   : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
                }
                ${isDayToday && !isSelected ? 'text-black dark:text-white font-bold ring-1 ring-gray-200 dark:ring-zinc-700' : ''}
                ${!isCurrentMonth ? 'opacity-30 text-gray-400' : ''}
              `}>
                {format(day, 'd')}
                
                {/* Event Indicator Dot */}
                {dayEvents.length > 0 && !isSelected && (
                  <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${isDayToday ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-zinc-600 group-hover/day:bg-black dark:group-hover/day:bg-white'}`}></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;