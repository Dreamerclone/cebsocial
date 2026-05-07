import React, { useRef, useState } from 'react';
import { MapPin, Image as ImageIcon, X, Tag, AlertTriangle, Calendar, Plus, Minus, BarChart3, Loader2, Users, ChevronDown } from 'lucide-react';
import { uploadImage } from '../lib/utils';

export default function Composer({
  activeTab, user, newPostContent, setNewPostContent, postType, setPostType, newItem, setNewItem,
  selectedZone, setSelectedZone, handleMainPost, zones, marketCategories, pendingImage, setPendingImage,
  feedCategory, setFeedCategory, eventDate, setEventDate, pollOptions, setPollOptions,
  rideDetails, setRideDetails, isSubmitting, t
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  const feedCategories = ['General', 'News', 'Question', 'Lost & Found', 'Ride'];
  const conditions = ['New', 'Used - Like New', 'Needs Repair'];

  const postTypes = [
      { id: 'Normal', icon: <Tag size={16}/>, color: 'text-black dark:text-white', bg: 'bg-gray-100' },
      { id: 'Alert', icon: <AlertTriangle size={16}/>, color: 'text-black dark:text-white', bg: 'bg-gray-100' },
      { id: 'Event', icon: <Calendar size={16}/>, color: 'text-black dark:text-white', bg: 'bg-gray-100' },
      { id: 'Poll', icon: <BarChart3 size={16}/>, color: 'text-black dark:text-white', bg: 'bg-gray-100' },
      { id: 'Ride', icon: <Users size={16}/>, color: 'text-black dark:text-white', bg: 'bg-gray-100' },
  ];

  return (
    <div className={`surface-card rounded-3xl border shadow-2xl shadow-primary-500/5 transition-all duration-500 overflow-hidden ${isExpanded ? 'p-6' : 'p-3'}`}>
      <div className="space-y-4">
        {activeTab === 'Feed' ? (
          <div className="space-y-4">
            {!isExpanded ? (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900 p-2 rounded-[2rem] transition-colors"
                >
                    <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xs font-black shadow-lg overflow-hidden flex-shrink-0">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.initials}
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-zinc-900 px-6 py-2.5 rounded-2xl border border-transparent text-muted font-bold text-[13px] uppercase tracking-wider">
                        What's on your mind, {user.name.split(' ')[0]}?
                    </div>
                    <div className="p-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-xl mr-2">
                        <Plus size={20} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-start space-x-3 mb-2 animate-fade-in">
                        <div className={`w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xs font-black shadow-lg overflow-hidden flex-shrink-0`}>
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.initials}
                        </div>
                        <div className="flex-1">
                            <textarea
                                autoFocus
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                maxLength={500}
                                placeholder={`What's on your mind?`}
                                className={`w-full bg-transparent p-2 text-[16px] focus:outline-none min-h-[120px] border-none resize-none text-main placeholder:text-muted font-medium`}
                            />
                        </div>
                        <button onClick={() => { setIsExpanded(false); setPostType('Normal'); }} className="p-2 text-muted hover:text-red-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Dynamic Input Areas */}
                    <div className="space-y-4">
                        {pendingImage && (
                            <div className="relative inline-block group">
                                <div className="w-40 h-40 rounded-3xl overflow-hidden border surface-card shadow-2xl">
                                    <img src={pendingImage} className="w-full h-full object-cover" alt="preview" />
                                </div>
                                <button onClick={() => setPendingImage(null)} className="absolute -top-3 -right-3 w-9 h-9 surface-card rounded-full shadow-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors border">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {postType === 'Poll' && (
                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border space-y-3 animate-slide-down">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <h4 className="text-[10px] font-black uppercase text-main tracking-widest">Poll Options</h4>
                                    <button onClick={() => setPostType('Normal')} className="text-muted hover:text-red-500"><X size={16}/></button>
                                </div>
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
                                            className="flex-1 bg-white dark:bg-zinc-900 border rounded-xl px-5 py-3 text-xs font-bold outline-none text-main transition-all focus:border-primary-600"
                                        />
                                        {pollOptions.length > 2 && (
                                            <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                                                <Minus size={16}/>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {pollOptions.length < 5 && (
                                    <button onClick={() => setPollOptions([...pollOptions, ''])} className="flex items-center space-x-2 text-[10px] font-black text-primary-600 uppercase tracking-widest px-1 hover:opacity-70 mt-2">
                                        <Plus size={14}/> <span>Add Option</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {postType === 'Event' && (
                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-[2rem] border animate-slide-down flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl text-primary-600">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-muted uppercase tracking-widest">Pick Event Date</p>
                                        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="bg-transparent text-[13px] font-black outline-none text-main cursor-pointer" />
                                    </div>
                                </div>
                                <button onClick={() => setPostType('Normal')} className="text-muted hover:text-red-500"><X size={16}/></button>
                            </div>
                        )}

                        {postType === 'Ride' && (
                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border animate-slide-down">
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <h4 className="text-[10px] font-black uppercase text-main tracking-widest">Ride Details</h4>
                                    <button onClick={() => setPostType('Normal')} className="text-muted hover:text-red-500"><X size={16}/></button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 border rounded-xl px-5 py-3 transition-all focus-within:border-primary-600">
                                        <MapPin size={18} className="text-primary-600" />
                                        <input
                                            placeholder="Destination"
                                            value={rideDetails?.destination || ''}
                                            onChange={(e) => setRideDetails({...rideDetails, destination: e.target.value})}
                                            className="bg-transparent text-xs font-bold outline-none text-main w-full"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3 bg-white dark:bg-zinc-900 border rounded-xl px-5 py-3 transition-all focus-within:border-primary-600">
                                        <Users size={18} className="text-primary-600" />
                                        <input
                                            type="number"
                                            placeholder="Seats"
                                            value={rideDetails?.seats || ''}
                                            onChange={(e) => setRideDetails({...rideDetails, seats: e.target.value})}
                                            className="bg-transparent text-xs font-bold outline-none text-main w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800">
                        <div className="flex items-center space-x-2">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="p-3 text-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-xl transition-all" title="Add Photo">
                                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                            </button>

                            <div className="relative group">
                                <button onClick={() => setShowOptions(!showOptions)} className={`p-3 rounded-xl transition-all ${postType !== 'Normal' ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10'}`} title="Post Type">
                                    {postTypes.find(t => t.id === postType)?.icon || <Tag size={20} />}
                                </button>

                                {showOptions && (
                                    <div className="absolute bottom-full left-0 mb-3 w-56 surface-card border rounded-[2rem] shadow-2xl py-2.5 z-50 animate-slide-up">
                                        {postTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => { setPostType(type.id); setShowOptions(false); }}
                                                className={`w-full flex items-center space-x-4 px-5 py-3.5 text-[11px] font-black uppercase tracking-widest transition-colors ${postType === type.id ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600' : 'text-muted hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-main'}`}
                                            >
                                                <span className={postType === type.id ? 'text-primary-600' : 'text-muted'}>{type.icon}</span>
                                                <span>{type.id === 'Normal' ? 'Standard' : type.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setShowZoneSelector(!showZoneSelector)} className={`p-3 rounded-xl transition-all ${showZoneSelector ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/10' : 'text-muted hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10'}`} title="Location">
                                <MapPin size={20} />
                            </button>

                            {showZoneSelector && (
                                <div className="relative">
                                    <div className="absolute bottom-full left-0 mb-3 surface-card border rounded-[1.5rem] shadow-2xl p-2 z-50 animate-slide-up">
                                        <select value={selectedZone} onChange={(e) => { setSelectedZone(e.target.value); setShowZoneSelector(false); }} className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-main p-3 min-w-[140px]">
                                            {zones.map(z => <option key={z} value={z}>{z}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <select value={feedCategory} onChange={(e) => setFeedCategory(e.target.value)} className="bg-gray-50 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-muted rounded-xl px-4 py-2 outline-none border-none cursor-pointer ml-2 hover:bg-gray-100 transition-colors">
                                {feedCategories.map(cat => <option key={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <button
                        onClick={async () => {
                            await handleMainPost();
                            setIsExpanded(false);
                        }}
                        disabled={isSubmitting || !newPostContent.trim()}
                        className={`bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center space-x-3 ${isSubmitting || !newPostContent.trim() ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> <span>{t?.post || 'Post'}</span></>}
                        </button>
                    </div>
                </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} placeholder="What are you selling?" className="w-full bg-gray-50 dark:bg-zinc-900 border rounded-2xl p-4 text-[13px] font-bold outline-none focus:border-primary-600 transition-all text-main placeholder:text-muted shadow-inner" />
                <input value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} placeholder="Price ₱" className="w-full bg-gray-50 dark:bg-zinc-900 border rounded-2xl p-4 text-[13px] font-bold outline-none focus:border-primary-600 transition-all text-main placeholder:text-muted shadow-inner" />
            </div>

            <div className="flex flex-wrap gap-4">
                <select value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} className="flex-1 bg-gray-50 dark:bg-zinc-900 border rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest outline-none text-main cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">
                    {marketCategories.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={newItem.condition} onChange={(e) => setNewItem({...newItem, condition: e.target.value})} className="flex-1 bg-gray-50 dark:bg-zinc-900 border rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest outline-none text-main cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">
                    {conditions.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                placeholder="Describe what you're selling (features, defects, etc.)"
                className="w-full bg-gray-50 dark:bg-zinc-900 border rounded-2xl p-5 text-[13px] font-bold outline-none focus:border-primary-600 min-h-[140px] resize-none transition-all text-main placeholder:text-muted shadow-inner"
            />

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800">
                 <button onClick={() => fileInputRef.current.click()} className="flex items-center space-x-3 px-6 py-3 bg-gray-50 dark:bg-zinc-900 border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary-600 transition-all">
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                    <span>{pendingImage ? 'Change Photo' : 'Add Photo'}</span>
                </button>

                <button
                  onClick={handleMainPost}
                  disabled={isSubmitting || !newItem.title.trim()}
                  className="bg-primary-600 text-white px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-95"
                >
                    {isSubmitting ? 'Listing...' : 'List Item'}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
