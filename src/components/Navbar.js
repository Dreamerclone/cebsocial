'use client';

import React, { useState } from 'react';
import { Search, X, Bell, MessageSquare, Sun, Moon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar({
    activeTab, setActiveTab, searchQuery, setSearchQuery, userInitials, userColor,
    notificationCount, notifications, setNotifications, markAsRead, userAvatar,
    isDarkMode, setIsDarkMode, language, setLanguage
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  const toggleNotifs = () => {
    const nextShow = !showNotifs;
    setShowNotifs(nextShow);
    if (nextShow && notificationCount > 0) {
        markAsRead();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Trigger wiggle when notification count increases
  React.useEffect(() => {
    if (notificationCount > 0) {
      setIsWiggling(true);
      const timer = setTimeout(() => setIsWiggling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [notificationCount]);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-50 px-4 shadow-sm transition-colors">
      <div className="max-w-6xl mx-auto py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-blue-200">C</div>
        </div>

        <div className="flex-1 max-w-md mx-4 relative group">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-blue-500' : 'text-gray-400'}`} size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for neighbors, items, or news..."
            className="w-full bg-gray-100 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-10 pr-10 text-xs font-bold outline-none dark:text-slate-200 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchQuery && (
            <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
            >
                <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            {['Feed', 'Market', 'Groups', 'Messages', 'Profile'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
            className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-all"
          >
            {language === 'en' ? 'EN' : 'CEB'}
          </button>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button onClick={toggleNotifs} className={`p-2 text-gray-400 hover:text-blue-600 relative transition-all ${isWiggling ? 'animate-wiggle' : ''}`}>
                <Bell size={20} />
                {notificationCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white">{notificationCount}</span>}
            </button>

            {showNotifs && (
                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-[100]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 px-2">Notifications</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? notifications.map(n => (
                            <div key={n.id} className={`p-3 rounded-2xl text-[11px] ${n.unread ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
                                {n.text}
                                <p className="text-[9px] mt-1 opacity-50">{n.time}</p>
                            </div>
                        )) : (
                            <div className="py-8 text-center opacity-40">
                                <Bell size={24} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">No notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>

          <div className={`w-8 h-8 rounded-full ${userColor} text-white text-[10px] font-bold flex items-center justify-center overflow-hidden shadow-sm mr-2`}>
            {userAvatar ? <img src={userAvatar} alt="user" className="w-full h-full object-cover" /> : userInitials}
          </div>

          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
