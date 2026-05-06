import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { calculateDistance as calcDist, generateInitials, formatTimeAgo, cleanText } from '../lib/utils';

export function useSocialData(addToast) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [marketItems, setMarketItems] = useState([]);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [loading, setLoading] = useState(true);

  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chats, setChats] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // --- AUTH CHECK ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
              setUser({
                  id: profile.id,
                  name: profile.full_name || 'New Neighbor',
                  neighborhood: profile.neighborhood || 'Cebu City',
                  initials: profile.initials || generateInitials(profile.full_name || 'NN'),
                  karma: profile.karma || 0,
                  avatar: profile.avatar_url,
                  bio: profile.bio,
                  color: 'bg-blue-600'
              });
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) checkUser();
      else {
          setUser(null);
          setLoading(false);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // --- DATABASE FETCHERS ---
  const fetchData = useCallback(async () => {
    try {
      console.log('🔄 Syncing with Supabase...');
      setDbStatus('fetching');

      // Fetch Everything
      const [postsRes, marketRes, leaderboardRes, notifyRes, groupsRes, myGroupsRes] = await Promise.all([
        supabase.from('posts').select('*, profiles(full_name, avatar_url, neighborhood), comments(*, profiles(full_name)), likes(user_id)').order('created_at', { ascending: false }),
        supabase.from('market_items').select('*, profiles(full_name, avatar_url, neighborhood)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('full_name, karma, neighborhood, initials').order('karma', { ascending: false }).limit(5),
        user?.id ? supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
        supabase.from('groups').select('*'),
        user?.id ? supabase.from('group_members').select('group_id').eq('user_id', user.id) : Promise.resolve({ data: [] })
      ]);

      const pData = postsRes.data;
      const mData = marketRes.data;

      setLeaderboard(leaderboardRes.data || []);
      setNotifications((notifyRes.data || []).map(n => ({
          id: n.id,
          text: n.content,
          unread: n.unread,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));

      const joinedGroupIds = (myGroupsRes.data || []).map(g => g.group_id);
      setUserGroups(joinedGroupIds);

      setGroups((groupsRes.data || []).map(g => ({
          ...g,
          isJoined: joinedGroupIds.includes(g.id)
      })));

      // Fetch Saved Items if user is logged in
      let sData = [];
      if (user?.id) {
          const { data } = await supabase.from('saved_items').select('*').eq('user_id', user.id);
          sData = data || [];
          setSavedItems(sData);

          // Fetch Conversations with Profile Data
          const { data: mRes } = await supabase
            .from('messages')
            .select('*, sender:profiles!sender_id(full_name, avatar_url), receiver:profiles!receiver_id(full_name, avatar_url)')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: true });

          if (mRes) {
              const chatMap = {};
              mRes.forEach(m => {
                  const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
                  const otherProfile = m.sender_id === user.id ? m.receiver : m.sender;

                  if (!chatMap[otherId]) {
                      chatMap[otherId] = {
                        id: otherId,
                        name: otherProfile?.full_name || 'Neighbor',
                        avatar: otherProfile?.avatar_url,
                        lastMsg: '',
                        messages: []
                      };
                  }
                  chatMap[otherId].messages.push({
                      text: m.content,
                      sender: m.sender_id === user.id ? 'me' : 'them',
                      time: m.created_at
                  });
                  chatMap[otherId].lastMsg = m.content;
              });
              // Sort by most recent message first
              setChats(Object.values(chatMap).sort((a, b) => {
                  const aLast = a.messages[a.messages.length - 1]?.time || 0;
                  const bLast = b.messages[b.messages.length - 1]?.time || 0;
                  return new Date(bLast) - new Date(aLast);
              }));
          }
      }

      setPosts(pData?.map(p => ({
          id: p.id,
          author: p.profiles?.full_name,
          location: p.location,
          content: p.content,
          time: formatTimeAgo(p.created_at),
          type: p.post_type,
          category: p.category,
          likes: p.likes?.length || 0,
          hasLiked: p.likes?.some(l => l.user_id === user?.id),
          isSaved: sData.some(s => String(s.item_id) === String(p.id) && s.item_type === 'post'),
          image: p.image_url,
          eventDate: p.event_date,
          pollOptions: p.poll_options,
          totalVotes: p.poll_options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0,
          groupId: p.group_id,
          profiles: p.profiles,
          comments: p.comments?.map(c => ({
              id: c.id,
              author: c.profiles?.full_name,
              content: c.content,
              time: 'Just now'
          })) || [],
          user_id: p.user_id
      })) || []);

      setMarketItems(mData?.map(m => ({
          id: m.id, author: m.profiles?.full_name, title: m.title, price: m.price,
          category: m.category, condition: m.condition, location: m.location,
          image: m.image_url, isSold: m.is_sold, time: formatTimeAgo(m.created_at), user_id: m.user_id,
          coords: m.coords, // Adding coords for distance calculation
          isSaved: sData.some(s => String(s.item_id) === String(m.id) && s.item_type === 'market'),
          description: m.description, seller: m.profiles
      })) || []);

      setDbStatus('online');
      console.log('✅ Data synced successfully');
    } catch (err) {
      console.error('❌ Sync error:', err);
      setDbStatus('offline');
    }
  }, [user?.id]);

  const trendingZone = (() => {
    if (!posts.length) return 'Cebu City';
    const counts = {};
    posts.forEach(p => {
        if (p.location) counts[p.location] = (counts[p.location] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Cebu City';
  })();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    console.log('📡 Attempting to connect to Realtime...');

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          console.log('🔔 REALTIME EVENT RECEIVED:', payload);

          // Show toasts for specific events
          if (payload.eventType === 'INSERT') {
            if (payload.table === 'posts' && payload.new.user_id !== user?.id) {
                addToast(`New post in #${payload.new.location}!`, 'info');
            }
            if (payload.table === 'messages' && payload.new.receiver_id === user?.id) {
                addToast(`New message received! 📩`, 'success');
            }
          }

          // Fetch fresh data for ANY change
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime Status:', status);
        if (status === 'SUBSCRIBED') setDbStatus('online');
        else setDbStatus('offline');
      });

    return () => {
      console.log('📡 Cleaning up Realtime channel');
      supabase.removeChannel(channel);
    };
  }, [fetchData, user?.id]);

  // --- WRITERS ---
  const createPost = async (postObj) => {
    if (!user) return;

    const { cleaned, isToxic } = cleanText(postObj.content);
    if (isToxic && addToast) {
        addToast('Please keep our community friendly! Your post was filtered.', 'info');
    }

    const insertData = {
        user_id: user.id,
        content: cleaned,
        location: postObj.location,
        category: postObj.category,
        post_type: postObj.type,
        image_url: postObj.image,
        event_date: postObj.eventDate,
        poll_options: postObj.pollOptions ? postObj.pollOptions.filter(o => o.trim()).map((o, i) => ({ id: i, text: o, votes: 0 })) : null
    };

    const { data, error } = await supabase.from('posts').insert([insertData]).select();
    if (!error) fetchData();
    return { data, error };
  };

  const createMarketItem = async (itemObj) => {
    if (!user) return;
    const { data, error } = await supabase.from('market_items').insert([{
        user_id: user.id,
        title: itemObj.title,
        price: itemObj.price,
        category: itemObj.category,
        condition: itemObj.condition,
        location: itemObj.location,
        image_url: itemObj.image,
        description: itemObj.description || ''
    }]).select();
    if (!error) fetchData();
    return { data, error };
  };

  const handleLike = async (postId) => {
    if (!user) return;

    // Optimistic Update
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                hasLiked: !p.hasLiked,
                likes: p.hasLiked ? Math.max(0, p.likes - 1) : p.likes + 1
            };
        }
        return p;
    }));

    const post = posts.find(p => p.id === postId);
    if (post.hasLiked) {
        const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
        if (error) {
            console.error('Unlike error:', error);
            fetchData(); // Rollback on error
        }
    } else {
        const { error } = await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
        if (error) {
            console.error('Like error:', error);
            fetchData(); // Rollback on error
        } else if (post.user_id !== user.id) {
            // Award karma to the author
            await supabase.rpc('increment_karma', { user_id: post.user_id, amount: 1 });
            if (addToast) addToast('+1 Karma awarded to author!', 'info');
        }
    }
  };

  const handleAddComment = async (postId, content) => {
    if (!user || !content.trim()) return;

    const { cleaned, isToxic } = cleanText(content);
    if (isToxic && addToast) {
        addToast('Comment filtered for community safety.', 'info');
    }

    // Optimistic Update
    const tempId = Date.now();
    setPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                comments: [...p.comments, {
                    id: tempId,
                    author: user.name,
                    content: cleaned,
                    time: 'Just now'
                }]
            };
        }
        return p;
    }));

    const { error } = await supabase.from('comments').insert([{
        post_id: postId,
        user_id: user.id,
        content: cleaned
    }]);

    if (error) {
        console.error('Comment error:', error);
        fetchData();
    } else {
        // Award karma to the commenter
        await supabase.rpc('increment_karma', { user_id: user.id, amount: 2 });
        if (addToast) addToast('+2 Karma for being helpful!', 'info');
        fetchData();
    }
  };

  const handleMarkSold = async (itemId) => {
    if (!user) return;
    const item = marketItems.find(i => i.id === itemId);
    const { error } = await supabase
        .from('market_items')
        .update({ is_sold: !item.isSold })
        .eq('id', itemId);
    if (error) console.error('Error marking sold:', error);
    else fetchData();
  };

  const toggleSaveItem = async (id, type) => {
      if (!user) return console.warn('User not logged in');
      const isSaved = savedItems.some(s => String(s.item_id) === String(id) && s.item_type === type);

      console.log(`${isSaved ? 'Removing' : 'Adding'} bookmark:`, { id, type });

      if (isSaved) {
          const { error } = await supabase.from('saved_items').delete().match({ user_id: user.id, item_id: id, item_type: type });
          if (error) console.error('Delete bookmark error:', error);
      } else {
          const { error } = await supabase.from('saved_items').insert([{ user_id: user.id, item_id: id, item_type: type }]);
          if (error) console.error('Insert bookmark error:', error);
      }
      fetchData();
  };

  const handleSendMessage = async (receiverId, content) => {
    if (!user || !content.trim()) return;

    const { cleaned } = cleanText(content);

    // Optimistic Update for Chat
    setChats(prev => prev.map(chat => {
        if (chat.id === receiverId) {
            return {
                ...chat,
                lastMsg: cleaned,
                messages: [...chat.messages, {
                    text: cleaned,
                    sender: 'me',
                    time: new Date().toISOString()
                }]
            };
        }
        return chat;
    }));

    const { error } = await supabase.from('messages').insert([{
        sender_id: user.id,
        receiver_id: receiverId,
        content: cleaned
    }]);

    if (error) {
        console.error('Message error:', error);
        fetchData(); // Rollback on error
    }
  };

  const handleVote = async (postId, optionId) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post || !post.pollOptions) return;

    const newOptions = post.pollOptions.map(opt => {
        if (opt.id === optionId) {
            return { ...opt, votes: (opt.votes || 0) + 1 };
        }
        return opt;
    });

    const { error } = await supabase
        .from('posts')
        .update({ poll_options: newOptions })
        .eq('id', postId);

    if (error) console.error('Vote error:', error);
    else fetchData();
  };

  const handleJoinEvent = async (postId) => {
    if (!user) return;
    // Award karma for community participation
    await supabase.rpc('increment_karma', { user_id: user.id, amount: 5 });
    if (addToast) addToast('+5 Karma for joining the event! 🥳', 'success');
    fetchData();
  };

  const markNotificationsAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
        .from('notifications')
        .update({ unread: false })
        .eq('user_id', user.id)
        .eq('unread', true);
    if (!error) fetchData();
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) return;
    const { error } = await supabase.from('group_members').insert([{ group_id: groupId, user_id: user.id }]);
    if (error) console.error('Join group error:', error);
    else fetchData();
  };

  const handleLeaveGroup = async (groupId) => {
    if (!user) return;
    const { error } = await supabase.from('group_members').delete().match({ group_id: groupId, user_id: user.id });
    if (error) console.error('Leave group error:', error);
    else fetchData();
  };

  const handleReport = async (itemId, type, reason = 'Community standards') => {
    if (!user) return;
    const { error } = await supabase.from('reports').insert([{
        user_id: user.id,
        target_id: itemId,
        target_type: type,
        reason: reason
    }]);
    if (error) {
        console.error('Report error:', error);
    } else {
        if (addToast) addToast('Thank you. Moderators will review this.', 'info');
    }
  };

  const handleDeleteMarketItem = async (id) => {
    if (!user) return;

    // Optimistic Update
    setMarketItems(prev => prev.filter(item => item.id !== id));

    const { error } = await supabase.from('market_items').delete().eq('id', id);
    if (error) {
        console.error('Delete item error:', error);
        fetchData(); // Restore on failure
    }
  };

  const handleDeletePost = async (id) => {
    if (!user) return;

    // Optimistic Update
    setPosts(prev => prev.filter(post => post.id !== id));

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
        console.error('Delete post error:', error);
        fetchData(); // Restore on failure
    }
  };

  return {
    user, setUser, posts, marketItems,
    groups, notifications, setNotifications, chats, dbStatus, loading,
    leaderboard,
    createPost, createMarketItem, handleLike, handleAddComment, handleMarkSold,
    handleVote, handleJoinEvent, toggleSaveItem, handleSendMessage, markNotificationsAsRead,
    handleJoinGroup, handleLeaveGroup, handleReport, handleDeleteMarketItem,
    handleDeletePost,
    trendingZone,
    calculateDistance: (coords) => calcDist({ lat: 10.33, lng: 123.89 }, coords),
    fetchData
  };
}
