import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { Flame, Trees, Zap, Target, Pencil, Check, PartyPopper, CloudSun, Sun, Sunset, Moon, MapPin, Navigation, History, Trophy, TrendingUp, ShieldCheck, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';

// Animated counter component
function AnimatedNumber({ value, decimals = 0 }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1.4, ease: 'easeOut' });
    return controls.stop;
  }, [value, motionVal]);

  return <motion.span>{rounded}</motion.span>;
}

// Sub-component for individual trees in the forest
const Tree = ({ height, width, color, delay, offset = 0, zIndex = 10 }) => (
  <div
    className="absolute bottom-0 flex flex-col items-center origin-bottom"
    style={{ left: `calc(50% + ${offset}px)`, zIndex }}
  >
    <motion.div
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="w-1.5 rounded-t-full bg-amber-900/40"
      style={{ height: height * 0.4 }}
    />
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: delay + 0.2, type: "spring", damping: 12 }}
      className={`absolute bottom-full rounded-full border border-white/5 shadow-inner ${color}`}
      style={{ width, height: width, marginBottom: -height * 0.1 }}
    />
  </div>
);

// Visual Ecosystem Graphic
function ForestGraphic({ co2 }) {
  let level = 1;
  let label = "Tiny Seedling";
  if (co2 >= 20) { level = 2; label = "Growing Sapling"; }
  if (co2 >= 100) { level = 3; label = "Healthy Oak"; }
  if (co2 >= 400) { level = 4; label = "Thriving Forest"; }

  return (
    <div className="w-full flex flex-col items-center gap-3 py-2">
      <div className="relative w-full max-w-[280px] h-40 flex items-end justify-center overflow-visible px-10">
        {/* Ground/Dirt Base */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 w-full h-1.5 bg-foreground/5 rounded-full"
        />

        <AnimatePresence mode="wait">
          {level === 1 && (
            <motion.div key="l1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full">
              <Tree height={40} width={32} color="bg-primary/80" delay={0.1} />
            </motion.div>
          )}

          {level === 2 && (
            <motion.div key="l2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full">
              <Tree height={80} width={64} color="bg-primary" delay={0.1} />
            </motion.div>
          )}

          {level === 3 && (
            <motion.div key="l3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full">
              <Tree height={60} width={50} color="bg-emerald-600/60" delay={0.1} offset={-40} zIndex={5} />
              <Tree height={100} width={80} color="bg-primary" delay={0.2} offset={0} zIndex={10} />
              <Tree height={70} width={55} color="bg-emerald-400/70" delay={0.3} offset={45} zIndex={5} />
            </motion.div>
          )}

          {level === 4 && (
            <motion.div key="l4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full scale-110 md:scale-125 origin-bottom">
              {/* Back Row */}
              <Tree height={60} width={45} color="bg-emerald-700/40" delay={0.1} offset={-70} zIndex={1} />
              <Tree height={75} width={55} color="bg-emerald-800/50" delay={0.2} offset={75} zIndex={1} />

              {/* Mid Row */}
              <Tree height={90} width={70} color="bg-emerald-600/70" delay={0.3} offset={-40} zIndex={5} />
              <Tree height={85} width={65} color="bg-emerald-500/80" delay={0.4} offset={45} zIndex={5} />

              {/* Front Hero Tree */}
              <Tree height={120} width={90} color="bg-primary" delay={0.5} offset={0} zIndex={10} />

              {/* Dynamic Flowers (only for Level 4) */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                  className={`absolute w-2 h-2 rounded-full z-20 ${['bg-rose-400', 'bg-yellow-400', 'bg-sky-400', 'bg-pink-400'][i % 4]}`}
                  style={{
                    bottom: 80 + Math.sin(i * 45) * 40,
                    left: `calc(50% + ${Math.cos(i * 45) * 50}px)`
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        layout
        className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-[0.15em] shadow-sm"
      >
        <span className="opacity-60">Level {level}</span>
        <span className="w-1 h-1 rounded-full bg-primary/40" />
        <span>{label}</span>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const { user, checkAuth } = useAuthStore();
  
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${url}`;
  };

  const [recentCommutes, setRecentCommutes] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    // Fetch History
    api.get('/commutes/history')
      .then(res => {
        if (res.data.activities) {
          setRecentCommutes(res.data.activities.slice(0, 3));
        }
      })
      .catch(err => console.error("History fetch error:", err));

    // Fetch Leaderboard for Rank Teaser
    api.get('/leaderboard/campus')
      .then(res => {
        if (res.data.leaderboard) {
          const mapped = res.data.leaderboard.map((item, i) => ({ ...item, rank: i + 1 }));
          const me = mapped.find(u => u._id === user?._id);
          if (me) setUserRank(me);
        }
      })
      .catch(err => console.error("Leaderboard fetch error:", err));
  }, [user?._id]);

  // ── Weekly goal (localStorage) ───────────────────────────────────────
  const GOAL_KEY = 'weeklyGoalPoints';
  const [weeklyGoal, setWeeklyGoal] = useState(() => Number(localStorage.getItem(GOAL_KEY)) || 500);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(weeklyGoal);

  const weeklyPoints = Math.min(user?.totalPoints || 0, weeklyGoal * 2);
  const goalPct = Math.min((weeklyPoints / weeklyGoal) * 100, 100);

  const saveGoal = () => {
    const val = Math.max(10, Number(goalInput) || 500);
    setWeeklyGoal(val);
    localStorage.setItem(GOAL_KEY, val);
    setEditingGoal(false);
  };

  // Fire confetti when goal is first reached
  const goalCelebrated = useRef(false);
  useEffect(() => {
    if (goalPct >= 100 && !goalCelebrated.current) {
      goalCelebrated.current = true;
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#10b981', '#3b82f6', '#facc15', '#a7f3d0'],
      });
    }
    if (goalPct < 100) goalCelebrated.current = false;  // reset if goal changes
  }, [goalPct]);
  // ─────────────────────────────────────────────────────────────────────

  const targetCO2 = 100;
  const currentCO2 = Math.round((user?.totalPoints || 0) / 10);
  const percentage = Math.min((currentCO2 / targetCO2) * 100, 100);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (percentage / 100) * circumference);

  const firstName = user?.name?.split(' ')[0] || 'Warrior';
  const getDynamicContext = () => {
    const hour = new Date().getHours();
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

    if (hour >= 5 && hour < 12) {
      return {
        title: `Good morning, ${firstName}.`,
        message: "Crisp 22°C outside! Perfect weather for a 3km cycle to campus.",
        icon: CloudSun,
        color: "text-amber-500",
        bg: "bg-amber-500/15 border-amber-500/30 dark:bg-amber-500/20 dark:border-amber-500/40"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        title: `Looking bright, ${firstName}!`,
        message: "Traffic is picking up. The Metro is your fastest and greenest option right now.",
        icon: Sun,
        color: "text-yellow-500",
        bg: "bg-yellow-500/15 border-yellow-500/30 dark:bg-yellow-500/20 dark:border-yellow-500/40"
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        title: `Good evening, ${firstName}.`,
        message: `You survived ${dayName}! Take the Metro back and earn an easy +14 pts.`,
        icon: Sunset,
        color: "text-indigo-500",
        bg: "bg-indigo-500/15 border-indigo-500/30 dark:bg-indigo-500/20 dark:border-indigo-500/40"
      };
    } else {
      return {
        title: `Late night, ${firstName}?`,
        message: "If you're heading back, prioritize a safe Cab or ride with friends.",
        icon: Moon,
        color: "text-blue-500",
        bg: "bg-blue-500/15 border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-500/40"
      };
    }
  };

  const ctx = getDynamicContext();
  const CtxIcon = ctx.icon;

  return (
    <div className="w-full max-w-[1400px] flex flex-col gap-5 mx-auto xl:px-8">

      {/* ── ROW 1: Dynamic Context Widget ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border p-3 md:p-4 md:px-6 backdrop-blur-md shadow-sm transition-colors duration-500 ${ctx.bg}`}
      >
        <div className="absolute inset-0 bg-white/5 dark:bg-black/5 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left">
          <div className={`p-2 rounded-xl bg-background/80 backdrop-blur-md border border-border shadow-sm flex-shrink-0 ${ctx.color}`}>
            <CtxIcon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight font-serif text-foreground">
              {ctx.title}
            </h1>
            <p className="text-sm md:text-base font-medium text-muted-foreground max-w-2xl mt-0.5">
              {ctx.message}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── ROW 2: Gamification Dashboard (Side by Side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

        {/* Living Forest Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="h-full flex flex-col"
        >
          <Card className="h-full flex-1 border-primary/20 bg-card overflow-hidden relative hover:border-primary/40 transition-all duration-300">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <CardHeader className="pt-4 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Trees className="text-primary w-7 h-7" /> Forest Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-0 pb-3">
              <ForestGraphic co2={currentCO2} />

              <div className="flex flex-col gap-0.5 z-10 text-center mt-1">
                <h3 className="text-xl md:text-2xl font-bold flex items-center justify-center gap-2">
                  <AnimatedNumber value={currentCO2} /> <span className="text-lg">kg CO₂ Saved</span>
                </h3>
                <p className="text-sm font-medium text-muted-foreground max-w-[280px] mx-auto">
                  That's roughly equivalent to planting <strong className="text-foreground">{Math.max(1, Math.floor(currentCO2 / 20))}</strong> mature trees!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Activity Ring Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="h-full flex flex-col"
        >
          <Card className="h-full flex-1 border-border relative overflow-hidden group hover:border-accent/40 transition-colors">
            <div className="absolute top-0 -translate-x-1/2 left-1/2 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-accent/8" />
            <CardHeader className="pt-4 pb-0">
              <CardTitle className="flex flex-row items-center justify-between w-full">
                <span className="flex items-center gap-2 text-lg">
                  <Target className={goalPct >= 100 ? "text-primary w-7 h-7" : "text-accent w-6 h-6"} /> Weekly Activity
                </span>
                {!editingGoal ? (
                  <button
                    onClick={() => { setGoalInput(weeklyGoal); setEditingGoal(true); }}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-background border border-border p-1 rounded-lg shadow-sm">
                    <input
                      type="text"
                      value={goalInput}
                      onChange={e => setGoalInput(e.target.value)}
                      className="w-16 bg-transparent text-foreground px-2 py-1 text-sm font-bold font-mono focus:outline-none"
                      min={10}
                    />
                    <span className="text-xs text-muted-foreground border-l border-border pl-2 border-r pr-2">pts</span>
                    <button onClick={saveGoal} className="text-primary hover:bg-primary/10 p-1.5 rounded-md transition-colors mr-1">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-start h-full gap-2 p-2 pt-0">
              {/* Activity Ring */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 176 176" className="transform -rotate-90 w-36 h-36 drop-shadow-xl z-10 ">
                  <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-muted/30" />
                  <motion.circle
                    cx="88" cy="88" r="70"
                    stroke="currentColor" strokeWidth="15" fill="transparent"
                    strokeDasharray={439.82}
                    initial={{ strokeDashoffset: 439.82 }}
                    animate={{ strokeDashoffset: 439.82 - (goalPct / 100) * 439.82 }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    className={goalPct >= 100 ? "text-green-400" : "text-accent"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none z-20 mt-2">
                  <span className="text-2xl font-black text-foreground leading-none">
                    <AnimatedNumber value={goalPct} />%
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Goal</span>
                </div>
              </div>

              {/* Data Center */}
              <div className="flex flex-col items-center text-center gap-3 w-full z-10">
                <div className="space-y-0.5">
                  <div className="text-3xl font-black font-mono tracking-tight">
                    <AnimatedNumber value={Math.min(weeklyPoints, weeklyGoal)} /> <span className="text-muted-foreground text-xl font-semibold">/ {weeklyGoal.toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Points earned towards your customized weekly threshold.
                  </p>
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {goalPct >= 100 ? (
                    <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-2 rounded-xl shadow-sm">
                      <PartyPopper className="w-4 h-4" /> Weekly goal crushed!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-2 rounded-xl shadow-sm">
                      <Zap className="w-4 h-4" /> {Math.round(weeklyGoal - Math.min(weeklyPoints, weeklyGoal)).toLocaleString()} points remaining
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── ROW 3: Feedback Tier (Stats, History, Leaderboard) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

        {/* Column 1: Quick Stats (Stacked vertically) */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="h-full">
            <Card className="border-border h-full hover:border-accent/40 transition-colors flex items-center p-6 gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-full bg-accent/5 blur-2xl pointer-events-none" />
              <div className="p-4 bg-accent/10 text-accent rounded-2xl shadow-sm z-10">
                <Zap className="w-8 h-8" />
              </div>
              <div className="flex flex-col z-10">
                <span className="text-4xl font-bold tracking-tight">
                  <AnimatedNumber value={user?.totalPoints || 0} />
                </span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Points</span>
              </div>
            </Card>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="h-full">
            <Card className="border-border h-full hover:border-orange-500/40 transition-colors flex items-center p-6 gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-full bg-orange-500/5 blur-2xl pointer-events-none" />
              <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl shadow-sm z-10">
                <Flame className="w-8 h-8" />
              </div>
              <div className="flex flex-col z-10">
                <span className="text-4xl font-bold tracking-tight">
                  <AnimatedNumber value={user?.currentStreak || 0} /> Days
                </span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Green Streak</span>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Column 2: Recent History Widget */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="h-full relative z-20">
          <Card className="border-border h-full flex flex-col relative overflow-hidden group hover:border-primary/40">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl pointer-events-none rounded-full" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-muted-foreground" /> Recent Commutes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 flex-1 justify-start">
              {recentCommutes.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8 font-medium">Log your first trip!</div>
              ) : (
                  recentCommutes.map((commute, i) => (
                    <div key={commute._id || i} className="group/item flex flex-row items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-full text-primary relative">
                          <Navigation className="w-4 h-4" />
                          {commute.isVerified && (
                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-card shadow-sm" title="AI Verified">
                              <ShieldCheck className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold flex items-center gap-1.5">
                            {commute.transportMode}
                            {commute.isVerified && <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Verified</span>}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-2">
                            {commute.distanceKm} km
                            {commute.proofUrl && (
                              <a 
                                href={getFullUrl(commute.proofUrl)} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[9px] font-bold text-blue-500 hover:underline uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                              >
                                View Proof
                              </a>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                        +{commute.pointsEarned}
                      </div>
                    </div>
                  ))
                )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Column 3: Leaderboard Rank Teaser */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="h-full relative z-20">
          <Card className="border-border h-full flex flex-col relative overflow-hidden group hover:border-yellow-500/40">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-600 drop-shadow-sm" /> Campus Rank
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 items-center justify-center p-6 pt-2 text-center gap-5">
              {userRank ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex flex-col items-center justify-center border-4 border-yellow-500/30 relative mt-2 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-4xl font-black text-yellow-600">#{userRank.rank}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">Current Rank <span className="text-yellow-600">#{userRank.rank}</span></p>
                    <p className="text-sm font-semibold text-muted-foreground flex items-center justify-center gap-1 border border-border px-3 py-1 bg-background/50 backdrop-blur rounded-full">
                      <TrendingUp className="w-4 h-4 text-emerald-500" /> Top {Math.max(1, Math.round((userRank.rank / 50) * 100))}%
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Trophy className="w-10 h-10 text-muted-foreground/30" />
                  <span className="text-muted-foreground text-sm font-medium">Rank calculating...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
