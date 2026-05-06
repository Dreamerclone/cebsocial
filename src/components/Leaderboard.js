import { Zap, TrendingUp, Award, Crown, Medal } from 'lucide-react';
import { useSocial } from '../contexts/SocialContext';

export default function Leaderboard({ currentUser, data, trendingZone }) {
  const { t } = useSocial();
  const leaderboardData = data && data.length > 0 ? data : [];

  const getRankIcon = (idx) => {
    if (idx === 0) return <Crown size={14} className="text-amber-500" />;
    if (idx === 1) return <Medal size={14} className="text-gray-400" />;
    if (idx === 2) return <Medal size={14} className="text-orange-400" />;
    return null;
  };

  const topNeighbor = leaderboardData[0];

  return (
    <div className="bg-white dark:bg-slate-900 p-7 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm sticky top-24">
        <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 italic flex items-center"><Zap className="mr-2 text-amber-500" size={16} /> Community Pulse</h2>

        {topNeighbor && (
            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white mb-6 shadow-xl shadow-blue-100 dark:shadow-none overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                    <Crown size={60} />
                </div>
                <div className="relative">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-1 opacity-80">Neighbor of the Month</p>
                    <h4 className="text-xs font-black uppercase tracking-widest leading-tight">{topNeighbor.full_name}</h4>
                    <div className="flex items-center space-x-3 mt-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-black">{topNeighbor.initials || topNeighbor.full_name[0]}</div>
                        <div>
                            <p className="text-[8px] font-medium opacity-80">{topNeighbor.neighborhood} • {topNeighbor.karma} Karma</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 mb-4">
            <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Your Standing</p>
            <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-100">{currentUser.name}</p>
                <div className="flex items-center text-[10px] font-black text-amber-500">
                    <Zap size={10} className="mr-1 fill-current" /> {currentUser.karma}
                </div>
            </div>
        </div>

        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 mb-6 group cursor-pointer hover:bg-blue-100/50 transition-colors">
            <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase mb-1 italic">{t.trending}</p>
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-800 dark:text-slate-100">#{trendingZone || 'Cebu City'}</p>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 bg-blue-200 dark:bg-blue-900 overflow-hidden text-[6px] flex items-center justify-center font-black">
                            +
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-4 italic flex items-center"><TrendingUp className="mr-2 text-blue-600" size={16} /> Top Performers</h2>
        <div className="space-y-3">
            {leaderboardData.length > 0 ? leaderboardData.map((neighbor, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                    <div className="flex items-center space-x-3">
                        <div className="w-4 flex justify-center">{getRankIcon(idx) || <span className="text-[10px] font-black text-gray-300">{idx + 1}</span>}</div>
                        <div className={`w-8 h-8 rounded-lg ${idx === 0 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'} flex items-center justify-center text-[10px] font-black shadow-sm group-hover:scale-110 transition-transform`}>
                            {neighbor.initials || neighbor.full_name?.[0]}
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-700 dark:text-slate-200">{neighbor.full_name}</p>
                            <p className="text-[8px] text-gray-400 font-medium uppercase">{neighbor.neighborhood}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-[10px] font-black text-blue-500">
                        <Zap size={10} className="mr-1 fill-current" /> {neighbor.karma}
                    </div>
                </div>
            )) : (
                <div className="py-4 text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase italic">Leaderboard is empty</p>
                </div>
            )}
        </div>
    </div>
  );
}
