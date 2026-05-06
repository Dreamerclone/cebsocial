'use client';

import React, { useState } from 'react';
import { Edit3, Check, Star, MapPin, Award, ShieldCheck, Zap } from 'lucide-react';

export default function Sidebar({
  user,
  activeFilter,
  setActiveFilter,
  zones,
  setIsEditingProfile
}) {
  // --- REPUTATION BADGES LOGIC ---
  const getBadge = () => {
      if (user.karma >= 500) return { label: 'Community Leader', icon: <ShieldCheck size={12}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' };
      if (user.karma >= 200) return { label: 'Local Helper', icon: <Award size={12}/>, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' };
      if (user.karma >= 100) return { label: 'Trusted Citizen', icon: <Star size={12}/>, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' };
      return null;
  };

  const badge = getBadge();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
        {/* Cover Photo */}
        <div className="h-24 w-full relative overflow-hidden bg-gray-100 dark:bg-slate-800">
            {user.coverPhoto ? (
                <img src={user.coverPhoto} alt="cover" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-8 mb-4">
            <div className={`w-16 h-16 rounded-3xl ${user.color || 'bg-blue-600'} border-4 border-white dark:border-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-100 overflow-hidden`}>
                {user.avatar ? <img src={user.avatar} alt="user" className="w-full h-full object-cover" /> : user.initials}
            </div>
            <button
                onClick={() => setIsEditingProfile(true)}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-slate-700"
            >
                <Edit3 size={16} className="text-gray-300" />
            </button>
          </div>

          <div>
            <h2 className="font-black text-gray-900 dark:text-slate-100 text-lg tracking-tight">{user.name}</h2>
            {user.bio && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2 italic font-medium leading-snug">
                    "{user.bio}"
                </p>
            )}

            <div className="flex flex-wrap items-center mt-3 gap-2">
              <div className="flex items-center text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                  <Zap size={10} className="mr-1 fill-current" /> {user.karma}
              </div>

              {badge && (
                  <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${badge.color}`}>
                      <span className="mr-1">{badge.icon}</span>
                      {badge.label}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Local Zones</h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
          {['All City', ...zones].map(z => (
            <button
              key={z}
              onClick={() => setActiveFilter(z)}
              className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeFilter === z ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
            >
              {z === 'All City' ? '🌍 ' + z : '# ' + z}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
