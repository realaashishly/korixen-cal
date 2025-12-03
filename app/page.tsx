'use client';

import React from 'react';
import { format } from 'date-fns';
import { 
  Home, 
  Settings, 
  LogOut,
  CalendarDays,
  Sparkles,
  Trash2,
  Filter,
  LayoutList,
  Columns,
  Calendar as CalendarIcon,
  Undo2,
  Redo2,
  PieChart,
  Plus,
  CreditCard,
  Check,
  User,
  Crown,
  Moon,
  Sun,
  ArrowRight,
  Quote,
  Zap,
  ShieldCheck,
  Gift,
  X
} from 'lucide-react';

import CalendarView from '../components/CalendarView';
import DayView from '../components/DayView';
import WeekView from '../components/WeekView';
import KanbanView from '../components/KanbanView';
import SubscriptionTracker from '../components/SubscriptionTracker';
import EventModal from '../components/EventModal';
import { ResourceWidget, TimeWeatherWidget } from '../components/Widgets';
import Loader from '../components/Loader';
import Logo from '../components/Logo';
import BuildingHome from '../components/BuildingHome';
import { getColorForString, TaskStatus } from '../types';
import { useApp } from '../context/AppContext';

const DashboardPage: React.FC = () => {
  const {
    appState,
    toastMsg,
    isDarkMode, toggleTheme,
    currentDate,
    selectedDate, handleDateSelect,
    userName, setUserName,
    handleDeleteAccount,
    couponCode, setCouponCode,
    isCelebrating,
    isUpgraded,
    events,
    history, redoStack,
    selectedEventId, setSelectedEventId,
    holidays, loadingHolidays,
    departments, eventTypes, resourceCategories,
    setDepartments, setEventTypes, setResourceCategories,
    isModalOpen, setIsModalOpen,
    activeView, setActiveView,
    calendarViewMode, setCalendarViewMode,
    selectedRoleFilter, setSelectedRoleFilter,
    selectedStatusFilter, setSelectedStatusFilter,
    daysLeftInYear, weeksLeft, yearProgress,
    displayResources, resourceWidgetTitle,
    filteredEvents,
    getDaysRemaining,
    handleRedeemCoupon,
    handleBuy,
    handleCancelSubscription,
    handlePrevMonth,
    handleNextMonth,
    undo, redo,
    handleSaveEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleReorderEvents,
    handleAddResource,
    handleRemoveResource
  } = useApp();

  if (appState === 'loading') return <Loader />;
  if (appState === 'building') return <BuildingHome />;
  // Auth and Onboarding are handled by routing in AppContext

  return (
    <div className={`transition-colors duration-300 ease-in-out ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col lg:flex-row min-h-screen w-full bg-[#FAFAFA] dark:bg-zinc-950 bg-dot-pattern lg:overflow-hidden text-[#09090b] dark:text-zinc-200 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">
        <div className="bg-noise opacity-[0.03] dark:opacity-[0.05]"></div>
        
        {/* Celebration Confetti Overlay */}
        {isCelebrating && (
             <div className="absolute inset-0 pointer-events-none z-100 overflow-hidden">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-2 h-2 rounded-full animate-[rain_3s_ease-out_forwards]"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `-10px`,
                            backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)],
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    ></div>
                ))}
                <style>{`
                    @keyframes rain {
                        to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                    }
                `}</style>
             </div>
        )}

        {toastMsg && (
          <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90%]">
            <div className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold border border-white/10">
                <Check size={16} />
                {toastMsg}
            </div>
          </div>
        )}
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-6 pb-2 z-30">
             <Logo />
             <button 
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
        </div>

        {/* 1. Navigation Rail (Desktop) */}
        <aside className="hidden lg:flex w-24 py-8 flex-col items-center justify-between z-20 flex-shrink-0 relative">
          <Logo />

          <nav className="flex flex-col gap-6 p-2 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-white/50 dark:border-white/5 shadow-depth-1">
              <button 
                onClick={() => setActiveView('calendar')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${activeView === 'calendar' ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
                title="Calendar"
              >
                <Home size={20} strokeWidth={activeView === 'calendar' ? 2.5 : 2} />
              </button>
              <button 
                onClick={() => setActiveView('subscriptions')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${activeView === 'subscriptions' ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
                title="Subscriptions"
              >
                <CreditCard size={20} strokeWidth={activeView === 'subscriptions' ? 2.5 : 2} />
              </button>
              <button 
                onClick={() => setActiveView('settings')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${activeView === 'settings' ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
                title="Settings"
              >
                <Settings size={20} strokeWidth={activeView === 'settings' ? 2.5 : 2} />
              </button>
              <button 
                onClick={() => setActiveView('pricing')}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group ${activeView === 'pricing' ? 'text-black dark:text-white scale-110' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-white dark:hover:bg-zinc-800'}`}
                title="Pricing"
              >
                <Crown size={20} strokeWidth={activeView === 'pricing' ? 2.5 : 2} />
              </button>
          </nav>

          <button 
             onClick={toggleTheme}
             className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </aside>

        {/* 2. Main Dashboard Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 w-full lg:h-full overflow-visible lg:overflow-hidden relative z-10 pb-28 lg:pb-6">
          
          {/* Panel A: Control Center */}
          <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full flex-shrink-0 animate-in slide-in-from-left-4 duration-500 fade-in">
            
            {(activeView === 'calendar' || activeView === 'pricing' || activeView === 'subscriptions') && (
              <>
                <div className="flex items-center justify-between px-2">
                    <h2 className="font-display font-bold text-2xl tracking-tight text-gray-900 dark:text-zinc-200">
                      {activeView === 'calendar' ? `${userName} Calendar` : activeView === 'subscriptions' ? 'Tracker' : 'Upgrade'}
                    </h2>
                    {activeView === 'calendar' && (
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
                    )}
                </div>

                {activeView === 'calendar' ? (
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
                ) : (
                  <div className="glass-panel p-8 rounded-[32px] shadow-sm flex-1 flex flex-col justify-center text-center">
                      <div className="mb-6 w-16 h-16 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100 dark:border-zinc-800">
                        {activeView === 'subscriptions' ? (
                            <CreditCard size={32} className="text-black dark:text-white" />
                        ) : (
                            <Crown size={32} className="text-black dark:text-white" />
                        )}
                      </div>
                      {activeView === 'subscriptions' ? (
                          <>
                            <h3 className="text-xl font-bold mb-2 dark:text-zinc-200">Manage Expenses</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                              Keep track of your recurring services and software licenses in one place.
                            </p>
                          </>
                      ) : (
                          <>
                            <h3 className="text-xl font-bold mb-2 dark:text-zinc-200">Manage Subscription</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                              {isUpgraded ? "You have full access to all features." : "You are currently on the Free plan. Upgrade to unlock full access."}
                            </p>
                          </>
                      )}
                  </div>
                )}
              </>
            )}

            {activeView === 'settings' && (
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
                          onClick={() => {
                            localStorage.removeItem('chronos_auth_token');
                            window.location.reload();
                          }}
                          className="w-full py-4 text-gray-900 dark:text-zinc-200 font-bold text-sm bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-[20px] hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                        <button 
                          onClick={handleDeleteAccount}
                          className="w-full py-4 text-red-600 font-bold text-sm border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 rounded-[20px] hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} /> Delete Account
                        </button>
                    </section>
                  </div>
              </div>
            )}
            
            {activeView === 'calendar' && (
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
            )}
          </div>

          {/* Panel B: Main Feed (Center or Pricing) */}
          <div className="flex-1 flex flex-col w-full lg:h-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl rounded-[40px] shadow-depth-2 px-4 py-6 lg:px-8 lg:py-8 overflow-visible lg:overflow-hidden relative z-10 animate-in zoom-in-95 duration-500 border border-white/50 dark:border-white/5">
            
            {activeView === 'subscriptions' ? (
                <SubscriptionTracker />
            ) : activeView === 'pricing' ? (
              <div className="flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 lg:h-full gap-8">
                      {/* Left Side: Quotes & Value Prop */}
                      <div className="flex flex-col justify-center h-full space-y-8 pr-4">
                          <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${getDaysRemaining() > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="font-bold uppercase text-xs tracking-widest text-gray-500 dark:text-gray-400">
                                   {getDaysRemaining() > 0 ? 'Free Trial Started' : 'Trial Expired'}
                                </span>
                              </div>
                              <h1 className="text-6xl font-display font-bold text-gray-900 dark:text-zinc-100 leading-tight">
                                {isUpgraded ? (
                                    <>
                                        Thank you for <br/>
                                        <span className="text-gray-400 dark:text-zinc-600">buying my project.</span>
                                    </>
                                ) : (
                                    <>
                                        Clarity in <br/>
                                        <span className="text-gray-400 dark:text-zinc-600">Chaos.</span>
                                    </>
                                )}
                              </h1>
                              <p className="text-lg text-gray-500 dark:text-zinc-400 font-medium max-w-md leading-relaxed">
                                Korizen brings your tasks, schedule, and subscriptions into one unified flow. Achieve peace of mind through organized living.
                              </p>
                          </div>

                          <div className="space-y-4">
                              <div className="flex items-start gap-4">
                                 <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                                    <Zap size={20} className="text-black dark:text-white" />
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-black dark:text-white">Seamless Workflow</h3>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">Never miss a beat with integrated tasks and calendar.</p>
                                 </div>
                              </div>
                              <div className="flex items-start gap-4">
                                 <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                                    <ShieldCheck size={20} className="text-black dark:text-white" />
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-black dark:text-white">Financial Control</h3>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400">Track every penny with the smart subscription manager.</p>
                                 </div>
                              </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-[24px] border border-gray-100 dark:border-zinc-800 relative">
                             <Quote className="absolute top-4 left-4 text-gray-200 dark:text-zinc-700" size={40} />
                             <p className="relative z-10 text-sm font-medium text-gray-600 dark:text-zinc-300 italic mb-4 pt-4">
                                "Korizen creates a beautiful, good, and amazing experience, transforming chaos into clarity with elegance."
                             </p>
                          </div>
                      </div>

                      {/* Right Side: Pricing Card */}
                      <div className="flex flex-col justify-center h-full">
                         <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[40px] p-8 shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                            {/* Countdown Badge - Beautifully Styled */}
                            <div className="absolute top-6 right-6 flex flex-col items-center animate-pulse">
                                <div className="bg-black dark:bg-white text-white dark:text-black w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white dark:border-black z-10">
                                    <span className="text-xl font-bold leading-none">{getDaysRemaining()}</span>
                                    <span className="text-[9px] uppercase font-bold tracking-wider">Days</span>
                                </div>
                            </div>

                            <div className="text-center mb-8 pt-6">
                               <div className="inline-flex items-center justify-center p-3 bg-gray-50 dark:bg-zinc-800 rounded-full mb-4 shadow-inner">
                                  <Crown size={28} className="text-black dark:text-white" />
                               </div>
                               <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-zinc-100">
                                   {isUpgraded ? "Premium Active" : "Full Access"}
                               </h2>
                               <div className="flex items-center justify-center gap-1 mt-4">
                                  <span className="text-2xl font-bold text-gray-400">$</span>
                                  <span className="text-7xl font-display font-bold text-black dark:text-white tracking-tighter">3</span>
                                  <span className="text-gray-400 font-medium self-end mb-2">/ month</span>
                               </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 mb-8 text-center border border-gray-100 dark:border-zinc-800">
                               <p className="font-bold text-gray-900 dark:text-zinc-200">
                                 {isUpgraded ? "You now have full access as you were using." : "Get access to everything as you have been using."}
                               </p>
                            </div>

                            {isUpgraded ? (
                                <button 
                                  onClick={handleCancelSubscription}
                                  className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-bold text-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl active:scale-95 mb-6 flex items-center justify-center gap-2"
                                >
                                  Cancel Subscription <X size={20} />
                                </button>
                            ) : (
                                <button 
                                  onClick={handleBuy}
                                  className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-bold text-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl active:scale-95 mb-6 flex items-center justify-center gap-2"
                                >
                                  Buy Now <ArrowRight size={20} />
                                </button>
                            )}

                            {/* Coupon Section */}
                            {!isUpgraded && (
                                <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Have a coupon?</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input 
                                            type="text" 
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Code"
                                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-10 pr-3 py-3 font-bold text-sm focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200 uppercase transition-all"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleRedeemCoupon}
                                            className="bg-gray-100 dark:bg-zinc-800 text-black dark:text-white px-4 rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                        >
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                                </div>
                            )}
                         </div>
                      </div>
                  </div>
              </div>
            ) : (
              <>
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
                      <div className="hidden lg:block absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none z-20"></div>
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
              </>
            )}
          </div>

          {/* Panel C: Resources & Weather (Right Sidebar) */}
          <div className="w-full lg:w-[340px] flex flex-col gap-6 lg:h-full flex-shrink-0 animate-in slide-in-from-right-4 duration-500 fade-in delay-75">
            <TimeWeatherWidget />
            <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0">
                <ResourceWidget 
                  title={resourceWidgetTitle}
                  resources={displayResources} 
                  resourceCategories={resourceCategories}
                  setResourceCategories={setResourceCategories}
                  onAddResource={handleAddResource}
                  onRemoveResource={handleRemoveResource}
                />
            </div>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-black/90 dark:bg-white/90 backdrop-blur-xl rounded-full z-50 flex items-center justify-between px-6 shadow-2xl text-gray-400">
           <button 
             onClick={() => setActiveView('calendar')}
             className={`p-2 rounded-full transition-all ${activeView === 'calendar' ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
           >
              <Home size={24} strokeWidth={activeView === 'calendar' ? 3 : 2} />
           </button>
           <button 
             onClick={() => setActiveView('subscriptions')}
             className={`p-2 rounded-full transition-all ${activeView === 'subscriptions' ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
           >
              <CreditCard size={24} strokeWidth={activeView === 'subscriptions' ? 3 : 2} />
           </button>
           
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center text-black dark:text-white shadow-lg -translate-y-4 border-4 border-[#FAFAFA] dark:border-zinc-950"
           >
              <Plus size={24} strokeWidth={3} />
           </button>

           <button 
             onClick={() => setActiveView('pricing')}
             className={`p-2 rounded-full transition-all ${activeView === 'pricing' ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
           >
              <Crown size={24} strokeWidth={activeView === 'pricing' ? 3 : 2} />
           </button>
           <button 
             onClick={() => setActiveView('settings')}
             className={`p-2 rounded-full transition-all ${activeView === 'settings' ? 'text-white dark:text-black scale-110' : 'hover:text-white dark:hover:text-black'}`}
           >
              <Settings size={24} strokeWidth={activeView === 'settings' ? 3 : 2} />
           </button>
        </nav>

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
      </div>
    </div>
  );
};

export default DashboardPage;
