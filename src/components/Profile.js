'use client';

import React, { useState, useRef } from 'react';
import { Camera, Edit3, Check, Globe, MapPin, Zap, Star, ShieldCheck, Award, Link, Loader2, Package, LayoutGrid } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadImage } from '../lib/utils';
import { CEBU_ZONES } from '../lib/constants';
import PostCard from './PostCard';
import MarketCard from './MarketCard';

export default function Profile({ user, setUser, userPosts = [], userItems = [], handleLike, onDeletePost, onMarkSold, toggleSaveItem, addToast, onImageClick }) {
  const [activeSubTab, setActiveSubTab] = useState('Posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: tempUser.name,
          neighborhood: tempUser.neighborhood,
          bio: tempUser.bio,
          avatar_url: tempUser.avatar,
          cover_url: tempUser.coverPhoto
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...tempUser });
      setIsEditing(false);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsSaving(true);
        const url = await uploadImage(file);
        if (url) setTempUser({ ...tempUser, avatar: url });
        setIsSaving(false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsSaving(true);
        const url = await uploadImage(file);
        if (url) setTempUser({ ...tempUser, coverPhoto: url });
        setIsSaving(false);
    }
  };

  const badge = (() => {
      if (user.karma >= 500) return { label: 'Community Leader', icon: <ShieldCheck size={14}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', next: 1000 };
      if (user.karma >= 200) return { label: 'Local Helper', icon: <Award size={14}/>, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', next: 500 };
      if (user.karma >= 100) return { label: 'Trusted Citizen', icon: <Star size={14}/>, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', next: 200 };
      return { label: 'New Neighbor', icon: <MapPin size={14}/>, color: 'text-gray-600 bg-gray-50 dark:bg-slate-800', next: 100 };
  })();

  const progress = Math.min(100, Math.round((user.karma / badge.next) * 100));

  return (
    <div className="space-y-6 animate-slide-down">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Banner */}
        <div className="h-48 w-full relative group bg-blue-600">
           <input type="file" ref={coverInputRef} onChange={handleCoverChange} className="hidden" accept="image/*" />
           {tempUser.coverPhoto || user.coverPhoto ? (
               <img src={isEditing ? tempUser.coverPhoto : user.coverPhoto} className="w-full h-full object-cover" alt="cover" />
           ) : null}
           <div className="absolute inset-0 bg-black/20"></div>
           {isEditing && (
               <button
                onClick={() => coverInputRef.current.click()}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
               >
                   Change Cover
               </button>
           )}
        </div>

        {/* Profile Info */}
        <div className="px-10 pb-10 relative">
          <div className="flex justify-between items-end -mt-12 mb-8">
            <div className="relative group cursor-pointer" onClick={() => isEditing && fileInputRef.current.click()}>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                <div className={`w-32 h-32 rounded-[2.5rem] bg-blue-600 border-8 border-white dark:border-slate-900 flex items-center justify-center text-white font-black text-4xl shadow-2xl overflow-hidden`}>
                    {tempUser.avatar || user.avatar ? (
                        <img src={isEditing ? tempUser.avatar : user.avatar} className="w-full h-full object-cover" />
                    ) : (
                        user.initials
                    )}
                </div>
                {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={24} className="text-white" />
                         <span className="text-[8px] font-black text-white uppercase mt-1">Change</span>
                    </div>
                )}
            </div>
            <button
                disabled={isSaving}
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all shadow-xl ${isEditing ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}
            >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : isEditing ? (
                    <><Check size={16} /> <span>Save Profile</span></>
                ) : (
                    <><Edit3 size={16} /> <span>Edit Profile</span></>
                )}
            </button>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Display Name</label>
                    <input
                        value={tempUser.name}
                        onChange={(e) => setTempUser({...tempUser, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 dark:text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Neighborhood</label>
                    <select
                        value={tempUser.neighborhood}
                        onChange={(e) => setTempUser({...tempUser, neighborhood: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 dark:text-white appearance-none cursor-pointer"
                    >
                        {CEBU_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Bio</label>
                    <textarea
                        value={tempUser.bio}
                        onChange={(e) => setTempUser({...tempUser, bio: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 min-h-[100px] resize-none dark:text-white"
                    />
                </div>
            </div>
          ) : (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tighter uppercase italic">{user.name}</h2>
                    <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl">
                            <MapPin size={12} className="mr-2" /> {user.neighborhood}
                        </div>
                        <div className="flex items-center text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl">
                            <Zap size={12} className="mr-2 fill-current" /> {user.karma} Helpful
                        </div>
                        {badge && (
                            <div className={`flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${badge.color}`}>
                                <span className="mr-2">{badge.icon}</span> {badge.label}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Helpfulness Level</span>
                        <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{user.karma} / {badge.next} XP</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-lg"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium italic">
                        {user.karma >= 500 ? "You're a pillar of the community! 🏆" : `Earn ${badge.next - user.karma} more Karma to become a ${badge.label === 'New Neighbor' ? 'Trusted Citizen' : badge.label === 'Trusted Citizen' ? 'Local Helper' : 'Community Leader'}!`}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800">
                    <p className="text-sm text-gray-600 dark:text-slate-300 font-medium leading-relaxed italic">
                        "{user.bio || 'Hello neighbors! 👋'}"
                    </p>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* User Activity Section */}
      <div className="space-y-6">
          <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-2 rounded-3xl border border-gray-100 dark:border-slate-800 w-fit shadow-sm">
              <button
                onClick={() => setActiveSubTab('Posts')}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeSubTab === 'Posts' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  <LayoutGrid size={14} /> <span>Your Posts</span>
              </button>
              <button
                onClick={() => setActiveSubTab('Market')}
                className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeSubTab === 'Market' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                  <Package size={14} /> <span>Your Listings</span>
              </button>
          </div>

          <div className="space-y-4">
              {activeSubTab === 'Posts' ? (
                  userPosts.length > 0 ? (
                      userPosts.map(post => (
                          <PostCard
                            key={post.id} post={post} user={user}
                            handleLike={handleLike} onDelete={onDeletePost}
                            toggleSave={() => toggleSaveItem(post.id, 'post')}
                            onShare={() => {
                                const url = typeof window !== 'undefined' ? window.location.origin : '';
                                navigator.clipboard.writeText(`${url}/post/${post.id}`);
                                addToast('Post link copied to clipboard!', 'success');
                            }}
                            onReport={() => {}}
                            handleAddComment={() => {}}
                            commentInput=""
                            setCommentInput={() => {}}
                            onImageClick={onImageClick}
                          />
                      ))
                  ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-gray-100 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No posts yet</p>
                      </div>
                  )
              ) : (
                  userItems.length > 0 ? (
                      userItems.map(item => (
                          <MarketCard
                            key={item.id} item={item} currentUser={user}
                            onMarkSold={onMarkSold}
                            toggleSave={() => toggleSaveItem(item.id, 'market')}
                            onMessage={() => {}}
                            onViewShop={() => {}}
                            onShare={() => {
                                const url = typeof window !== 'undefined' ? window.location.origin : '';
                                navigator.clipboard.writeText(`${url}/item/${item.id}`);
                                addToast('Market link copied to clipboard!', 'success');
                            }}
                            onReport={() => {}}
                            onImageClick={onImageClick}
                          />
                      ))
                  ) : (
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-gray-100 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No listings yet</p>
                      </div>
                  )
              )}
          </div>
      </div>
    </div>
  );
}
