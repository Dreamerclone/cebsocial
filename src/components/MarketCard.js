'use client';

import React, { useState } from 'react';
import { ShoppingBag, Bookmark, MapPin, MessageCircle, Tag, Star, X, Flag, ShieldCheck, Share2, Edit3 } from 'lucide-react';

export default function MarketCard({ item, toggleSave, onMessage, onViewShop, onReport, distance, onMarkSold, onDelete, onEdit, currentUser, onShare, onImageClick, onViewProfile, viewMode = 'List' }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (viewMode === 'Grid') {
    return (
        <div
            onClick={() => onViewShop(item)}
            className={`surface-card rounded-[2rem] border shadow-sm overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full ${item.isSold ? 'opacity-60 grayscale' : ''}`}
        >
            <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-zinc-900">
                {item.image ? (
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                        <ShoppingBag size={32} />
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg">
                    {item.price}
                </div>
                {item.isSold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest rotate-[-12deg]">Sold</span>
                    </div>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleSave(item.id, 'market'); }}
                    className={`absolute bottom-3 right-3 p-2.5 rounded-xl transition-all ${item.isSaved ? 'bg-primary-600 text-white shadow-lg' : 'bg-white/90 text-zinc-900 opacity-0 group-hover:opacity-100'}`}
                >
                    <Bookmark size={14} fill={item.isSaved ? "currentColor" : "none"} />
                </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-black text-main text-xs uppercase tracking-tight italic line-clamp-1 mb-1">{item.title}</h4>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted font-bold uppercase">
                        <MapPin size={10} className="text-primary-600" />
                        <span className="truncate">{item.location}</span>
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-primary-600 overflow-hidden shadow-sm">
                            {item.seller?.avatar_url ? <img src={item.seller.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-white">?</div>}
                        </div>
                        <span className="text-[9px] font-black text-main uppercase truncate max-w-[60px]">{item.seller?.full_name?.split(' ')[0] || 'Neighbor'}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onMessage(); }} className="text-primary-600 text-[9px] font-black uppercase tracking-widest hover:underline">
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div
        onClick={() => onViewShop(item)}
        className={`surface-card p-4 md:p-6 rounded-[2rem] border shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 cursor-pointer relative ${item.isSold ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      {/* SOLD STAMP */}
      {item.isSold && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rotate-[-12deg] pointer-events-none">
              <div className="border-[4px] border-red-500 rounded-xl px-6 py-2 shadow-2xl bg-white/10 backdrop-blur-sm">
                  <span className="text-3xl font-black text-red-500 uppercase tracking-widest opacity-90">SOLD</span>
              </div>
          </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showConfirmDelete && (
          <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-20 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center animate-slide-down" onClick={(e) => e.stopPropagation()}>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-4"><Flag size={24} /></div>
              <h4 className="font-black text-xs text-main uppercase tracking-widest">Delete Listing?</h4>
              <div className="flex space-x-3 mt-6">
                  <button onClick={() => setShowConfirmDelete(false)} className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-main">Cancel</button>
                  <button onClick={() => { onDelete(item.id); setShowConfirmDelete(false); }} className="px-6 py-2 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase shadow-lg shadow-red-500/20">Remove</button>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div
            className="w-full md:w-32 h-40 md:h-32 bg-gray-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-muted overflow-hidden relative"
            onClick={(e) => {
                if (item.image) {
                    e.stopPropagation();
                    onImageClick && onImageClick(item.image);
                }
            }}
        >
            {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <ShoppingBag size={24} />}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">
                {item.price}
            </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h4 className="font-black text-main text-base uppercase tracking-tight italic line-clamp-1">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted font-bold uppercase">{item.category}</span>
                            <span className="w-1 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full"></span>
                            <span className="text-[10px] text-muted font-bold uppercase">{item.condition || 'New'}</span>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleSave(item.id, 'market'); }} className={`p-2 rounded-xl transition-all ${item.isSaved ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-muted hover:bg-gray-50 dark:hover:bg-zinc-900'}`}>
                        <Bookmark size={16} fill={item.isSaved ? "currentColor" : "none"} />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted font-bold uppercase mt-3">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary-600" /> {item.location}</span>
                    {distance && <span className="flex items-center gap-1.5"><Tag size={12} /> {distance} KM away</span>}
                    <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-500 fill-current" /> {item.rating || 'New'}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 dark:border-zinc-800">
                <div className="flex items-center gap-2 cursor-pointer group/seller" onClick={(e) => { e.stopPropagation(); onViewProfile && onViewProfile(item.seller); }}>
                    <div className="w-6 h-6 rounded-lg bg-primary-600 overflow-hidden shadow-sm">
                        {item.seller?.avatar_url ? <img src={item.seller.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px] font-black text-white">?</div>}
                    </div>
                    <span className="text-[10px] font-black text-main group-hover:text-primary-600 transition-colors uppercase">{item.seller?.full_name || 'Neighbor'}</span>
                </div>

                <div className="flex items-center gap-2">
                    {item.user_id === currentUser.id ? (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 text-muted hover:text-main transition-colors"><Edit3 size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }} className="p-2 text-muted hover:text-red-500 transition-colors"><X size={16} /></button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkSold(item.id); }}
                                className={`ml-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${item.isSold ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-muted'}`}
                            >
                                {item.isSold ? 'Active' : 'Sold'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="p-2 text-muted hover:text-main transition-colors"><Share2 size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onMessage(); }} className="ml-2 px-4 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all">
                                Message
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
