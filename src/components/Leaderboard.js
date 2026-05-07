import { Zap, TrendingUp, Award, Crown, Medal, User } from 'lucide-react';
import { useSocial } from '../contexts/SocialContext';
import { useRouter } from 'next/navigation';

export default function Leaderboard({ currentUser, data, trendingZone, onSelectGroup, setActiveTab }) {
  const { t, trendingGroups } = useSocial();
  const router = useRouter();
  const leaderboardData = data && data.length > 0 ? data : [];

  const getRankIcon = (idx) => {
    if (idx === 0) return <Crown size={14} className="text-amber-500" />;
    if (idx === 1) return <Medal size={14} className="text-gray-400" />;
    if (idx === 2) return <Medal size={14} className="text-orange-400" />;
    return null;
  };

  const topNeighbor = leaderboardData[0];

  return (
    <div className="surface-card p-8 rounded-[3rem] border shadow-sm sticky top-24 transition-all duration-700">
        <h2 className="font-black text-[10px] uppercase tracking-widest text-muted mb-8 italic flex items-center"><Zap className="mr-3 text-amber-500" size={18} /> Community Pulse</h2>

        {topNeighbor && (
            <div
                onClick={() => router.push(`/profile/${topNeighbor.id}`)}
                className="p-6 bg-primary-600 text-white rounded-[2rem] mb-8 shadow-2xl shadow-primary-500/20 overflow-hidden relative group cursor-pointer"
            >
                <div className="absolute -top-4 -right-4 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                    <Crown size={100} />
                </div>
                <div className="relative">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Neighbor of the Month</p>
                    <h4 className="text-sm font-black uppercase tracking-widest leading-tight">{topNeighbor.full_name}</h4>
                    <div className="flex items-center space-x-4 mt-5">
                        <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-sm">{topNeighbor.initials || topNeighbor.full_name[0]}</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-90">{topNeighbor.neighborhood}</p>
                            <p className="text-[9px] font-bold opacity-70 mt-0.5">{topNeighbor.karma} XP COLLECTED</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="p-5 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border mb-5">
            <p className="text-[9px] font-black text-muted uppercase mb-2 tracking-widest">Your Status</p>
            <div className="flex justify-between items-center">
                <p className="text-xs font-black text-main uppercase italic">{currentUser.name}</p>
                <div className="flex items-center text-[11px] font-black text-primary-600">
                    <Zap size={12} className="mr-1.5 fill-current" /> {currentUser.karma}
                </div>
            </div>
        </div>

        <div className="p-5 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border mb-8 group cursor-pointer hover:border-primary-600/30 transition-all">
            <p className="text-[9px] font-black text-muted uppercase mb-2 tracking-widest italic">Current Hotspot</p>
            <div className="flex items-center justify-between">
                <p className="text-xs font-black text-main uppercase tracking-tighter">#{trendingZone || 'Cebu City'}</p>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 surface-card bg-primary-100 dark:bg-primary-900 text-primary-600 text-[8px] flex items-center justify-center font-black uppercase">
                            +
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {trendingGroups && trendingGroups.length > 0 && (
            <div className="mb-10">
                <h2 className="font-black text-[10px] uppercase tracking-widest text-muted mb-5 italic flex items-center">
                    <TrendingUp className="mr-3 text-primary-600" size={18} /> Trending Now
                </h2>
                <div className="space-y-4">
                    {trendingGroups.map(group => (
                        <div
                            key={group.id}
                            onClick={() => {
                                if (onSelectGroup) onSelectGroup(group);
                                if (setActiveTab) setActiveTab('Groups');
                            }}
                            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm group-hover:rotate-6 transition-transform">
                                    <img src={group.image} className="w-full h-full object-cover" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-black text-main uppercase truncate w-28 tracking-tighter">{group.name}</p>
                                    <p className="text-[9px] text-muted font-black uppercase tracking-widest mt-0.5">{(group.members || 0)} Members</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                <TrendingUp size={12} className="text-primary-600" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <h2 className="font-black text-[10px] uppercase tracking-widest text-muted mb-5 italic flex items-center"><TrendingUp className="mr-3 text-main" size={18} /> Hall of Fame</h2>
        <div className="space-y-4">
            {leaderboardData.length > 0 ? leaderboardData.map((neighbor, idx) => (
                <div
                    key={idx}
                    onClick={() => router.push(`/profile/${neighbor.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-all group cursor-pointer"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-5 flex justify-center">{getRankIcon(idx) || <span className="text-[10px] font-black text-muted">{idx + 1}</span>}</div>
                        <div className={`w-10 h-10 rounded-xl ${idx === 0 ? 'bg-primary-600 text-white' : 'bg-gray-50 dark:bg-zinc-800 text-main'} flex items-center justify-center text-[11px] font-black shadow-sm group-hover:scale-110 transition-transform uppercase`}>
                            {neighbor.initials || neighbor.full_name?.[0]}
                        </div>
                        <div>
                            <p className="text-[12px] font-black text-main leading-tight">{neighbor.full_name}</p>
                            <p className="text-[9px] text-muted font-black uppercase tracking-tighter mt-0.5">{neighbor.neighborhood}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[11px] font-black text-primary-600">
                        <Zap size={12} className="mr-1.5 fill-current" /> {neighbor.karma}
                    </div>
                </div>
            )) : (
                <div className="py-8 text-center opacity-30">
                    <p className="text-[10px] font-black text-muted uppercase italic tracking-widest">No data available</p>
                </div>
            )}
        </div>
    </div>
  );
}
