'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send, User, CheckCheck, MessageCircle, Search, Image as ImageIcon,
  Smile, MoreVertical, Trash2, Flag, MapPin, X, Loader2,
  ArrowLeft, Phone, Video, Info, Pin, BellOff, UserPlus,
  Paperclip, Mic, Heart, Reply, Copy, Bookmark
} from 'lucide-react';
import { uploadImage } from '../lib/utils';

export default function Messages({ chats, activeChat, activeChatProfile, onSendMessage, onSelectChat, onDeleteChat, addToast }) {
  const [text, setText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [readTimestamps, setReadTimestamps] = useState({});
  const [mutedChats, setMutedChats] = useState({});
  const [disabledNotifs, setDisabledNotifs] = useState({});
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['👋', '🙌', '🤝', '👍', '😊', '📍', '🛵', '🏠', '🥘', '✅'];

  // 1. Helpers First
  const isImage = (word) => {
    if (!word || typeof word !== 'string') return false;
    return word.startsWith('http') && (/\.(jpeg|jpg|gif|png|webp|avif|svg)/i.test(word) || word.includes('supabase.co/storage'));
  };

  const handleComingSoon = (feature) => {
    addToast(`${feature} is coming soon! 🚀`, 'info');
  };

  // 2. Core Data Resolution
  const displayChats = useMemo(() => {
    let list = chats.map(c => ({
      ...c,
      lastMsg: c.lastMsg?.includes('supabase.co/storage') ? '📷 Sent an image' : c.lastMsg
    }));

    if (activeChat && activeChatProfile && !chats.some(c => c.id === activeChat)) {
        list = [{
            id: activeChat,
            name: activeChatProfile.name,
            avatar: activeChatProfile.avatar,
            lastMsg: 'Starting new chat...',
            messages: []
        }, ...list];
    }

    if (searchTerm) {
      return list.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             c.lastMsg.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return list;
  }, [chats, activeChat, activeChatProfile, searchTerm]);

  const currentChat = chats.find(c => c.id === activeChat);
  const displayChat = useMemo(() => {
    return currentChat || (activeChat && activeChatProfile ? {
      id: activeChat,
      name: activeChatProfile.name,
      avatar: activeChatProfile.avatar,
      neighborhood: activeChatProfile.neighborhood,
      karma: activeChatProfile.karma,
      messages: []
    } : null);
  }, [currentChat, activeChat, activeChatProfile]);

  // 3. Handlers
  const handleMute = () => {
    setMutedChats(prev => ({ ...prev, [activeChat]: !prev[activeChat] }));
    addToast(mutedChats[activeChat] ? 'Chat unmuted' : 'Chat muted', 'info');
  };

  const handleToggleNotifs = () => {
    setDisabledNotifs(prev => ({ ...prev, [activeChat]: !prev[activeChat] }));
    addToast(disabledNotifs[activeChat] ? 'Notifications enabled' : 'Notifications disabled', 'info');
  };

  const handleBlock = () => {
    if (confirm(`Are you sure you want to block ${displayChat?.name}?`)) {
        addToast('User blocked successfully', 'success');
        onSelectChat(null);
    }
  };

  const handleReport = () => {
    addToast('Chat reported to safety team', 'info');
  };

  const sharedMedia = useMemo(() => {
    if (!displayChat?.messages) return [];
    return displayChat.messages
        .map(m => {
            const words = (m.text || '').split(/\s+/);
            return words.filter(w => isImage(w));
        })
        .flat()
        .reverse();
  }, [displayChat?.messages]);

  const getLastActivity = (chat) => {
    if (!chat?.messages?.length) return null;
    return chat.messages.reduce((latest, message) => {
      const time = new Date(message.time).getTime();
      if (isNaN(time)) return latest;
      return !latest || time > latest ? time : latest;
    }, null);
  };

  const formatActivityLabel = (chat) => {
    const last = getLastActivity(chat);
    if (!last) return chat?.lastMsg === 'Starting new chat...' ? 'Online' : 'Offline';
    const diff = Date.now() - last;
    if (diff < 5 * 60 * 1000) return 'Active now';
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `Active ${minutes}m ago`;
    return `Active ${Math.round(minutes / 60)}h ago`;
  };

  const activeChatStatus = displayChat ? formatActivityLabel(displayChat) : '';

  // 4. Effects
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayChat?.messages?.length, isOtherTyping]);

  // Real-time Typing Simulation
  useEffect(() => {
    if (activeChat) {
        setShowInfo(true);
        if (displayChat && !isOtherTyping) {
            setIsOtherTyping(true);
            const timer = setTimeout(() => setIsOtherTyping(false), 2500);
            return () => clearTimeout(timer);
        }
    }
  }, [activeChat]);

  const handleSend = () => {
    const trimmedText = text.trim();
    if ((!trimmedText && !pendingImage) || !activeChat) return;
    const messageContent = pendingImage ? (trimmedText ? `${trimmedText} ${pendingImage}` : pendingImage) : trimmedText;
    onSendMessage(activeChat, messageContent);
    setText('');
    setPendingImage(null);
    setShowEmojiPicker(false);
    setTimeout(scrollToBottom, 100);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsUploading(true);
        const url = await uploadImage(file);
        if (url) setPendingImage(url);
        setIsUploading(false);
    }
  };

  const groupedMessages = useMemo(() => {
    if (!displayChat?.messages) return [];
    const groups = [];
    let currentGroup = null;

    displayChat.messages.forEach((msg, idx) => {
        const msgTime = new Date(msg.time);
        const prevMsg = displayChat.messages[idx - 1];

        // Add date separator if it's a new day
        const isNewDay = !prevMsg || new Date(prevMsg.time).toDateString() !== msgTime.toDateString();
        if (isNewDay) {
            groups.push({ type: 'date', date: msgTime.toDateString() });
        }

        const isSameSender = prevMsg && prevMsg.sender === msg.sender;
        const isCloseInTime = prevMsg && (msgTime - new Date(prevMsg.time)) < 5 * 60 * 1000;

        if (!isNewDay && isSameSender && isCloseInTime) {
            currentGroup.messages.push(msg);
        } else {
            currentGroup = {
                type: 'message-group',
                sender: msg.sender,
                messages: [msg],
                time: msg.time
            };
            groups.push(currentGroup);
        }
    });
    return groups;
  }, [displayChat?.messages]);

  const renderMessageContent = (msgText, isMe) => {
    if (!msgText) return null;
    const words = msgText.split(/\s+/);
    const imageUrls = words.filter(w => isImage(w));
    const textContent = words.filter(w => !isImage(w)).join(' ');

    return (
      <div className="space-y-3">
        {textContent && <p className="whitespace-pre-wrap break-words text-[15px] md:text-[16px] leading-relaxed font-medium">{textContent}</p>}
        {imageUrls.map((url, idx) => (
          <img key={idx} src={url} alt="Shared content" className="max-w-full rounded-2xl border border-black/5 dark:border-white/5 shadow-md cursor-zoom-in hover:opacity-95 transition-opacity" onClick={() => window.open(url, '_blank')} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full transition-all duration-500 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar - Modern List */}
      <div className={`w-full md:w-[320px] lg:w-[400px] border-r flex flex-col bg-gray-50/20 dark:bg-zinc-950/20 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black text-main uppercase italic tracking-tighter">Inbox</h2>
                <div className="flex gap-2">
                    <div onClick={() => handleComingSoon('New Chat')} className="p-2.5 bg-gray-100 dark:bg-zinc-900 text-main rounded-xl cursor-pointer hover:bg-primary-600 hover:text-white transition-all">
                        <UserPlus size={18} />
                    </div>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full bg-white dark:bg-zinc-900 border rounded-2xl py-3 pl-11 pr-4 text-[13px] font-bold outline-none focus:ring-2 focus:ring-primary-600/20 transition-all shadow-sm"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 no-scrollbar">
            {displayChats.length > 0 ? displayChats.map(chat => (
                <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 group ${activeChat === chat.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'hover:bg-white dark:hover:bg-zinc-900 text-main'}`}
                >
                    <div className="relative flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 ${activeChat === chat.id ? 'border-white/20' : 'border-transparent'}`}>
                            {chat.avatar ? <img src={chat.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary-100 dark:bg-zinc-800 flex items-center justify-center text-primary-600 font-black text-xl">{chat.name[0]}</div>}
                        </div>
                        {formatActivityLabel(chat) === 'Active now' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-zinc-950 rounded-full"></div>
                        )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="font-black text-[14px] uppercase truncate">{chat.name}</span>
                            <span className={`text-[10px] font-bold ${activeChat === chat.id ? 'text-white/60' : 'text-muted'}`}>
                                {chat.messages?.length > 0 ? new Date(chat.messages[chat.messages.length-1].time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                        </div>
                        <p className={`text-[12px] truncate font-medium ${activeChat === chat.id ? 'text-white/80' : 'text-muted'}`}>
                            {chat.lastMsg}
                        </p>
                    </div>
                </button>
            )) : (
                <div className="p-10 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No conversations found</p>
                </div>
            )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-950 relative ${activeChat ? 'flex' : 'hidden md:flex'}`}>
        {activeChat ? (
            <>
                {/* Chat Header */}
                <div className="p-4 md:px-8 md:py-4 border-b flex items-center justify-between backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => onSelectChat(null)} className="md:hidden p-2 text-muted hover:text-main"><ArrowLeft size={20}/></button>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowInfo(!showInfo)}>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary-600 overflow-hidden shadow-lg shadow-primary-500/20">
                                {displayChat?.avatar ? <img src={displayChat.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">{displayChat?.name?.[0]}</div>}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-main uppercase tracking-widest leading-none mb-1">{displayChat?.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${activeChatStatus === 'Active now' ? 'bg-green-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'}`}></div>
                                    <span className="text-[9px] font-black uppercase text-muted tracking-widest">{activeChatStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => handleComingSoon('Voice Calls')} className="p-2.5 text-muted hover:text-primary-600 transition-all rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900"><Phone size={18}/></button>
                        <button onClick={() => handleComingSoon('Video Calls')} className="p-2.5 text-muted hover:text-primary-600 transition-all rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900"><Video size={18}/></button>
                        <button onClick={() => setShowInfo(!showInfo)} className={`p-2.5 transition-all rounded-xl ${showInfo ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-muted hover:text-main hover:bg-gray-50 dark:hover:bg-zinc-900'}`}><Info size={18}/></button>
                        <button onClick={() => setShowActions(!showActions)} className="p-2.5 text-muted hover:text-main rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900"><MoreVertical size={18}/></button>
                    </div>
                </div>

                {/* Messages Container */}
                <div
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 bg-gray-50/10 scroll-smooth"
                >
                    {groupedMessages.map((item, idx) => {
                        if (item.type === 'date') {
                            return (
                                <div key={`date-${idx}`} className="flex justify-center my-6">
                                    <span className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-900 text-[9px] font-black text-muted uppercase tracking-[0.2em] rounded-full">
                                        {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            );
                        }

                        const group = item;
                        return (
                            <div key={idx} className={`flex flex-col ${group.sender === 'me' ? 'items-end' : 'items-start'} group/row`}>
                                <div className={`space-y-0.5 max-w-[85%] md:max-w-[70%] flex flex-col ${group.sender === 'me' ? 'items-end' : 'items-start'}`}>
                                    {group.messages.map((m, mIdx) => {
                                        const isFirst = mIdx === 0;
                                        const isLast = mIdx === group.messages.length - 1;
                                        return (
                                            <div
                                                key={mIdx}
                                                className={`relative group/msg px-5 py-3.5 transition-all ${
                                                    group.sender === 'me'
                                                    ? `bg-primary-600 text-white ${isFirst ? 'rounded-t-[1.5rem] rounded-bl-[1.5rem]' : 'rounded-l-[1.5rem]'} ${isLast ? 'rounded-b-[1.5rem]' : ''} ${!isFirst && !isLast ? 'rounded-l-[1.5rem]' : ''}`
                                                    : `bg-white dark:bg-zinc-900 border text-main ${isFirst ? 'rounded-t-[1.5rem] rounded-br-[1.5rem]' : 'rounded-r-[1.5rem]'} ${isLast ? 'rounded-b-[1.5rem]' : ''} ${!isFirst && !isLast ? 'rounded-r-[1.5rem]' : ''}`
                                                } hover:brightness-95 shadow-md`}
                                            >
                                                {renderMessageContent(m.text, group.sender === 'me')}

                                                {/* Hover actions */}
                                                <div className={`absolute top-1/2 -translate-y-1/2 ${group.sender === 'me' ? '-left-14' : '-right-14'} opacity-0 group-hover/msg:opacity-100 transition-all flex items-center gap-1 z-10`}>
                                                    <button className="p-1.5 text-muted hover:text-primary-600 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border"><Heart size={10}/></button>
                                                    <button className="p-1.5 text-muted hover:text-primary-600 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border"><Reply size={10}/></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <span className="text-[8px] font-black text-muted uppercase tracking-widest mt-1.5 px-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    {new Date(group.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {group.sender === 'me' && ' • Seen'}
                                </span>
                            </div>
                        );
                    })}

                    {isOtherTyping && (
                        <div className="flex items-center gap-2 text-muted animate-pulse py-2">
                            <div className="flex gap-1 bg-gray-100 dark:bg-zinc-900 px-3 py-2 rounded-2xl rounded-bl-none border">
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Scroll to Bottom Button */}
                {showScrollBottom && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-32 right-8 p-3 bg-white dark:bg-zinc-900 border shadow-2xl rounded-full text-primary-600 animate-bounce z-30 hover:scale-110 transition-all"
                    >
                        <ArrowLeft className="-rotate-90" size={20} />
                    </button>
                )}

                {/* Input Section */}
                <div className="p-4 md:p-6 border-t bg-white dark:bg-zinc-950">
                    {pendingImage && (
                        <div className="mb-4 flex items-center gap-3 animate-slide-up">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary-600/20 shadow-xl group">
                                <img src={pendingImage} className="w-full h-full object-cover" />
                                <button onClick={() => setPendingImage(null)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><X size={20}/></button>
                            </div>
                            <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Image ready to send</div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="flex items-center">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <button onClick={() => fileInputRef.current.click()} className="p-3 text-muted hover:text-primary-600 transition-all rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900"><Paperclip size={20}/></button>
                            <button className="hidden sm:block p-3 text-muted hover:text-primary-600 transition-all rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900"><Mic size={20}/></button>
                        </div>

                        <div className="flex-1 relative">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="w-full bg-gray-50 dark:bg-zinc-900 rounded-2xl py-4 px-6 pr-12 text-[15px] font-medium outline-none border-2 border-transparent focus:border-primary-600/20 transition-all shadow-inner"
                            />
                            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-primary-600 transition-all"><Smile size={22}/></button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-4 p-4 bg-white dark:bg-zinc-900 border rounded-3xl shadow-2xl flex flex-wrap gap-2 w-56 z-30 animate-slide-up">
                                    {emojis.map(e => <button key={e} onClick={() => setText(t => t+e)} className="text-xl hover:scale-125 transition-transform p-1">{e}</button>)}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={!text.trim() && !pendingImage}
                            className="p-3.5 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            <Send size={20}/>
                        </button>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 p-10 text-center">
                <div className="w-24 h-24 rounded-[3rem] bg-gray-100 dark:bg-zinc-900 flex items-center justify-center mb-8 rotate-12">
                    <MessageCircle size={48} className="text-muted" />
                </div>
                <h3 className="text-sm font-black text-main uppercase tracking-[0.3em]">Your Inbox</h3>
                <p className="text-[10px] font-bold text-muted uppercase mt-4 max-w-[200px] leading-relaxed">Select a conversation to start chatting with your neighbors.</p>
            </div>
        )}
      </div>

      {/* Info Sidebar (Hidden by default) */}
      {showInfo && activeChat && (
          <div className="hidden lg:flex w-[300px] border-l flex-col animate-slide-left bg-white dark:bg-zinc-950">
              <div className="p-8 flex flex-col items-center text-center border-b">
                  <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden mb-6 shadow-2xl border-4 border-primary-600/10">
                      {displayChat?.avatar ? <img src={displayChat.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-2xl font-black text-primary-600">{displayChat?.name?.[0]}</div>}
                  </div>
                  <h3 className="font-black text-lg text-main uppercase tracking-tighter italic">{displayChat?.name}</h3>
                  <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-2">{displayChat?.neighborhood || 'Cebu City'}</p>

                  <div className="flex gap-2 mt-8">
                      <button
                        onClick={() => window.location.href = `/profile/${displayChat.id}`}
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-primary-600 transition-all border"
                      >
                        Profile
                      </button>
                      <button
                        onClick={handleMute}
                        className={`flex-1 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${mutedChats[activeChat] ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 dark:bg-zinc-900 text-muted hover:text-primary-600'}`}
                      >
                        {mutedChats[activeChat] ? 'Unmute' : 'Mute'}
                      </button>
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                  <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase text-muted tracking-widest px-2">Privacy & Support</h4>
                      <div className="space-y-1">
                          {[
                              { label: disabledNotifs[activeChat] ? 'Enable Notifs' : 'Mute Notifs', icon: <BellOff size={14}/>, action: handleToggleNotifs },
                              { label: 'Block User', icon: <Trash2 size={14}/>, color: 'text-red-500', action: handleBlock },
                              { label: 'Report Chat', icon: <Flag size={14}/>, color: 'text-red-500', action: handleReport }
                          ].map(item => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-[10px] font-bold uppercase transition-all ${item.color || 'text-main'}`}
                              >
                                  {item.icon} {item.label}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-[9px] font-black uppercase text-muted tracking-widest">Shared Media</h4>
                        <span className="text-[8px] font-bold text-muted uppercase">{sharedMedia.length} Items</span>
                      </div>
                      {sharedMedia.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2 px-1">
                            {sharedMedia.map((url, i) => (
                                <div
                                    key={i}
                                    onClick={() => window.open(url, '_blank')}
                                    className="aspect-square bg-gray-100 dark:bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border"
                                >
                                    <img src={url} className="w-full h-full object-cover" alt="shared" />
                                </div>
                            ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center bg-gray-50/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed">
                            <ImageIcon size={20} className="mx-auto text-muted/30 mb-2" />
                            <p className="text-[8px] font-black uppercase text-muted/50 tracking-widest">No media yet</p>
                        </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
