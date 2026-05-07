'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Send, Tag, Trash2, X, Check, Users, Share2, Calendar, BarChart3, Flag, MapPin, BellRing, MoreHorizontal, AlertTriangle } from 'lucide-react';

export default function PostCard({
    post, user, handleLike, toggleSave, handleAddComment, commentInput,
    setCommentInput, onDelete, onShare, onJoinEvent, onVote, onReport,
    distance, onSetReminder, onImageClick, onViewProfile, t
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmReport, setShowConfirmReport] = useState(false);
  const [showJoinersList, setShowJoinersList] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const moreMenuRef = useRef(null);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!post.hasLiked) {
        handleLike(post.id);
        setShowHeartOverlay(true);
        setTimeout(() => setShowHeartOverlay(false), 1000);
      }
    }
    setLastTap(now);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleJoin = (id) => {
      onJoinEvent(id);
      if (!post.isJoined) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 1200);
      }
  };

  return (
    <div className={`surface-card border-b sm:border sm:rounded-3xl p-4 sm:p-6 transition-all duration-500 relative bg-white dark:bg-zinc-950/50 hover:bg-gray-50/50 dark:hover:bg-zinc-900/30 ${post.type === 'Alert' ? 'border-l-4 border-l-red-500' : 'border-gray-100 dark:border-zinc-800'}`}>

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
          <div className="absolute inset-0 bg-card/95 backdrop-blur-md z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-3"><Trash2 size={24} /></div>
              <h4 className="font-black text-sm text-main uppercase tracking-widest">Delete?</h4>
              <div className="flex space-x-3 mt-4">
                  <button onClick={() => setShowConfirmDelete(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-main">Cancel</button>
                  <button onClick={() => { onDelete(post.id); setShowConfirmDelete(false); }} className="px-6 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase shadow-lg shadow-red-100">Confirm</button>
              </div>
          </div>
      )}

      {/* REPORT CONFIRMATION */}
      {showConfirmReport && (
          <div className="absolute inset-0 bg-card/95 backdrop-blur-md z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-3"><Flag size={24} /></div>
              <h4 className="font-black text-sm text-main uppercase tracking-widest">Report Content?</h4>
              <p className="text-[10px] text-muted mt-1 mb-4 px-4">Our community moderators will review this post for violations.</p>
              <div className="flex space-x-3">
                  <button onClick={() => setShowConfirmReport(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-main">Cancel</button>
                  <button onClick={() => { onReport(post.id); setShowConfirmReport(false); }} className="px-6 py-2 rounded-xl bg-amber-600 text-white text-[10px] font-black uppercase shadow-lg shadow-amber-100">Report</button>
              </div>
          </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 cursor-pointer group/auth" onClick={() => onViewProfile && onViewProfile(post.profiles)}>
          <div className="relative">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-sm font-black shadow-lg overflow-hidden transition-all group-hover/auth:scale-105`}>
              {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : (post.author ? post.author[0] : '?')}
            </div>
            {post.profiles?.karma >= 100 && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-600 border-2 border-white dark:border-zinc-950 rounded-full flex items-center justify-center shadow-sm">
                    <Check size={8} strokeWidth={4} className="text-white" />
                </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-main group-hover/auth:text-primary-600 transition-colors leading-tight">{post.author}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted font-medium">{post.time}</span>
                <span className="text-[10px] text-muted">•</span>
                <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider">{post.location}</span>
            </div>
          </div>
        </div>

        <div className="relative" ref={moreMenuRef}>
            <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2.5 text-muted hover:text-main transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
                <MoreHorizontal size={20} />
            </button>

            {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-52 surface-card border rounded-[2rem] shadow-2xl py-2 z-20 animate-slide-down">
                    <button
                        onClick={() => { toggleSave(post.id, 'post'); setShowMoreMenu(false); }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-[11px] font-black uppercase transition-colors ${post.isSaved ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-muted hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                    >
                        <Bookmark size={16} fill={post.isSaved ? "currentColor" : "none"} />
                        <span>{post.isSaved ? 'Saved' : 'Save Post'}</span>
                    </button>

                    <button
                        onClick={() => { onShare(post.id); setShowMoreMenu(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-[11px] font-black uppercase text-muted hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Share2 size={16} />
                        <span>Share</span>
                    </button>

                    {post.type === 'Event' && (
                        <button
                            onClick={() => { onSetReminder(post.id); setShowMoreMenu(false); }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-[11px] font-black uppercase text-muted hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <BellRing size={16} />
                            <span>Set Reminder</span>
                        </button>
                    )}

                    <div className="h-px bg-gray-50 dark:bg-zinc-800 my-2 mx-2"></div>

                    <button
                        onClick={() => { setShowConfirmReport(true); setShowMoreMenu(false); }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-[11px] font-black uppercase text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                    >
                        <Flag size={16} />
                        <span>Report Post</span>
                    </button>

                    {post.author === user?.name && (
                        <button
                            onClick={() => { setShowConfirmDelete(true); setShowMoreMenu(false); }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-[11px] font-black uppercase text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <Trash2 size={16} />
                            <span>Delete Post</span>
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* RIDE INFO TAG */}
      {post.type === 'Ride' && (
          <div className="mb-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-zinc-800 text-main px-3 py-1.5 rounded-xl border">
                  <MapPin size={10}/> <span className="text-[10px] font-black uppercase tracking-tight">{post.destination}</span>
              </div>
              <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-zinc-800 text-main px-3 py-1.5 rounded-xl border">
                  <Users size={10}/> <span className="text-[10px] font-black uppercase tracking-tight">{post.seats} seats</span>
              </div>
          </div>
      )}

      {post.type === 'Event' && post.eventDate && (
          <div className="mb-4 inline-flex items-center space-x-2 bg-gray-50 dark:bg-zinc-800 text-main px-3 py-1.5 rounded-xl border">
              <Calendar size={10}/> <span className="text-[10px] font-black uppercase tracking-tight">{post.eventDate}</span>
          </div>
      )}

      <p className="text-main text-[15px] sm:text-[16px] leading-relaxed mb-4 font-normal whitespace-pre-wrap">{post.content}</p>

      {post.type === 'Alert' && (
          <div className="mb-4 flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/20">
              <AlertTriangle size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Community Alert</span>
          </div>
      )}
      {post.type === 'Poll' && post.pollOptions && (
          <div className="mb-6 space-y-2 bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-[1.8rem] border">
              <div className="flex justify-between items-center mb-3 px-1">
                  <span className="text-[10px] font-black uppercase text-main tracking-widest flex items-center"><BarChart3 size={14} className="mr-2 text-primary-600"/> Community Poll</span>
                  <span className="text-[9px] font-bold text-muted uppercase">{post.totalVotes} votes</span>
              </div>
              {post.pollOptions.map(opt => {
                  const percentage = post.totalVotes > 0 ? Math.round((opt.votes / post.totalVotes) * 100) : 0;
                  return (
                    <button
                        key={opt.id}
                        onClick={() => !post.hasVoted && onVote(post.id, opt.id)}
                        disabled={post.hasVoted}
                        className={`w-full relative h-12 rounded-[1.2rem] overflow-hidden border transition-all ${post.hasVoted ? 'border-transparent bg-gray-100 dark:bg-zinc-800' : 'hover:border-primary-600'}`}
                    >
                        {/* Progress Bar */}
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${post.hasVoted ? 'bg-primary-600/10' : 'bg-transparent'}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                        <div className="relative px-5 flex justify-between items-center h-full">
                            <span className={`text-[12px] font-black uppercase ${post.hasVoted ? 'text-main' : 'text-muted'}`}>{opt.text}</span>
                            {post.hasVoted && <span className="text-[11px] font-black text-primary-600">{percentage}%</span>}
                        </div>
                    </button>
                  );
              })}
          </div>
      )}

      {post.image && (
          <div
            className="mb-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm max-h-[600px] cursor-zoom-in relative group/img"
            onClick={handleDoubleTap}
          >
              <img src={post.image} className="w-full h-full object-cover group-hover/img:scale-[1.02] transition-transform duration-1000 ease-out" alt="attachment" />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none"></div>

              {showHeartOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <Heart size={100} fill="white" className="text-white animate-heart drop-shadow-2xl" />
                  </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); onImageClick && onImageClick(post.image); }}
                className="absolute bottom-4 right-4 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl opacity-0 group-hover/img:opacity-100 transition-all hover:scale-110 shadow-xl border border-white/20"
              >
                  <Share2 size={18} className="text-main" />
              </button>
          </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-4">
            <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center space-x-1.5 transition-all group ${post.hasLiked ? 'text-primary-600' : 'text-muted hover:text-primary-600'}`}
            >
                <div className={`p-2 rounded-full transition-colors ${post.hasLiked ? 'bg-primary-50 dark:bg-primary-900/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-zinc-800'}`}>
                    <Heart size={18} fill={post.hasLiked ? "currentColor" : "none"} />
                </div>
                <span className="text-[13px] font-bold">{post.likes}</span>
            </button>

            <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center space-x-1.5 transition-all group ${showComments ? 'text-primary-600' : 'text-muted hover:text-primary-600'}`}
            >
                <div className={`p-2 rounded-full transition-colors ${showComments ? 'bg-primary-50 dark:bg-primary-900/20' : 'group-hover:bg-gray-100 dark:group-hover:bg-zinc-800'}`}>
                    <MessageCircle size={18} />
                </div>
                <span className="text-[13px] font-bold">{post.comments.length}</span>
            </button>
        </div>

        <div className="flex items-center gap-2">
            {post.user_id !== user?.id && (
                <button
                    onClick={() => onViewProfile && onViewProfile(post.profiles)}
                    className="p-2 text-muted hover:text-primary-600 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                    title="Chat"
                >
                    <Send size={18} />
                </button>
            )}

            {post.type === 'Event' && (
                <button onClick={() => handleJoin(post.id)} className={`px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${post.isJoined ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-zinc-800 text-muted hover:text-primary-600'}`}>
                    {post.isJoined ? 'Going' : 'Join'}
                </button>
            )}
        </div>
      </div>

      {showComments && (
        <div className="pt-6 mt-6 border-t animate-slide-down">
          <div className="space-y-4 mb-6">
            {post.comments.map(c => (
              <div key={c.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-[10px] font-black text-primary-600 uppercase">{c.author ? c.author[0] : '?'}</div>
                <div className="flex-1">
                    <p className="font-black text-[12px] text-main mb-1">{c.author}</p>
                    <p className="text-[13px] text-muted leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex space-x-3 mt-4 bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-[1.5rem] border border-transparent focus-within:border-primary-600/30 transition-all">
            <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleAddComment(post.id, commentInput);
                        setCommentInput('');
                    }
                }}
                className="flex-1 bg-transparent px-4 py-2 text-xs font-bold outline-none text-main placeholder:text-muted"
                placeholder="Write a reply..."
            />
            <button
                onClick={() => {
                    handleAddComment(post.id, commentInput);
                    setCommentInput('');
                }}
                className="bg-primary-600 text-white p-3 rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 transition-all"
            >
                <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
