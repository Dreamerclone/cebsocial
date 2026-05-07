import React from 'react';
import { Users, UserPlus, UserCheck } from 'lucide-react';

export default function GroupCard({ group, onJoin }) {
  return (
    <div className="surface-card rounded-[2.5rem] border shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col bg-white dark:bg-zinc-900">
      <div className="h-44 w-full relative overflow-hidden">
        <img src={group.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={group.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/20 to-transparent"></div>

        <div className="absolute top-4 left-4">
            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                {group.category || 'General'}
            </span>
        </div>

        <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex-1">
                <h4 className="text-xl font-black text-white italic uppercase tracking-tighter leading-tight line-clamp-2">{group.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full border-2 border-zinc-900 bg-blue-500 flex items-center justify-center text-[7px] font-black text-white">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-wider">{ (group.members || 0).toLocaleString() } Joined</span>
                </div>
            </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <p className="text-xs text-muted font-medium leading-relaxed line-clamp-3 mb-6 opacity-80">
            {group.description}
        </p>

        <div className="flex items-center gap-3">
            <button
                onClick={(e) => { e.stopPropagation(); onJoin(group.id); }}
                className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${group.isJoined ? 'bg-gray-100 dark:bg-zinc-800 text-muted hover:text-red-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5'}`}
            >
                {group.isJoined ? 'Leave Circle' : 'Join Community'}
            </button>
            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl text-muted group-hover:text-blue-600 transition-colors">
                <Users size={18} />
            </div>
        </div>
      </div>
    </div>
  );
}
