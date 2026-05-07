'use client';

import React, { useState } from 'react';
import { ShoppingBag, Bookmark, MapPin, MessageCircle, Tag, Star, X, Flag, ShieldCheck, Share2, Edit3 } from 'lucide-react';

export default function MarketCard({ item, toggleSave, onMessage, onViewShop, onReport, distance, onMarkSold, onDelete, onEdit, currentUser, onShare, onImageClick, onViewProfile }) {
  const [showRateModal, setShowRateModal] = useState(false);
  const [showConfirmReport, setShowConfirmReport] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userRating, setUserRating] = useState(0);

  return (
    <div
        onClick={() => onViewShop(item)}
        className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-blue-200 transition-all cursor-pointer relative card-hover ${item.isSold ? 'opacity-75' : ''}`}
    >

      {/* SOLD STAMP */}
      {item.isSold && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rotate-[-12deg] pointer-events-none">
              <div className="border-4 border-red-500 rounded-xl px-6 py-2">
                  <span className="text-4xl font-black text-red-500 uppercase tracking-widest opacity-80">SOLD</span>
              </div>
          </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showConfirmDelete && (
          <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-20 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-3"><Flag size={24} /></div>
              <h4 className="font-black text-sm text-gray-900 dark:text-slate-100 uppercase tracking-widest">Delete Listing?</h4>
              <div className="flex space-x-3 mt-4">
                  <button onClick={() => setShowConfirmDelete(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-[10px] font-black uppercase">Cancel</button>
                  <button onClick={() => { onDelete(item.id); setShowConfirmDelete(false); }} className="px-6 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase shadow-lg shadow-red-100">Confirm</button>
              </div>
          </div>
      )}

      {/* RATE SELLER MODAL */}
      {showRateModal && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down">
              <button onClick={() => setShowRateModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={20}/></button>
              <h4 className="font-black text-sm text-gray-900 dark:text-slate-100 uppercase tracking-widest mb-4">Rate Seller</h4>
              <div className="flex space-x-2 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setUserRating(star)}>
                          <Star size={24} fill={star <= userRating ? "#EAB308" : "none"} className={star <= userRating ? "text-amber-500 scale-110" : "text-gray-300"} />
                      </button>
                  ))}
              </div>
              <button
                  onClick={() => setShowRateModal(false)}
                  className="px-8 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                  disabled={userRating === 0}
              >
                  Submit Review
              </button>
          </div>
      )}

      {/* REPORT CONFIRMATION */}
      {showConfirmReport && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-3"><Flag size={24} /></div>
              <h4 className="font-black text-sm text-gray-900 dark:text-slate-100 uppercase tracking-widest">Report Listing?</h4>
              <div className="flex space-x-3 mt-6">
                  <button onClick={() => setShowConfirmReport(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-[10px] font-black uppercase">Cancel</button>
                  <button onClick={() => { onReport(item.id); setShowConfirmReport(false); }} className="px-6 py-2 rounded-xl bg-amber-600 text-white text-[10px] font-black uppercase shadow-lg shadow-amber-100">Report</button>
              </div>
          </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
            <div
                className="w-14 h-14 bg-[#EEF2FF] dark:bg-blue-900/30 rounded-[1.2rem] flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner overflow-hidden cursor-zoom-in"
                onClick={(e) => {
                    if (item.image) {
                        e.stopPropagation();
                        onImageClick && onImageClick(item.image);
                    }
                }}
            >
                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ShoppingBag size={24} />}
            </div>
            <div>
            <div className="flex items-center space-x-2">
                <div className="group/seller cursor-pointer flex items-center space-x-2" onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(item.seller); }}>
                    <div className="w-5 h-5 rounded-md bg-blue-600 overflow-hidden shadow-sm">
                        {item.seller?.avatar_url ? <img src={item.seller.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-white">{item.author?.[0]}</div>}
                    </div>
                    <h4 className="font-black text-gray-900 dark:text-slate-100 text-sm group-hover/seller:text-blue-600 transition-colors">{item.title}</h4>
                </div>
                {item.isVerifiedShop && (
                    <button onClick={(e) => { e.stopPropagation(); onViewShop(); }} className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase hover:bg-blue-100 transition-colors">
                        <ShieldCheck size={10} className="mr-1"/> Verified
                    </button>
                )}
            </div>

            <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg">
                    <Star size={10} fill="currentColor" className="mr-1" />
                    <span className="text-[10px] font-black">{item.rating || 'New'}</span>
                </div>
                <span className="text-[9px] text-gray-400 font-bold uppercase">({item.reviewCount || 0} reviews)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
                {distance && (
                    <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-black flex items-center">
                        <MapPin size={8} className="mr-1" /> {distance} km away
                    </span>
                )}
                <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">{item.category}</span>
                <span className="text-[9px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center">
                    <Tag size={8} className="mr-1" /> {item.condition || 'New'}
                </span>
                <span className="text-[9px] text-gray-400 font-bold tracking-tight uppercase flex items-center"><MapPin size={8} className="mr-1"/> {item.location}</span>
            </div>
            </div>
        </div>
        <div className="text-right">
            <p className="text-xl font-black text-green-600 dark:text-green-400 leading-none italic">{item.price}</p>
            <div className="flex items-center justify-end space-x-2 mt-3">
                {item.user_id === currentUser.id && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onMarkSold(item.id); }}
                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${item.isSold ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200'}`}
                        >
                            {item.isSold ? 'Set Available' : 'Mark Sold'}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            className="p-2 bg-blue-50 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all button-pop"
                            title="Edit Listing"
                        >
                            <Edit3 size={14} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }}
                            className="p-2 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all button-pop"
                            title="Delete Listing"
                        >
                            <X size={14} />
                        </button>
                    </>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onShare(); }}
                    className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-600 rounded-xl transition-all button-pop"
                    title="Share Listing"
                >
                    <Share2 size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowConfirmReport(true); }}
                    className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-amber-500 rounded-xl transition-all button-pop"
                    title="Report Listing"
                >
                    <Flag size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowRateModal(true); }}
                    className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all button-pop"
                    title="Rate Seller"
                >
                    <Star size={14} />
                </button>
                {item.user_id !== currentUser.id && (
                    <button onClick={(e) => { e.stopPropagation(); onMessage(); }} className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-all button-pop">
                        <MessageCircle size={14} />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); toggleSave(item.id, 'market'); }} className={`p-2 rounded-xl transition-all button-pop ${item.isSaved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-300 bg-gray-50 dark:bg-slate-800'}`}>
                    <Bookmark size={14} fill={item.isSaved ? "currentColor" : "none"} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
