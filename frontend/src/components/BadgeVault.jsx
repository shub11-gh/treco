import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Flame, Building2, MapPin, Target, ShieldCheck, Crown } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const BADGE_DATA = [
  {
    id: 'seedling',
    name: 'Eco-Seedling',
    description: 'Welcome to the green movement.',
    icon: Target,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    check: () => true // Always unlocked
  },
  {
    id: 'metro-master',
    name: 'Metro Master',
    description: '10+ Metro journeys logged.',
    icon: MapPin,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    check: (user, stats) => (stats?.metroCount || 0) >= 10
  },
  {
    id: 'streak-stalker',
    name: 'Streak Stalker',
    description: 'Maintain a 7-day green streak.',
    icon: Flame,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    check: (user) => (user?.currentStreak || 0) >= 7
  },
  {
    id: 'campus-legend',
    name: 'Campus Legend',
    description: 'Reach Rank #1 on your campus.',
    icon: Crown,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    check: (user, stats) => stats?.rank === 1
  },
  {
    id: 'carbon-crusader',
    name: 'Carbon Crusader',
    description: 'Save over 50kg of CO2.',
    icon: ShieldCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
    check: (user) => (user?.totalPoints || 0) / 10 >= 50
  },
  {
    id: 'university-hero',
    name: 'University Hero',
    description: 'Contribute 10% of total campus points.',
    icon: Building2,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    check: (user, stats) => {
      if (!stats?.campusTotal || !user?.totalPoints) return false;
      const percent = (user.totalPoints / stats.campusTotal) * 100;
      return percent >= 10;
    }
  }
];

export default function BadgeVault({ user, stats }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Achievement Vault
        </h3>
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
          {BADGE_DATA.filter(b => b.check(user, stats)).length} / {BADGE_DATA.length} Unlocked
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar mask-fade-right">
        {BADGE_DATA.map((badge) => {
          const isUnlocked = badge.check(user, stats);
          const Icon = badge.icon;

          return (
            <motion.div
              key={badge.id}
              whileHover={isUnlocked ? { y: -5 } : {}}
              className="flex-shrink-0"
            >
              <Card className={`w-34 h-40 flex flex-col items-center justify-center text-center transition-all duration-500 border-border/50 relative px-2 overflow-hidden group ${!isUnlocked ? 'opacity-40 grayscale pointer-events-none' : 'bg-card/40 hover:bg-card/60'}`}>
                {isUnlocked && (
                  <div className={`absolute top-0 right-0 w-12 h-12 ${badge.bg} blur-xl rounded-full opacity-50`} />
                )}

                <div className={`p-3 rounded-2xl mb-3 z-10 transition-colors ${isUnlocked ? badge.bg + ' ' + badge.color : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-7 h-7" />
                </div>

                <div className="space-y-1 z-10">
                  <div className={`text-sm font-bold uppercase tracking-tighter leading-none ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {badge.name}
                  </div>
                  <div className="text-[12px] text-muted-foreground leading-tight line-clamp-2 px-1">
                    {badge.description}
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Locked</span>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
