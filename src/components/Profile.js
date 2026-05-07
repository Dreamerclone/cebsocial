'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Camera, Edit3, Check, Globe, MapPin, Zap, Star, ShieldCheck, Award, Link, Loader2, Package, LayoutGrid, X, Plus, Users, ChevronRight, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadImage, getReputationBadge } from '../lib/utils';
import { CEBU_ZONES } from '../lib/constants';
import PostCard from './PostCard';
import MarketCard from './MarketCard';

export default function Profile({
  user, setUser, userPosts = [], userItems = [], userGroups = [], handleLike,
  onDeletePost, onMarkSold, onDeleteMarketItem, onEditMarketItem,
  toggleSaveItem, addToast, onImageClick, onViewProfile,
  handleAddComment, commentInputs, setCommentInputs,
  isOwnProfile = false
}) {
  const [activeSubTab, setActiveSubTab] = useState('Posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user, interests: user.interests || [] });
  const [newInterest, setNewInterest] = useState('');
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Sync tempUser when entering edit mode or when user data updates
  React.useEffect(() => {
    if (!isEditing && user) {
      setTempUser({ ...user, interests: user.interests || [] });
    }
  }, [user, isEditing]);

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
          cover_url: tempUser.coverPhoto,
          interests: tempUser.interests // Assuming this column exists or we fallback to local state
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...tempUser });
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Error updating profile: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !tempUser.interests.includes(newInterest.trim())) {
        setTempUser({ ...tempUser, interests: [...tempUser.interests, newInterest.trim()] });
        setNewInterest('');
    }
  };

  const removeInterest = (tag) => {
    setTempUser({ ...tempUser, interests: tempUser.interests.filter(t => t !== tag) });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsSaving(true);
        try {
            const url = await uploadImage(file); // Removed 'avatars' bucket
            if (url) {
                setTempUser({ ...tempUser, avatar: url });
                addToast('Avatar uploaded!', 'success');
            } else {
                addToast('Failed to upload avatar', 'error');
            }
        } catch (err) {
            addToast('Upload error: ' + err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsSaving(true);
        try {
            const url = await uploadImage(file); // Removed 'covers' bucket
            if (url) {
                setTempUser({ ...tempUser, coverPhoto: url });
                addToast('Cover photo uploaded!', 'success');
            } else {
                addToast('Failed to upload cover photo', 'error');
            }
        } catch (err) {
            addToast('Upload error: ' + err.message, 'error');
        } finally {
            setIsSaving(false);
        }
    }
  };

  const badge = useMemo(() => {
      const b = getReputationBadge(user.karma);
      const iconMap = {
          'Community Leader': <ShieldCheck size={14}/>,
          'Local Helper': <Award size={14}/>,
          'Trusted Citizen': <Star size={14}/>,
          'New Neighbor': <MapPin size={14}/>
      };
      return { ...b, icon: iconMap[b.label] };
  }, [user.karma]);

  const progress = Math.min(100, Math.round((user.karma / badge.next) * 100));

  return (
    <div className="space-y-6 animate-slide-down">
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Banner */}
        <div className="h-64 w-full relative group bg-slate-200 dark:bg-slate-800 transition-all overflow-hidden">
           <input type="file" ref={coverInputRef} onChange={handleCoverChange} className="hidden" accept="image/*" />

           {(isEditing ? tempUser.coverPhoto : user.coverPhoto) ? (
               <img
                src={isEditing ? tempUser.coverPhoto : user.coverPhoto}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="cover"
               />
           ) : (
               <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 flex items-center justify-center">
                   <Globe size={48} className="text-blue-600/20" />
               </div>
           )}

           <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

           {isSaving && (
               <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-10">
                   <Loader2 size={32} className="text-white animate-spin" />
               </div>
           )}

           {isOwnProfile && isEditing && !isSaving && (
               <button
                onClick={() => coverInputRef.current.click()}
                className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/30 shadow-2xl flex items-center space-x-2"
               >
                   <Camera size={14} />
                   <span>Update Cover</span>
               </button>
           )}
        </div>

        {/* Profile Info */}
        <div className="px-10 pb-10 relative">
          <div className="flex justify-between items-end -mt-16 mb-8 relative z-20">
            <div className="relative group" onClick={() => (isOwnProfile && isEditing && !isSaving) && fileInputRef.current.click()}>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                <div className={`w-36 h-36 rounded-[2.5rem] bg-blue-600 border-8 border-white dark:border-slate-900 flex items-center justify-center text-white font-black text-4xl shadow-2xl overflow-hidden relative ${isEditing ? 'cursor-pointer' : ''}`}>
                    {(isEditing ? tempUser.avatar : user.avatar) ? (
                        <img src={isEditing ? tempUser.avatar : user.avatar} className="w-full h-full object-cover" />
                    ) : (
                        user.initials
                    )}
                    {isSaving && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                    )}
                </div>
                {isOwnProfile && isEditing && !isSaving && (
                    <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <Camera size={24} className="text-white" />
                         <span className="text-[8px] font-black text-white uppercase mt-1">Change Avatar</span>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-3">
                {isOwnProfile && isEditing && (
                    <button
                        disabled={isSaving}
                        onClick={() => {
                            setIsEditing(false);
                            setTempUser({ ...user });
                        }}
                        className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </button>
                )}
                {isOwnProfile && (
                    <button
                        disabled={isSaving}
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 transition-all shadow-xl ${isEditing ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : isEditing ? (
                            <><Check size={16} /> <span>Save Changes</span></>
                        ) : (
                            <><Edit3 size={16} /> <span>Edit Profile</span></>
                        )}
                    </button>
                )}
                {!isOwnProfile && (
                    <button
                        onClick={() => {
                            // Direct to messages
                            window.location.href = `/messages?chat=${user.id}`;
                        }}
                        className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                        <MessageCircle size={16} /> <span>Message Neighbor</span>
                    </button>
                )}
            </div>
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
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Interests & Services (e.g. Gardening, Tech Help)</label>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 min-h-[60px]">
                        {tempUser.interests?.map(tag => (
                            <span key={tag} className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center group">
                                {tag}
                                <button onClick={() => removeInterest(tag)} className="ml-2 hover:text-red-200"><X size={12} /></button>
                            </span>
                        ))}
                        <div className="flex-1 flex items-center min-w-[120px]">
                            <input
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                                placeholder="Add skill..."
                                className="w-full bg-transparent border-none outline-none text-xs font-bold dark:text-white"
                            />
                            {newInterest && <button onClick={addInterest} className="p-1 text-blue-600"><Plus size={16} /></button>}
                        </div>
                    </div>
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
                    {user.interests?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                            {user.interests.map(tag => (
                                <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Achievements Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Settler', val: 'New', icon: <MapPin size={14}/>, color: 'bg-slate-100 text-slate-500', active: true },
                        { label: 'Poster', val: userPosts.length, icon: <LayoutGrid size={14}/>, color: 'bg-blue-50 text-blue-600', active: userPosts.length > 0 },
                        { label: 'Trader', val: userItems.length, icon: <Package size={14}/>, color: 'bg-green-50 text-green-600', active: userItems.length > 0 },
                        { label: 'Helpful', val: user.karma, icon: <Zap size={14}/>, color: 'bg-amber-50 text-amber-600', active: user.karma >= 100 }
                    ].map((badge, i) => (
                        <div key={i} className={`p-4 rounded-[2rem] border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-all ${badge.active ? 'opacity-100 bg-white dark:bg-slate-900 shadow-sm' : 'opacity-30 grayscale'}`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 ${badge.active ? badge.color : 'bg-gray-100 text-gray-400'}`}>
                                {badge.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{badge.label}</span>
                            <span className="text-[8px] font-bold text-gray-400 mt-0.5">{badge.val} Units</span>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats and Groups Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
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
                            handleAddComment={handleAddComment}
                            commentInput={commentInputs?.[post.id] || ''}
                            setCommentInput={(val) => setCommentInputs?.(prev => ({...prev, [post.id]: val}))}
                            onImageClick={onImageClick}
                            onViewProfile={onViewProfile}
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
                            onDelete={onDeleteMarketItem || onDeletePost}
                            onEdit={onEditMarketItem}
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
                            onViewProfile={onViewProfile}
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

        {/* Right Column: Joined Groups Sidebar */}
        <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6 flex items-center">
                      <Users size={16} className="mr-2 text-blue-600" /> My Communities
                  </h3>
                  <div className="space-y-4">
                      {userGroups.length > 0 ? userGroups.map(group => (
                          <div key={group.id} className="flex items-center space-x-4 group cursor-pointer">
                              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                  <img src={group.image} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                  <p className="font-black text-[10px] text-gray-900 dark:text-slate-100 uppercase truncate tracking-tight">{group.name}</p>
                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Active Member</p>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                  <ChevronRight size={10} className="text-blue-600" />
                              </div>
                          </div>
                      )) : (
                          <div className="py-6 text-center opacity-40">
                              <Users size={24} className="mx-auto mb-2 text-gray-300" />
                              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">No groups yet</p>
                          </div>
                      )}
                  </div>
              </div>

              {/* Quick Contact / Share */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-100 dark:shadow-none">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Neighborhood Identity</h4>
                  <p className="text-xs font-bold leading-relaxed italic">"I'm here to help our neighborhood grow and stay safe!"</p>
                  <button
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        addToast('Profile link copied!', 'success');
                    }}
                    className="w-full mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                      Share My Profile
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
