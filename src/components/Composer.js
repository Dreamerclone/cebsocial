import React, { useRef, useState } from 'react';
import { MapPin, Image as ImageIcon, X, Tag, AlertTriangle, Calendar, Plus, Minus, BarChart3, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/utils';

export default function Composer({
  activeTab, user, newPostContent, setNewPostContent, postType, setPostType, newItem, setNewItem,
  selectedZone, setSelectedZone, handleMainPost, zones, marketCategories, pendingImage, setPendingImage,
  feedCategory, setFeedCategory, eventDate, setEventDate, pollOptions, setPollOptions, isSubmitting
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        setIsUploading(true);
        const url = await uploadImage(file);
        if (url) setPendingImage(url);
        setIsUploading(false);
    }
  };

  const feedCategories = ['News', 'Question', 'Lost & Found', 'General'];
  const conditions = ['New', 'Used - Like New', 'Needs Repair'];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/40 dark:shadow-none transition-colors">
      <div className="space-y-4">
        {activeTab === 'Feed' ? (
          <div className="space-y-4">
            <div className="relative">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  maxLength={500}
                  placeholder={`Share something with the city, ${user.name.split(' ')[0]}...`}
                  className={`w-full bg-gray-50 dark:bg-slate-800 rounded-[1.8rem] p-6 text-sm focus:outline-none min-h-[120px] border-none resize-none transition-all focus:bg-white dark:focus:bg-slate-700 dark:text-slate-200 ${postType === 'Alert' ? 'ring-2 ring-red-100 dark:ring-red-900/30' : ''}`}
                />
                <div className={`absolute bottom-4 right-6 text-[9px] font-black uppercase tracking-widest ${newPostContent.length > 450 ? 'text-red-500' : 'text-gray-300'}`}>
                    {newPostContent.length} / 500
                </div>
            </div>

            {/* Poll Creation UI */}
            {postType === 'Poll' && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/50 space-y-3 animate-slide-down">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest px-1">Poll Options</h4>
                    {pollOptions.map((opt, idx) => (
                        <div key={idx} className="flex space-x-2">
                            <input
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...pollOptions];
                                    newOpts[idx] = e.target.value;
                                    setPollOptions(newOpts);
                                }}
                                placeholder={`Option ${idx + 1}`}
                                className="flex-1 bg-white dark:bg-slate-800 border border-blue-50 dark:border-blue-900/30 rounded-xl px-4 py-2 text-xs font-bold outline-none dark:text-slate-200"
                            />
                            {pollOptions.length > 2 && (
                                <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                    <Minus size={14}/>
                                </button>
                            )}
                        </div>
                    ))}
                    {pollOptions.length < 5 && (
                        <button onClick={() => setPollOptions([...pollOptions, ''])} className="flex items-center space-x-2 text-[9px] font-black text-blue-600 uppercase tracking-widest px-1 hover:opacity-70">
                            <Plus size={12}/> <span>Add Option</span>
                        </button>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
                {feedCategories.map(cat => (
                    <button
                    key={cat}
                    onClick={() => setFeedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${feedCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 border-gray-100 dark:border-slate-700 hover:border-blue-200'}`}
                    >
                    {cat}
                    </button>
                ))}
                </div>

                {postType === 'Event' && (
                    <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800 animate-slide-down">
                        <Calendar size={12} className="text-amber-600" />
                        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none text-amber-700 dark:text-amber-400 cursor-pointer" />
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} placeholder="What are you selling?" className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-sm border-none outline-none focus:bg-white dark:focus:bg-slate-700 dark:text-slate-200 transition-all shadow-inner" />
                <input value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="Price ₱" className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-sm border-none outline-none focus:bg-white dark:focus:bg-slate-700 dark:text-slate-200 transition-all shadow-inner" />
            </div>

            <div className="flex flex-wrap gap-2">
                <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-xs font-black outline-none border-none dark:text-slate-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                    {marketCategories.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={newItem.condition} onChange={(e) => setNewItem({...newItem, condition: e.target.value})} className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 text-xs font-black outline-none border-none dark:text-slate-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                    {conditions.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Describe what you're selling (features, defects, etc.)"
                className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-sm border-none outline-none focus:bg-white dark:focus:bg-slate-700 dark:text-slate-200 min-h-[100px] resize-none transition-all shadow-inner"
            />
          </div>
        )}

        {pendingImage && (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden group shadow-lg">
                <img src={pendingImage} className="w-full h-full object-cover" alt="preview" />
                <button onClick={() => setPendingImage(null)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                </button>
            </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-slate-800 mt-2">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
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
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all flex-shrink-0"
                >
                    {isUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                    <span>{isUploading ? 'Uploading...' : 'Photo'}</span>
                </button>

                {activeTab === 'Feed' && (
                    <div className="flex items-center space-x-1 border-l border-gray-100 dark:border-slate-800 pl-2 overflow-x-auto no-scrollbar">
                        {['Normal', 'Alert', 'Event', 'Poll'].map(type => (
                            <button
                                key={type}
                                onClick={() => setPostType(type)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all flex-shrink-0 ${postType === type ? (type === 'Alert' ? 'bg-red-500 text-white shadow-lg' : type === 'Event' ? 'bg-amber-500 text-white shadow-lg' : type === 'Poll' ? 'bg-purple-600 text-white shadow-lg' : 'bg-blue-600 text-white shadow-lg') : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}
                            >
                                {type === 'Alert' ? <AlertTriangle size={12}/> : type === 'Event' ? <Calendar size={12}/> : type === 'Poll' ? <BarChart3 size={12}/> : <Tag size={12}/>}
                                <span>{type}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-3 ml-auto">
                <div className="flex items-center bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-gray-100 dark:border-slate-700 flex-shrink-0">
                    <MapPin size={12} className="text-blue-600 mr-2" />
                    <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer dark:text-slate-300">
                        {zones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                </div>

                <button
                  onClick={handleMainPost}
                  disabled={isSubmitting || (activeTab === 'Feed' ? !newPostContent.trim() : !newItem.title.trim())}
                  className={`bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex-shrink-0 flex items-center space-x-2 ${(isSubmitting || (activeTab === 'Feed' ? !newPostContent.trim() : !newItem.title.trim())) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>{activeTab === 'Feed' ? 'Posting...' : 'Listing...'}</span>
                        </>
                    ) : (
                        <span>{activeTab === 'Feed' ? 'Post' : 'List'}</span>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
