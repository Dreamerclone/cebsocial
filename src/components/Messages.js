'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, User, CheckCheck, MessageCircle, Search, Image as ImageIcon, Smile, MoreVertical, Trash2, Flag, MapPin, X, Loader2, ArrowLeft, Phone, Video } from 'lucide-react';
import { uploadImage } from '../lib/utils';

export default function Messages({ chats, activeChat, activeChatProfile, onSendMessage, onSelectChat, onDeleteChat }) {
  const [text, setText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [readTimestamps, setReadTimestamps] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['👋', '🙌', '🤝', '👍', '😊', '📍', '🛵', '🏠', '🥘', '✅'];

  // Combine existing chats with the phantom "activeChatProfile" if it doesn't exist yet
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
    if (!last) {
      if (chat?.lastMsg === 'Starting new chat...') return 'New conversation';
      return 'No recent activity';
    }

    const diff = Date.now() - last;
    if (diff < 5 * 60 * 1000) return 'Active now';
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `Active ${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    return `Active ${hours}h ago`;
  };

  const activeChatStatus = displayChat ? formatActivityLabel(displayChat) : '';

  const getLastRead = (chatId) => readTimestamps[chatId] || 0;
  const hasUnread = (chat) => {
    const lastActivity = getLastActivity(chat);
    return lastActivity && lastActivity > getLastRead(chat.id);
  };
  const unreadCount = displayChats.filter(hasUnread).length;

  useEffect(() => {
    if (!activeChat || !displayChat) return;
    const lastActivity = getLastActivity(currentChat || displayChat) || Date.now();
    setReadTimestamps(prev => ({ ...prev, [activeChat]: lastActivity }));
  }, [activeChat, currentChat?.messages?.length, displayChat]);

  // --- TYPING INDICATOR SIMULATION ---
  useEffect(() => {
    if (activeChat && displayChat) {
        setIsOtherTyping(true);
        const timer = setTimeout(() => setIsOtherTyping(false), 3000);
        return () => clearTimeout(timer);
    }
  }, [activeChat, displayChat]);

  // --- AUTO-SCROLL LOGIC ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if ((currentChat || displayChat)?.messages) {
      scrollToBottom();
    }
  }, [currentChat?.messages, displayChat?.messages, isOtherTyping]);

  // --- SOUND LOGIC (Simulated with AudioContext) ---
  const playSendSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5 note
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio not supported or blocked");
    }
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

  // Handle empty text on send and add trim
  const handleSend = () => {
    const trimmedText = text.trim();
    if ((!trimmedText && !pendingImage) || !activeChat) return;

    // If there's an image, we send it either as a separate message or concatenated
    // For now, let's assume onSendMessage can handle a string.
    // If it's an image, we might send the URL.
    const messageContent = pendingImage ? (trimmedText ? `${trimmedText} ${pendingImage}` : pendingImage) : trimmedText;

    onSendMessage(activeChat, messageContent);
    playSendSound();
    setText('');
    setPendingImage(null);
    setShowEmojiPicker(false);
  };

  const renderMessageContent = (msgText) => {
    if (!msgText) return null;

    const isImage = (word) => {
      if (!word || typeof word !== 'string') return false;
      const isUrl = word.startsWith('http');
      const hasImageExt = /\.(jpeg|jpg|gif|png|webp|avif|svg)/i.test(word);
      const isSupabase = word.includes('supabase.co/storage');
      return isUrl && (hasImageExt || isSupabase);
    };

    const words = msgText.split(/\s+/);
    const imageUrls = words.filter(w => isImage(w));
    const textContent = words.filter(w => !isImage(w)).join(' ');

    return (
      <div className="space-y-3">
        {textContent && <p className="whitespace-pre-wrap break-words">{textContent}</p>}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-1 gap-2 mt-2">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 shadow-inner bg-gray-50 dark:bg-slate-800">
                <img
                  src={url}
                  alt="shared"
                  className="max-w-full max-h-80 w-auto h-auto object-contain cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => window.open(url, '_blank')}
                  onError={(e) => {
                      e.target.style.display = 'none';
                      const link = document.createElement('a');
                      link.href = url;
                      link.target = '_blank';
                      link.className = 'text-[10px] text-blue-500 underline p-2 block';
                      link.innerText = 'View Attachment';
                      e.target.parentNode.appendChild(link);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-500">
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat List */}
        <div className={`w-full md:w-[320px] lg:w-[380px] border-r border-gray-50 dark:border-slate-800 flex flex-col overflow-hidden bg-gray-50/20 dark:bg-slate-950/20 transition-all duration-300 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-6 px-2">
                <div>
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Inbox</h3>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">{displayChats.length} conversations</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${unreadCount > 0 ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                        {unreadCount > 0 ? `${unreadCount} new` : 'Up to date'}
                    </span>
                </div>
            </div>

            <div className="relative mb-4 group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-blue-500' : 'text-gray-400'}`} size={14} />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search neighbor..."
                  className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all shadow-sm"
                />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4 space-y-1">
            {displayChats.length > 0 ? displayChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center space-x-3 p-4 rounded-[1.8rem] transition-all duration-300 group button-pop ${activeChat === chat.id ? 'bg-white dark:bg-slate-800 shadow-xl shadow-blue-100/20 dark:shadow-none scale-[1.02] ring-1 ring-black/5 dark:ring-white/5' : 'hover:bg-white/50 dark:hover:bg-slate-800/50 hover:translate-x-1'}`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm overflow-hidden shadow-inner transition-transform group-hover:rotate-3`}>
                    {chat.avatar ? <img src={chat.avatar} className="w-full h-full object-cover" /> : chat.name[0]}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white dark:border-slate-900 rounded-full ${getLastActivity(chat) && Date.now() - getLastActivity(chat) < 10 * 60 * 1000 ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-[11px] truncate text-gray-900 dark:text-slate-100 uppercase tracking-tight">{chat.name}</p>
                    <span className="text-[8px] font-bold text-gray-400 whitespace-nowrap">
                        {chat.messages?.length > 0 ? new Date(chat.messages[chat.messages.length-1].time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-[10px] truncate font-medium flex-1 ${hasUnread(chat) ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400'}`}>
                        {chat.lastMsg}
                    </p>
                    {hasUnread(chat) && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 flex-shrink-0 shadow-lg shadow-blue-200"></div>
                    )}
                  </div>
                </div>
              </button>
            )) : (
              <div className="text-center py-20 opacity-20 flex flex-col items-center">
                <MessageCircle size={32} className="mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest">No results</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversation Area */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 transition-all duration-300 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          {(displayChat || activeChat) ? (
            <>
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                 <div className="flex items-center">
                    <button onClick={() => onSelectChat(null)} className="md:hidden mr-4 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-400 hover:text-blue-600 transition-all button-pop">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.location.href = `/profile/${displayChat.id}`}>
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-blue-100 dark:shadow-none overflow-hidden transition-transform group-hover:scale-105">
                            {displayChat?.avatar ? <img src={displayChat.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{displayChat?.name?.[0] || '?'}</div>}
                        </div>
                        <div>
                            <p className="font-black text-xs text-gray-900 dark:text-slate-100 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{displayChat?.name || 'Neighbor'}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${activeChatStatus === 'Active now' ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                                <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400 dark:text-slate-500">{activeChatStatus}</span>
                                {displayChat?.neighborhood && (
                                    <span className="text-[8px] text-gray-400 font-black uppercase tracking-tighter hidden sm:inline">• {displayChat.neighborhood}</span>
                                )}
                            </div>
                        </div>
                    </div>
                 </div>
                 <div className="flex items-center space-x-1 sm:space-x-3">
                    <button className="hidden sm:flex p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all button-pop">
                        <Phone size={18} />
                    </button>
                    <button className="hidden sm:flex p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all button-pop">
                        <Video size={18} />
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowActions(!showActions)}
                            className={`p-2.5 rounded-xl transition-all button-pop ${showActions ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showActions && (
                            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl shadow-2xl p-2.5 z-30 animate-slide-down">
                                <button
                                    onClick={() => {
                                        onSendMessage(activeChat, "Hey, want to meet up at IT Park? 📍");
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 flex items-center space-x-3 transition-colors"
                                >
                                    <MapPin size={16} /> <span>Suggest Meetup</span>
                                </button>
                                <button
                                    className="w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center space-x-3 transition-colors"
                                >
                                    <Flag size={16} /> <span>Report Neighbor</span>
                                </button>
                                <div className="h-px bg-gray-50 dark:bg-slate-800 my-2 mx-2"></div>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to clear this conversation?')) {
                                            onDeleteChat && onDeleteChat(activeChat);
                                        }
                                        setShowActions(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors"
                                >
                                    <Trash2 size={16} /> <span>Clear Chat</span>
                                </button>
                            </div>
                        )}
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#FBFBFE] dark:bg-slate-950/50 scroll-smooth no-scrollbar">
                {(currentChat || displayChat?.messages?.length > 0) ? (currentChat || displayChat).messages.map((m, i) => {
                  const messageDate = new Date(m.time);
                  const showTimestamp = !isNaN(messageDate.getTime());
                  const formattedTime = showTimestamp
                    ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div key={i} className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'} animate-slide-up group/msg`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl text-[13px] leading-relaxed font-medium shadow-sm transition-all hover:shadow-md ${m.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-tl-none text-gray-700 dark:text-slate-200'}`}>
                        {renderMessageContent(m.text)}
                      </div>
                      <div className={`flex items-center mt-1.5 px-1 space-x-2 transition-opacity duration-300 ${activeChat ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'}`}>
                        {showTimestamp && (
                          <span className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">{formattedTime}</span>
                        )}
                        {m.sender === 'me' && (
                          <div className="flex items-center space-x-1">
                              <span className="text-[8px] text-blue-500 font-black uppercase tracking-tighter">Delivered</span>
                              <CheckCheck size={10} className="text-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-6">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] flex items-center justify-center text-blue-500 rotate-12">
                            <MessageCircle size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">Start the conversation</p>
                            <p className="text-[9px] font-bold uppercase text-gray-400 mt-2">Be friendly and helpful to your neighbors!</p>
                        </div>
                    </div>
                )}

                {isOtherTyping && (
                    <div className="flex justify-start animate-slide-down">
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-4 py-3 rounded-[1.5rem] rounded-tl-none shadow-sm flex items-center space-x-2">
                            <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Neighbor Typing</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {pendingImage && (
                <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-between border-t border-blue-100 dark:border-blue-900/20 animate-slide-up">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-lg relative group">
                      <img src={pendingImage} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block">Photo attached</span>
                        <span className="text-[8px] text-blue-400 font-bold uppercase tracking-tighter">Ready to send</span>
                    </div>
                  </div>
                  <button onClick={() => setPendingImage(null)} className="p-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-xl transition-all shadow-sm button-pop">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800 flex items-center space-x-3 relative">
                <div className="flex items-center space-x-1">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl transition-all button-pop"
                    title="Attach Photo"
                  >
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20}/>}
                  </button>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2.5 rounded-xl transition-all button-pop ${showEmojiPicker ? 'text-blue-600 bg-blue-50 dark:bg-slate-800' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    title="Emojis"
                  >
                    <Smile size={20}/>
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-6 mb-4 p-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-2xl flex flex-wrap gap-2 w-56 z-20 animate-slide-up">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setText(prev => prev + emoji)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl text-xl transition-all active:scale-125 hover:rotate-6"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 relative">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Write your message..."
                      className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-[1.5rem] py-3.5 px-6 text-xs font-bold outline-none ring-2 ring-transparent focus:ring-blue-100 dark:focus:ring-blue-900/30 dark:text-slate-200 transition-all shadow-inner"
                    />
                </div>
                <button
                  onClick={handleSend}
                  disabled={isUploading || (!text.trim() && !pendingImage)}
                  className={`bg-blue-600 text-white p-3.5 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed button-pop`}
                >
                  <Send size={20}/>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700 space-y-6 bg-gray-50/10">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[3rem] flex items-center justify-center shadow-xl shadow-gray-100 dark:shadow-none animate-pulse">
                    <User size={48} className="text-gray-200" />
                </div>
                <div className="text-center">
                    <p className="font-black text-[12px] uppercase tracking-[0.4em] text-gray-400">Select a Conversation</p>
                    <p className="text-[9px] font-bold uppercase text-gray-300 mt-2">Chat with your neighbors in Cebu</p>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
