import React from 'react';
import { CalendarEvent, Department, getColorForString } from '../types';
import { format } from 'date-fns';
import { MoreHorizontal, Clock, Calendar, CheckCircle2, Circle } from 'lucide-react';

interface KanbanViewProps {
  events: CalendarEvent[];
  departments: Department[];
  onEventUpdate?: (event: CalendarEvent) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ events, departments, onEventUpdate }) => {
  
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDept: Department) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    const event = events.find(ev => ev.id === eventId);
    
    if (event && onEventUpdate) {
      onEventUpdate({ ...event, department: targetDept });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <div className="h-full overflow-x-auto pb-4">
      <div className="flex gap-4 h-full min-w-max px-2">
        {departments.map(dept => {
          const deptEvents = events.filter(e => e.department === dept);
          // Sort by status then time
          deptEvents.sort((a, b) => {
            if (a.status !== b.status) return a.status.localeCompare(b.status);
            return a.startTime.getTime() - b.startTime.getTime();
          });

          return (
            <div 
              key={dept} 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dept)}
              className="w-80 flex flex-col h-full bg-gray-50/80 dark:bg-zinc-900/80 rounded-[24px] border border-gray-100 dark:border-zinc-800 hover:border-black/5 dark:hover:border-white/10 transition-colors flex-shrink-0 group/col relative"
            >
               {/* Column Header */}
               <div className="p-4 pb-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <div className={`w-2.5 h-2.5 rounded-full ${getColorForString(dept).split(' ')[0]}`}></div>
                     <h3 className="font-display font-bold text-gray-900 dark:text-zinc-200 text-lg">{dept}</h3>
                     <span className="text-xs font-bold text-gray-400 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">{deptEvents.length}</span>
                  </div>
                  <button className="text-gray-300 hover:text-black dark:hover:text-white transition-colors"><MoreHorizontal size={16} /></button>
               </div>

               {/* Droppable Area */}
               <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                  {deptEvents.map(evt => (
                    <div 
                      key={evt.id} 
                      draggable={!!onEventUpdate}
                      onDragStart={(e) => handleDragStart(e, evt)}
                      className={`
                        bg-white dark:bg-zinc-800 p-4 rounded-[20px] shadow-sm border border-gray-100 dark:border-zinc-700 
                        hover:shadow-lg hover:-translate-y-1 transition-all cursor-move group relative
                        ${evt.status === 'completed' ? 'opacity-75 hover:opacity-100' : ''}
                      `}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-gray-50 dark:bg-zinc-900 text-gray-400 dark:text-zinc-500`}>
                            {evt.type}
                          </span>
                          <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${getStatusColor(evt.status)}`}>
                             {evt.status === 'completed' ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                             {evt.status.replace('-', ' ')}
                          </div>
                       </div>
                       
                       <h4 className="font-bold text-base text-gray-900 dark:text-zinc-200 mb-1 leading-snug">{evt.title}</h4>
                       
                       {evt.description && (
                         <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3 line-clamp-2 leading-relaxed">{evt.description}</p>
                       )}

                       <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 dark:border-zinc-700">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-zinc-500">
                             <Calendar size={12} />
                             <span>{format(evt.startTime, 'MMM d')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-zinc-500">
                             <Clock size={12} />
                             <span>{format(evt.startTime, 'HH:mm')}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                  
                  {/* Empty State / Drop Target Indicator */}
                  {deptEvents.length === 0 && (
                     <div className="h-24 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-gray-400 dark:text-zinc-600 text-xs font-bold bg-white/50 dark:bg-zinc-900/50">
                        Drop items here
                     </div>
                  )}
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default KanbanView;