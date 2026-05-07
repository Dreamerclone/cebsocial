'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingBag, Search, Filter, TrendingUp, Sparkles, Tag, LayoutGrid, List as ListIcon, MapPin, Gift } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('List');
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
      addToast('Item listed successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
        {/* Modern Shopping Hero */}
        <div className="relative rounded-[3rem] overflow-hidden bg-zinc-900 dark:bg-white p-8 md:p-12 text-white dark:text-black shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-green-500 to-transparent"></div>
                <ShoppingBag size={300} className="absolute -right-20 -bottom-20 rotate-12" />
            </div>

            <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Local Trade</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1"><MapPin size={12} /> {activeFilter}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6">
                    Find what you need, <br />
                    <span className="text-green-500">right next door.</span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for items, electronics, services..."
                            className="w-full bg-white/10 dark:bg-zinc-100 backdrop-blur-md border border-white/10 dark:border-zinc-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                    </div>
                    <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                        Browse All
                    </button>
                </div>
            </div>
        </div>

        {/* Quick Categories Bar - Like a real shopping app */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {['All', 'Food', 'Tech', 'Services', 'Home', 'Fashion', 'Free'].map(cat => (
                <button
                    key={cat}
                    onClick={() => setMarketCategory(cat)}
                    className={`flex flex-col items-center gap-2 min-w-[80px] group transition-all`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${marketCategory === cat ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-white dark:bg-zinc-900 border text-muted group-hover:border-green-500/50'}`}>
                        {cat === 'All' && <LayoutGrid size={20} />}
                        {cat === 'Food' && <Tag size={20} />}
                        {cat === 'Tech' && <Sparkles size={20} />}
                        {cat === 'Services' && <TrendingUp size={20} />}
                        {cat === 'Home' && <ShoppingBag size={20} />}
                        {cat === 'Fashion' && <Tag size={20} />}
                        {cat === 'Free' && <Gift size={20} />}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${marketCategory === cat ? 'text-green-600' : 'text-muted'}`}>{cat}</span>
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left Filter Sidebar - Traditional Shopping UX */}
            <div className="hidden lg:block space-y-8 sticky top-24">
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Sort By</h4>
                    <div className="space-y-2">
                        {['Newest', 'Low-High', 'High-Low'].map(s => (
                            <button key={s} onClick={() => setPriceSort(s)} className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${priceSort === s ? 'bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-600/10' : 'text-muted hover:text-main'}`}>
                                {s === 'Low-High' ? 'Price: Low to High' : s === 'High-Low' ? 'Price: High to Low' : s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-xl shadow-green-500/20">
                    <h4 className="font-black text-sm uppercase italic mb-2">Sell Something?</h4>
                    <p className="text-[10px] font-medium opacity-80 mb-4">Turn your unwanted items into extra cash today.</p>
                    <button onClick={() => document.getElementById('market-composer').scrollIntoView({behavior:'smooth'})} className="w-full py-2.5 bg-white text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">List Item</button>
                </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
                <div id="market-composer">
                    <Composer
                        activeTab="Market" user={user}
                        newItem={newItem} setNewItem={setNewItem}
                        selectedZone={selectedZone} setSelectedZone={setSelectedZone}
                        handleMainPost={handleCreateItem} zones={CEBU_ZONES}
                        marketCategories={['Food', 'Tech', 'Free', 'General', 'Services', 'Home', 'Fashion']}
                        pendingImage={pendingImage} setPendingImage={setPendingImage}
                        isSubmitting={isSubmitting}
                    />
                </div>

                {/* Grid vs List Toggle Header */}
                <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="text-sm font-black text-main uppercase tracking-widest flex items-center gap-2">
                        {marketCategory} Products <span className="text-[10px] text-muted font-bold">({filteredMarketItems.length})</span>
                    </h3>
                    <div className="flex gap-1 bg-gray-50 dark:bg-zinc-900 p-1 rounded-xl">
                        <button onClick={() => setViewMode('Grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'Grid' ? 'bg-white dark:bg-zinc-800 text-green-600 shadow-sm' : 'text-muted'}`}><LayoutGrid size={16}/></button>
                        <button onClick={() => setViewMode('List')} className={`p-2 rounded-lg transition-all ${viewMode === 'List' ? 'bg-white dark:bg-zinc-800 text-green-600 shadow-sm' : 'text-muted'}`}><ListIcon size={16}/></button>
                    </div>
                </div>

                <div className="min-h-[400px]">
                  {loading ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <Skeleton type="market" />
                        <Skeleton type="market" />
                        <Skeleton type="market" />
                      </div>
                  ) : (
                      filteredMarketItems.length > 0 ? (
                          <div className={viewMode === 'Grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-6' : 'space-y-4'}>
                            {filteredMarketItems.map(item => (
                                <MarketCard
                                  key={item.id} item={item} currentUser={user}
                                  viewMode={viewMode}
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
                          <div className="py-20 text-center opacity-30 flex flex-col items-center">
                              <ShoppingBag size={48} className="mb-4" />
                              <p className="text-sm font-black uppercase tracking-widest">No listings found</p>
                              <button onClick={() => setMarketCategory('All')} className="mt-4 text-[10px] font-black text-green-600 underline uppercase">Reset Filters</button>
                          </div>
                      )
                  )}
                </div>
            </div>
        </div>
      </div>
    </DashboardShell>
  );
}
