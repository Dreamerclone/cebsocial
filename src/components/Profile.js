'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Camera, Edit3, Check, MapPin, Zap, Star, ShieldCheck,
  Award, Loader2, Package, LayoutGrid, X, Plus, Users,
  MessageCircle, Settings, Mail, Lock, Phone,
  Grid, List as ListIcon, Calendar
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('Grid');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user, interests: user.interests || [] });
  const [newInterest, setNewInterest] = useState('');
  const [accountSettings, setAccountSettings] = useState({
    email: user.email || '',
    password: '',
    confirmPassword: '',
    phone: user.phone || ''
  });
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

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
          interests: tempUser.interests,
          phone: tempUser.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      setUser({ ...tempUser });
      setIsEditing(false);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAccount = async (type) => {
    setIsSaving(true);
    try {
        if (type === 'email') {
            const { error } = await supabase.auth.updateUser({ email: accountSettings.email });
            if (error) throw error;
            addToast('Check your email for confirmation', 'info');
        } else if (type === 'password') {
            if (accountSettings.password !== accountSettings.confirmPassword) throw new Error("Passwords mismatch");
            const { error } = await supabase.auth.updateUser({ password: accountSettings.password });
            if (error) throw error;
            addToast('Password updated!', 'success');
        }
    } catch (err) {
        addToast(err.message, 'error');
    } finally {
        setIsSaving(false);
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

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      {/* Header Section - Clean & Balanced */}
      <div className="surface-card rounded-[2rem] border shadow-sm overflow-hidden mb-6">
        <div className="h-48 md:h-64 bg-gray-100 dark:bg-zinc-900 relative">
          {(isEditing ? tempUser.coverPhoto : user.coverPhoto) ? (
            <img src={isEditing ? tempUser.coverPhoto : user.coverPhoto} className="w-full h-full object-cover" alt="cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-500/10 to-indigo-500/10" />
          )}
          {isOwnProfile && isEditing && (
            <button onClick={() => coverInputRef.current.click()} className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-lg backdrop-blur-md hover:bg-black/70 transition-all">
                <Camera size={18} />
            </button>
          )}
          <input type="file" ref={coverInputRef} onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                  const url = await uploadImage(file);
                  if (url) setTempUser({...tempUser, coverPhoto: url});
              }
          }} className="hidden" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-12 mb-4 relative z-10">
            <div className="relative group/avatar">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 surface-card bg-primary-600 shadow-lg overflow-hidden flex items-center justify-center text-white font-black text-4xl">
                    {(isEditing ? tempUser.avatar : user.avatar) ? <img src={isEditing ? tempUser.avatar : user.avatar} className="w-full h-full object-cover" /> : user.initials}
                </div>
                {isOwnProfile && isEditing && (
                    <button onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const url = await uploadImage(file);
                        if (url) setTempUser({...tempUser, avatar: url});
                    }
                }} className="hidden" />
            </div>

            <div className="pt-14 flex gap-2">
                {isOwnProfile ? (
                    <>
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`px-6 py-2 rounded-xl font-bold text-xs transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-main hover:bg-gray-200'}`}
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : isEditing ? 'Save' : 'Edit Profile'}
                        </button>
                        <button onClick={() => setActiveSubTab('Settings')} className={`p-2 rounded-xl transition-all ${activeSubTab === 'Settings' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-main'}`}>
                            <Settings size={18} />
                        </button>
                    </>
                ) : (
                    <button onClick={() => window.location.href = `/messages?chat=${user.id}`} className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary-500/20">
                        Message
                    </button>
                )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-main">{user.name}</h1>
                {badge && <span className="text-primary-600" title={badge.label}>{badge.icon}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted font-medium">
                <span className="flex items-center gap-1"><MapPin size={12} /> {user.neighborhood}</span>
                <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500 fill-current" /> {user.karma} XP</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> Joined 2024</span>
            </div>
          </div>

          {!isEditing && user.bio && (
            <p className="mt-4 text-sm text-main font-medium leading-relaxed max-w-2xl opacity-80">
                {user.bio}
            </p>
          )}

          {isEditing && (
            <div className="mt-6 space-y-4 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted px-1">Display Name</label>
                        <input value={tempUser.name} onChange={(e) => setTempUser({...tempUser, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-2.5 text-sm border-none outline-none focus:ring-2 focus:ring-primary-600/20 transition-all" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-muted px-1">Neighborhood</label>
                        <select value={tempUser.neighborhood} onChange={(e) => setTempUser({...tempUser, neighborhood: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-2.5 text-sm border-none outline-none cursor-pointer">
                            {CEBU_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted px-1">Phone Number</label>
                    <input value={tempUser.phone || ''} onChange={(e) => setTempUser({...tempUser, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-2.5 text-sm border-none outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-muted px-1">Bio</label>
                    <textarea value={tempUser.bio} onChange={(e) => setTempUser({...tempUser, bio: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-2.5 text-sm border-none outline-none focus:ring-2 focus:ring-primary-600/20 min-h-[80px]" />
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row - Subtle */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
            { label: 'Posts', value: userPosts.length },
            { label: 'Deals', value: userItems.length },
            { label: 'Groups', value: userGroups.length },
            { label: 'Karma', value: user.karma },
        ].map(s => (
            <div key={s.label} className="surface-card p-3 rounded-2xl border text-center">
                <p className="text-lg font-black text-main leading-none">{s.value}</p>
                <p className="text-[9px] font-black uppercase text-muted mt-1">{s.label}</p>
            </div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className="sticky top-[72px] bg-white/80 dark:bg-black/80 backdrop-blur-md z-20 border-b mb-6 px-2">
        <div className="flex items-center justify-between">
            <div className="flex gap-6">
                {['Posts', 'Store', 'Media'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`py-4 text-[11px] font-bold uppercase tracking-widest relative ${activeSubTab === tab ? 'text-primary-600' : 'text-muted'}`}
                    >
                        {tab}
                        {activeSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
                    </button>
                ))}
            </div>
            <div className="flex gap-1">
                <button onClick={() => setViewMode('Grid')} className={`p-2 rounded-lg ${viewMode === 'Grid' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-muted'}`}><Grid size={16}/></button>
                <button onClick={() => setViewMode('List')} className={`p-2 rounded-lg ${viewMode === 'List' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-muted'}`}><ListIcon size={16}/></button>
            </div>
        </div>
      </div>

      <div className="min-h-[300px]">
          {activeSubTab === 'Settings' ? (
              <div className="surface-card p-6 rounded-[2rem] border space-y-6 animate-slide-up max-w-lg mx-auto">
                  <h2 className="text-lg font-black text-main uppercase italic">Account Settings</h2>
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted px-1 uppercase tracking-widest">Email Address</label>
                          <div className="flex gap-2">
                              <input value={accountSettings.email} onChange={(e) => setAccountSettings({...accountSettings, email: e.target.value})} className="flex-1 bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-2 text-sm font-medium outline-none" />
                              <button onClick={() => handleUpdateAccount('email')} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase">Update</button>
                          </div>
                      </div>
                      <div className="h-px bg-gray-50 dark:bg-zinc-800" />
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted px-1 uppercase tracking-widest">Change Password</label>
                          <input type="password" placeholder="New Password" value={accountSettings.password} onChange={(e) => setAccountSettings({...accountSettings, password: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-2 text-sm font-medium outline-none" />
                          <input type="password" placeholder="Confirm New Password" value={accountSettings.confirmPassword} onChange={(e) => setAccountSettings({...accountSettings, confirmPassword: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-900 rounded-xl px-4 py-2 text-sm font-medium outline-none" />
                          <button onClick={() => handleUpdateAccount('password')} className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase mt-2">Update Security</button>
                      </div>
                  </div>
              </div>
          ) : (
              <div className={viewMode === 'Grid' && activeSubTab !== 'Posts' ? 'grid grid-cols-2 md:grid-cols-3 gap-3' : 'space-y-4 max-w-2xl mx-auto'}>
                  {activeSubTab === 'Posts' ? (
                      userPosts.length > 0 ? userPosts.map(post => (
                          <PostCard key={post.id} post={post} user={user} handleLike={handleLike} onDelete={onDeletePost} onImageClick={onImageClick} onViewProfile={onViewProfile} />
                      )) : <div className="py-12 text-center opacity-30"><p className="text-xs font-bold uppercase tracking-widest">No Posts</p></div>
                  ) : activeSubTab === 'Store' ? (
                      userItems.length > 0 ? userItems.map(item => (
                          viewMode === 'Grid' ? (
                              <div key={item.id} onClick={() => onMarkSold(item.id)} className="aspect-square rounded-2xl overflow-hidden border relative group cursor-pointer shadow-sm">
                                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                      <p className="text-white font-bold text-[10px] truncate">{item.title}</p>
                                  </div>
                              </div>
                          ) : (
                              <MarketCard key={item.id} item={item} currentUser={user} onMarkSold={onMarkSold} />
                          )
                      )) : <div className="py-12 text-center opacity-30"><p className="text-xs font-bold uppercase tracking-widest">Empty Shop</p></div>
                  ) : (
                      <div className="grid grid-cols-3 gap-1">
                          {userPosts.filter(p => p.image).map(p => (
                              <div key={p.id} onClick={() => onImageClick(p.image)} className="aspect-square rounded-lg overflow-hidden cursor-zoom-in hover:opacity-90 transition-opacity">
                                  <img src={p.image} className="w-full h-full object-cover" />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
}
