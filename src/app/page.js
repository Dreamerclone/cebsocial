'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Search, AlertTriangle, Users, MessageSquare, Plus } from 'lucide-react';
import { useSocial } from '../contexts/SocialContext';
import Composer from '../components/Composer';
import PostCard from '../components/PostCard';
import Skeleton from '../components/Skeleton';
import { CEBU_ZONES } from '../lib/constants';
import DashboardShell from '../components/DashboardShell';

export default function FeedPage() {
  const router = useRouter();
  const {
    user, posts, loading, createPost, handleLike, handleAddComment,
    handleDeletePost, toggleSaveItem, handleJoinEvent, handleVote,
    calculateDistance, addToast, t, dbStatus, activeFilter, searchQuery,
    setSelectedImage, setViewingNeighbor, allUsers
  } = useSocial();

  const [activeFeedCategory, setActiveFeedCategory] = useState('All');
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState('Normal');
  const [feedCategory, setFeedCategory] = useState('General');
  const [pendingImage, setPendingImage] = useState(null);
  const [eventDate, setEventDate] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [rideDetails, setRideDetails] = useState({ destination: '', seats: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedZone, setSelectedZone] = useState('Lahug');
  const [commentInputs, setCommentInputs] = useState({});

  const composerRef = useRef(null);

  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => !p.groupId)
      .filter(p => (activeFilter === 'All City' || p.location === activeFilter))
      .filter(p => {
        if (activeFeedCategory === 'All') return true;
        if (activeFeedCategory === 'Alerts') return p.type === 'Alert';
        if (activeFeedCategory === 'Pasabay') return p.type === 'Ride';
        return p.category === activeFeedCategory;
      })
      .filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [posts, activeFilter, activeFeedCategory, searchQuery]);

  const handleMainPost = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (!newPostContent.trim()) return addToast('Post cannot be empty', 'error');
      const { error } = await createPost({
          content: newPostContent,
          location: selectedZone,
          category: feedCategory,
          type: postType,
          image: pendingImage,
          eventDate: eventDate,
          pollOptions: pollOptions,
          destination: rideDetails.destination,
          seats: rideDetails.seats
      });
      if (error) return addToast('Failed to post: ' + error.message, 'error');
      setNewPostContent(''); setPostType('Normal');
      setPendingImage(null);
      setRideDetails({ destination: '', seats: '' });
      addToast('Post published successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      {user && (
        <div className="space-y-6">
          <div ref={composerRef}>
              <Composer
                  activeTab="Feed" user={user} t={t}
                  newPostContent={newPostContent} setNewPostContent={setNewPostContent}
                  postType={postType} setPostType={setPostType}
                  selectedZone={selectedZone} setSelectedZone={setSelectedZone}
                  handleMainPost={handleMainPost} zones={CEBU_ZONES}
                  pendingImage={pendingImage} setPendingImage={setPendingImage}
                  feedCategory={feedCategory} setFeedCategory={setFeedCategory}
                  eventDate={eventDate} setEventDate={setEventDate}
                  pollOptions={pollOptions} setPollOptions={setPollOptions}
                  rideDetails={rideDetails} setRideDetails={setRideDetails}
                  isSubmitting={isSubmitting}
              />
          </div>


          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
             <div className="flex flex-col">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter flex items-center">
                    {searchQuery ? `Results for "${searchQuery}"` : `Neighborhood Feed`}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Live in {activeFilter}</p>
                </div>
             </div>

             <div className="flex space-x-2 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                  {[
                      { id: 'All', label: 'All', icon: <Globe size={14}/> },
                      { id: 'Alerts', label: 'Alerts', icon: <AlertTriangle size={14}/> },
                      { id: 'Pasabay', label: 'Pasabay', icon: <Users size={14}/> },
                      { id: 'General', label: 'General', icon: <MessageSquare size={14}/> }
                  ].map(cat => (
                      <button
                          key={cat.id}
                          onClick={() => setActiveFeedCategory(cat.id)}
                          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${activeFeedCategory === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-500/20 scale-105' : 'bg-white dark:bg-slate-900 text-muted border-gray-100 dark:border-slate-800 hover:border-primary-600/30'}`}
                      >
                          {cat.icon}
                          {cat.label}
                      </button>
                  ))}
              </div>
          </div>

          <div className="space-y-4">
            {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} type="post" />)
            ) : (
                filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <PostCard
                          key={post.id} post={post} user={user}
                          handleLike={handleLike}
                          toggleSave={(id) => toggleSaveItem(id, 'post')}
                          handleAddComment={handleAddComment}
                          commentInput={commentInputs[post.id] || ''}
                          setCommentInput={(val) => setCommentInputs({...commentInputs, [post.id]: val})}
                          onDelete={handleDeletePost}
                          onJoinEvent={handleJoinEvent}
                          onViewProfile={(profile) => router.push(`/profile/${profile.id}`)}
                          onShare={(id) => {
                              const url = window.location.origin;
                              navigator.clipboard.writeText(`${url}/post/${id}`);
                              addToast('Link copied!');
                          }}
                          onReport={() => addToast('Reported', 'info')}
                          onSetReminder={() => addToast('Reminder set')}
                          t={t}
                        />
                    ))
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-12 text-center shadow-sm">
                        <Search size={40} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">{t.no_posts}</h3>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{t.be_first}</p>
                    </div>
                )
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
