'use client';

import React from 'react';
import { X, ShoppingBag, MapPin, MessageSquare, User, Zap, Check, Plus } from 'lucide-react';

export const ShopModal = ({ viewingShop, user, onClose, onMessage, onSave, t }) => {
  if (!viewingShop) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-slide-down flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 dark:bg-slate-800 relative">
                {viewingShop.image ? <img src={viewingShop.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={64} /></div>}
                <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md text-white rounded-full transition-all md:hidden"><X size={20} /></button>
            </div>
            <div className="w-full md:w-1/2 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{viewingShop.category}</span>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mt-3 leading-tight uppercase italic">{viewingShop.title}</h3>
                        <p className="text-3xl font-black text-green-600 mt-2 italic">{viewingShop.price}</p>
                    </div>
                    <button onClick={onClose} className="hidden md:block p-2 text-gray-400 hover:text-gray-600 transition-all"><X size={24} /></button>
                </div>
                <div className="space-y-4 flex-1">
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100"><p className="text-[9px] font-black uppercase text-gray-400 mb-1">Description</p><p className="text-xs text-gray-600 dark:text-slate-300 font-medium leading-relaxed">{viewingShop.description || 'No description provided.'}</p></div>
                    <div className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-slate-800 rounded-3xl">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black overflow-hidden">{viewingShop.seller?.avatar_url ? <img src={viewingShop.seller.avatar_url} className="w-full h-full object-cover" /> : viewingShop.author?.[0]}</div>
                        <div><h4 className="text-sm font-black text-gray-900 dark:text-slate-100 uppercase">{viewingShop.author}</h4><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center"><MapPin size={10} className="mr-1" /> {viewingShop.location}</p></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-8">
                    {viewingShop.user_id !== user.id && (
                        <button onClick={() => onMessage(viewingShop.user_id)} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100">Message Seller</button>
                    )}
                    <button onClick={() => onSave(viewingShop.id)} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${viewingShop.isSaved ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-600'} ${viewingShop.user_id === user.id ? 'col-span-2' : ''}`}>{viewingShop.isSaved ? 'Saved' : 'Save for Later'}</button>
                </div>
            </div>
        </div>
    </div>
  );
};

export const NeighborModal = ({ viewingNeighbor, user, onClose, onMessage, onViewProfile }) => {
  if (!viewingNeighbor) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[250] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-slide-down border border-gray-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 relative"><button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20} /></button></div>
            <div className="px-8 pb-8 text-center -mt-12">
                <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 p-2 mx-auto shadow-xl"><div className="w-full h-full rounded-[1.5rem] bg-blue-600 overflow-hidden flex items-center justify-center text-white font-black text-2xl">{viewingNeighbor.avatar_url ? <img src={viewingNeighbor.avatar_url} className="w-full h-full object-cover" /> : (viewingNeighbor.full_name?.[0] || '?')}</div></div>
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 mt-4 uppercase italic tracking-tighter">{viewingNeighbor.full_name}</h3>
                <div className="flex items-center justify-center space-x-2 mt-2">
                    <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"><MapPin size={10} className="inline mr-1" /> {viewingNeighbor.neighborhood}</span>
                    <span className="text-[10px] font-black uppercase text-amber-500 bg-amber-50 px-3 py-1 rounded-lg"><Zap size={10} className="inline mr-1" /> {viewingNeighbor.karma} Karma</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-6 font-medium italic leading-relaxed">"{viewingNeighbor.bio || 'Hello neighbors! 👋'}"</p>
                <div className="grid grid-cols-1 gap-3 mt-8">
                    <button
                      onClick={() => {
                          onViewProfile(viewingNeighbor.id);
                          onClose();
                      }}
                      className="bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-blue-100"
                    >
                        <User size={14} /> <span>View Full Profile</span>
                    </button>
                    {viewingNeighbor.id !== user.id && (
                        <button onClick={() => onMessage(viewingNeighbor.id)} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2"><MessageSquare size={14} /> <span>Message Neighbor</span></button>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export const ImageModal = ({ selectedImage, onClose }) => {
  if (!selectedImage) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
        <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={32} /></button>
        <img src={selectedImage} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in" />
    </div>
  );
};

export const EditItemModal = ({ editingItem, setEditingItem, onSave, isSubmitting }) => {
  if (!editingItem) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[260] flex items-center justify-center p-4" onClick={() => setEditingItem(null)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-slide-down border border-gray-100 p-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase italic tracking-tighter">Edit Listing</h3>
                <button onClick={() => setEditingItem(null)} className="p-2 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <input value={editingItem.title} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-bold" />
                    <input value={editingItem.price} onChange={(e) => setEditingItem({...editingItem, price: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <button disabled={isSubmitting} onClick={onSave} className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-100 flex items-center justify-center space-x-2">
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Check size={18} /><span>Save Changes</span></>}
                </button>
            </div>
        </div>
    </div>
  );
};

export const CreateGroupModal = ({ isCreatingGroup, setIsCreatingGroup, newGroup, setNewGroup, onSave, isSubmitting }) => {
  if (!isCreatingGroup) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[260] flex items-center justify-center p-4" onClick={() => setIsCreatingGroup(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-slide-down border border-gray-100 p-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase italic tracking-tighter">Create Group</h3>
                <button onClick={() => setIsCreatingGroup(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="space-y-6">
                <input value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})} placeholder="Group Name" className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-bold" />
                <textarea value={newGroup.description} onChange={(e) => setNewGroup({...newGroup, description: e.target.value})} placeholder="Description" className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-sm font-bold min-h-[100px]" />
                <button disabled={isSubmitting} onClick={onSave} className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-xs uppercase shadow-xl shadow-blue-100 flex items-center justify-center space-x-2">
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Plus size={18} /><span>Create Group</span></>}
                </button>
            </div>
        </div>
    </div>
  );
};

export const MemberModal = ({ showMemberModal, setShowMemberModal, members, setViewingNeighbor }) => {
  if (!showMemberModal) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[300] flex items-center justify-center p-4" onClick={() => setShowMemberModal(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-slide-down border border-gray-100" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase italic tracking-tighter">Members</h3>
                <button onClick={() => setShowMemberModal(false)} className="p-2 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
                {members.map(member => (
                    <div key={member.id} onClick={() => { setViewingNeighbor(member); setShowMemberModal(false); }} className="flex items-center justify-between p-4 rounded-[2rem] hover:bg-gray-50 cursor-pointer group">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black overflow-hidden">{member.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover" /> : member.full_name?.[0]}</div>
                            <div><h4 className="text-sm font-black text-gray-900 dark:text-slate-100 uppercase">{member.full_name}</h4><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{member.neighborhood}</p></div>
                        </div>
                        <div className="flex items-center space-x-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-xl"><Zap size={10} fill="currentColor" /><span className="text-[10px] font-black">{member.karma}</span></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
