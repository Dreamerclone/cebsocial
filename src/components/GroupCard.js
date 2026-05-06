import React from 'react';
import { Users, UserPlus, UserCheck } from 'lucide-react';

export default function GroupCard({ group, onJoin }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-200 transition-all cursor-pointer">
      <div className="h-24 w-full relative">
        <img src={group.image} className="w-full h-full object-cover" alt={group.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-6 flex items-center text-white space-x-2">
            <Users size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{group.members.toLocaleString()} Members</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-black text-gray-900 dark:text-slate-100 text-sm tracking-tight">{group.name}</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-medium">{group.description}</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onJoin(group.id); }}
                className={`p-2 rounded-xl transition-all ${group.isJoined ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}
            >
                {group.isJoined ? <UserCheck size={18} /> : <UserPlus size={18} />}
            </button>
        </div>
      </div>
    </div>
  );
}
