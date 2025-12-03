
import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent, getColorForString, TaskStatus } from '../types';
import { Video, MapPin, GripVertical, Timer, CheckCircle, CircleDashed, Trash2 } from 'lucide-react';
import { InteractiveText } from './InteractiveText';
import { TimeControl } from './TimeControl';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  onUpdateEvent: (event: CalendarEvent) => void;
  onReorderEvents: (events: CalendarEvent[]) => void;
  onDeleteEvent: (eventId: string) => void;
  onSelectEvent?: (eventId: string) => void;
  selectedEventId?: string | null;
}

const DayView: React.FC<DayViewProps> = ({ 
  date, events, onUpdateEvent, onReorderEvents, onDeleteEvent, onSelectEvent, selectedEventId 
}) => {
  const daysToShow = [date];
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('dragIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    el.classList.add('opacity-50');
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, dayEvents: CalendarEvent[]) => {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
    const el = document.querySelector('.opacity-50');
    if (el) el.classList.remove('opacity-50');

    if (dragIndex === dropIndex) return;

    const newDayEvents = [...dayEvents];
    const [draggedItem] = newDayEvents.splice(dragIndex, 1);
    newDayEvents.splice(dropIndex, 0, draggedItem);
    
    const reorderedWithIndex = newDayEvents.map((ev, idx) => ({
      ...ev,
      order: idx
    }));

    onReorderEvents(reorderedWithIndex);
  };

  const handleStatusChange = (e: React.MouseEvent, evt: CalendarEvent, newStatus: TaskStatus) => {
    e.stopPropagation();
    onUpdateEvent({ ...evt, status: newStatus });
  };
  
  const handleDeleteClick = (e: React.MouseEvent, evtId: string) => {
    e.stopPropagation();
    // Trigger animation
    setDeletingIds(prev => new Set(prev).add(evtId));
    
    // Perform delete after animation
    setTimeout(() => {
      onDeleteEvent(evtId);
      // Cleanup local state (safety measure)
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(evtId);
        return next;
      });
    }, 500);
  }

  // Time Updates
  const handleStartTimeChange = (evt: CalendarEvent, newTime: Date) => {
      // Preserve the date part, only update time
      const updatedDate = new Date(evt.startTime);
      updatedDate.setHours(newTime.getHours(), newTime.getMinutes());
      onUpdateEvent({ ...evt, startTime: updatedDate });
  };

  const handleEndTimeChange = (evt: CalendarEvent, newTime: Date) => {
      if (!evt.endTime) return;
      const updatedDate = new Date(evt.endTime);
      updatedDate.setHours(newTime.getHours(), newTime.getMinutes());
      onUpdateEvent({ ...evt, endTime: updatedDate });
  };

  const getCardStyle = (status: TaskStatus, isSelected: boolean) => {
    // High contrast border for selected state
    if (isSelected) {
      return 'bg-white dark:bg-zinc-800 ring-2 ring-black dark:ring-white shadow-2xl z-20';
    }

    switch (status) {
      case 'completed':
        return 'opacity-60 grayscale bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800';
      case 'in-progress':
        return 'bg-white dark:bg-zinc-800 ring-1 ring-blue-100 dark:ring-blue-900 shadow-lg shadow-blue-50/20 dark:shadow-blue-900/10 border border-transparent';
      case 'todo':
      default:
        // Clean white card with shadow lift
        return 'bg-white dark:bg-zinc-900 shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md';
    }
  };

  return (
    <div className="h-auto lg:h-full overflow-visible lg:overflow-y-auto hide-scrollbar pb-20 px-1">
      <div className="space-y-12">
        {daysToShow.map((dayDate) => {
          const dayEvents = events.filter(e => isSameDay(e.startTime, dayDate));
          
          dayEvents.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            return a.startTime.getTime() - b.startTime.getTime();
          });

          const dayNumber = format(dayDate, 'dd');
          const dayShort = format(dayDate, 'EEEE'); 

          return (
            <div key={dayDate.toString()} className="relative">
              {/* Header */}
              <div className="flex items-baseline gap-4 mb-8 sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md z-30 py-4 border-b border-gray-50 dark:border-zinc-900 transition-colors">
                 <h2 className="text-6xl font-display font-bold text-gray-900 dark:text-zinc-200 tracking-tighter">
                   <InteractiveText text={dayNumber} />
                 </h2>
                 <p className="text-xl text-gray-400 font-medium tracking-wide">{dayShort}</p>
              </div>

              {/* Timeline Container */}
              <div className="relative pl-0">
                {dayEvents.length > 0 ? (
                  <div className="flex flex-col">
                    {dayEvents.map((evt, index) => {
                      const isDeleting = deletingIds.has(evt.id);
                      const isSelected = selectedEventId === evt.id;
                      
                      return (
                      <div 
                        key={evt.id} 
                        draggable={!isDeleting}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index, dayEvents)}
                        onClick={() => onSelectEvent && onSelectEvent(evt.id)}
                        className={`
                          flex gap-6 group/card relative mb-8
                          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-center
                          ${isDeleting 
                            ? 'opacity-0 translate-x-12 max-h-0 mb-0 overflow-hidden pointer-events-none' 
                            : 'opacity-100 max-h-[500px]'
                          }
                        `}
                      >
                        {/* Big Time Column with Scroll Interaction */}
                        <div className="w-20 lg:w-32 pt-1 text-right flex-shrink-0 z-10 select-none flex flex-col items-end">
                           <TimeControl 
                              time={evt.startTime} 
                              onChange={(t) => handleStartTimeChange(evt, t)}
                              className={`font-display font-bold text-4xl lg:text-5xl tracking-tighter leading-none transition-colors ${evt.status === 'completed' ? 'text-gray-300 dark:text-zinc-700' : 'text-gray-900 dark:text-zinc-200'}`}
                           />
                           
                           {evt.endTime ? (
                              <TimeControl 
                                time={evt.endTime}
                                onChange={(t) => handleEndTimeChange(evt, t)}
                                isEndTime={true}
                                className="text-xs lg:text-sm text-red-500 font-bold mt-2 tracking-wider"
                              />
                           ) : (
                              <span className="text-xs lg:text-sm text-gray-300 dark:text-zinc-700 font-bold mt-2 tracking-wider">--:--</span>
                           )}
                        </div>

                        {/* Card Container */}
                        <div className={`
                           flex-1 rounded-[24px] p-1 transition-all duration-300 relative
                           ${isSelected ? 'z-20' : 'hover:-translate-y-1 hover:z-20'}
                           ${evt.status === 'completed' ? '' : ''}
                        `}>
                           {/* Inner Content Card */}
                           <div className={`
                             rounded-[20px] p-4 lg:p-6 h-full transition-all relative overflow-hidden
                             ${getCardStyle(evt.status, isSelected)}
                           `}>
                              
                             <div className="flex flex-col lg:flex-row lg:justify-between items-start pl-1 gap-4 relative z-10">
                                {/* Left Content */}
                                <div className="flex-1 w-full">
                                   {/* Tags Row */}
                                   <div className="flex items-center gap-2 mb-3 flex-wrap">
                                     {evt.department && (
                                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getColorForString(evt.department)} bg-opacity-10 border border-opacity-10 shadow-sm`}>
                                         {evt.department}
                                       </span>
                                     )}
                                     <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-full border border-gray-100 dark:border-zinc-700">
                                       {evt.type}
                                     </span>
                                     {evt.resources && evt.resources.length > 0 && (
                                       <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                                         {evt.resources.length} Links
                                       </span>
                                     )}
                                   </div>
                                   
                                   {/* Title & Desc */}
                                   <div className={`mb-3 transition-all ${evt.status === 'completed' ? 'text-gray-400 dark:text-zinc-600 decoration-gray-300 dark:decoration-zinc-700' : 'text-gray-900 dark:text-zinc-200'}`}>
                                      <h3 className={`text-xl lg:text-2xl font-display leading-tight mb-2 font-medium ${evt.status === 'completed' ? 'line-through' : ''}`}>
                                        <InteractiveText text={evt.title} />
                                      </h3>
                                      {evt.description && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                                           <InteractiveText text={evt.description} />
                                        </div>
                                      )}
                                   </div>
                                   
                                   {/* Footer Meta */}
                                   <div className="flex gap-2 flex-wrap mt-4">
                                      {evt.meetLink && (
                                        <a href={evt.meetLink} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100/50 dark:border-blue-900/30">
                                          <Video size={12} /> Join Meet
                                        </a>
                                      )}
                                      {evt.location && (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-zinc-700">
                                          <MapPin size={12} /> {evt.location}
                                        </span>
                                      )}
                                   </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex lg:flex-col items-center lg:items-end gap-3 w-full lg:w-auto justify-between lg:justify-start border-t lg:border-0 border-gray-50 dark:border-zinc-800 pt-3 lg:pt-0 mt-2 lg:mt-0">
                                   <div className="flex items-center gap-2">
                                      {/* Delete Button */}
                                      <button 
                                         onClick={(e) => handleDeleteClick(e, evt.id)}
                                         className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors lg:opacity-0 lg:group-hover/card:opacity-100"
                                         title="Delete Event"
                                      >
                                         <Trash2 size={14} />
                                      </button>
                                      
                                      {/* Drag Handle */}
                                      <div className="text-gray-300 dark:text-zinc-600 cursor-grab active:cursor-grabbing p-1 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors lg:opacity-0 lg:group-hover/card:opacity-100 hidden lg:block" title="Drag to reorder">
                                         <GripVertical size={18} />
                                      </div>
                                   </div>

                                   {/* Status Switcher */}
                                   <div className="flex items-center gap-1 bg-white/80 dark:bg-zinc-800/80 p-1.5 rounded-full border border-gray-100/80 dark:border-zinc-700/80 backdrop-blur-sm shadow-sm">
                                      <button 
                                         onClick={(e) => handleStatusChange(e, evt, 'todo')}
                                         className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${evt.status === 'todo' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm ring-1 ring-black/5' : 'text-gray-300 dark:text-zinc-600 hover:text-gray-500 dark:hover:text-zinc-400'}`}
                                         title="To Do"
                                      >
                                         <CircleDashed size={14} />
                                      </button>
                                      <button 
                                         onClick={(e) => handleStatusChange(e, evt, 'in-progress')}
                                         className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${evt.status === 'in-progress' ? 'bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20' : 'text-gray-300 dark:text-zinc-600 hover:text-blue-500'}`}
                                         title="In Progress"
                                      >
                                         <Timer size={14} className={evt.status === 'in-progress' ? 'animate-pulse' : ''} />
                                      </button>
                                      <button 
                                         onClick={(e) => handleStatusChange(e, evt, 'completed')}
                                         className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${evt.status === 'completed' ? 'bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/20' : 'text-gray-300 dark:text-zinc-600 hover:text-green-500'}`}
                                         title="Completed"
                                      >
                                         <CheckCircle size={14} />
                                      </button>
                                   </div>
                                </div>
                             </div>
                           </div>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-[32px] bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm">
                     <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-50 dark:border-zinc-700">
                        <CircleDashed size={28} className="text-gray-300 dark:text-zinc-600" />
                     </div>
                     <span className="text-gray-400 dark:text-zinc-500 text-sm font-bold tracking-tight">No events scheduled</span>
                     <p className="text-gray-300 dark:text-zinc-600 text-xs mt-1">Enjoy your free time!</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;
