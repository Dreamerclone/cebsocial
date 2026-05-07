'use client';

import React, { useState, useRef } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Weather from './Weather';
import Leaderboard from './Leaderboard';
import Toast from './Toast';
import { useSocial } from '../contexts/SocialContext';
import { CEBU_ZONES } from '../lib/constants';
import { usePathname, useRouter } from 'next/navigation';
import Auth from './Auth';
import { X, ShoppingBag, MapPin, MessageSquare, Zap, Plus, Image as ImageIcon, Check, Users, ShieldCheck, Crown, MessageCircle, Globe, User, Search, Home } from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';
import { ShopModal, NeighborModal, ImageModal, EditItemModal, CreateGroupModal, MemberModal } from './Modals';

export default function DashboardShell({ children }) {
  const {
    user, groups, notifications, setNotifications, markNotificationsAsRead,
    toasts, removeToast, language, setLanguage, fetchData, trendingZone, leaderboard, loading,
    activeFilter, setActiveFilter, searchQuery, setSearchQuery, addToast,
    handleSendMessage, createGroup,
    toggleSaveItem, updateMarketItem,
    fetchGroupMembers,
    // Modal states from context
    selectedImage, setSelectedImage,
    viewingNeighbor, setViewingNeighbor,
    viewingShop, setViewingShop,
    editingItem, setEditingItem,
    isCreatingGroup, setIsCreatingGroup,
    showMemberModal, setShowMemberModal,
    currentGroupMembers, setCurrentGroupMembers,
    t
  } = useSocial();

  const { isDarkMode, toggleDarkMode } = useTheme();

  const pathname = usePathname();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category: 'General', image: '' });
  const groupFileInputRef = useRef(null);

  const activeTab = pathname === '/' ? 'Feed' :
                    pathname.startsWith('/market') ? 'Market' :
                    pathname.startsWith('/groups') ? 'Groups' :
                    pathname.startsWith('/messages') ? 'Messages' :
                    pathname.startsWith('/profile') ? 'Profile' : 'Feed';

  const handleTabChange = (tab) => {
    const route = tab === 'Feed' ? '/' : `/${tab.toLowerCase()}`;
    router.push(route);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
        const { error } = await updateMarketItem(editingItem.id, editingItem);
        if (!error) setEditingItem(null);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return addToast('Group name is required', 'error');
    setIsSubmitting(true);
    try {
        const { error } = await createGroup({
            ...newGroup,
            image: pendingImage || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=400'
        });
        if (!error) {
            setIsCreatingGroup(false);
            setNewGroup({ name: '', description: '', category: 'General', image: '' });
            setPendingImage(null);
            addToast('Group created successfully!', 'success');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const isMessagesPage = pathname.startsWith('/messages');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black italic text-2xl animate-pulse">LOADING...</div>;
  if (!user) return <Auth onAuthComplete={fetchData} />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 text-[#1E293B] dark:text-slate-200 font-sans pb-20 transition-colors duration-300">
        <div className="fixed inset-0 pointer-events-none z-[1000] flex flex-col items-center justify-end p-8 space-y-4">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                  <Toast {...toast} onClose={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>

        <Navbar
          activeTab={activeTab} setActiveTab={handleTabChange}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          userInitials={user.initials} userColor={user.color}
          notificationCount={notifications.filter(n => n.unread).length}
          notifications={notifications} setNotifications={setNotifications}
          markAsRead={markNotificationsAsRead}
          userAvatar={user.avatar} isDarkMode={isDarkMode} setIsDarkMode={toggleDarkMode}
          language={language} setLanguage={setLanguage}
        />

        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 hidden lg:block">
            <Sidebar
              user={user} activeFilter={activeFilter} setActiveFilter={setActiveFilter} zones={CEBU_ZONES}
              isEditingProfile={false} setIsEditingProfile={() => router.push('/profile')}
              joinedGroups={groups.filter(g => g.isJoined)}
              onSelectGroup={(group) => router.push(`/groups/${group.id}`)}
            />
          </div>

          <div className={`${isMessagesPage ? 'lg:col-span-9' : 'lg:col-span-6'} space-y-6 transition-all duration-500`}>
            {children}
          </div>

          {!isMessagesPage && (
            <div className="lg:col-span-3 hidden lg:block space-y-6">
                <Weather />
                <Leaderboard
                    currentUser={user}
                    data={leaderboard}
                    trendingZone={trendingZone}
                    onSelectGroup={(g) => router.push(`/groups/${g.id}`)}
                    setActiveTab={handleTabChange}
                />
            </div>
          )}
        </main>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-[100] shadow-2xl">
            {[
              { id: 'Feed', icon: <Home size={20} />, label: t.feed },
              { id: 'Market', icon: <ShoppingBag size={20} />, label: t.market },
              { id: 'Create', icon: <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200 -mt-8 border-4 border-[#F8FAFC] dark:border-slate-950 hover:scale-110 active:scale-95 transition-all"><Plus size={24} /></div>, label: '' },
              { id: 'Messages', icon: <MessageSquare size={20} />, label: t.messages },
              { id: 'Profile', icon: <User size={20} />, label: t.profile }
            ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                      if (tab.id === 'Create') {
                          if (pathname === '/') {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                              router.push('/');
                          }
                          return;
                      }
                      handleTabChange(tab.id);
                  }}
                  className={`flex flex-col items-center space-y-1 transition-all ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
                >
                    {tab.icon}
                    {tab.label && <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>}
                </button>
            ))}
        </div>

      {/* MODALS */}
      <ShopModal
        viewingShop={viewingShop}
        user={user}
        onClose={() => setViewingShop(null)}
        onMessage={(id) => { router.push(`/messages?chat=${id}`); setViewingShop(null); }}
        onSave={(id) => { toggleSaveItem(id, 'market'); addToast('Saved'); }}
        t={t}
      />

      <NeighborModal
        viewingNeighbor={viewingNeighbor}
        user={user}
        onClose={() => setViewingNeighbor(null)}
        onMessage={(id) => { handleSendMessage(id, "Hi neighbor! 👋"); router.push(`/messages?chat=${id}`); setViewingNeighbor(null); }}
        onViewProfile={(id) => { router.push(`/profile/${id}`); setViewingNeighbor(null); }}
      />

      <ImageModal
        selectedImage={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <EditItemModal
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        onSave={handleUpdateItem}
        isSubmitting={isSubmitting}
      />

      <CreateGroupModal
        isCreatingGroup={isCreatingGroup}
        setIsCreatingGroup={setIsCreatingGroup}
        newGroup={newGroup}
        setNewGroup={setNewGroup}
        onSave={handleCreateGroup}
        isSubmitting={isSubmitting}
      />

      <MemberModal
        showMemberModal={showMemberModal}
        setShowMemberModal={setShowMemberModal}
        members={currentGroupMembers}
        setViewingNeighbor={setViewingNeighbor}
      />
    </div>
  );
}
