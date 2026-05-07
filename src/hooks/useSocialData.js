import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { calculateDistance as calcDist, generateInitials, formatTimeAgo, cleanText } from '../lib/utils';

export function useSocialData(addToast) {
  const [user, setUser] = useState(null);
  const [rawPosts, setRawPosts] = useState([]);
  const [rawMarketItems, setRawMarketItems] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
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
                  coverPhoto: profile.cover_url,
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

  // --- DERIVED DATA ---
  const posts = useMemo(() => {
    return rawPosts.map(p => ({
      ...p,
      hasLiked: p.likesData?.some(l => l.user_id === user?.id),
      isSaved: savedItems.some(s => String(s.item_id) === String(p.id) && s.item_type === 'post')
    }));
  }, [rawPosts, user?.id, savedItems]);

  const marketItems = useMemo(() => {
    return rawMarketItems.map(m => ({
      ...m,
      isSaved: savedItems.some(s => String(s.item_id) === String(m.id) && s.item_type === 'market')
    }));
  }, [rawMarketItems, savedItems]);

  // --- DATABASE FETCHERS ---

  const fetchPosts = useCallback(async () => {
    const { data: pData } = await supabase
      .from('posts')
      .select('*, profiles(id, full_name, avatar_url, neighborhood), comments(*, profiles(id, full_name)), likes(user_id)')
      .order('created_at', { ascending: false });

    if (pData) {
      setRawPosts(pData.map(p => ({
        id: p.id,
        author: p.profiles?.full_name,
        location: p.location,
        content: p.content,
        time: formatTimeAgo(p.created_at),
        type: p.post_type,
        category: p.category,
        likes: p.likes?.length || 0,
        likesData: p.likes || [],
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
      })));
    }
  }, []);

  const fetchMarketItems = useCallback(async () => {
    const { data: mData } = await supabase
      .from('market_items')
      .select('*, profiles(id, full_name, avatar_url, neighborhood)')
      .order('created_at', { ascending: false });

    if (mData) {
      setRawMarketItems(mData.map(m => ({
        id: m.id, author: m.profiles?.full_name, title: m.title, price: m.price,
        category: m.category, condition: m.condition, location: m.location,
        image: m.image_url, isSold: m.is_sold, time: formatTimeAgo(m.created_at), user_id: m.user_id,
        coords: m.coords,
        description: m.description, seller: m.profiles
      })));
    }
  }, []);

  const fetchChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data: mRes, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(id, full_name, avatar_url, neighborhood, karma), receiver:profiles!receiver_id(id, full_name, avatar_url, neighborhood, karma)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (mRes) {
        const chatMap = {};
        mRes.forEach(m => {
          const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
          const otherProfile = m.sender_id === user.id ? m.receiver : m.sender;

          if (!chatMap[otherId] && otherProfile) {
            chatMap[otherId] = {
              id: otherId,
              name: otherProfile.full_name || 'Neighbor',
              avatar: otherProfile.avatar_url,
              neighborhood: otherProfile.neighborhood,
              karma: otherProfile.karma,
              lastMsg: '',
              hasUnread: false,
              messages: []
            };
          }

          if (chatMap[otherId]) {
            const isMe = m.sender_id === user.id;
            // Check if unread column exists in response, fallback to false
            const isUnread = m.unread === true || m.is_read === false;

            chatMap[otherId].messages.push({
              id: m.id,
              text: m.content,
              sender: isMe ? 'me' : 'them',
              time: m.created_at,
              unread: isUnread
            });
            chatMap[otherId].lastMsg = m.content;
            if (!isMe && isUnread) {
                chatMap[otherId].hasUnread = true;
            }
          }
        });
        setChats(Object.values(chatMap).sort((a, b) => {
          const aLast = a.messages[a.messages.length - 1]?.time || 0;
          const bLast = b.messages[b.messages.length - 1]?.time || 0;
          return new Date(bLast) - new Date(aLast);
        }));
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data: notifyRes, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (notifyRes) {
        setNotifications(notifyRes.map(n => ({
          id: n.id,
          text: n.content,
          unread: n.unread,
          time: formatTimeAgo(n.created_at)
        })));
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user?.id]);

  const fetchSavedItems = useCallback(async () => {
    if (!user?.id) return;
    const { data: sData } = await supabase.from('saved_items').select('*').eq('user_id', user.id);
    if (sData) setSavedItems(sData);
  }, [user?.id]);

  const fetchAllUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, neighborhood, karma, initials');
    if (data) setAllUsers(data);
  }, []);

  const fetchGroups = useCallback(async () => {
    const [groupsRes, myGroupsRes] = await Promise.all([
      supabase.from('groups').select('*'),
      user?.id ? supabase.from('group_members').select('group_id').eq('user_id', user.id) : Promise.resolve({ data: [] })
    ]);

    const joinedGroupIds = (myGroupsRes.data || []).map(g => g.group_id);
    setUserGroups(joinedGroupIds);

    setGroups((groupsRes.data || []).map(g => ({
      ...g,
      isJoined: joinedGroupIds.includes(g.id),
      recentActivity: 0
    })));
  }, [user?.id]);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, karma, neighborhood, initials')
      .order('karma', { ascending: false })
      .limit(5);
    if (data) setLeaderboard(data);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setDbStatus('fetching');
      await Promise.all([
        fetchPosts(),
        fetchMarketItems(),
        fetchLeaderboard(),
        fetchNotifications(),
        fetchGroups(),
        fetchSavedItems(),
        fetchChats(),
        fetchAllUsers()
      ]);
      setDbStatus('online');
    } catch (err) {
      console.error('❌ Sync error:', err);
      setDbStatus('offline');
    }
  }, [fetchPosts, fetchMarketItems, fetchLeaderboard, fetchNotifications, fetchGroups, fetchSavedItems, fetchChats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- REALTIME SUBSCRIPTION ---
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_items' }, () => fetchMarketItems())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
          console.log('🔔 NEW NOTIFICATION RECEIVED:', payload);
          if (payload.new.user_id === user.id) {
              fetchNotifications();
              addToast('New neighborhood activity! 🔔', 'info');
          }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          console.log('📩 NEW MESSAGE RECEIVED:', payload);
          // Only refetch if the current user is part of the conversation
          if (payload.new.receiver_id === user.id || payload.new.sender_id === user.id) {
              fetchChats();
              if (payload.new.receiver_id === user.id) {
                  addToast('New message received! 💬', 'info');
              }
          }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => fetchGroups())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => fetchGroups())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
          if (payload.new.id === user.id) {
              const p = payload.new;
              setUser(prev => ({
                  ...prev,
                  name: p.full_name,
                  neighborhood: p.neighborhood,
                  karma: p.karma,
                  avatar: p.avatar_url,
                  coverPhoto: p.cover_url,
                  bio: p.bio
              }));
          }
          fetchLeaderboard();
          fetchAllUsers();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, (payload) => {
          if (payload.new.user_id === user.id) fetchNotifications();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchPosts())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setDbStatus('online');
      });

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchChats, fetchPosts, fetchMarketItems, fetchNotifications, addToast]);

  const trendingZone = useMemo(() => {
    if (!rawPosts.length) return 'Cebu City';
    const counts = {};
    rawPosts.forEach(p => { if (p.location) counts[p.location] = (counts[p.location] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Cebu City';
  }, [rawPosts]);

  // --- WRITERS (With fallbacks to fetch) ---
  const createPost = async (postObj) => {
    if (!user) return;
    const { cleaned, isToxic } = cleanText(postObj.content);
    if (isToxic && addToast) addToast('Please keep our community friendly!', 'info');

    const { data, error } = await supabase.from('posts').insert([{
        user_id: user.id,
        content: cleaned,
        location: postObj.location,
        category: postObj.category,
        post_type: postObj.type,
        image_url: postObj.image,
        event_date: postObj.eventDate,
        poll_options: postObj.pollOptions ? postObj.pollOptions.filter(o => o.trim()).map((o, i) => ({ id: i, text: o, votes: 0 })) : null,
        group_id: postObj.groupId
    }]).select();
    if (!error) fetchPosts();
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
    if (!error) fetchMarketItems();
    return { data, error };
  };

  const handleLike = async (postId) => {
    if (!user) return;
    const post = rawPosts.find(p => p.id === postId);
    const isLiking = !post?.likesData?.some(l => l.user_id === user.id);

    // Optimistic Update
    setRawPosts(prev => prev.map(p => {
        if (p.id === postId) {
            return {
                ...p,
                likes: isLiking ? p.likes + 1 : Math.max(0, p.likes - 1),
                likesData: isLiking
                    ? [...p.likesData, { user_id: user.id }]
                    : p.likesData.filter(l => l.user_id !== user.id)
            };
        }
        return p;
    }));

    if (isLiking) {
        await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);

        if (post && post.user_id !== user.id) {
            await supabase.rpc('increment_karma', { user_id: post?.user_id, amount: 1 });
            await supabase.from('notifications').insert([{
                user_id: post.user_id,
                content: `${user.name} liked your post: "${post.content.substring(0, 20)}..."`,
                unread: true
            }]);
        }
    } else {
        await supabase.from('likes').delete().match({ post_id: postId, user_id: user.id });
    }
    // Realtime listener will handle the final sync
  };

  const handleAddComment = async (postId, content) => {
    if (!user || !content.trim()) return;
    const { cleaned } = cleanText(content);

    // Optimistic Update
    const tempId = Date.now();
    setRawPosts(prev => prev.map(p => {
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

    if (!error) {
        await supabase.rpc('increment_karma', { user_id: user.id, amount: 2 });

        const post = rawPosts.find(p => p.id === postId);
        if (post && post.user_id !== user.id) {
            await supabase.from('notifications').insert([{
                user_id: post.user_id,
                content: `${user.name} commented on your post: "${cleaned.substring(0, 20)}..."`,
                unread: true
            }]);
        }
    } else {
        // Rollback on error
        fetchPosts();
    }
  };

  const handleMarkSold = async (itemId) => {
    if (!user) return;
    const item = rawMarketItems.find(i => i.id === itemId);
    const { error } = await supabase.from('market_items').update({ is_sold: !item.isSold }).eq('id', itemId);
    if (!error) fetchMarketItems();
  };

  const toggleSaveItem = async (id, type) => {
      if (!user) return;
      const isSaved = savedItems.some(s => String(s.item_id) === String(id) && s.item_type === type);
      if (isSaved) {
          await supabase.from('saved_items').delete().match({ user_id: user.id, item_id: id, item_type: type });
      } else {
          await supabase.from('saved_items').insert([{ user_id: user.id, item_id: id, item_type: type }]);
      }
      fetchSavedItems();
  };

  const handleSendMessage = async (receiverId, content) => {
    if (!user || !content.trim()) return;
    const { cleaned } = cleanText(content);

    // Attempting to send with unread tracking (trying both common column names)
    let payload = {
        sender_id: user.id,
        receiver_id: receiverId,
        content: cleaned,
        unread: true,
        is_read: false
    };

    let { error } = await supabase.from('messages').insert([payload]);

    // If it fails because of extra columns, try the most basic insert
    if (error && (error.code === '42703' || error.message?.includes('column'))) {
        const fallbackPayload = {
            sender_id: user.id,
            receiver_id: receiverId,
            content: cleaned
        };
        const retry = await supabase.from('messages').insert([fallbackPayload]);
        error = retry.error;
    }

    if (!error) {
        // Create a notification for the receiver
        await supabase.from('notifications').insert([{
            user_id: receiverId,
            content: `New message from ${user.name}: "${cleaned.substring(0, 20)}..."`,
            unread: true
        }]);
        fetchChats();
    } else {
        console.error('Final Error sending message:', error);
        addToast('Failed to send message', 'error');
    }
  };

  const handleVote = async (postId, optionId) => {
    if (!user) return;
    const post = rawPosts.find(p => p.id === postId);
    if (!post || !post.pollOptions) return;
    const newOptions = post.pollOptions.map(opt => {
        if (opt.id === optionId) return { ...opt, votes: (opt.votes || 0) + 1 };
        return opt;
    });
    const { error } = await supabase.from('posts').update({ poll_options: newOptions }).eq('id', postId);
    if (!error) fetchPosts();
  };

  const handleJoinEvent = async (postId) => {
    if (!user) return;
    const post = rawPosts.find(p => p.id === postId);
    await supabase.rpc('increment_karma', { user_id: user.id, amount: 5 });

    // Notify post owner
    if (post && post.user_id !== user.id) {
        await supabase.from('notifications').insert([{
            user_id: post.user_id,
            content: `${user.name} is joining your event: "${post.content.substring(0, 20)}..."`,
            unread: true
        }]);
    }
    fetchPosts();
  };

  const markNotificationsAsRead = async () => {
    if (!user || notifications.filter(n => n.unread).length === 0) return;

    // Optimistic local update
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ unread: false })
        .eq('user_id', user.id)
        .eq('unread', true);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      // Rollback on error
      fetchNotifications();
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) return;
    await supabase.from('group_members').insert([{ group_id: groupId, user_id: user.id }]);
    fetchGroups();
  };

  const handleLeaveGroup = async (groupId) => {
    if (!user) return;
    await supabase.from('group_members').delete().match({ group_id: groupId, user_id: user.id });
    fetchGroups();
  };

  const createGroup = async (groupObj) => {
    if (!user) return;
    const { data, error } = await supabase.from('groups').insert([{
        name: groupObj.name,
        description: groupObj.description,
        image: groupObj.image,
        members: 1
    }]).select();

    if (!error && data?.[0]) {
        await supabase.from('group_members').insert([{ group_id: data[0].id, user_id: user.id }]);
        fetchGroups();
    }
    return { data, error };
  };

  const handleReport = async (itemId, type, reason = 'Community standards') => {
    if (!user) return;
    await supabase.from('reports').insert([{ user_id: user.id, target_id: itemId, target_type: type, reason: reason }]);
  };

  const handleDeleteMarketItem = async (id) => {
    if (!user) return;
    const { error } = await supabase.from('market_items').delete().eq('id', id);
    if (!error) fetchMarketItems();
  };

  const handleDeletePost = async (id) => {
    if (!user) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) fetchPosts();
  };

  const updateMarketItem = async (id, updates) => {
    if (!user) return;
    const { error } = await supabase
        .from('market_items')
        .update({
            title: updates.title,
            price: updates.price,
            category: updates.category,
            condition: updates.condition,
            location: updates.location,
            image_url: updates.image,
            description: updates.description
        })
        .eq('id', id);
    if (!error) fetchMarketItems();
    return { error };
  };

  const markMessagesAsRead = async (otherId) => {
    if (!user || !otherId) return;

    // Try updating 'unread' column
    const { error } = await supabase
        .from('messages')
        .update({ unread: false })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherId)
        .eq('unread', true);

    // If column doesn't exist, we just ignore the error as highlights won't work anyway
    if (!error) fetchChats();
  };

  return {
    user, setUser, posts, marketItems, allUsers,
    groups, userGroups, notifications, setNotifications, chats, dbStatus, loading,
    leaderboard,
    createPost, createMarketItem, handleLike, handleAddComment, handleMarkSold,
    handleVote, handleJoinEvent, toggleSaveItem, handleSendMessage, markNotificationsAsRead,
    markMessagesAsRead,
    handleJoinGroup, handleLeaveGroup, handleReport, handleDeleteMarketItem,
    handleDeletePost, updateMarketItem, createGroup,
    fetchGroupMembers: async (groupId) => {
        const { data, error } = await supabase
            .from('group_members')
            .select('profiles(id, full_name, avatar_url, neighborhood, karma)')
            .eq('group_id', groupId);
        return { data: data?.map(d => d.profiles) || [], error };
    },
    trendingZone,
    trendingGroups: (() => {
        if (!groups.length) return [];
        return [...groups].sort((a, b) => (b.members || 0) - (a.members || 0)).slice(0, 3);
    })(),
    calculateDistance: (coords) => calcDist({ lat: 10.33, lng: 123.89 }, coords),
    fetchData
  };
}
