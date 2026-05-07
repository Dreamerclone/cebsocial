'use client';

import React, { useState, useMemo } from 'react';
import { Edit3, Check, Star, MapPin, Award, ShieldCheck, Zap, Home, ShoppingBag, Users, MessageSquare, User, LogOut } from 'lucide-react';
import { getReputationBadge } from '../lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Sidebar({
  user,
  activeFilter,
  setActiveFilter,
  zones,
  setIsEditingProfile,
  joinedGroups = [],
  onSelectGroup
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { id: 'Feed', icon: <Home size={16} />, label: 'Home Feed', path: '/' },
    { id: 'Market', icon: <ShoppingBag size={16} />, label: 'Marketplace', path: '/market' },
    { id: 'Groups', icon: <Users size={16} />, label: 'Groups', path: '/groups' },
    { id: 'Messages', icon: <MessageSquare size={16} />, label: 'Messages', path: '/messages' },
    { id: 'Profile', icon: <User size={16} />, label: 'My Profile', path: '/profile' },
  ];

  // --- REPUTATION BADGES LOGIC ---
  const badge = useMemo(() => {
      if (!user) return null;
      const b = getReputationBadge(user.karma);
      const iconMap = {
          'Community Leader': <ShieldCheck size={12}/>,
          'Local Helper': <Award size={12}/>,
          'Trusted Citizen': <Star size={12}/>,
          'New Neighbor': <MapPin size={12}/>
      };
      return { ...b, icon: iconMap[b.label] };
  }, [user?.karma]);

  return (
    <div className="space-y-6">
      <div className="surface-card p-6 rounded-[2.5rem] border shadow-sm transition-all duration-700">
        <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 px-2">Menu</h3>
        <div className="space-y-1">
          {menuItems.map(item => {
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all button-pop group ${isActive ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-muted hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-primary-600'}`}
              >
                <span className={`${isActive ? 'text-white' : 'text-primary-600'}`}>{item.icon}</span>
                <span className="uppercase text-[10px] tracking-widest font-black">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="surface-card rounded-[2.5rem] border shadow-sm relative overflow-hidden group transition-all duration-700">
        {/* Cover Photo */}
        <div className="h-24 w-full relative overflow-hidden bg-gray-100 dark:bg-zinc-800">
            {user.coverPhoto ? (
                <img src={user.coverPhoto} alt="cover" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-zinc-800 dark:to-zinc-900"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex justify-between items-end -mt-8 mb-4">
            <div className={`w-16 h-16 rounded-3xl bg-primary-600 border-4 surface-card flex items-center justify-center text-white font-black text-2xl shadow-xl overflow-hidden`}>
                {user.avatar ? <img src={user.avatar} alt="user" className="w-full h-full object-cover" /> : user.initials}
            </div>
            <button
                onClick={() => setIsEditingProfile(true)}
                className="p-2 surface-card hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm border"
            >
                <Edit3 size={16} className="text-muted" />
            </button>
          </div>

          <div>
            <h2 className="font-black text-main text-lg tracking-tight">{user.name}</h2>
            {user.bio && (
                <p className="text-xs text-muted mt-1 line-clamp-2 italic font-medium leading-snug">
                    "{user.bio}"
                </p>
            )}

            <div className="flex flex-wrap items-center mt-3 gap-2">
              <div className="flex items-center text-[10px] font-black text-main uppercase tracking-widest bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                  <Zap size={10} className="mr-1 fill-current" /> {user.karma}
              </div>

              {badge && (
                  <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-primary-600 text-white`}>
                      <span className="mr-1">{badge.icon}</span>
                      {badge.label}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card p-6 rounded-[2.5rem] border shadow-sm transition-all duration-700">
        <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 px-2">Your Communities</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
          {joinedGroups.length > 0 ? joinedGroups.map(group => (
            <button
              key={group.id}
              onClick={() => onSelectGroup && onSelectGroup(group)}
              className="w-full flex items-center space-x-3 p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all group button-pop"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                <img src={group.image} className="w-full h-full object-cover" alt={group.name} />
              </div>
              <div className="text-left overflow-hidden">
                <p className="font-black text-[10px] text-main uppercase truncate">{group.name}</p>
                <p className="text-[8px] text-muted font-bold uppercase tracking-tighter">Active community</p>
              </div>
            </button>
          )) : (
            <div className="py-4 text-center">
                <p className="text-[8px] font-black text-muted uppercase italic">No joined groups yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="surface-card p-6 rounded-[2.5rem] border shadow-sm transition-all duration-700">
        <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 px-2">Local Zones</h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
          {['All City', ...zones].map(z => (
            <button
              key={z}
              onClick={() => setActiveFilter(z)}
              className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition-all button-pop ${activeFilter === z ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-muted hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
            >
              {z === 'All City' ? '🌍 ' + z : '# ' + z}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
