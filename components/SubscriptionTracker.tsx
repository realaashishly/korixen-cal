
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Zap, 
  Home, 
  Monitor, 
  Tv, 
  Briefcase, 
  Calendar,
  CheckCircle2,
  X,
  ArrowUpRight,
  Filter,
  Music,
  Smartphone,
  Gamepad,
  Coffee,
  Cloud,
  Shield,
  Key,
  Globe,
  Mail,
  ShoppingBag,
  Car,
  Wifi,
  Film,
  Dumbbell,
  Plane,
  Gift,
  Book,
  Camera,
  Heart
} from 'lucide-react';
import { Subscription, SubscriptionType, BillingCycle } from '../types';
import { format, addMonths, addYears, differenceInDays } from 'date-fns';

const AVAILABLE_ICONS: { [key: string]: React.ElementType } = {
  CreditCard, Monitor, Tv, Zap, Home, Briefcase, Music, Smartphone, Gamepad, Coffee, Cloud, Shield, Key, Globe, Mail, ShoppingBag, Car, Wifi, Film, Dumbbell, Plane, Gift, Book, Camera, Heart
};

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    currency: '$',
    billingCycle: 'monthly',
    startDate: new Date('2023-01-15'),
    type: 'entertainment',
    isActive: true,
    link: 'https://netflix.com',
    color: '#E50914',
    icon: 'Tv'
  },
  {
    id: '2',
    name: 'Figma Professional',
    price: 144,
    currency: '$',
    billingCycle: 'yearly',
    startDate: new Date('2023-06-01'),
    type: 'software',
    isActive: true,
    link: 'https://figma.com',
    color: '#0ACF83',
    icon: 'Monitor'
  },
  {
    id: '3',
    name: 'Spotify',
    price: 9.99,
    currency: '$',
    billingCycle: 'monthly',
    startDate: new Date('2022-03-10'),
    type: 'entertainment',
    isActive: true,
    link: 'https://spotify.com',
    color: '#1DB954',
    icon: 'Music'
  }
];

