
import React, { useState, useEffect } from 'react';
import { FileText, Plus, FileSpreadsheet, Youtube, Link as LinkIcon, Trash2, ExternalLink, CloudSun, Clock, Settings2, X, Thermometer, Globe, HardDrive, Box, Database, PenTool, Layout, File, MoreHorizontal, Check, CloudRain, CloudSnow, Sun, Moon, Cloud, CloudLightning, Wind, Droplets } from 'lucide-react';
import { ResourceItem, WeatherForecastItem } from '../types';
import { format } from 'date-fns';
import { getWeatherForecast } from '../services/geminiService';
import { useApp } from '@/context/AppContext';

// --- Time & Weather Widget ---

const TIMEZONES = [
  { label: 'Local', value: 'local' },
  { label: 'UTC', value: 'UTC' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Mumbai', value: 'Asia/Kolkata' },
  { label: 'Sydney', value: 'Australia/Sydney' },
];

const getWeatherIcon = (condition: string, size = 24) => {
  const c = condition.toLowerCase();
  if (c.includes('rain')) return <CloudRain size={size} className="text-blue-400" />;
  if (c.includes('snow')) return <CloudSnow size={size} className="text-blue-200" />;
  if (c.includes('storm')) return <CloudLightning size={size} className="text-yellow-400" />;
  if (c.includes('cloud')) return <Cloud size={size} className="text-gray-400" />;
  if (c.includes('clear') || c.includes('sunny')) return <Sun size={size} className="text-orange-400" />;
  if (c.includes('night')) return <Moon size={size} className="text-indigo-300" />;
  return <CloudSun size={size} className="text-gray-400" />;
};

export const TimeWeatherWidget: React.FC = () => {
  const { user } = useApp();
  const [time, setTime] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Settings State with Persistence
  const [unit, setUnit] = useState<'F' | 'C'>(() => (localStorage.getItem('weather_unit') as 'F' | 'C') || 'F');
  
  // Initialize with user location if available, else local storage or default
  const [locationName, setLocationName] = useState(() => {
     if (user?.location) return user.location;
     return localStorage.getItem('weather_location') || 'San Francisco';
  });

  const [tempLocation, setTempLocation] = useState(locationName);
  const [timeZone, setTimeZone] = useState(() => localStorage.getItem('weather_timezone') || 'local');

  // Forecast Data
  const [forecast, setForecast] = useState<WeatherForecastItem[]>([]);
  const [loadingForecast, setLoadingForecast] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('weather_unit', unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem('weather_location', locationName);
  }, [locationName]);

  useEffect(() => {
    localStorage.setItem('weather_timezone', timeZone);
  }, [timeZone]);

  // Update location when user profile loads/changes
  useEffect(() => {
    if (user?.location) {
      setLocationName(user.location);
      setTempLocation(user.location);
    }
  }, [user?.location]);

  // Fetch forecast when location changes or on mount (morning check simulated)
  useEffect(() => {
    const fetchWeather = async () => {
      setLoadingForecast(true);
      const data = await getWeatherForecast(locationName, new Date());
      setForecast(data);
      setLoadingForecast(false);
    };
    fetchWeather();
    
    // Refresh every hour
    const interval = setInterval(fetchWeather, 3600000);
    return () => clearInterval(interval);
  }, [locationName]);

  const getDisplayTime = () => {
    if (timeZone === 'local') return time;
    const tzString = time.toLocaleString('en-US', { timeZone: timeZone });
    return new Date(tzString);
  };

  const displayTime = getDisplayTime();
  const currentForecast = forecast[0] || { temp: 72, condition: 'Sunny', humidity: '50%', windSpeed: '5 mph', precipitation: '0%' };

  const handleSave = () => {
    setLocationName(tempLocation);
    setIsEditing(false);
  };

  return (
    <>
      <div 
        onClick={() => !isEditing && setIsExpanded(true)}
        className="bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-[32px] p-6 shadow-sm border border-white/60 dark:border-white/5 flex flex-col justify-between h-44 mb-6 relative overflow-hidden group hover:shadow-md transition-all duration-500 cursor-pointer"
      >
        {/* Decorative BG */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-100/50 dark:bg-white/5 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-700"></div>

        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()} className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-20 p-4 flex flex-col gap-3 animate-in fade-in cursor-default">
             <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Widget Settings</h4>
                <button onClick={handleSave} className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">
                   <X size={12} />
                </button>
             </div>
             
             <div className="space-y-1">
               <label className="text-[10px] font-bold text-gray-400">Location</label>
               <input 
                 type="text" 
                 value={tempLocation}
                 onChange={(e) => setTempLocation(e.target.value)}
                 className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200"
               />
             </div>

             <div className="flex gap-2">
               <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">Unit</label>
                  <div className="flex bg-gray-50 dark:bg-zinc-800 rounded-lg p-0.5 border border-gray-200 dark:border-zinc-700">
                     <button onClick={() => setUnit('F')} className={`flex-1 text-[10px] font-bold py-1 rounded-md ${unit === 'F' ? 'bg-white dark:bg-zinc-700 shadow-sm dark:text-white' : 'text-gray-400'}`}>°F</button>
                     <button onClick={() => setUnit('C')} className={`flex-1 text-[10px] font-bold py-1 rounded-md ${unit === 'C' ? 'bg-white dark:bg-zinc-700 shadow-sm dark:text-white' : 'text-gray-400'}`}>°C</button>
                  </div>
               </div>
               <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-400">Time</label>
                  <select 
                    value={timeZone} 
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-1 py-1 text-[10px] font-bold focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
               </div>
             </div>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            className="absolute top-4 right-4 z-20 text-gray-300 hover:text-black dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
             <Settings2 size={16} />
          </button>
        )}

        <div className="flex justify-between items-start z-10">
           <div>
              <h3 className="font-display font-bold text-4xl text-gray-900 dark:text-zinc-200 tracking-tighter">
                {format(displayTime, 'h:mm')} <span className="text-lg text-gray-400 font-medium">{format(displayTime, 'a')}</span>
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                {timeZone === 'local' ? format(displayTime, 'EEEE, MMMM do') : `${timeZone.split('/')[1] || timeZone}`}
              </p>
           </div>
           <div className="text-black dark:text-white transition-transform duration-500">
              {getWeatherIcon(currentForecast.condition)}
           </div>
        </div>

        <div className="z-10 mt-auto flex items-end justify-between">
           <div>
             <p className="text-2xl font-bold text-gray-900 dark:text-zinc-200">
               {currentForecast.temp}°{unit}
             </p>
             <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{currentForecast.condition}</p>
           </div>
           <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                 <Wind size={10} /> {currentForecast.windSpeed || '5mph'}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Thermometer size={10} /> {locationName}
              </p>
           </div>
        </div>
      </div>

      {/* Expanded Forecast Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setIsExpanded(false)}></div>
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200 border border-white/20">
             <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                <div>
                   <h2 className="text-2xl font-display font-bold dark:text-white">24-Hour Forecast</h2>
                   <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                     <Thermometer size={12} /> {locationName} &bull; Updated just now
                   </p>
                </div>
                <button onClick={() => setIsExpanded(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  <X size={20} className="dark:text-white" />
                </button>
             </div>

             <div className="p-8 overflow-x-auto custom-scrollbar">
                {loadingForecast ? (
                   <div className="flex gap-4 items-center justify-center h-32">
                      <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce delay-150"></div>
                   </div>
                ) : (
                   <div className="flex gap-4 min-w-max pb-4">
                      {forecast.map((item, idx) => (
                         <div key={idx} className="flex flex-col items-center justify-between bg-gray-50 dark:bg-zinc-800 rounded-3xl p-4 min-w-[120px] h-[220px] border border-gray-100 dark:border-zinc-700 hover:scale-105 transition-transform group">
                            <span className="text-xs font-bold text-gray-400 uppercase">{item.time}</span>
                            
                            <div className="my-2 p-2 bg-white dark:bg-zinc-700/50 rounded-full shadow-sm">
                               {getWeatherIcon(item.condition, 32)}
                            </div>
                            
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{item.temp}°{unit}</span>
                            
                            <div className="flex flex-col gap-1 w-full pt-2 border-t border-gray-200 dark:border-zinc-700/50">
                                <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Droplets size={8} /> Rain</span>
                                    <span>{item.precipitation || '0%'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Wind size={8} /> Wind</span>
                                    <span>{item.windSpeed || '0'}</span>
                                </div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>
      )}
    </>
  );
};


// --- Resource Hub Widget ---

interface ResourceWidgetProps {
  resources: ResourceItem[];
  resourceCategories: string[];
  onAddResource: (item: ResourceItem) => void;
  onRemoveResource: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setResourceCategories: React.Dispatch<React.SetStateAction<string[]>>;
  title?: string;
}

const getIconForCategory = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('youtube')) return <Youtube size={20} />;
  if (normalized.includes('doc')) return <FileText size={20} />;
  if (normalized.includes('sheet')) return <FileSpreadsheet size={20} />;
  if (normalized.includes('drive')) return <HardDrive size={20} />;
  if (normalized.includes('dropbox') || normalized.includes('box')) return <Box size={20} />;
  if (normalized.includes('notion') || normalized.includes('data')) return <Database size={20} />;
  if (normalized.includes('design') || normalized.includes('figma')) return <PenTool size={20} />;
  if (normalized.includes('link')) return <LinkIcon size={20} />;
  return <File size={20} />;
};

const getCategoryColor = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('youtube')) return 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50';
    if (normalized.includes('doc')) return 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50';
    if (normalized.includes('sheet')) return 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50';
    if (normalized.includes('design')) return 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50';
    return 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700';
};

export const ResourceWidget: React.FC<ResourceWidgetProps> = ({ 
  resources, resourceCategories, onAddResource, onRemoveResource, setResourceCategories, title = "Project Hub" 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Default to first category
  useEffect(() => {
    if (resourceCategories.length > 0 && !categoryInput) {
      setCategoryInput(resourceCategories[0]);
    }
  }, [resourceCategories, categoryInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    onAddResource({
      id: Math.random().toString(36).substr(2, 9),
      url: urlInput,
      type: categoryInput,
      title: titleInput || 'Untitled Resource'
    });

    setUrlInput('');
    setTitleInput('');
    setIsAdding(false);
  };

  const handleAddCategory = () => {
    if (newCatName.trim() && !resourceCategories.includes(newCatName.trim())) {
    //  setResourceCategories([...resourceCategories, newCatName.trim()]); 
    // Commented out as we don't have setResourceCategories exposed properly yet or ignoring it
    // Wait, the prop exists but might not be backed by AppContext. 
    // RightSidebar passes it as `setResourceCategories` but AppContext only exposes the list.
    // I added setResourceCategories to AppContext interface but didn't implement it in the provider to update DB?
    // Actually I added `setResourceCategories` to AppContext state in the previous turn. 
    // So it should work if passed correctly.
      setResourceCategories(prev => [...prev, newCatName.trim()]);
      setNewCatName('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    setResourceCategories(prev => prev.filter(c => c !== cat));
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-[32px] p-6 relative overflow-hidden flex flex-col shadow-[inset_0_1px_4px_rgba(255,255,255,0.6)] dark:shadow-none border border-white/60 dark:border-white/5 transition-all duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 z-10 shrink-0">
        <div>
          <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-zinc-200 leading-tight">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            {resources.length} resource{resources.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showSettings ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-zinc-800 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-700'}`}
                title="Manage Categories"
            >
                <Settings2 size={18} />
            </button>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-md active:scale-95 ${isAdding ? 'bg-black text-white dark:bg-white dark:text-black rotate-45' : 'bg-white dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-zinc-700'}`}
            >
                <Plus size={20} />
            </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
          <div className="mb-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 animate-in slide-in-from-top-4 fade-in z-20 shrink-0">
             <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Manage Categories</h4>
             <div className="flex flex-wrap gap-2 mb-3">
                {resourceCategories.map(cat => (
                    <div key={cat} className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-100 dark:border-zinc-700">
                        <span className="text-xs font-bold text-gray-600 dark:text-zinc-300">{cat}</span>
                        <button onClick={() => handleDeleteCategory(cat)} className="text-gray-400 hover:text-red-500">
                            <X size={12} />
                        </button>
                    </div>
                ))}
             </div>
             <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={newCatName} 
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="New Category..."
                    className="flex-1 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200"
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                 />
                 <button onClick={handleAddCategory} className="bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg text-xs font-bold">Add</button>
             </div>
          </div>
      )}

      {/* Content */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        {isAdding && (
          <div className="mb-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-lg animate-in slide-in-from-top-4 fade-in z-20 shrink-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Paste URL..." 
                className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all dark:text-zinc-200"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Title" 
                    className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-all dark:text-zinc-200"
                    value={titleInput}
                    onChange={e => setTitleInput(e.target.value)}
                  />
                  <select 
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    className="w-1/3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-2 py-2 text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white dark:text-zinc-200"
                  >
                    {resourceCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
              </div>
              <button type="submit" className="bg-black text-white dark:bg-white dark:text-black rounded-xl py-2.5 text-sm font-bold shadow-md hover:bg-gray-800 dark:hover:bg-gray-200 active:scale-95 transition-all">
                Add Link
              </button>
            </form>
          </div>
        )}

        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pb-2">
          {resources.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 border-2 border-dashed border-gray-300/50 dark:border-zinc-700 rounded-3xl mx-2 min-h-[150px]">
                <LinkIcon size={32} className="mb-3" />
                <span className="text-sm font-bold text-center">No links found</span>
                <span className="text-xs">Select an event or add resources</span>
            </div>
          ) : (
            resources.map((res) => (
              <div 
                key={res.id} 
                onClick={() => handleOpenLink(res.url)}
                className="bg-white dark:bg-zinc-900 rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer border border-white/60 dark:border-zinc-800 hover:-translate-y-0.5 animate-in slide-in-from-bottom-2 duration-300"
              >
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${getCategoryColor(res.type)}`}>
                        {getIconForCategory(res.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-gray-900 dark:text-zinc-200 text-sm truncate">{res.title}</h4>
                       <div className="flex items-center gap-2 mt-0.5">
                           <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-zinc-700">
                                {res.type}
                           </span>
                           <span className="text-[10px] text-gray-300 dark:text-zinc-600 truncate max-w-[100px]">{new URL(res.url).hostname.replace('www.', '')}</span>
                       </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                       <ExternalLink size={14} className="text-gray-400" />
                       <button 
                          onClick={(e) => { e.stopPropagation(); onRemoveResource(res.id); }}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-gray-300 dark:text-zinc-600 dark:hover:bg-red-900/30 transition-colors"
                       >
                          <Trash2 size={12} />
                       </button>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
