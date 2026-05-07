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
      <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase italic tracking-tighter">Communities</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Connect with specialized neighborhood groups</p>
              </div>
              <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all"
              >
                  <Plus size={16} /> <span>Create New Group</span>
              </button>
          </div>

          {/* Quick Stats Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Users size={20} /></div>
                  <div><p className="text-[10px] font-black uppercase text-gray-400">Your Groups</p><p className="text-lg font-black dark:text-white">{myGroups.length}</p></div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Compass size={20} /></div>
                  <div><p className="text-[10px] font-black uppercase text-gray-400">Discover</p><p className="text-lg font-black dark:text-white">{discoverGroups.length}</p></div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-[2rem] text-white shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"><Star size={20} /></div>
                    <div><p className="text-[10px] font-black uppercase opacity-80">Top Voted</p><p className="text-[10px] font-black">Cebu Tech Hub</p></div>
                  </div>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 sticky top-[72px] z-20 bg-[#F8FAFC]/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -mx-2 px-2">
              <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input
                      value={groupSearchQuery}
                      onChange={(e) => setGroupSearchQuery(e.target.value)}
                      placeholder="Search for hobbies, safety, or events..."
                      className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 dark:text-slate-200 shadow-sm transition-all"
                  />
              </div>
              <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
                  {['All', 'Joined', 'Hobbies', 'Safety', 'Sports', 'Food'].map(cat => (
                      <button
                          key={cat}
                          onClick={() => setActiveGroupCategory(cat)}
                          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border whitespace-nowrap button-pop ${activeGroupCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-400 hover:text-blue-600'}`}
                      >
                          {cat}
                      </button>
                  ))}
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="col-span-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-16 text-center shadow-sm animate-slide-up">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-gray-200">
                      <Users size={32} />
                    </div>
                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">No Communities Found</h3>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Try searching for something else or browse all groups</p>
                    <button onClick={() => { setActiveGroupCategory('All'); setGroupSearchQuery(''); }} className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 hover:border-blue-600 transition-all">Show All Groups</button>
                </div>
              )}
          </div>
      </div>
    </DashboardShell>
  );
}