interface SubscriptionTrackerProps {
  subscriptions: Subscription[];
  onAddSubscription: (sub: Subscription) => Promise<void>;
  onDeleteSubscription: (id: string) => Promise<void>;
}

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ 
  subscriptions, 
  onAddSubscription, 
  onDeleteSubscription 
}) => {
  // Removed local storage state
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SubscriptionType | 'all'>('all');

  // Form State
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newType, setNewType] = useState<SubscriptionType>('software');
  const [newCycle, setNewCycle] = useState<BillingCycle>('monthly');
  const [newLink, setNewLink] = useState('');
  const [newStartDate, setNewStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newEndDate, setNewEndDate] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  const [newIcon, setNewIcon] = useState('CreditCard');

  const filteredSubs = useMemo(() => {
    return activeFilter === 'all' 
      ? subscriptions 
      : subscriptions.filter(s => s.type === activeFilter);
  }, [subscriptions, activeFilter]);

  const monthlyTotal = useMemo(() => {
    return filteredSubs.reduce((acc, sub) => {
      if (!sub.isActive) return acc;
      // If end date is passed, don't count
      if (sub.endDate && new Date() > sub.endDate) return acc;
      
      let monthlyPrice = sub.price;
      if (sub.billingCycle === 'yearly') {
        monthlyPrice = sub.price / 12;
      }
      return acc + monthlyPrice;
    }, 0);
  }, [filteredSubs]);

  const yearlyTotal = monthlyTotal * 12;

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: Subscription = {
      id: Math.random().toString(36).substr(2, 9), // Temp ID, backend will assign real one
      name: newName,
      price: parseFloat(newPrice),
      currency: '$',
      billingCycle: newCycle,
      startDate: new Date(newStartDate),
      endDate: newEndDate ? new Date(newEndDate) : undefined,
      link: newLink,
      type: newType,
      isActive: true,
      color: newColor,
      icon: newIcon
    };

    await onAddSubscription(newSub);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteSubscription = async (id: string) => {
    await onDeleteSubscription(id);
  };

  const resetForm = () => {
    setNewName('');
    setNewPrice('');
    setNewType('software');
    setNewCycle('monthly');
    setNewLink('');
    setNewStartDate(format(new Date(), 'yyyy-MM-dd'));
    setNewEndDate('');
    setNewColor('#000000');
    setNewIcon('CreditCard');
  };

  const getNextPaymentDate = (sub: Subscription) => {
    const today = new Date();
    let nextDate = new Date(sub.startDate);
    
    // Simple logic to find next occurrence
    while (nextDate < today) {
      if (sub.billingCycle === 'monthly') {
        nextDate = addMonths(nextDate, 1);
      } else {
        nextDate = addYears(nextDate, 1);
      }
    }
    return nextDate;
  };

  const IconComponent = (iconName: string) => {
    const Icon = AVAILABLE_ICONS[iconName] || CreditCard;
    return <Icon size={20} />;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 dark:text-zinc-200 tracking-tighter mb-2">
            Subscriptions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Track recurring expenses and software licenses.</p>
        </div>
        
        <button 
           onClick={() => setIsModalOpen(true)}
           className="bg-black dark:bg-white text-white dark:text-black px-4 lg:px-5 py-3 rounded-full font-bold text-sm shadow-lg shadow-black/10 hover:shadow-black/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
        >
           <Plus size={18} /> <span className="hidden lg:inline">Add Subscription</span> <span className="lg:hidden">Add</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {/* Monthly Cost Card */}
         <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/50 dark:border-zinc-700 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-white dark:bg-zinc-700 rounded-2xl shadow-sm">
                  <CreditCard size={24} className="text-black dark:text-white" />
               </div>
            </div>
            
            <div>
               <span className="text-5xl font-display font-bold text-gray-900 dark:text-zinc-200 tracking-tighter">
                 ${monthlyTotal.toFixed(2)}
               </span>
               <p className="text-sm font-bold text-gray-400 mt-1">Monthly Estimate</p>
            </div>
            
            {/* Decoration */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent dark:from-zinc-700 dark:to-transparent rounded-full opacity-50 pointer-events-none"></div>
         </div>

         {/* Yearly Projection */}
         <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/50 dark:border-zinc-700 shadow-sm flex flex-col justify-between group">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 w-fit rounded-2xl shadow-sm mb-4">
               <ArrowUpRight size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
               <span className="text-3xl font-display font-bold text-gray-900 dark:text-zinc-200 tracking-tight">
                 ${yearlyTotal.toFixed(0)}
               </span>
               <p className="text-sm font-bold text-gray-400 mt-1">Yearly Projection</p>
            </div>
         </div>

         {/* Active Count */}
         <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/50 dark:border-zinc-700 shadow-sm flex flex-col justify-between group">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 w-fit rounded-2xl shadow-sm mb-4">
               <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
               <span className="text-3xl font-display font-bold text-gray-900 dark:text-zinc-200 tracking-tight">
                 {filteredSubs.filter(s => s.isActive).length}
               </span>
               <p className="text-sm font-bold text-gray-400 mt-1">Active Subscriptions</p>
            </div>
         </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
         <div className="flex items-center gap-2 text-gray-400 mr-2 shrink-0">
            <Filter size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Type</span>
         </div>
         {(['all', 'software', 'entertainment', 'utility', 'rent', 'service', 'other'] as const).map(type => (
            <button
               key={type}
               onClick={() => setActiveFilter(type)}
               className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
                  activeFilter === type 
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black shadow-md' 
                  : 'bg-white text-gray-500 border-transparent hover:bg-gray-50 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'
               }`}
            >
               {type}
            </button>
         ))}
      </div>

      {/* Subscription List */}
      <div className="flex-1 overflow-visible lg:overflow-y-auto hide-scrollbar space-y-3 pb-20">
         {filteredSubs.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-[32px] opacity-60">
              <CreditCard size={48} className="text-gray-300 dark:text-zinc-700 mb-4" />
              <p className="font-bold text-gray-400 dark:text-zinc-600">No subscriptions found</p>
           </div>
         ) : (
           filteredSubs.map(sub => {
             const nextPayment = getNextPaymentDate(sub);
             const daysLeft = differenceInDays(nextPayment, new Date());
             const isEnded = sub.endDate && new Date() > sub.endDate;

             return (
               <div key={sub.id} className={`group bg-white dark:bg-zinc-900 rounded-[24px] p-5 shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-all relative overflow-hidden ${isEnded ? 'opacity-60 grayscale' : ''}`}>
                  <div className="flex items-center gap-5 relative z-10">
                     {/* Icon Box - Updated to be clean monochrome */}
                     <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 text-black dark:text-zinc-200 transition-colors"
                     >
                        {IconComponent(sub.icon || 'CreditCard')}
                     </div>

                     {/* Main Info */}
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-200 truncate">{sub.name}</h3>
                           {sub.link && (
                              <a 
                                href={sub.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              >
                                 <ExternalLink size={14} />
                              </a>
                           )}
                           {/* Color tag indicator instead of full icon color */}
                           <div className="w-2 h-2 rounded-full ml-1" style={{ backgroundColor: sub.color }}></div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                           <span className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-gray-100 dark:border-zinc-700">
                             <Calendar size={12} /> {sub.billingCycle}
                           </span>
                           {!isEnded && (
                             <span className={`${daysLeft <= 3 ? 'text-red-500 font-bold' : ''}`}>
                               Next: {format(nextPayment, 'MMM d')} ({daysLeft} days)
                             </span>
                           )}
                           {isEnded && <span className="text-red-500 font-bold">Expired</span>}
                        </div>
                     </div>

                     {/* Price */}
                     <div className="text-right">
                        <div className="text-xl font-display font-bold text-gray-900 dark:text-zinc-200">
                           {sub.currency}{sub.price}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800 inline-block px-2 py-0.5 rounded-full mt-1">
                           {sub.type}
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="w-10 flex items-center justify-end">
                        <button 
                           onClick={() => handleDeleteSubscription(sub.id)}
                           className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               </div>
             );
           })
         )}
      </div>

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-md p-8 relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto hide-scrollbar border border-gray-100 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-display font-bold dark:text-zinc-200">Add Subscription</h2>
                 <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full dark:text-white transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <form onSubmit={handleAddSubscription} className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Name</label>
                    <input 
                       required
                       type="text" 
                       value={newName} 
                       onChange={e => setNewName(e.target.value)}
                       placeholder="e.g. Netflix" 
                       className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200 transition-all"
                    />
                 </div>

                 {/* Icon & Color Picker */}
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Customization</label>
                    <div className="flex gap-4 items-start">
                       {/* Color Picker */}
                       <div className="relative group">
                          <input 
                            type="color" 
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-12 h-12 p-0 border-0 rounded-full overflow-hidden cursor-pointer shadow-sm ring-2 ring-gray-100 dark:ring-zinc-700"
                          />
                       </div>

                       {/* Icon Grid (Mini) */}
                       <div className="flex-1 bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 border border-gray-200 dark:border-zinc-700 h-32 overflow-y-auto custom-scrollbar">
                          <div className="grid grid-cols-6 gap-2">
                             {Object.keys(AVAILABLE_ICONS).map(iconName => {
                                const Icon = AVAILABLE_ICONS[iconName];
                                return (
                                   <button 
                                      key={iconName}
                                      type="button"
                                      onClick={() => setNewIcon(iconName)}
                                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${newIcon === iconName ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-600'}`}
                                   >
                                      <Icon size={16} />
                                   </button>
                                )
                             })}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Price</label>
                       <input 
                          required
                          type="number" 
                          step="0.01"
                          value={newPrice} 
                          onChange={e => setNewPrice(e.target.value)}
                          placeholder="0.00" 
                          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200 transition-all"
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Cycle</label>
                       <select 
                          value={newCycle}
                          onChange={e => setNewCycle(e.target.value as BillingCycle)}
                          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold focus:border-black dark:focus:border-white focus:outline-none appearance-none dark:text-zinc-200 transition-all"
                       >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Type</label>
                    <select 
                       value={newType}
                       onChange={e => setNewType(e.target.value as SubscriptionType)}
                       className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold focus:border-black dark:focus:border-white focus:outline-none appearance-none dark:text-zinc-200 transition-all"
                    >
                       <option value="software">Software</option>
                       <option value="entertainment">Entertainment</option>
                       <option value="utility">Utility</option>
                       <option value="rent">Rent</option>
                       <option value="service">Service</option>
                       <option value="other">Other</option>
                    </select>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Link (Optional)</label>
                    <input 
                       type="url" 
                       value={newLink} 
                       onChange={e => setNewLink(e.target.value)}
                       placeholder="https://..." 
                       className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-medium text-sm focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200 transition-all"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Start Date</label>
                       <input 
                          type="date" 
                          required
                          value={newStartDate} 
                          onChange={e => setNewStartDate(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold text-sm focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200 transition-all"
                       />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">End Date (Opt)</label>
                       <input 
                          type="date" 
                          value={newEndDate} 
                          onChange={e => setNewEndDate(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold text-sm focus:border-black dark:focus:border-white focus:outline-none dark:text-zinc-200 transition-all"
                       />
                    </div>
                 </div>

                 <button 
                    type="submit" 
                    className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl mt-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
                 >
                    Save Subscription
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTracker;
