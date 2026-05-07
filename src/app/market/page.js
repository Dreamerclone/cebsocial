'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Search, Filter, TrendingUp, Sparkles } from 'lucide-react';
import { useSocial } from '../../contexts/SocialContext';
import MarketCard from '../../components/MarketCard';
import Composer from '../../components/Composer';
import Skeleton from '../../components/Skeleton';
import { CEBU_ZONES } from '../../lib/constants';
import { useRouter } from 'next/navigation';
import DashboardShell from '../../components/DashboardShell';

export default function MarketPage() {
  const {
    user, marketItems, loading, toggleSaveItem, addToast,
    handleMarkSold, handleDeleteMarketItem,
    calculateDistance, createMarketItem, activeFilter, searchQuery,
    setSelectedImage, setViewingNeighbor, setViewingShop, setEditingItem
  } = useSocial();

  const router = useRouter();
  const [marketCategory, setMarketCategory] = useState('All');
  const [priceSort, setPriceSort] = useState('Newest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', price: '', category: 'General', condition: 'New', description: '' });
  const [selectedZone, setSelectedZone] = useState('Lahug');
  const [pendingImage, setPendingImage] = useState(null);

  const filteredMarketItems = useMemo(() => {
    return marketItems
      .filter(i => (activeFilter === 'All City' || i.location === activeFilter))
      .filter(i => (marketCategory === 'All' || i.category === marketCategory))
      .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (priceSort === 'Low-High') {
            const getVal = (s) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
            return getVal(a.price) - getVal(b.price);
        }
        if (priceSort === 'High-Low') {
            const getVal = (s) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
            return getVal(b.price) - getVal(a.price);
        }
        return 0;
      });
  }, [marketItems, activeFilter, marketCategory, searchQuery, priceSort]);

  const trendingItems = useMemo(() => marketItems.slice(0, 3), [marketItems]);

  const handleCreateItem = async () => {
    if (!newItem.title.trim()) return addToast('Title is required', 'error');
    setIsSubmitting(true);
    try {
      const { error } = await createMarketItem({
          ...newItem,
          location: selectedZone,
          image: pendingImage
      });
      if (error) return addToast('Failed to list: ' + error.message, 'error');
      setNewItem({ title: '', price: '', category: 'General', condition: 'New', description: '' });
      setPendingImage(null);
      addToast('Item listed in marketplace!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 uppercase italic tracking-tighter">Marketplace</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Buy & Sell within your neighborhood</p>
            </div>
            <div className="flex items-center space-x-2">
                <div className="flex items-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-sm">
                    <TrendingUp size={14} className="text-green-500 mr-2" />
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{marketItems.length} active listings</span>
                </div>
            </div>
        </div>

        <Composer
            activeTab="Market" user={user}
            newItem={newItem} setNewItem={setNewItem}
            selectedZone={selectedZone} setSelectedZone={setSelectedZone}
            handleMainPost={handleCreateItem} zones={CEBU_ZONES}
            marketCategories={['Food', 'Tech', 'Free', 'General', 'Services', 'Home', 'Fashion']}
            pendingImage={pendingImage} setPendingImage={setPendingImage}
            isSubmitting={isSubmitting}
        />

        {/* Featured Section */}
        {marketCategory === 'All' && !searchQuery && (
            <div className="space-y-4 animate-slide-down">
                <div className="flex items-center space-x-2 px-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Trending in {activeFilter}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setViewingShop(item)}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 relative">
                                {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag size={32} /></div>}
                                <div className="absolute top-2 right-2 bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg">{item.price}</div>
                            </div>
                            <h5 className="font-black text-[10px] text-gray-900 dark:text-slate-100 uppercase truncate">{item.title}</h5>
                            <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">{item.location}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-[72px] z-20 bg-[#F8FAFC]/80 dark:bg-slate-950/80 backdrop-blur-md py-4 -mx-2 px-2">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm"><Filter size={14} className="text-gray-400" /></div>
                {['All', 'Food', 'Tech', 'Services', 'Home', 'Fashion', 'Free'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setMarketCategory(cat)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shadow-sm button-pop ${marketCategory === cat ? 'bg-green-600 text-white border-green-600 shadow-green-100' : 'bg-white dark:bg-slate-900 text-gray-400 border-gray-100 dark:border-slate-800 hover:border-green-200 hover:text-green-600'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter whitespace-nowrap">Sort By</span>
                <select
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest outline-none text-gray-500 shadow-sm cursor-pointer hover:border-blue-200 transition-colors"
                >
                    <option>Newest</option>
                    <option>Low-High</option>
                    <option>High-Low</option>
                </select>
            </div>
        </div>

        <div className="space-y-4">
          {loading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} type="market" />)
          ) : (
              filteredMarketItems.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredMarketItems.map(item => (
                            <MarketCard
                              key={item.id} item={item} currentUser={user}
                              toggleSave={(id) => toggleSaveItem(id, 'market')}
                              onMessage={() => router.push(`/messages?chat=${item.user_id}`)}
                              onMarkSold={handleMarkSold}
                              onDelete={handleDeleteMarketItem}
                              onEdit={setEditingItem}
                              distance={calculateDistance(item.coords)}
                              onImageClick={setSelectedImage}
                              onViewProfile={(profile) => router.push(`/profile/${profile.id}`)}
                              onViewShop={setViewingShop}
                              onShare={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/item/${item.id}`);
                                  addToast('Link copied!');
                              }}
                              onReport={() => addToast('Reported', 'info')}
                            />
                    ))}
                  </div>
              ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 p-16 text-center shadow-sm animate-slide-up">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-gray-200">
                        <ShoppingBag size={32} />
                      </div>
                      <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">No Listings Found</h3>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">Try changing your filters or location</p>
                      <button onClick={() => { setMarketCategory('All'); setActiveFilter('All City'); }} className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-100 hover:border-blue-600 transition-all">Clear All Filters</button>
                  </div>
              )
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
