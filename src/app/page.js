'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Globe, X, ShoppingBag, ShieldCheck, ArrowLeft, Search, MapPin, Bookmark, MessageSquare, User } from 'lucide-react';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Composer from '../components/Composer';
import PostCard from '../components/PostCard';
import MarketCard from '../components/MarketCard';
import Messages from '../components/Messages';
import GroupCard from '../components/GroupCard';
import Profile from '../components/Profile';
import Weather from '../components/Weather';
import Leaderboard from '../components/Leaderboard';
import Toast from '../components/Toast';
import Skeleton from '../components/Skeleton';
import Auth from '../components/Auth';

import { useSocial } from '../contexts/SocialContext';
import { CEBU_ZONES } from '../lib/constants';

export default function Home() {
  const {
    user, setUser, posts, marketItems, groups, dbStatus, loading,
    leaderboard,
    createPost, createMarketItem, fetchData, handleDeletePost,
    handleLike, handleAddComment, handleMarkSold, handleVote, handleJoinEvent,
    toggleSaveItem, handleSendMessage, markNotificationsAsRead,
    handleJoinGroup, handleLeaveGroup, handleReport, handleDeleteMarketItem,
    calculateDistance, toasts, removeToast, addToast,
    notifications, setNotifications, chats, trendingZone,
    language, setLanguage, t
  } = useSocial();

  const [activeTab, setActiveTab] = useState('Feed');
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewingNeighbor, setViewingNeighbor] = useState(null);
  const composerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cebsocial_theme') === 'dark';
    }
    return false;
  });

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('cebsocial_theme', nextMode ? 'dark' : 'white');
  };

  const [activeFilter, setActiveFilter] = useState('All City');
  const [activeFeedCategory, setActiveFeedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketCategory, setMarketCategory] = useState('All');
  const [priceSort, setPriceSort] = useState('Newest');
  const [feedCategory, setFeedCategory] = useState('General');

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedZone, setSelectedZone] = useState('Lahug');
  const [activeChat, setActiveChat] = useState(null);
  const [viewingShop, setViewingShop] = useState(null);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPostContent, setNewPostContent] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [postType, setPostType] = useState('Normal');
  const [newItem, setNewItem] = useState({ title: '', price: '', category: 'General', condition: 'New', description: '' });
  const [pendingImage, setPendingImage] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const zones = CEBU_ZONES;

  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => !p.groupId)
      .filter(p => (activeFilter === 'All City' || p.location === activeFilter))
      .filter(p => {
        if (activeFeedCategory === 'All') return true;
        if (activeFeedCategory === 'Alerts') return p.type === 'Alert';
        return p.category === activeFeedCategory;
      })
      .filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [posts, activeFilter, activeFeedCategory, searchQuery]);

  const filteredMarketItems = useMemo(() => {
    return marketItems
      .filter(i => (activeFilter === 'All City' || i.location === activeFilter))
      .filter(i => (marketCategory === 'All' || i.category === marketCategory))
      .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (priceSort === 'Low-High') {
            const getVal = (s) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
            return getVal(a.price) - getVal(b.price);
        }
        if (priceSort === 'High-Low') {
            const getVal = (s) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
            return getVal(b.price) - getVal(a.price);
        }
        return 0;
      });
  }, [marketItems, activeFilter, marketCategory, searchQuery, priceSort]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => setIsLoading(false), 600);
  };

  const handleMainPost = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (activeTab === 'Feed') {
          if (!newPostContent.trim()) return addToast('Post cannot be empty', 'error');
          const { error } = await createPost({
              content: newPostContent,
              location: selectedZone,
              category: feedCategory,
              type: postType,
              image: pendingImage,
              eventDate: eventDate,
              pollOptions: pollOptions
          });
          if (error) return addToast('Failed to post: ' + error.message, 'error');
          setNewPostContent(''); setPostType('Normal');
          addToast('Post published successfully!');
      } else {
          if (!newItem.title.trim()) return addToast('Title is required', 'error');
          const { error } = await createMarketItem({
              ...newItem,
              location: selectedZone,
              image: pendingImage
          });
          if (error) return addToast('Failed to list: ' + error.message, 'error');
          setNewItem({ title: '', price: '', category: 'General', condition: 'New', description: '' });
          addToast('Item listed in marketplace!');
      }
      setPendingImage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black italic">LOADING CEBSOCIAL...</div>;
  if (!user) return <Auth onAuthComplete={fetchData} />;

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-[#1E293B] dark:text-slate-200 font-sans pb-20 transition-colors duration-300">

      {/* Toast Overlay */}
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

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 hidden lg:block">
          <Sidebar
            user={user} activeFilter={activeFilter} setActiveFilter={setActiveFilter} zones={zones}
            isEditingProfile={false} setIsEditingProfile={() => setActiveTab('Profile')}
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          {activeTab === 'Messages' && (
            <Messages
                chats={chats}
                activeChat={activeChat}
                onSendMessage={handleSendMessage}
                onSelectChat={setActiveChat}
            />
          )}

          {activeTab === 'Profile' && (
            <Profile
                user={user}
                setUser={setUser}
                userPosts={posts.filter(p => p.user_id === user.id)}
                userItems={marketItems.filter(i => i.user_id === user.id)}
                handleLike={handleLike}
                onDeletePost={handleDeletePost}
                onMarkSold={handleMarkSold}
                toggleSaveItem={toggleSaveItem}
                addToast={addToast}
                onImageClick={setSelectedImage}
                onViewProfile={setViewingNeighbor}
            />
          )}

          {activeTab !== 'Messages' && activeTab !== 'Profile' && (
            <>
              {activeTab !== 'Saved' && activeTab !== 'Groups' && (
                <div ref={composerRef}>
                    <Composer
                        activeTab={activeTab} user={user}
                        newPostContent={newPostContent} setNewPostContent={setNewPostContent}
                        postType={postType} setPostType={setPostType}
                        newItem={newItem} setNewItem={setNewItem}
                        selectedZone={selectedZone} setSelectedZone={setSelectedZone}
                        handleMainPost={handleMainPost} zones={zones}
                        marketCategories={['Food', 'Tech', 'Free', 'General']}
                        pendingImage={pendingImage} setPendingImage={setPendingImage}
                        feedCategory={feedCategory} setFeedCategory={setFeedCategory}
                        eventDate={eventDate} setEventDate={setEventDate}
                        pollOptions={pollOptions} setPollOptions={setPollOptions}
                        isSubmitting={isSubmitting}
                    />
                </div>
              )}

              <div className="flex justify-between items-center mb-6 px-2">
                 <div className="flex flex-col">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                        <Globe size={14} className="mr-2 text-blue-500" />
                        {searchQuery ? `Searching: "${searchQuery}"` : `${activeTab} View • ${activeFilter}`}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 px-1">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dbStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">DB Status: {dbStatus}</span>
                    </div>
                 </div>
                 {activeTab === 'Feed' && (
                     <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-3 border border-gray-100 dark:border-slate-800 shadow-sm">
                        <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest">Latest Updates</span>
                     </div>
                 )}
              </div>

              {activeTab === 'Feed' && (
                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                    {['All', 'Alerts', 'News', 'Question', 'Lost & Found', 'General'].map(cat => (
                        <button key={cat} onClick={() => setActiveFeedCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeFeedCategory === cat ? (cat === 'Alerts' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100' : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100') : 'bg-white dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-800'}`}>{cat}</button>
                    ))}
                </div>
              )}

              {activeTab === 'Market' && (
                <div className="flex items-center justify-between pb-2 overflow-x-auto no-scrollbar gap-4">
                    <div className="flex space-x-2">
                        {['All', 'Food', 'Tech', 'Free', 'General'].map(cat => (
                            <button key={cat} onClick={() => setMarketCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${marketCategory === cat ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-100' : 'bg-white dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-800'}`}>{cat}</button>
                        ))}
                    </div>
                    <select
                        value={priceSort}
                        onChange={(e) => setPriceSort(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none text-gray-500"
                    >
                        <option>Newest</option>
                        <option>Low-High</option>
                        <option>High-Low</option>
                    </select>
                </div>
              )}

              <div className="space-y-4">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} type={activeTab === 'Market' ? 'market' : 'post'} />)
                ) : (
                <>
                {activeTab === 'Feed' && (
                    filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <PostCard
                              key={post.id} post={post} user={user}
                              handleLike={handleLike}
                              toggleSave={(id) => {
                                toggleSaveItem(id, 'post');
                                addToast(post.isSaved ? 'Removed from saved' : 'Post saved to your profile!');
                              }}
                              handleAddComment={handleAddComment}
                              commentInput={commentInputs[post.id] || ''}
                              setCommentInput={(val) => setCommentInputs({...commentInputs, [post.id]: val})}
                              onDelete={handleDeletePost}
                              onShare={() => {
                                  const url = typeof window !== 'undefined' ? window.location.origin : '';
                                  navigator.clipboard.writeText(`${url}/post/${post.id}`);
                                  addToast('Post link copied to clipboard!', 'success');
                              }}
                              onJoinEvent={handleJoinEvent}
                              onVote={handleVote}
                              onReport={() => addToast('Reported to community moderators', 'info')}
                              onSetReminder={() => addToast('Reminder set!')}
                              distance={calculateDistance(post.coords)}
                              onImageClick={setSelectedImage}
                              onViewProfile={setViewingNeighbor}
                            />
                        ))
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-12 text-center shadow-sm">
                            <Search size={40} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">{t.no_posts}</h3>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                {searchQuery ? `No results for "${searchQuery}" in ${activeFilter}.` : t.be_first}
                            </p>
                            <button
                                onClick={() => composerRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100"
                            >
                                {t.create_post}
                            </button>
                        </div>
                    )
                )}

                {activeTab === 'Market' && (
                    filteredMarketItems.length > 0 ? (
                        filteredMarketItems.map(item => (
                            <MarketCard
                              key={item.id} item={item} currentUser={user}
                              toggleSave={(id) => {
                                toggleSaveItem(id, 'market');
                                addToast(item.isSaved ? 'Removed from saved' : 'Item saved to your profile!');
                              }}
                              onMessage={() => {
                                setActiveChat(item.id); // Temporary: using item.id as chat session
                                setActiveTab('Messages');
                                addToast('Opening chat with seller...');
                              }}
                              onViewShop={() => setViewingShop(item)}
                              onShare={() => {
                                  const url = typeof window !== 'undefined' ? window.location.origin : '';
                                  navigator.clipboard.writeText(`${url}/item/${item.id}`);
                                  addToast('Market link copied to clipboard!', 'success');
                              }}
                              onReport={(id) => { handleReport(id, 'market'); addToast('Listing reported', 'info'); }}
                              onMarkSold={handleMarkSold}
                              distance={calculateDistance(item.coords)}
                              onImageClick={setSelectedImage}
                              onViewProfile={setViewingNeighbor}
                            />
                        ))
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-12 text-center shadow-sm">
                            <ShoppingBag size={40} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">{t.no_posts}</h3>
                            <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                {searchQuery ? `No items matching "${searchQuery}" in ${activeFilter}.` : t.be_first}
                            </p>
                        </div>
                    )
                )}

                {activeTab === 'Saved' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {posts.filter(p => p.isSaved).map(post => (
                                <PostCard
                                    key={post.id} post={post} user={user}
                                    handleLike={handleLike}
                                    toggleSave={() => toggleSaveItem(post.id, 'post')}
                                    handleAddComment={handleAddComment}
                                    commentInput={commentInputs[post.id] || ''}
                                    setCommentInput={(val) => setCommentInputs({...commentInputs, [post.id]: val})}
                                    onDelete={handleDeletePost}
                                    onShare={() => addToast('Post link copied!')}
                                    onJoinEvent={handleJoinEvent}
                                    onVote={handleVote}
                                    onReport={() => addToast('Reported', 'info')}
                                    onSetReminder={() => addToast('Reminder set!')}
                                    onImageClick={setSelectedImage}
                                    onViewProfile={setViewingNeighbor}
                                />
                            ))}
                            {marketItems.filter(i => i.isSaved).map(item => (
                                <MarketCard
                                    key={item.id} item={item} currentUser={user}
                                    toggleSave={() => toggleSaveItem(item.id, 'market')}
                                    onMessage={() => setActiveTab('Messages')}
                                    onViewShop={() => setViewingShop(item)}
                                    onReport={() => addToast('Reported', 'info')}
                                    onMarkSold={handleMarkSold}
                                    onImageClick={setSelectedImage}
                                    onViewProfile={setViewingNeighbor}
                                />
                            ))}
                            {posts.filter(p => p.isSaved).length === 0 && marketItems.filter(i => i.isSaved).length === 0 && (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-12 text-center shadow-sm">
                                    <Bookmark size={40} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Nothing Saved</h3>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Bookmark posts or items to see them here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Groups' && !selectedGroup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groups.map(group => (
                            <div key={group.id} onClick={() => setSelectedGroup(group)} className="cursor-pointer transition-transform hover:scale-[1.02]">
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
                        ))}
                    </div>
                )}

                {activeTab === 'Groups' && selectedGroup && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setSelectedGroup(null)}
                            className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400 hover:text-blue-600 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800"
                        >
                            <ArrowLeft size={14} /> <span>Back to Groups</span>
                        </button>

                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                            <div className="flex items-center space-x-6">
                                <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl">
                                    <img src={selectedGroup.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase italic tracking-tighter">{selectedGroup.name}</h2>
                                    <p className="text-xs text-gray-500 font-medium mt-1">{selectedGroup.members} Neighbors • {selectedGroup.description}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (selectedGroup.isJoined) {
                                            handleLeaveGroup(selectedGroup.id);
                                            addToast('Left group');
                                        } else {
                                            handleJoinGroup(selectedGroup.id);
                                            addToast('Joined group!');
                                        }
                                    }}
                                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${selectedGroup.isJoined ? 'bg-gray-100 text-gray-600' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}
                                >
                                    {selectedGroup.isJoined ? 'Leave Group' : 'Join Group'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {posts.filter(p => p.groupId === selectedGroup.id).length > 0 ? (
                                posts.filter(p => p.groupId === selectedGroup.id).map(post => (
                                    <PostCard
                                        key={post.id} post={post} user={user}
                                        handleLike={handleLike} toggleSave={() => toggleSaveItem(post.id, 'post')}
                                        onImageClick={setSelectedImage}
                                        onViewProfile={setViewingNeighbor}
                                    />
                                ))
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-gray-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No group posts yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-3 hidden lg:block space-y-6">
            <Weather />
            <Leaderboard currentUser={user} data={leaderboard} trendingZone={trendingZone} />
        </div>
      </main>

      {/* MARKET DETAIL MODAL */}
      {viewingShop && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-slide-down flex flex-col md:flex-row">
                  {/* Left: Product Image */}
                  <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 dark:bg-slate-800 relative">
                      {viewingShop.image ? (
                          <img src={viewingShop.image} className="w-full h-full object-cover" alt={viewingShop.title} />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ShoppingBag size={64} />
                          </div>
                      )}
                      <button
                        onClick={() => setViewingShop(null)}
                        className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all md:hidden"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  {/* Right: Info */}
                  <div className="w-full md:w-1/2 p-8 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                                  {viewingShop.category}
                              </span>
                              <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-3 leading-tight uppercase italic">{viewingShop.title}</h3>
                              <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-2 italic">{viewingShop.price}</p>
                          </div>
                          <button
                            onClick={() => setViewingShop(null)}
                            className="hidden md:block p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-all"
                          >
                              <X size={24} />
                          </button>
                      </div>

                      <div className="space-y-4 flex-1">
                          <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                              <p className="text-[9px] font-black uppercase text-gray-400 mb-1">Description</p>
                              <p className="text-xs text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
                                  {viewingShop.description || 'No description provided by the seller.'}
                              </p>
                          </div>

                          <div className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-slate-800 rounded-3xl">
                              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black overflow-hidden shadow-lg">
                                  {viewingShop.seller?.avatar_url ? (
                                      <img src={viewingShop.seller.avatar_url} className="w-full h-full object-cover" />
                                  ) : (
                                      viewingShop.author?.[0] || '?'
                                  )}
                              </div>
                              <div>
                                  <h4 className="text-sm font-black text-gray-900 dark:text-slate-100 uppercase">{viewingShop.author}</h4>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                      <MapPin size={10} className="mr-1" /> {viewingShop.location}
                                  </p>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-8">
                          <button
                            onClick={() => {
                                addToast('Chat opening...');
                                setActiveTab('Messages');
                                setViewingShop(null);
                            }}
                            className="bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                          >
                              Message Seller
                          </button>
                          <button
                            onClick={() => {
                                toggleSaveItem(viewingShop.id, 'market');
                                addToast(viewingShop.isSaved ? 'Removed from saved' : 'Item saved to your profile!');
                            }}
                            className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${viewingShop.isSaved ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200'}`}
                          >
                              {viewingShop.isSaved ? 'Saved to Profile' : 'Save for Later'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* NEIGHBOR PROFILE MODAL */}
      {viewingNeighbor && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-slide-down border border-gray-100 dark:border-slate-800">
                  <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                      <button onClick={() => setViewingNeighbor(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="px-8 pb-8 text-center -mt-12">
                      <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 p-2 mx-auto shadow-xl">
                          <div className="w-full h-full rounded-[1.5rem] bg-blue-600 overflow-hidden flex items-center justify-center text-white font-black text-2xl">
                              {viewingNeighbor.avatar_url ? <img src={viewingNeighbor.avatar_url} className="w-full h-full object-cover" /> : viewingNeighbor.full_name?.[0]}
                          </div>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 mt-4 uppercase italic tracking-tighter">{viewingNeighbor.full_name}</h3>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                          <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                             <MapPin size={10} className="inline mr-1" /> {viewingNeighbor.neighborhood}
                          </span>
                          <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-lg">
                             <Zap size={10} className="inline mr-1 fill-current" /> {viewingNeighbor.karma} Karma
                          </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-6 font-medium italic leading-relaxed">
                          "{viewingNeighbor.bio || 'Hello neighbors! 👋'}"
                      </p>

                      <div className="grid grid-cols-1 gap-3 mt-8">
                          <button
                            onClick={() => {
                                handleSendMessage(viewingNeighbor.id, "Hi neighbor! 👋");
                                setActiveTab('Messages');
                                setViewingNeighbor(null);
                                addToast('Chat opened with ' + viewingNeighbor.full_name);
                            }}
                            className="bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-2"
                          >
                              <MessageSquare size={14} /> <span>Message Neighbor</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* IMAGE LIGHTBOX */}
      {selectedImage && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4 animate-in fade-in duration-300"
            onClick={() => setSelectedImage(null)}
          >
              <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                  <X size={32} />
              </button>
              <img
                src={selectedImage}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
                alt="Enlarged view"
              />
          </div>
      )}

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-gray-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-[100] shadow-2xl">
          {[
            { id: 'Feed', icon: <Globe size={20} />, label: t.feed },
            { id: 'Market', icon: <ShoppingBag size={20} />, label: t.market },
            { id: 'Create', icon: <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200 -mt-8 border-4 border-[#F8FAFC] dark:border-slate-950"><Search size={20} className="rotate-45" /></div>, label: '' },
            { id: 'Messages', icon: <MessageSquare size={20} />, label: t.messages },
            { id: 'Profile', icon: <User size={20} />, label: t.profile }
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                    if (tab.id === 'Create') {
                        setActiveTab('Feed');
                        setTimeout(() => composerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
    </div>
    </div>
  );
}
