
import React, { useState } from 'react';
import { X, Clock, AlignLeft, Users, Settings2, Plus, Trash2, Check, CheckCircle2, Circle, Repeat, ToggleRight, ToggleLeft, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { EventType, Department, getColorForString, TaskStatus, Recurrence, ResourceItem } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  selectedDate: Date;
  departments: string[];
  eventTypes: string[];
  resourceCategories: string[];
  setDepartments: React.Dispatch<React.SetStateAction<string[]>>;
  setEventTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setResourceCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const EventModal: React.FC<EventModalProps> = ({ 
  isOpen, onClose, onSave, selectedDate, 
  departments, eventTypes, resourceCategories,
  setDepartments, setEventTypes, setResourceCategories
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>(eventTypes[0] || 'meeting');
  const [department, setDepartment] = useState<Department>(departments[0] || 'General');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [hasEndTime, setHasEndTime] = useState(true);
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Resource Links State
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState(resourceCategories[0] || 'Link');
  const [showResourceInput, setShowResourceInput] = useState(false);
  
  // Edit Mode States
  const [editingRoles, setEditingRoles] = useState(false);
  const [editingTypes, setEditingTypes] = useState(false);
  const [editingCategories, setEditingCategories] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate a small delay for "processing" feel
    await new Promise(resolve => setTimeout(resolve, 300));

    onSave({
      title,
      type,
      department,
      status,
      recurrence,
      startTime: new Date(`${selectedDate.toDateString()} ${startTime}`),
      endTime: hasEndTime ? new Date(`${selectedDate.toDateString()} ${endTime}`) : undefined,
      description,
      resources
    });
    
    setIsProcessing(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDepartment(departments[0] || 'General');
    setStatus('todo');
    setRecurrence('none');
    setEditingRoles(false);
    setEditingTypes(false);
    setNewItemName('');
    setHasEndTime(true);
    setResources([]);
    setNewLinkUrl('');
    setNewLinkTitle('');
    setShowResourceInput(false);
    setEditingCategories(false);
  };

  // CRUD Helpers
  const addItem = (
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    currentSelection: string,
    setSelection: (val: string) => void
  ) => {
    if (newItemName.trim() && !list.includes(newItemName.trim())) {
      const newVal = newItemName.trim();
      setList([...list, newVal]);
      setSelection(newVal);
      setNewItemName('');
    }
  };

  const deleteItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    currentSelection: string,
    setSelection: (val: string) => void
  ) => {
    const newList = list.filter(i => i !== item);
    setList(newList);
    if (currentSelection === item && newList.length > 0) {
      setSelection(newList[0]);
    }
  };

  const addResource = () => {
    if(!newLinkUrl.trim()) return;
    
    const newResource: ResourceItem = {
      id: Math.random().toString(36).substr(2, 9),
      url: newLinkUrl,
      title: newLinkTitle || newLinkUrl,
      type: newLinkCategory
    };
    setResources([...resources, newResource]);
    setNewLinkUrl('');
    setNewLinkTitle('');
    setShowResourceInput(false);
  };

  const removeResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const getSubmitButtonText = () => {
    const t = type.toLowerCase();
    if (t === 'reminder') return 'Set Reminder';
    if (t === 'birthday') return 'Add Birthday';
    if (t === 'meeting') return 'Schedule Meeting';
    if (t === 'task') return 'Create Task';
    
    // Dynamic fallback for user created types
    return `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800 max-h-[90vh] flex flex-col m-4">
        <div className="p-8 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 shrink-0">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">New Thing</h2>
            <p className="text-gray-500 text-sm">{selectedDate.toDateString()}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-gray-900 dark:text-white" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 space-y-6 flex-1 hide-scrollbar">
          <div className="space-y-4">
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's happening?" 
              className="w-full text-3xl font-display font-bold border-b-2 border-gray-100 dark:border-zinc-800 focus:border-black dark:focus:border-white outline-none py-2 bg-transparent transition-colors placeholder:text-gray-200 dark:placeholder:text-zinc-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Clock size={12} /> Start Time
              </label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl p-3 text-lg font-display font-medium outline-none focus:ring-2 focus:ring-black/5 dark:text-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <label className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${hasEndTime ? 'text-gray-400' : 'text-gray-300'}`}>
                   <Clock size={12} /> End Time
                 </label>
                 <button 
                   type="button" 
                   onClick={() => setHasEndTime(!hasEndTime)}
                   className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                   title={hasEndTime ? "Disable End Time" : "Enable End Time"}
                 >
                   {hasEndTime ? <ToggleRight size={20} className="text-black dark:text-white"/> : <ToggleLeft size={20}/>}
                 </button>
              </div>
              
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!hasEndTime}
                className={`w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl p-3 text-lg font-display font-medium outline-none focus:ring-2 focus:ring-black/5 dark:text-white transition-all ${!hasEndTime ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
          
          {/* Recurrence */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
               <Repeat size={12} /> Recurrence
            </label>
            <select
               value={recurrence}
               onChange={(e) => setRecurrence(e.target.value as Recurrence)}
               className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-black/5 dark:text-white transition-all"
            >
               <option value="none">Does not repeat</option>
               <option value="daily">Daily</option>
               <option value="weekly">Weekly</option>
               <option value="monthly">Monthly</option>
               <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="space-y-3">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Status</label>
             <div className="flex gap-2 p-1 bg-gray-50 dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700">
                {(['todo', 'in-progress', 'completed'] as TaskStatus[]).map(s => (
                   <button
                     key={s}
                     type="button"
                     onClick={() => setStatus(s)}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        status === s 
                          ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                     }`}
                   >
                     {s === 'completed' ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                     {s.replace('-', ' ')}
                   </button>
                ))}
             </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
               <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                 <Users size={12} /> Department
               </label>
               <button 
                 type="button" 
                 onClick={() => setEditingRoles(!editingRoles)}
                 className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${editingRoles ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
               >
                 {editingRoles ? <Check size={10} /> : <Settings2 size={10} />}
                 {editingRoles ? 'Done' : 'Manage'}
               </button>
             </div>
             
             <div className="flex flex-wrap gap-2">
               {departments.map((dept) => (
                 <div key={dept} className="relative group">
                   <button
                     type="button"
                     onClick={() => !editingRoles && setDepartment(dept)}
                     className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                       department === dept && !editingRoles
                         ? `bg-black text-white dark:bg-white dark:text-black border-black dark:border-white` 
                         : `${getColorForString(dept)} border-transparent opacity-80 hover:opacity-100`
                     } ${editingRoles ? 'pr-8 cursor-default opacity-100' : ''}`}
                   >
                     {dept}
                   </button>
                   {editingRoles && (
                     <button
                        type="button"
                        onClick={() => deleteItem(dept, departments, setDepartments, department, setDepartment)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-white/50 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                     >
                        <Trash2 size={10} />
                     </button>
                   )}
                 </div>
               ))}
               
               {editingRoles && (
                 <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 rounded-full px-2 border border-gray-200 dark:border-zinc-700">
                    <input 
                      type="text" 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New Dept..."
                      className="bg-transparent text-xs font-medium focus:outline-none w-20 py-1.5 dark:text-white"
                      onKeyDown={(e) => e.key === 'Enter' && addItem(departments, setDepartments, department, setDepartment)}
                    />
                    <button 
                       type="button" 
                       onClick={() => addItem(departments, setDepartments, department, setDepartment)}
                       className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                       <Plus size={10} />
                    </button>
                 </div>
               )}
             </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
               <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <AlignLeft size={12} /> Type
               </label>
               <button 
                 type="button" 
                 onClick={() => setEditingTypes(!editingTypes)}
                 className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${editingTypes ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}
               >
                 {editingTypes ? <Check size={10} /> : <Settings2 size={10} />}
                 {editingTypes ? 'Done' : 'Manage'}
               </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {eventTypes.map((t) => (
                <div key={t} className="relative group">
                  <button
                    type="button"
                    onClick={() => !editingTypes && setType(t)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all border ${
                      type === t && !editingTypes
                        ? 'bg-gray-100 text-black dark:bg-zinc-700 dark:text-white border-gray-300 dark:border-zinc-600 shadow-sm' 
                        : 'bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600'
                    } ${editingTypes ? 'pr-8 cursor-default' : ''}`}
                  >
                    {t}
                  </button>
                  {editingTypes && (
                     <button
                        type="button"
                        onClick={() => deleteItem(t, eventTypes, setEventTypes, type, setType)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-red-500 hover:text-white rounded-full transition-colors z-10"
                     >
                        <Trash2 size={12} />
                     </button>
                   )}
                </div>
              ))}
              
              {editingTypes && (
                 <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 rounded-full px-3 border border-gray-200 dark:border-zinc-700">
                    <input 
                      type="text" 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="New Type..."
                      className="bg-transparent text-sm font-medium focus:outline-none w-24 py-2 dark:text-white"
                      onKeyDown={(e) => e.key === 'Enter' && addItem(eventTypes, setEventTypes, type, setType)}
                    />
                    <button 
                       type="button" 
                       onClick={() => addItem(eventTypes, setEventTypes, type, setType)}
                       className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200"
                    >
                       <Plus size={12} />
                    </button>
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-2">
             <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <AlignLeft size={12} /> Details
              </label>
             <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-black/5 dark:text-white resize-none transition-all"
                placeholder="Add description..."
             />
          </div>

          {/* Resources Section */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
               <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <LinkIcon size={12} /> Project Hub
               </label>
               <button 
                 type="button" 
                 onClick={() => setShowResourceInput(!showResourceInput)}
                 className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1"
               >
                 <Plus size={10} /> Add Link
               </button>
             </div>
             
             {showResourceInput && (
               <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2 fade-in border border-gray-100 dark:border-zinc-700">
                 <input 
                    type="text" 
                    placeholder="URL (https://...)" 
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-black dark:focus:border-white transition-all dark:text-white"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                 />
                 <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Title (Optional)" 
                        className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-black dark:focus:border-white transition-all dark:text-white"
                        value={newLinkTitle}
                        onChange={e => setNewLinkTitle(e.target.value)}
                    />
                 </div>
                 
                 {/* Category Management */}
                 <div className="flex justify-between items-center gap-2">
                     {editingCategories ? (
                         <div className="flex-1 flex flex-wrap gap-1.5 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-700">
                            {resourceCategories.map(cat => (
                                <div key={cat} className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded px-1.5 py-1">
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 mr-1">{cat}</span>
                                    <button 
                                        type="button"
                                        onClick={() => deleteItem(cat, resourceCategories, setResourceCategories, newLinkCategory, setNewLinkCategory)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center gap-1">
                                <input 
                                    type="text" 
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="New..."
                                    className="w-16 text-[10px] bg-transparent outline-none border-b border-gray-200 dark:border-zinc-700 focus:border-black dark:focus:border-white dark:text-white"
                                    onKeyDown={(e) => e.key === 'Enter' && addItem(resourceCategories, setResourceCategories, newLinkCategory, setNewLinkCategory)}
                                />
                                <button type="button" onClick={() => addItem(resourceCategories, setResourceCategories, newLinkCategory, setNewLinkCategory)} className="dark:text-white">
                                    <Plus size={10} />
                                </button>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setEditingCategories(false)}
                                className="ml-auto text-[10px] font-bold text-blue-500 hover:text-blue-700"
                            >
                                Done
                            </button>
                         </div>
                     ) : (
                         <div className="flex-1 flex items-center justify-between bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Category:</span>
                                <select 
                                    value={newLinkCategory} 
                                    onChange={(e) => setNewLinkCategory(e.target.value)}
                                    className="text-xs font-bold bg-transparent outline-none appearance-none cursor-pointer hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                                >
                                    {resourceCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown size={10} className="text-gray-400 pointer-events-none" />
                             </div>
                             <button 
                                type="button" 
                                onClick={() => setEditingCategories(true)}
                                className="text-[10px] font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                             >
                                <Settings2 size={12} />
                             </button>
                         </div>
                     )}
                 </div>

                 <button 
                    type="button" 
                    onClick={addResource}
                    disabled={!newLinkUrl}
                    className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-all"
                 >
                    Attach Resource
                 </button>
               </div>
             )}

             <div className="space-y-2">
               {resources.map((res) => (
                 <div key={res.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-2.5 group hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-700 font-bold text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                          {res.type.slice(0, 2)}
                       </div>
                       <div className="flex flex-col min-w-0">
                           <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{res.title}</span>
                           <span className="text-[10px] text-gray-400 truncate">{res.type}</span>
                       </div>
                    </div>
                    <button 
                       type="button" 
                       onClick={() => removeResource(res.id)}
                       className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                    >
                       <Trash2 size={12} />
                    </button>
                 </div>
               ))}
               {resources.length === 0 && !showResourceInput && (
                 <div className="text-center py-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-900/50">
                    <span className="text-xs text-gray-400">No linked resources</span>
                 </div>
               )}
             </div>
          </div>

        </div>

        <div className="p-8 pt-0 bg-gradient-to-t from-white dark:from-zinc-900 via-white dark:via-zinc-900 to-transparent shrink-0">
          <button 
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full py-4 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-[20px] font-bold text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>{getSubmitButtonText()}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
