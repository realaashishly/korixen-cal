import React, { useState } from 'react';
import { X, Users, Check } from 'lucide-react';
import { Department, getColorForString } from '../types';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (name: string, role: Department) => void;
  departments: string[];
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, onInvite, departments }) => {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Department>(departments[0] || 'General');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onInvite(name, selectedRole);
      setName('');
      setSelectedRole(departments[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-gray-900">Invite Team Member</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-lg font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
               Assign Role <span className="normal-case font-normal text-gray-400">(Restricts their view)</span>
            </label>
            <div className="flex flex-wrap gap-2">
               {departments.map((dept) => (
                 <button
                   key={dept}
                   type="button"
                   onClick={() => setSelectedRole(dept)}
                   className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${
                     selectedRole === dept 
                       ? `bg-black text-white border-black shadow-md scale-105` 
                       : `${getColorForString(dept)} border-transparent opacity-60 hover:opacity-100`
                   }`}
                 >
                   {selectedRole === dept && <Check size={10} />}
                   {dept}
                 </button>
               ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-[18px] font-bold text-base transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            <Users size={18} /> Send Invitation
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;