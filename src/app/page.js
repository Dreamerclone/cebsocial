'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Search } from 'lucide-react';
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
    setSelectedImage, setViewingNeighbor
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
      <div className="space-y-6">
        <div ref={composerRef}>
            <Composer
                activeTab="Feed" user={user}
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

        <div className="flex justify-between items-center mb-6 px-2">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Globe size={14} className="mr-2 text-blue-500" />
                  {searchQuery ? `Searching: "${searchQuery}"` : `Feed View • ${activeFilter}`}
              </h3>
              <div className="flex items-center space-x-2 mt-1 px-1">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dbStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">DB Status: {dbStatus}</span>
              </div>
           </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
            {['All', 'Alerts', 'Pasabay', 'News', 'Question', 'Lost & Found', 'General'].map(cat => (
                <button key={cat} onClick={() => setActiveFeedCategory(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeFeedCategory === cat ? (cat === 'Alerts' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100' : cat === 'Pasabay' ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-100' : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100') : 'bg-white dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-800'}`}>{cat}</button>
            ))}
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
                        onVote={handleVote}
                        distance={calculateDistance(post.coords)}
                        onImageClick={setSelectedImage}
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
    </DashboardShell>
  );
}
