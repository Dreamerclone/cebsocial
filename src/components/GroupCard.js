import React from 'react';
import { Users, UserPlus, UserCheck } from 'lucide-react';

export default function GroupCard({ group, onJoin }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-200 transition-all cursor-pointer card-hover h-full flex flex-col">
      <div className="h-32 w-full relative overflow-hidden">
        <img src={group.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={group.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute top-4 right-4 flex space-x-2">
            {group.recentActivity > 0 && (
                <div className="bg-rose-500 text-white text-[8px] font-black px-2.5 py-1 rounded-lg animate-pulse shadow-lg shadow-rose-200 dark:shadow-none uppercase tracking-widest">
                    {group.recentActivity} New
                </div>
            )}
        </div>
        <div className="absolute bottom-4 left-6 flex items-center text-white space-x-2">
            <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
                <Users size={12} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{(group.members || 0).toLocaleString()} Members</span>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                    <h4 className="font-black text-gray-900 dark:text-slate-100 text-[13px] uppercase tracking-tight italic">{group.name}</h4>
                    {group.category && <span className="text-[8px] font-black text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg uppercase">{group.category}</span>}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 font-medium line-clamp-2 leading-relaxed italic">"{group.description}"</p>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onJoin(group.id); }}
                className={`p-3 rounded-2xl transition-all button-pop shadow-sm ${group.isJoined ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-100 dark:border-green-900/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}
            >
                {group.isJoined ? <UserCheck size={20} /> : <UserPlus size={20} />}
            </button>
        </div>
      </div>
    </div>
  );
}
