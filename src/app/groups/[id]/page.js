'use client';

import React, { useState } from 'react';
import { useSocial } from '../../../contexts/SocialContext';
import { ArrowLeft, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Composer from '../../../components/Composer';
import PostCard from '../../../components/PostCard';
import { CEBU_ZONES } from '../../../lib/constants';
import DashboardShell from '../../../components/DashboardShell';

export default function GroupDetailPage({ params }) {
  const { id } = params;
  const {
    user, groups, posts, handleJoinGroup, handleLeaveGroup,
    handleLike, toggleSaveItem, handleAddComment, createPost, addToast,
    setSelectedImage, setViewingNeighbor, fetchGroupMembers,
    setCurrentGroupMembers, setShowMemberModal
  } = useSocial();

  const router = useRouter();
  const group = groups.find(g => String(g.id) === String(id));
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  if (!group) return <DashboardShell><div>Group not found</div></DashboardShell>;

  const handleFetchMembers = async () => {
    const { data } = await fetchGroupMembers(group.id);
    setCurrentGroupMembers(data);
    setShowMemberModal(true);
  };

  return (
    <DashboardShell>
        <div className="space-y-6">
            <button
                onClick={() => router.push('/groups')}
                className="flex items-center space-x-2 text-[10px] font-black uppercase text-gray-400 hover:text-blue-600 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm"
            >
                <ArrowLeft size={14} /> <span>Back to Groups</span>
            </button>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <img src={group.image} className="w-full h-full object-cover blur-sm" />
                </div>
                <div className="flex items-center space-x-6 relative z-10">
                    <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl">
                        <img src={group.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase italic tracking-tighter">{group.name}</h2>
                        <div className="flex items-center space-x-3 mt-1">
                            <span onClick={handleFetchMembers} className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg flex items-center cursor-pointer hover:bg-blue-100 transition-colors">
                                <Users size={12} className="mr-1.5" /> {group.members || 0} Neighbors
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => group.isJoined ? handleLeaveGroup(group.id) : handleJoinGroup(group.id)}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${group.isJoined ? 'bg-white/80 dark:bg-slate-800/80 text-gray-600 dark:text-slate-300' : 'bg-blue-600 text-white shadow-blue-100'}`}
                    >
                        {group.isJoined ? 'Leave Group' : 'Join Group'}
                    </button>
                </div>
            </div>

            {group.isJoined && (
                <Composer
                    activeTab="Feed" user={user}
                    newPostContent={newPostContent} setNewPostContent={setNewPostContent}
                    handleMainPost={async () => {
                        setIsSubmitting(true);
                        await createPost({ content: newPostContent, groupId: group.id, location: user.neighborhood });
                        setNewPostContent('');
                        setIsSubmitting(false);
                    }}
                    isSubmitting={isSubmitting}
                    zones={CEBU_ZONES}
                />
            )}

            <div className="space-y-4">
                {posts.filter(p => String(p.groupId) === String(group.id)).map(post => (
                    <PostCard
                        key={post.id} post={post} user={user}
                        handleLike={handleLike} toggleSave={() => toggleSaveItem(post.id, 'post')}
                        handleAddComment={handleAddComment}
                        onImageClick={setSelectedImage}
                        onViewProfile={setViewingNeighbor}
                        commentInput={commentInputs[post.id] || ''}
                        setCommentInput={(val) => setCommentInputs({...commentInputs, [post.id]: val})}
                        onShare={() => addToast('Link copied!')}
                        onReport={() => addToast('Reported', 'info')}
                    />
                ))}
            </div>
        </div>
    </DashboardShell>
  );
}
