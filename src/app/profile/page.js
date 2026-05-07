'use client';

import React, { useState } from 'react';
import { useSocial } from '../../contexts/SocialContext';
import Profile from '../../components/Profile';
import DashboardShell from '../../components/DashboardShell';

export default function ProfilePage() {
  const {
    user, setUser, posts, marketItems, groups, handleLike,
    handleDeletePost, handleMarkSold, handleDeleteMarketItem,
    toggleSaveItem, addToast, handleAddComment,
    setSelectedImage, setViewingNeighbor, setViewingShop, setEditingItem
  } = useSocial();

  const [commentInputs, setCommentInputs] = useState({});

  return (
    <DashboardShell>
        <Profile
            user={user}
            setUser={setUser}
            userPosts={posts.filter(p => p.user_id === user.id)}
            userItems={marketItems.filter(i => i.user_id === user.id)}
            userGroups={groups.filter(g => g.isJoined)}
            handleLike={handleLike}
            onDeletePost={handleDeletePost}
            onMarkSold={handleMarkSold}
            onDeleteMarketItem={handleDeleteMarketItem}
            toggleSaveItem={toggleSaveItem}
            addToast={addToast}
            handleAddComment={handleAddComment}
            commentInputs={commentInputs}
            setCommentInputs={setCommentInputs}
            onImageClick={setSelectedImage}
            onViewProfile={setViewingNeighbor}
            onViewShop={setViewingShop}
            onEditMarketItem={setEditingItem}
            isOwnProfile={true}
        />
    </DashboardShell>
  );
}
