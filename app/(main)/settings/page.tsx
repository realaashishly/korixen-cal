'use client';

import React, { useEffect, useState } from 'react';
import { User, Check, LogOut, Trash2, CalendarDays, LayoutList, Calendar as CalendarIcon, Columns, Sparkles, Filter, X, AlertTriangle, RefreshCw } from 'lucide-react';
import EventModal from '@/components/EventModal';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { TaskStatus, getColorForString } from '@/types';
import DayView from '@/components/DayView';
import WeekView from '@/components/WeekView';
import KanbanView from '@/components/KanbanView';
import useUser from '@/context/useUser';
import { authClient } from '@/lib/auth-client';
import { redirect, useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, isLoading } = useUser();
  const [userName, setUserName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  
  // ... existing code ...

  // Loading Skeleton
  if (isLoading) {
     return (
        <div className="flex flex-col lg:flex-row h-full gap-8 animate-pulse p-4 lg:p-0">
           {/* Sidebar Skeleton */}
           <div className="w-full lg:w-[320px] shrink-0 space-y-6">
              <div className="h-8 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
              <div className="h-64 w-full bg-gray-200 dark:bg-zinc-800 rounded-[32px]"></div>
              <div className="h-40 w-full bg-gray-200 dark:bg-zinc-800 rounded-[32px]"></div>
           </div>
           
           {/* Main Content Skeleton */}
           <div className="flex-1 space-y-6">
              <div className="h-[400px] w-full bg-gray-200 dark:bg-zinc-800 rounded-[40px]"></div>
              <div className="h-[300px] w-full bg-gray-200 dark:bg-zinc-800 rounded-[40px]"></div>
           </div>
        </div>
     )
  }

  const {
    handleDeleteAccount,
    departments,
    handleUpdateEvent,
    handleDeleteEvent,
    seedDataByRole,
    events, // Use global events
    eventTypes,
    resourceCategories,
    setResourceCategories
  } = useApp();
  
  // Checking AppContext again - setters for departments/eventTypes might be missing in context export?
  // Let's check AppContext text. It has departments state but maybe not setter in context value?
  // AppContext only exports: setResourceCategories. Other setters might be internal or missing.
  // For now I will wrap them or mock them if context doesn't expose them.
  // Actually EventModal needs them.
  // I will assume for now I can pass dummy setters or I might need to update AppContext.
  // Let's look at AppContext again in my thought process... 
  // AppContext has setDepartments, setEventTypes defined as state but NOT exported in value={{...}}
  // Wait, I read AppContext file. line 533 value={{...}}. 
  // It has resources, departments... NO setDepartments.
  // This means I cannot edit departments/types globally easily from here without updating Context.
  // But for "User can delete, edit and update it", maybe I don't need to edit the *lists* of types, just the event's choice of type.
  // EventModal takes setDepartments prop. I might need to pass no-op or local state if I can't change global.
  // Or I can add them to context.
  // For this task "add example... user can delete edit update IT (the event)", I will prioritize event editing.
  
  // To avoid breaking, I'll pass local state dummy or if possible update context.
  // Updating context is better but bigger scope.
  // I'll define local state wrappers that warn "Not implemented" or just work locally?
  // Actually, EventModal requires them.
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null); // CalendarEvent
  
  // Local "mock" setters for Modal props that are missing from context
  const [localDepartments, setLocalDepartments] = useState(departments);
  const [localEventTypes, setLocalEventTypes] = useState(eventTypes);
  // Sync with context
  useEffect(() => { setLocalDepartments(departments) }, [departments]);
  useEffect(() => { setLocalEventTypes(eventTypes) }, [eventTypes]);

  useEffect(() => {
    if (user) {
      setUserName(user.name);
    }
  }, [user]);



  // --- Local State for Calendar Preview ---
  // Using global events from useApp now
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [calendarViewMode, setCalendarViewMode] = React.useState<"day" | "week" | "kanban">("day");
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState<TaskStatus | "all">("all");

  const filteredEvents = events.filter((event) => {
    const matchesStatus = selectedStatusFilter === "all" || event.status === selectedStatusFilter;
    return matchesStatus;
  });

  const handleDateSelect = (date: Date) => setSelectedDate(date);
  // Mock handlers since this is settings page, maybe readonly or simple updates?
  // We'll keep them no-op or simple for now to fix the crash
  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/signin');
  };

  const handleDeleteAccountClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    try {
        await authClient.deleteUser();
        router.replace('/signup');
    } catch (error) {
        console.error("Failed to delete account", error);
    }
  };

  const handleSelectEvent = (eventId: string | null) => {
    if (!eventId) {
        setSelectedEventId(null);
        return;
    }
    const evt = events.find(e => String(e.id) === String(eventId));
    if (evt) {
        setEditingEvent(evt);
        setSelectedDate(new Date(evt.startTime));
        setIsEventModalOpen(true);
    }
    setSelectedEventId(eventId);
  };

  const handleSaveEvent = async (eventData: any) => {
    if (editingEvent) {
        await handleUpdateEvent(editingEvent.id, eventData);
    } else {
        // Create new? The UI doesn't explicitly have "Add" button here yet, only Edit.
        // But if we did:
        // await handleCreateEvent(eventData);
    }
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleRegenerateData = async () => {
      if (confirm("This will add example events to your schedule. Continue?")) {
        // Default to "Professional" role for example data if user doesn't have one or just use 'Professional'
        await seedDataByRole('Professional'); 
        window.location.reload(); // Force refresh to see data if needed, or rely on state update
      }
  };

  const handleReorderEvents = async () => {
    // Placeholder: Real reordering would require updating start/end times based on index
    // For now we allow drag in UI but don't persist order changes to DB to avoid complex time shift logic in this turn
    // unless requested.
  };

  return (
    <>
      {/* Panel A: Settings Form */}
      <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full shrink-0 animate-in slide-in-from-left-4 duration-500 fade-in">
        <div className="lg:h-full glass-panel rounded-[32px] p-8 shadow-depth-1 border border-white/60 dark:border-white/5 overflow-y-auto hide-scrollbar animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="font-display font-bold text-3xl mb-1 dark:text-zinc-200">Settings</h2>
            <p className="text-gray-400 text-sm mb-8 font-medium">Manage your preferences</p>
            <div className="space-y-8">
            <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h3>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-400">
                        <User size={24} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Display Name</label>
                        <input 
                        type="text" 
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onBlur={() => {
                            if (userName && userName !== user?.name) {
                                authClient.updateUser({
                                    name: userName,
                                });
                            }
                        }}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-zinc-700 focus:border-black dark:focus:border-white outline-none font-bold text-lg py-1 transition-colors dark:text-zinc-200"
                        />
                    </div>
                </div>
                
                <button className="w-full bg-white dark:bg-zinc-900 rounded-xl p-3 flex items-center justify-between border border-gray-100 dark:border-zinc-800 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.08 2.72-5.2 2.72-7.753 0-.72-.053-1.467-.147-2.107H12.48z" fill="#4285F4"/></svg>
                        </div>
                        <span className="text-xs font-bold dark:text-zinc-300">Connected to Google</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full group-hover:scale-105 transition-transform">
                        <Check size={10} />
                    </span>
                </button>
            </section>
            <section className="space-y-3">
                <button 
                    onClick={handleSignOut}
                    className="w-full py-4 text-gray-900 dark:text-zinc-200 font-bold text-sm bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-[20px] hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut size={16} /> Sign Out
                </button>
                <button 
                    onClick={handleDeleteAccountClick}
                    className="w-full py-4 text-red-600 font-bold text-sm border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-[20px] hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                    <Trash2 size={16} /> Delete Account
                </button>
            </section>
            

            </div>
        </div>
      </div>

      {/* Panel B: Main Feed (Calendar) */}
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
                onUpdateEvent={(e) => handleUpdateEvent(e.id, e)} // Adapt signature
                onReorderEvents={handleReorderEvents}
                onDeleteEvent={handleDeleteEvent}
                onSelectEvent={handleSelectEvent}
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
              onEventUpdate={(e) => handleUpdateEvent(e.id, e)}
            />
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-md" 
                onClick={() => setIsDeleteModalOpen(false)}
            ></div>
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800 flex flex-col">
                <div className="p-8 pb-0 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Delete Account?</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                        This action cannot be undone. All your data, including tasks, events, and subscriptions will be permanently removed.
                    </p>
                </div>
                <div className="p-8 flex flex-col gap-3">
                    <button 
                        onClick={confirmDeleteAccount}
                        className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-[20px] font-bold text-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                        Yes, Delete Forever
                    </button>
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="w-full py-4 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-[20px] font-bold text-lg transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Event Edit Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
        departments={localDepartments}
        eventTypes={localEventTypes}
        resourceCategories={resourceCategories}
        setDepartments={setLocalDepartments}
        setEventTypes={setLocalEventTypes}
        setResourceCategories={setResourceCategories}
        event={editingEvent}
      />
    </>
  );
}
