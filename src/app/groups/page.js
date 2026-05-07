'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, Users, Compass, Star, ChevronRight } from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import GroupCard from '../../components/GroupCard';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../components/DashboardShell';

export default function GroupsPage() {
  const {
    groups, handleJoinGroup, handleLeaveGroup, addToast,
    setIsCreatingGroup
  } = useSocial();

  const router = useRouter();
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [activeGroupCategory, setActiveGroupCategory] = useState('All');

  const myGroups = useMemo(() => groups.filter(g => g.isJoined), [groups]);
  const discoverGroups = useMemo(() => groups.filter(g => !g.isJoined), [groups]);

  const filteredGroups = useMemo(() => {
    const list = activeGroupCategory === 'Joined' ? myGroups :
                 activeGroupCategory === 'All' ? groups :
                 groups.filter(g => g.category === activeGroupCategory);

    return list.filter(g =>
        g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(groupSearchQuery.toLowerCase())
      );
  }, [groups, myGroups, activeGroupCategory, groupSearchQuery]);

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
        {/* Community Discovery Hero */}
        <div className="relative rounded-[3rem] overflow-hidden bg-blue-600 p-8 md:p-16 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                <Users size={400} className="absolute -right-20 -bottom-20" />
            </div>

            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full mb-6">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{groups.length} Active Communities</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
                    Find Your <span className="text-blue-200">Circle.</span>
                </h1>
                <p className="text-sm md:text-base font-medium opacity-90 max-w-lg mb-8 leading-relaxed">
                    Connect with neighbors who share your passions, from tech enthusiasts to local sports teams.
                </p>

                <div className="flex flex-wrap gap-4">
                    <button onClick={() => setIsCreatingGroup(true)} className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                        Create New Group
                    </button>
                    <div className="relative flex-1 max-w-md hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" size={20} />
                        <input
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                            placeholder="Search interests..."
                            className="w-full bg-blue-500/50 backdrop-blur-md border border-blue-400/30 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-blue-200 outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Your Groups Section - Sleek Slider */}
        {myGroups.length > 0 && (
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-main uppercase italic tracking-tighter">Your Circles</h2>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{myGroups.length} Joined</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {myGroups.slice(0, 5).map(group => (
                        <div key={group.id} onClick={() => router.push(`/groups/${group.id}`)} className="group cursor-pointer">
                            <div className="aspect-square rounded-[2rem] overflow-hidden relative mb-3 border shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
                                <img src={group.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-[10px] font-black text-white uppercase truncate">{group.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {myGroups.length > 5 && (
                        <button onClick={() => setActiveGroupCategory('Joined')} className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-muted hover:text-blue-600 hover:border-blue-600 transition-all group">
                            <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest mt-2">View All</span>
                        </button>
                    )}
                </div>
            </div>
        )}

        {/* Explore Hub */}
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t pt-12">
                <div>
                    <h2 className="text-2xl font-black text-main uppercase italic tracking-tighter">Explore Communities</h2>
                    <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mt-1">Discover what's happening in Cebu</p>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Hobbies', 'Safety', 'Sports', 'Food', 'Tech'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveGroupCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeGroupCategory === cat ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl' : 'bg-gray-50 dark:bg-zinc-900 text-muted hover:text-main'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredGroups.length > 0 ? filteredGroups.map(group => (
                    <div key={group.id} onClick={() => router.push(`/groups/${group.id}`)} className="cursor-pointer">
                        <GroupCard
                            group={group}
                            onJoin={(id) => {
                                if (group.isJoined) {
                                    handleLeaveGroup(id);
                                    addToast('Left group');
                                } else {
                                    handleJoinGroup(id);
                                    addToast('Joined group!');
                                }
                            }}
                        />
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center opacity-30">
                        <Users size={64} className="mx-auto mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest">No groups found matching your search</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </DashboardShell>
  );
}
