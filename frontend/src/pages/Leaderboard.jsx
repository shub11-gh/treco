import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, RefreshCw, Flame, Medal } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { ListSkeleton } from '../components/Skeletons';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data } = await api.get('/leaderboard/campus');
      const mapped = data.leaderboard.map((item, index) => ({
        ...item,
        rank: index + 1,
        points: item.totalPoints,
        isUser: item._id === user?._id,
        trend: item.currentStreak > 5 ? 'up' : (item.currentStreak === 0 ? 'down' : 'same')
      }));
      setLeaders(mapped);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="h-9 w-56 bg-muted rounded-lg animate-pulse" />
        <ListSkeleton count={5} />
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rank1 = top3.find(l => l.rank === 1);
  const rank2 = top3.find(l => l.rank === 2);
  const rank3 = top3.find(l => l.rank === 3);

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div className="text-center md:text-left flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Campus Leaderboard</h1>
          <p className="text-muted-foreground">{user?.collegeName || 'Your Campus'} Rankings</p>
        </div>
        <button onClick={fetchLeaderboard} className="p-2 text-muted-foreground hover:text-primary transition-colors">
           <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
      <div className="flex justify-center flex-row items-end gap-2 md:gap-6 mt-8 mb-8 h-48 select-none">
        {/* Rank 2 */}
        {rank2 && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-1/3 max-w-[120px]">
          <span className="font-bold mb-2 truncate max-w-[80px]" title={rank2.name}>{rank2.name.split(' ')[0]}</span>
          <div className="w-full bg-slate-800 rounded-t-lg border border-b-0 border-slate-700 h-24 flex items-start justify-center pt-2 text-2xl font-black text-slate-500">2</div>
        </motion.div>
        )}
        
        {/* Rank 1 */}
        {rank1 && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center w-1/3 max-w-[140px] z-10">
          <Trophy className="text-yellow-500 w-8 h-8 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <span className="font-bold mb-2 text-yellow-500 truncate max-w-[100px]" title={rank1.name}>{rank1.name.split(' ')[0]}</span>
          <div className="w-full bg-gradient-to-t from-yellow-900/50 to-yellow-600/20 rounded-t-lg border border-b-0 border-yellow-700/50 h-32 flex items-start justify-center pt-2 text-3xl font-black text-yellow-500 shadow-[0_-10px_30px_rgba(234,179,8,0.1)]">1</div>
        </motion.div>
        )}
        
        {/* Rank 3 */}
        {rank3 && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center w-1/3 max-w-[120px]">
          <span className="font-bold mb-2 truncate max-w-[80px]" title={rank3.name}>{rank3.name.split(' ')[0]}</span>
          <div className="w-full bg-amber-900/30 rounded-t-lg border border-b-0 border-amber-800/50 h-20 flex items-start justify-center pt-2 text-2xl font-black text-amber-700">3</div>
        </motion.div>
        )}
      </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3">
        {leaders.map((person) => (
          <motion.div key={person._id} variants={item}>
            <Card className={`overflow-hidden transition-colors ${person.isUser ? 'border-primary shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-primary/10' : 'border-border hover:bg-muted/50'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 font-bold text-center ${person.rank <= 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                    {person.rank === 1 ? <Trophy className="w-4 h-4 text-yellow-500 mx-auto" /> : `#${person.rank}`}
                  </div>
                  <div>
                    <div className={`font-semibold text-base ${person.isUser ? 'text-primary' : ''}`}>
                      {person.name} {person.isUser && <span className="text-xs font-normal text-muted-foreground">(You)</span>}
                    </div>
                    {person.currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-xs text-orange-400 mt-0.5">
                        <Flame className="w-3 h-3" /> {person.currentStreak} day streak
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-mono font-bold text-lg">{person.points.toLocaleString()} <span className="text-xs text-muted-foreground">pts</span></div>
                  <div className="w-5 flex justify-center">
                    {person.trend === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
                    {person.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                    {person.trend === 'same' && <Minus className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
