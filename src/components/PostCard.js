'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Send, Tag, Trash2, X, Check, Users, Share2, Calendar, BarChart3, Flag, MapPin, BellRing } from 'lucide-react';

export default function PostCard({
    post, user, handleLike, toggleSave, handleAddComment, commentInput,
    setCommentInput, onDelete, onShare, onJoinEvent, onVote, onReport,
    distance, onSetReminder, onImageClick, onViewProfile, t
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmReport, setShowConfirmReport] = useState(false); // New: Report state
  const [showLikesList, setShowLikesList] = useState(false);
  const [showJoinersList, setShowJoinersList] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const reactions = ['❤️', '😮', '🔥', '🙌', '👏', '😢'];

  const handleJoin = (id) => {
      onJoinEvent(id);
      if (!post.isJoined) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1200);
      }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border p-7 shadow-sm transition-all relative card-hover ${post.type === 'Alert' ? 'border-red-100 ring-4 ring-red-50/20' : post.type === 'Event' ? 'border-amber-100 ring-4 ring-amber-50/20' : post.type === 'Poll' ? 'border-purple-100 ring-4 ring-purple-50/20' : post.type === 'Ride' ? 'border-green-100 ring-4 ring-green-50/20' : 'border-gray-100 dark:border-slate-800'}`}>

      {/* CONFETTI EFFECT */}
      {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
              <div className="text-4xl animate-confetti">🎉</div>
              <div className="text-4xl animate-confetti delay-75">✨</div>
              <div className="text-4xl animate-confetti delay-100">🥳</div>
              <div className="text-4xl animate-confetti delay-200" style={{ left: '30%' }}>🎈</div>
              <div className="text-4xl animate-confetti delay-300" style={{ right: '30%' }}>🎊</div>
          </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showConfirmDelete && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-3"><Trash2 size={24} /></div>
              <h4 className="font-black text-sm text-gray-900 dark:text-slate-100 uppercase tracking-widest">Delete?</h4>
              <div className="flex space-x-3 mt-4">
                  <button onClick={() => setShowConfirmDelete(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-[10px] font-black uppercase">Cancel</button>
                  <button onClick={() => { onDelete(post.id); setShowConfirmDelete(false); }} className="px-6 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase shadow-lg shadow-red-100">Confirm</button>
              </div>
          </div>
      )}

      {/* REPORT CONFIRMATION */}
      {showConfirmReport && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-3"><Flag size={24} /></div>
              <h4 className="font-black text-sm text-gray-900 dark:text-slate-100 uppercase tracking-widest">Report Content?</h4>
              <p className="text-[10px] text-gray-400 mt-1 mb-4 px-4">Our community moderators will review this post for violations.</p>
              <div className="flex space-x-3">
                  <button onClick={() => setShowConfirmReport(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-[10px] font-black uppercase">Cancel</button>
                  <button onClick={() => { onReport(post.id); setShowConfirmReport(false); }} className="px-6 py-2 rounded-xl bg-amber-600 text-white text-[10px] font-black uppercase shadow-lg shadow-amber-100">Report</button>
              </div>
          </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 cursor-pointer group/auth" onClick={() => onViewProfile && onViewProfile(post.profiles)}>
          <div className={`w-10 h-10 rounded-xl ${post.type === 'Alert' ? 'bg-red-500' : post.type === 'Event' ? 'bg-amber-500' : post.type === 'Poll' ? 'bg-purple-500' : post.type === 'Ride' ? 'bg-green-500' : user?.color || 'bg-blue-600'} flex items-center justify-center text-white text-xs font-black shadow-lg overflow-hidden transition-transform group-hover/auth:scale-110`}>
            {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : (post.type === 'Alert' ? '!' : post.type === 'Event' ? 'CAL' : post.type === 'Poll' ? 'VOTE' : post.type === 'Ride' ? 'RIDE' : (post.author ? post.author[0] : '?'))}
          </div>
          <div>
            <div className="flex items-center space-x-2">
                <h4 className="font-black text-sm text-gray-900 dark:text-slate-100 group-hover/auth:text-blue-600 transition-colors">{post.author}</h4>
                {post.sharedFrom && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">Shared</span>}
            </div>
            <div className="flex items-center space-x-2 mt-0.5">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{post.time} • <span className="text-blue-500">#{post.location}</span></p>
                {distance && (
                    <span className="text-[8px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-black flex items-center">
                        <MapPin size={8} className="mr-1" /> {distance} km away
                    </span>
                )}
                {post.category && <span className="text-[8px] bg-gray-100 dark:bg-slate-800 text-gray-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{post.category}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
            <button onClick={() => setShowConfirmReport(true)} className="p-2 text-gray-300 hover:text-amber-500 transition-colors button-pop" title="Report Post">
                <Flag size={18} />
            </button>
            {post.author === user?.name && <button onClick={() => setShowConfirmDelete(true)} className="p-2 text-gray-300 hover:text-red-500 button-pop"><Trash2 size={18} /></button>}
            <button onClick={() => toggleSave(post.id, 'post')} className={`p-2 rounded-xl transition-all button-pop ${post.isSaved ? 'text-blue-600 bg-blue-50' : 'text-gray-300'}`}><Bookmark size={18} fill={post.isSaved ? "currentColor" : "none"} /></button>
        </div>
      </div>

      {/* RIDE INFO TAG */}
      {post.type === 'Ride' && (
          <div className="mb-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-full border border-green-100 dark:border-green-800 animate-slide-down">
                  <MapPin size={12}/> <span className="text-[10px] font-black uppercase tracking-widest">{t?.going_to || 'Going to'}: {post.destination} {t?.from || 'from'} {post.location}</span>
              </div>
              <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-full border border-green-100 dark:border-green-800 animate-slide-down">
                  <Users size={12}/> <span className="text-[10px] font-black uppercase tracking-widest">{post.seats} {t?.seats_available || 'seats available'}</span>
              </div>
          </div>
      )}

      {post.type === 'Event' && post.eventDate && (
          <div className="mb-4 inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full border border-amber-100 dark:border-amber-800 animate-slide-down">
              <Calendar size={12}/> <span className="text-[10px] font-black uppercase tracking-widest">Scheduled: {post.eventDate}</span>
          </div>
      )}

      <p className="text-gray-800 dark:text-slate-200 text-[15px] leading-relaxed mb-6 font-medium">{post.content}</p>

      {/* POLL UI */}
      {post.type === 'Poll' && post.pollOptions && (
          <div className="mb-8 space-y-3 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 animate-slide-down">
              <div className="flex justify-between items-center mb-2 px-1">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-purple-600 tracking-widest flex items-center"><BarChart3 size={12} className="mr-2"/> Community Poll</span>
                      {post.expiresAt && (
                          <span className="text-[8px] font-black uppercase text-amber-600 tracking-widest mt-1 flex items-center">
                             <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse mr-1"></div>
                             Ends in: {Math.max(0, Math.floor((new Date(post.expiresAt) - new Date()) / 3600000))}h {Math.max(0, Math.floor(((new Date(post.expiresAt) - new Date()) % 3600000) / 60000))}m
                          </span>
                      )}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">{post.totalVotes} votes</span>
              </div>
              {post.pollOptions.map(opt => {
                  const percentage = post.totalVotes > 0 ? Math.round((opt.votes / post.totalVotes) * 100) : 0;
                  return (
                    <button
                        key={opt.id}
                        onClick={() => !post.hasVoted && onVote(post.id, opt.id)}
                        disabled={post.hasVoted}
                        className={`w-full relative h-12 rounded-2xl overflow-hidden border transition-all ${post.hasVoted ? 'border-transparent' : 'border-gray-100 dark:border-slate-700 hover:border-purple-200'}`}
                    >
                        {/* Progress Bar */}
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ${post.hasVoted ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-transparent'}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                        <div className="relative px-4 flex justify-between items-center h-full">
                            <span className={`text-xs font-bold ${post.hasVoted ? 'text-purple-900 dark:text-purple-200' : 'text-gray-600 dark:text-slate-400'}`}>{opt.text}</span>
                            {post.hasVoted && <span className="text-[10px] font-black text-purple-600">{percentage}%</span>}
                        </div>
                    </button>
                  );
              })}
              {post.hasVoted && <p className="text-[9px] text-gray-400 italic text-center pt-2">Thank you for voting!</p>}
          </div>
      )}

      {post.image && (
          <div
            className="mb-6 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-inner max-h-[400px] cursor-zoom-in"
            onClick={() => onImageClick && onImageClick(post.image)}
          >
              <img src={post.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="attachment" />
          </div>
      )}

      <div className="flex flex-wrap items-center gap-6 relative">
        {/* REACTION BAR INTERACTION */}
        <div className="relative flex items-center space-x-2">
            <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-2 font-black transition-all button-pop ${post.hasLiked ? 'scale-110 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            >
                <Heart size={18} fill={post.hasLiked ? "currentColor" : "none"} />
            </button>
            <span className="text-xs font-bold text-gray-400">
                {post.likes}
            </span>
        </div>

        <button onClick={() => setShowComments(!showComments)} className={`flex items-center space-x-2 font-black transition-all button-pop ${showComments ? 'text-blue-600' : 'text-gray-400'}`}>
          <MessageCircle size={18} /><span className="text-xs">{post.comments.length}</span>
        </button>

        <button onClick={() => onShare(post.id)} className="flex items-center space-x-2 text-gray-400 hover:text-blue-600 font-black button-pop"><Share2 size={18} /><span className="text-xs">Share</span></button>

        {post.user_id !== user?.id && (
            <button
                onClick={() => {
                    onViewProfile && onViewProfile(post.profiles);
                    // The profile modal will now show the message button
                }}
                className="flex items-center space-x-2 text-gray-400 hover:text-blue-600 font-black"
            >
                <MessageCircle size={18} /><span className="text-xs">Chat</span>
            </button>
        )}

        {/* EVENT JOIN */}
        {post.type === 'Event' && (
            <div className="flex items-center space-x-2 ml-auto">
                <button onClick={() => setShowJoinersList(!showJoinersList)} className="text-[10px] font-black text-gray-400 hover:text-amber-500">{post.attendees || 0} attending</button>
                <button onClick={() => handleJoin(post.id)} className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${post.isJoined ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                    <Calendar size={14} /> <span>{post.isJoined ? 'Going' : 'Join'}</span>
                </button>
                <button
                    onClick={() => onSetReminder(post.id)}
                    className={`p-2 rounded-xl transition-all ${post.hasReminder ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-600'}`}
                    title={post.hasReminder ? "Reminder set" : "Remind me"}
                >
                    <BellRing size={14} className={post.hasReminder ? "animate-pulse" : ""} />
                </button>
                {showJoinersList && (
                    <div className="absolute bottom-10 right-0 bg-white dark:bg-slate-900 border border-gray-100 rounded-2xl shadow-xl p-3 z-20 w-48 animate-slide-down">
                        <div className="flex justify-between items-center mb-2 px-1"><span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Attending</span><X size={12} className="cursor-pointer" onClick={() => setShowJoinersList(false)} /></div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                            {post.joinedBy?.map((name, i) => (
                                <div key={i} className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg"><div className="w-5 h-5 bg-amber-50 text-amber-600 rounded-md flex items-center justify-center text-[8px] font-black">{name[0]}</div><span className="text-[10px] font-bold text-gray-700 dark:text-slate-300">{name}</span></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {showComments && (
        <div className="bg-[#FBFCFE] dark:bg-slate-900/50 p-7 border-t border-gray-100 dark:border-slate-800 mt-6 rounded-b-[2rem] -mx-7 -mb-7 animate-slide-down">
          <div className="space-y-4 mb-4">
            {post.comments.map(c => (
              <div key={c.id} className="flex space-x-3">
                <div className={`w-8 h-8 rounded-lg ${c.author === user?.name ? user?.color : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700'} flex items-center justify-center text-[10px] font-black shadow-sm`}>{c.author ? c.author[0] : '?'}</div>
                <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-50 dark:border-slate-700 text-xs text-gray-600 dark:text-slate-300 font-medium shadow-sm">
                    <p className="font-black text-[9px] uppercase text-blue-600 mb-1">{c.author}</p>
                    {c.content}
                </div>
              </div>
            ))}
            {post.comments.length === 0 && <p className="text-[10px] text-gray-400 text-center italic py-2">No comments yet. Be the first to reply!</p>}
          </div>
          <div className="flex space-x-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner">
            <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleAddComment(post.id, commentInput);
                        setCommentInput('');
                    }
                }}
                className="flex-1 bg-transparent dark:text-slate-200 px-4 py-2 text-xs font-bold outline-none"
                placeholder="Write a reply..."
            />
            <button
                onClick={() => {
                    handleAddComment(post.id, commentInput);
                    setCommentInput('');
                }}
                className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-100"
            >
                <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
