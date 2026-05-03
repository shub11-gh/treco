import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Flame, Crown } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import Spinner from '../components/ui/Spinner';
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
        trend: item.carbonDebt > 50 ? 'down' : (item.currentStreak > 5 ? 'up' : (item.currentStreak === 0 ? 'down' : 'same'))
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
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rank1 = top3.find(l => l.rank === 1);
  const rank2 = top3.find(l => l.rank === 2);
  const rank3 = top3.find(l => l.rank === 3);

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
        <div className="text-center md:text-left w-full">
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex justify-center md:justify-start items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Campus Leaderboard
          </h1>
          <p className="text-muted-foreground mx-auto md:mx-0">{user?.collegeName || 'Your Campus'} Rankings</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex justify-center flex-row items-end gap-2 md:gap-6 mt-8 mb-8 h-48 select-none">
          {/* Rank 2 - Silver */}
          {rank2 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center w-1/3 max-w-[120px]">
              <span className="font-bold mb-3 truncate max-w-[80px] text-slate-600/90" title={rank2.name}>{rank2.name.split(' ')[0]}</span>
              <div className="w-full bg-slate-400/10 rounded-t-xl border border-b-0 border-slate-600/40 h-24 flex items-start justify-center pt-3 text-3xl font-black text-slate-500/80 backdrop-blur-md">2</div>
            </motion.div>
          )}

          {/* Rank 1 - Gold */}
          {rank1 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center w-1/3 max-w-[140px] z-10 relative">
              <div className="absolute top-[-40px] w-full flex justify-center">
                <Crown className="text-yellow-400 w-9 h-9 fill-yellow-500/20" />
              </div>
              <span className="font-bold mb-3 text-yellow-500 truncate max-w-[100px] text-lg mt-3" title={rank1.name}>{rank1.name.split(' ')[0]}</span>
              <div className="w-full bg-yellow-500/15 rounded-t-2xl border border-b-0 border-yellow-400/50 h-32 flex items-start justify-center pt-3 text-4xl font-black text-yellow-500/80 backdrop-blur-md relative overflow-hidden">
                1
              </div>
            </motion.div>
          )}

          {/* Rank 3 - Bronze */}
          {rank3 && (
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center w-1/3 max-w-[120px]">
              <span className="font-bold mb-3 truncate max-w-[80px] text-orange-500/80" title={rank3.name}>{rank3.name.split(' ')[0]}</span>
              <div className="w-full bg-orange-500/10 rounded-t-xl border border-b-0 border-orange-400/40 h-20 flex items-start justify-center pt-3 text-2xl font-black text-orange-500/60 backdrop-blur-md">3</div>
            </motion.div>
          )}
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3">
        {leaders.map((person) => (
          <motion.div key={person._id} variants={item}>
            <Card className={`overflow-hidden transition-all duration-300 backdrop-blur-xl ${person.isUser ? 'border-yellow-500 bg-yellow-700/2 scale-[1.02] z-10' : 'border-border/50 bg-card/40 hover:bg-card/70 hover:shadow-md'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 font-bold text-center ${person.rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {person.rank === 1 ? <Trophy className="w-4 h-4 text-yellow-600 mx-auto" /> : `#${person.rank}`}
                  </div>
                  <div>
                    <div className={`font-semibold text-base flex items-center gap-2 ${person.isUser ? 'text-yellow-500' : ''}`}>
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
