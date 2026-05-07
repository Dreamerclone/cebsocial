'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Bell, MessageSquare, Sun, Moon, LogOut, User, Home, ShoppingBag, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar({
    activeTab, setActiveTab, searchQuery, setSearchQuery, userInitials, userColor,
    notificationCount, notifications, setNotifications, markAsRead, userAvatar,
    isDarkMode, setIsDarkMode, language, setLanguage, allUsers = [],
    isFullWidth = false
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const router = useRouter();
  const notifRef = useRef(null);

  const menuItems = [
    { id: 'Feed', icon: <Home size={18} />, label: 'Feed', path: '/' },
    { id: 'Market', icon: <ShoppingBag size={18} />, label: 'Market', path: '/market' },
    { id: 'Groups', icon: <Users size={18} />, label: 'Groups', path: '/groups' },
  ];

  const filteredUsers = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    return allUsers.filter(u =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, allUsers]);

  // Click outside handler for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        if (showNotifs) {
          setShowNotifs(false);
          if (notificationCount > 0) {
            markAsRead();
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifs, notificationCount, markAsRead]);

  const toggleNotifs = () => {
    const nextShow = !showNotifs;
    setShowNotifs(nextShow);
    // If we are closing it via the button, mark as read
    if (!nextShow && notificationCount > 0) {
        markAsRead();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Trigger wiggle when notification count increases
  useEffect(() => {
    if (notificationCount > 0) {
      setIsWiggling(true);
      const timer = setTimeout(() => setIsWiggling(false), 500);
      return () => clearTimeout(timer);
    }
  }, [notificationCount]);

  return (
    <nav className="surface-card border-b sticky top-0 z-50 px-4 backdrop-blur-xl transition-all duration-700">
      <div className={`${isFullWidth ? 'max-w-none' : 'max-w-7xl mx-auto'} py-3 flex justify-between items-center transition-all duration-500`}>
        <div className="flex items-center space-x-6">
          <div
            onClick={() => router.push('/')}
            className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 cursor-pointer hover:scale-105 transition-all overflow-hidden"
          >
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>

          {/* Inline Navigation for Full Width Pages */}
          {isFullWidth && (
            <div className="hidden lg:flex items-center gap-1 bg-gray-50 dark:bg-zinc-900 p-1 rounded-2xl">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-white dark:bg-zinc-800 text-primary-600 shadow-sm' : 'text-muted hover:text-main'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 max-w-lg mx-4 relative group">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-500 ${searchQuery ? 'text-primary-500' : 'text-muted'}`} size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for neighbors, items, or news..."
            className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-3 pl-12 pr-10 text-[11px] font-bold outline-none ring-1 ring-transparent focus:ring-primary-500/30 transition-all duration-500"
          />
          {searchQuery && (
            <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
            >
                <X size={14} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {filteredUsers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 surface-card border rounded-3xl shadow-2xl overflow-hidden z-[100] animate-slide-down">
              <div className="p-3 border-b border-gray-50 dark:border-zinc-800">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-muted px-2">Neighbors Found</h4>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar p-1">
                {filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      router.push(`/profile/${u.id}`);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-2xl transition-colors text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 overflow-hidden`}>
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-black uppercase">{u.initials || '??'}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[12px] font-black text-main">{u.full_name}</div>
                      <div className="text-[9px] text-muted font-bold uppercase tracking-tight">{u.neighborhood || 'Cebu Neighbor'} • {u.karma || 0} Karma</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
            className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-900 rounded-xl text-[10px] font-black uppercase text-main hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
          >
            {language === 'en' ? 'EN' : 'CEB'}
          </button>

          <button
            onClick={setIsDarkMode}
            className="relative p-2.5 text-muted hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-zinc-900 rounded-xl transition-all duration-300 group overflow-hidden"
            aria-label="Toggle Theme"
          >
            <div className={`transition-all duration-500 ${isDarkMode ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
              <Moon size={20} className="group-hover:-rotate-12 transition-transform" />
            </div>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
              <Sun size={20} className="group-hover:rotate-12 transition-transform text-yellow-500" />
            </div>
          </button>

          <div className="relative" ref={notifRef}>
            <button
                onClick={toggleNotifs}
                className={`p-2.5 text-muted hover:text-primary-500 bg-gray-50 dark:bg-zinc-900 rounded-xl relative transition-all ${isWiggling ? 'animate-wiggle' : ''}`}
            >
                <Bell size={20} />
                {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 surface-card shadow-lg shadow-red-500/20 animate-bounce">
                        {notificationCount}
                    </span>
                )}
            </button>

            {showNotifs && (
                <div className="absolute right-0 mt-4 w-72 surface-card border rounded-[2rem] shadow-2xl p-4 z-[100] animate-slide-down">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 px-2">Notifications</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? notifications.map(n => (
                            <div key={n.id} className={`p-4 rounded-2xl text-[11px] transition-all ${n.unread ? 'bg-primary-50 dark:bg-primary-900/10 text-main font-black' : 'bg-gray-50 dark:bg-zinc-900 text-muted'}`}>
                                {n.text}
                                <p className="text-[9px] mt-2 opacity-60 font-bold uppercase tracking-tighter">{n.time}</p>
                            </div>
                        )) : (
                            <div className="py-12 text-center opacity-40">
                                <Bell size={32} className="mx-auto mb-3 text-muted" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted">All caught up!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>

          <div className={`w-9 h-9 rounded-2xl ${userColor} text-white text-[11px] font-black flex items-center justify-center overflow-hidden shadow-lg shadow-primary-500/10`}>
            {userAvatar ? <img src={userAvatar} alt="user" className="w-full h-full object-cover" /> : userInitials}
          </div>

          <button onClick={handleLogout} className="p-2.5 text-muted hover:text-red-500 bg-gray-50 dark:bg-zinc-900 rounded-xl transition-all" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
