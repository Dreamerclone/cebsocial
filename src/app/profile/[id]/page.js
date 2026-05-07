'use client';

import React, { useState, useEffect } from 'react';
import { useSocial } from '../../../contexts/SocialContext';
import Profile from '../../../components/Profile';
import DashboardShell from '../../../components/DashboardShell';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';

export default function NeighborProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    user: currentUser, posts: allPosts, marketItems: allItems, groups, handleLike,
    handleDeletePost, handleMarkSold, handleDeleteMarketItem,
    toggleSaveItem, addToast, handleAddComment,
    setSelectedImage, setViewingNeighbor, setViewingShop, setEditingItem
  } = useSocial();

  const [neighbor, setNeighbor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    if (id === currentUser?.id) {
        router.push('/profile');
        return;
    }

    const fetchNeighbor = async () => {
      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (profile) {
            setNeighbor({
                id: profile.id,
                name: profile.full_name,
                neighborhood: profile.neighborhood,
                initials: profile.full_name?.substring(0, 2).toUpperCase(),
                karma: profile.karma || 0,
                avatar: profile.avatar_url,
                coverPhoto: profile.cover_url,
                bio: profile.bio,
                interests: profile.interests || []
            });
        }
      } catch (err) {
        console.error('Error fetching neighbor:', err);
        addToast('Neighbor not found', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNeighbor();
  }, [id, currentUser?.id]);

  if (loading) return <DashboardShell><div className="min-h-[400px] flex items-center justify-center font-black uppercase text-gray-400 italic animate-pulse">Loading Profile...</div></DashboardShell>;
  if (!neighbor) return <DashboardShell><div className="min-h-[400px] flex items-center justify-center font-black uppercase text-gray-400 italic">Neighbor Not Found</div></DashboardShell>;

  return (
    <DashboardShell>
        <Profile
            user={neighbor}
            setUser={() => {}} // No-op for other users
            userPosts={allPosts.filter(p => p.user_id === neighbor.id)}
            userItems={allItems.filter(i => i.user_id === neighbor.id)}
            userGroups={[]} // We don't easily know their joined groups unless we fetch them
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
            isOwnProfile={false}
        />
    </DashboardShell>
  );
}
