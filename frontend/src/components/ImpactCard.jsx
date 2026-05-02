import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, Flame, Zap, Trees, Share2, Download } from 'lucide-react';
import { Button } from './ui/button';

export default function ImpactCard({ user, onClose }) {
  if (!user) return null;

  const co2Saved = Math.round((user.totalPoints || 0) / 10);
  const treesSaved = Math.floor(co2Saved / 20);
  const streak = user.currentStreak || 0;
  const points = user.totalPoints || 0;
  const kmAvoided = Math.round(co2Saved * 5); // rough estimate

  // Tier label
  const tier =
    points >= 10000 ? { label: 'Legend', color: 'text-yellow-400' } :
      points >= 5000 ? { label: 'Champion', color: 'text-primary' } :
        points >= 1000 ? { label: 'Commuter', color: 'text-blue-400' } :
          { label: 'Beginner', color: 'text-muted-foreground' };

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleShare = () => {
    const text = `I've saved ${co2Saved}kg of CO2 and earned ${points.toLocaleString()} green points on Treco! Join your campus eco leaderboard.`;
    if (navigator.share) {
      navigator.share({ title: 'My Treco Impact Card', text }).catch(() => { });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const calculateLevelInfo = (points) => {
    const level = Math.floor(points / 500) + 1;
    const currentLevelPoints = points % 500;
    const progress = (currentLevelPoints / 500) * 100;

    let title = "Eco-Seedling";
    if (level >= 50) title = "Forest Guardian";
    else if (level >= 30) title = "Nature Protector";
    else if (level >= 15) title = "Green Warrior";
    else if (level >= 5) title = "Carbon Crusader";

    return { level, title, progress, nextLevel: level + 1 };
  };

  const levelInfo = calculateLevelInfo(user?.totalPoints || 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm relative"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Card — designed to be screenshotted */}
          <div
            id="eco-impact-card"
            className="rounded-2xl overflow-hidden border border-primary/30 bg-card"
          >
            {/* Header gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

            <div className="p-6 flex flex-col gap-5">
              {/* Logo + name row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src="/trecoLogo.png"
                    alt="Treco Logo"
                    className="h-7 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span className="font-bold text-lg tracking-tight">Treco</span>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${tier.color} border-current/20 bg-current/5`}>
                  {tier.label}
                </span>
              </div>

              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-15 h-15 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-3xl font-black tracking-tight flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.collegeName}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <span className="text-xs font-bold text-foreground uppercase tracking-[0.1em] bg-white/5 px-3 py-1 rounded-sm border border-white/10 whitespace-nowrap">
                  LEVEL {levelInfo.level} • {levelInfo.title}
                </span>
              </div>

              {/* Big CO2 number */}
              <div className="text-center py-4 relative">
                <div className="absolute inset-0 bg-primary/5 rounded-xl" />
                <p className="text-3xl font-black text-primary leading-none">
                  {co2Saved}
                  <span className="text-xl text-muted-foreground ml-1">kg</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">CO<sub>2</sub> Saved from the Atmosphere</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Trees, color: 'text-primary', bg: 'bg-primary/10', value: treesSaved, label: 'Trees Equiv.' },
                  { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10', value: `${streak}d`, label: 'Streak' },
                  { icon: Zap, color: 'text-accent', bg: 'bg-accent/10', value: points >= 1000 ? `${(points / 1000).toFixed(1)}k` : points, label: 'Points' },
                ].map(({ icon: Icon, color, bg, value, label }) => (
                  <div key={label} className={`rounded-xl ${bg} p-3 text-center border border-border`}>
                    <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                    <p className={`text-lg font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                  </div>
                ))}
              </div>

              {/* Footer tag */}
              <p className="text-center text-xs text-muted-foreground tracking-wider">
                Treco — Green Commutes. Real Rewards.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleShare} className="flex-1 gap-2">
              <Share2 className="w-4 h-4" /> Share Impact Card
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
