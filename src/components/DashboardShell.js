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
    fetchGroupMembers, allUsers,
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
  const isProfilePage = pathname.startsWith('/profile');
  const isGroupsPage = pathname.startsWith('/groups');
  const isMarketPage = pathname.startsWith('/market');
  const isWidePage = isMessagesPage || isProfilePage || isGroupsPage || isMarketPage;

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-black dark:text-white transition-colors duration-500">
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-4 overflow-hidden">
      <img src="/logo.png" alt="Loading..." className="w-full h-full object-cover" />
    </div>
    <div className="font-black italic text-xl animate-pulse tracking-widest uppercase">CebSocial</div>
  </div>;
  if (!user) return <Auth onAuthComplete={fetchData} />;

  return (
    <div className={`min-h-screen surface-main text-main font-sans transition-all duration-700 ease-in-out ${isMessagesPage ? 'pb-0' : 'pb-20 lg:pb-0'}`}>
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
          allUsers={allUsers}
          isFullWidth={isMessagesPage}
        />

        <main className={`${isMessagesPage ? 'max-w-none px-0 py-0' : 'max-w-7xl mx-auto px-4 py-8'} grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-500`}>
          <div className={`${isMessagesPage ? 'hidden' : 'lg:col-span-3 hidden lg:block'}`}>
            <div className="sticky top-28 space-y-6">
              <Sidebar
                user={user} activeFilter={activeFilter} setActiveFilter={setActiveFilter} zones={CEBU_ZONES}
                isEditingProfile={false} setIsEditingProfile={() => router.push('/profile')}
                joinedGroups={groups.filter(g => g.isJoined)}
                onSelectGroup={(group) => router.push(`/groups/${group.id}`)}
              />
            </div>
          </div>

          <div className={`${isMessagesPage ? 'lg:col-span-12' : (isWidePage ? 'lg:col-span-9' : 'lg:col-span-6')} ${isMessagesPage ? '' : 'space-y-6'} transition-all duration-500`}>
            {children}
          </div>

          {!isWidePage && (
            <div className="lg:col-span-3 hidden lg:block">
                <div className="sticky top-28 space-y-6">
                    <Weather />
                    <Leaderboard
                        currentUser={user}
                        data={leaderboard}
                        trendingZone={trendingZone}
                        onSelectGroup={(g) => router.push(`/groups/${g.id}`)}
                        setActiveTab={handleTabChange}
                    />
                </div>
            </div>
          )}
        </main>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t surface-card px-6 py-3 flex justify-between items-center z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-none">
            {[
              { id: 'Feed', icon: <Home size={20} />, label: t.feed },
              { id: 'Market', icon: <ShoppingBag size={20} />, label: t.market },
              { id: 'Create', icon: <div className="bg-primary-600 text-white p-3 rounded-2xl shadow-xl shadow-primary-500/20 -mt-8 border-4 surface-card hover:scale-110 active:scale-95 transition-all duration-300"><Plus size={24} /></div>, label: '' },
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
                  className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === tab.id ? 'text-primary-600 scale-110 font-black' : 'text-muted'}`}
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
