'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format, addMonths, subMonths, endOfYear, differenceInDays, differenceInWeeks } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Undo2,
  Redo2,
  PieChart,
  Plus,
  Sparkles,
  Filter,
  CalendarDays,
  LayoutList,
  Calendar as CalendarIcon,
  Columns
} from 'lucide-react';

import CalendarView from '@/components/CalendarView';
import DayView from '@/components/DayView';
import WeekView from '@/components/WeekView';
import KanbanView from '@/components/KanbanView';
import EventModal from '@/components/EventModal';
import { getColorForString, TaskStatus, CalendarEvent, CalendarViewMode, Department } from '@/types';
import { getEvents, createEvent, updateEvent, deleteEvent, getUserAssets } from '@/app/actions';
import {DEFAULT_DEPARTMENTS, DEFAULT_EVENT_TYPES, DEFAULT_RESOURCE_CATEGORIES} from '@/constants'
import { authClient } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {data: session} = authClient.useSession();
  const user = session?.user;
  const userName = user?.name;

  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [eventTypes, setEventTypes] = useState<string[]>(DEFAULT_EVENT_TYPES);
  const [resourceCategories, setResourceCategories] = useState<string[]>(DEFAULT_RESOURCE_CATEGORIES);


  // --- Local State ---
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [history, setHistory] = useState<CalendarEvent[][]>([]);
  const [redoStack, setRedoStack] = useState<CalendarEvent[][]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>("day");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<Department | "All">("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<TaskStatus | "all">("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Holidays
  const [holidays, setHolidays] = useState<string[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  // Simple cache for now
  const holidayCache = useRef<Map<string, string[]>>(new Map());

  // --- Computed ---
  const daysLeftInYear = differenceInDays(endOfYear(new Date()), new Date());
  const weeksLeft = differenceInWeeks(endOfYear(new Date()), new Date());
  const yearProgress = Math.round(((365 - daysLeftInYear) / 365) * 100);

  const filteredEvents = events.filter((event) => {
    const matchesRole =
      selectedRoleFilter === "All" || event.department === selectedRoleFilter;
    const matchesStatus =
      selectedStatusFilter === "all" || event.status === selectedStatusFilter;
    return matchesRole && matchesStatus;
  });

  // --- Effects ---
  

  // Fetch Holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoadingHolidays(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      if (holidayCache.current.has(dateStr)) {
          setHolidays(holidayCache.current.get(dateStr)!);
          setLoadingHolidays(false);
          return;
      }

      // Mock holidays logic (moved from AppContext)
      // In a real app, this would be an API call
      setTimeout(() => {
          const mockHolidays = Math.random() > 0.7 ? ["Public Holiday"] : [];
          holidayCache.current.set(dateStr, mockHolidays);
          setHolidays(mockHolidays);
          setLoadingHolidays(false);
      }, 500);
    };
    
    fetchHolidays();
  }, [selectedDate]);

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data.map(e => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: e.endTime ? new Date(e.endTime) : undefined,
          type: e.type as any,
          department: e.department as any,
          status: e.status as any,
          recurrence: e.recurrence as any
        })));
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  // Handle URL Action
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      // Clean up URL
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  // --- Actions ---

  const updateEvents = useCallback((newEvents: CalendarEvent[], saveHistory = true) => {
    if (saveHistory) {
      setHistory((prev) => [...prev, events]);
      setRedoStack([]);
    }
    setEvents(newEvents);
  }, [events]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [events, ...prev]);
    setHistory((prev) => prev.slice(0, -1));
    setEvents(previous);
    // TODO: Sync with DB? Undo is tricky with DB. 
    // Ideally we should re-save the previous state to DB or just rely on local state until next action.
    // For now, we keep it local, but this might cause drift if page reloaded.
  }, [history, events]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, events]);
    setRedoStack((prev) => prev.slice(1));
    setEvents(next);
  }, [redoStack, events]);

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      // Optimistic
      const tempId = Math.random().toString(36).substr(2, 9);
      const newEvent: CalendarEvent = {
        id: tempId,
        title: eventData.title || "New Event",
        startTime: eventData.startTime || new Date(),
        endTime: eventData.endTime,
        type: eventData.type || "task",
        department: eventData.department || "General",
        status: eventData.status || "todo",
        resources: eventData.resources || [],
        ...eventData,
      } as CalendarEvent;

      updateEvents([...events, newEvent]);
      setIsModalOpen(false);

      const savedEvent = await createEvent({
        ...newEvent,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime
      });

      // Replace temp ID
      setEvents(prev => prev.map(e => e.id === tempId ? { ...e, id: savedEvent.id } : e));

    } catch (error) {
      console.error("Failed to save event", error);
      // Revert?
    }
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      updateEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      
      // Don't call server if it's a temp ID (it will be created by handleSaveEvent)
      if (updatedEvent.id.length < 24) return;

      await updateEvent(updatedEvent.id, {
        ...updatedEvent,
        startTime: updatedEvent.startTime,
        endTime: updatedEvent.endTime
      });
    } catch (error) {
      console.error("Failed to update event", error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      updateEvents(events.filter(e => e.id !== eventId));
      
      // Don't call server if it's a temp ID
      if (eventId.length < 24) return;

      await deleteEvent(eventId);
    } catch (error) {
      console.error("Failed to delete event", error);
    }
  };

  const handleReorderEvents = async (reorderedSubset: CalendarEvent[]) => {
    // This is complex because we only have a subset.
    // We update the events in the main list that match the IDs in the subset.
    const newEvents = events.map(e => {
        const match = reorderedSubset.find(r => r.id === e.id);
        return match ? match : e;
    });
    updateEvents(newEvents);
    
    // Persist all changed events
    for (const ev of reorderedSubset) {
        if (ev.id.length < 24) continue; // Skip temp IDs
        await updateEvent(ev.id, {
            startTime: ev.startTime,
            endTime: ev.endTime,
            status: ev.status
        });
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedEventId(null);
  };

  return (
    <>
      {/* Panel A: Control Center */}
      <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full shrink-0 animate-in slide-in-from-left-4 duration-500 fade-in">
        <div className="flex items-center justify-between px-2">
            <h2 className="font-display font-bold text-2xl tracking-tight text-gray-900 dark:text-zinc-200">
              {`${userName} Calendar`}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                  onClick={undo} 
                  disabled={history.length === 0}
                  className="p-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-100 dark:border-zinc-800 dark:text-white"
                  title="Undo"
              >
                  <Undo2 size={16} />
              </button>
              <button 
                  onClick={redo} 
                  disabled={redoStack.length === 0}
                  className="p-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-gray-100 dark:border-zinc-800 dark:text-white"
                  title="Redo"
              >
                  <Redo2 size={16} />
              </button>
            </div>
        </div>

        <div className="glass-panel p-6 rounded-[32px] shadow-sm relative overflow-hidden flex flex-col">
            
            <CalendarView 
              currentDate={currentDate}
              selectedDate={selectedDate}
              events={filteredEvents}
              onSelectDate={handleDateSelect}
              onNextMonth={handleNextMonth}
              onPrevMonth={handlePrevMonth}
            />

            <div className="mt-6 bg-white dark:bg-zinc-900 rounded-[28px] p-5 shadow-sm relative overflow-hidden group border border-gray-50 dark:border-zinc-800">
              <div className="flex items-end justify-between mb-2 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Year Progress</span>
                    <span className="text-3xl font-display font-bold text-gray-900 dark:text-zinc-200">{yearProgress}%</span>
                  </div>
                  <PieChart size={20} className="text-gray-300 dark:text-zinc-700 mb-2" />
              </div>
              
              <div className="relative h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-black dark:bg-white rounded-full shadow-lg transition-all duration-1000 ease-out relative"
                    style={{ width: `${yearProgress}%` }}
                  />
              </div>

              <div className="flex items-center gap-4 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900 dark:text-zinc-200 leading-none">{daysLeftInYear}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Days Left</span>
                  </div>
                  <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800"></div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900 dark:text-zinc-200 leading-none">{weeksLeft}</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Weeks Left</span>
                  </div>
              </div>
            </div>

            <div className="mt-6 mb-4 pl-1 flex-1 overflow-y-auto hide-scrollbar">
              <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={12} className="text-gray-400" />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Events & Holidays</h3>
              </div>
              <div className="min-h-[20px]">
                  {loadingHolidays ? (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
                    </div>
                  ) : (
                    holidays.length > 0 ? (
                        <ul className="space-y-1.5">
                          {holidays.map((h, i) => (
                              <li key={i} className="text-xs font-medium text-gray-600 dark:text-zinc-400 flex items-start gap-2 leading-tight">
                                <span className="w-1 h-1 rounded-full bg-black dark:bg-white mt-1.5 shrink-0 opacity-50"></span>
                                {h}
                              </li>
                          ))}
                        </ul>
                    ) : (
                        <p className="text-[10px] text-gray-400 italic">No special events today.</p>
                    )
                  )}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Filter size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Categories</span>
                </div>
                {selectedRoleFilter !== 'All' && (
                  <button onClick={() => setSelectedRoleFilter('All')} className="text-[10px] text-red-500 font-bold hover:underline">Clear</button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth snap-x">
                <button 
                  onClick={() => setSelectedRoleFilter('All')}
                  className={`snap-start px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${selectedRoleFilter === 'All' ? 'bg-black text-white border-black dark:bg-white dark:text-black shadow-lg' : 'bg-white/50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 border-transparent hover:bg-white dark:hover:bg-zinc-700'}`}
                >
                  All
                </button>
                {departments.map(dept => (
                  <button 
                    key={dept}
                    onClick={() => setSelectedRoleFilter(dept)}
                    className={`snap-start px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${selectedRoleFilter === dept ? `bg-white dark:bg-zinc-800 border-black/10 dark:border-white/10 shadow-md ${getColorForString(dept)}` : 'bg-white/50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 border-transparent hover:bg-white dark:hover:bg-zinc-700'}`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="group w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-bold text-lg shadow-xl shadow-black/10 dark:shadow-white/5 hover:shadow-black/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[24px]"></div>
          <div className="flex items-center gap-2 relative z-10">
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 
            <span>New Thing</span>
          </div>
        </button>
      </div>

      {/* Panel B: Main Feed */}
      <div className="flex-1 flex flex-col w-full lg:h-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] shadow-depth-2 px-4 py-6 lg:px-8 lg:py-8 overflow-visible lg:overflow-hidden relative z-10 animate-in zoom-in-95 duration-500 border border-white/50 dark:border-white/5">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 z-10 relative gap-4">
            <div className="flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-zinc-200 tracking-tighter">
                  {format(currentDate, 'MMMM yyyy')}
              </h1>
              
              <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  {['all', 'todo', 'in-progress', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatusFilter(status as TaskStatus | 'all')}
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all border shrink-0 ${
                        selectedStatusFilter === status 
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black shadow-md' 
                          : 'text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {status.replace('-', ' ')}
                    </button>
                  ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between lg:justify-end gap-3">
              {calendarViewMode !== 'kanban' && (
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-full border border-gray-100 dark:border-zinc-700">
                    <CalendarDays size={16} className="text-gray-400"/>
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      {calendarViewMode === 'day' ? format(selectedDate, 'EEEE, MMM do') : `Week of ${format(selectedDate, 'MMM do')}`}
                    </span>
                </div>
              )}

              <div className="flex items-center bg-gray-100/80 dark:bg-zinc-800/80 p-1 rounded-full border border-gray-200 dark:border-zinc-700 shadow-inner w-full lg:w-auto justify-between lg:justify-start">
                  <button 
                    onClick={() => setCalendarViewMode('day')}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${calendarViewMode === 'day' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <LayoutList size={14} />
                    Day
                  </button>
                  <button 
                    onClick={() => setCalendarViewMode('week')}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${calendarViewMode === 'week' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <CalendarIcon size={14} />
                    Week
                  </button>
                  <button 
                    onClick={() => setCalendarViewMode('kanban')}
                    className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${calendarViewMode === 'kanban' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <Columns size={14} />
                    Kanban
                  </button>
              </div>
            </div>
        </div>

        <div className="flex-1 relative overflow-visible lg:overflow-hidden flex flex-col">
          {calendarViewMode === 'day' && (
            <>
              <DayView 
                date={selectedDate} 
                events={filteredEvents} 
                onUpdateEvent={handleUpdateEvent}
                onReorderEvents={handleReorderEvents}
                onDeleteEvent={handleDeleteEvent}
                onSelectEvent={setSelectedEventId}
                selectedEventId={selectedEventId}
              />
              <div className="hidden lg:block absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none z-20"></div>
            </>
          )}
          
          {calendarViewMode === 'week' && (
            <WeekView 
              date={selectedDate} 
              events={filteredEvents} 
              onSelectDate={handleDateSelect}
            />
          )}

          {calendarViewMode === 'kanban' && (
            <KanbanView 
              events={filteredEvents} 
              departments={departments}
              onEventUpdate={handleUpdateEvent}
            />
          )}
        </div>
      </div>

      <EventModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
        departments={departments}
        eventTypes={eventTypes}
        resourceCategories={resourceCategories}
        setDepartments={setDepartments}
        setEventTypes={setEventTypes}
        setResourceCategories={setResourceCategories}
      />
    </>
  );
}
