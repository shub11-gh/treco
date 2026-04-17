import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Flame, Trees, Zap, Target, Pencil, Check, PartyPopper, CloudSun, Sun, Sunset, Moon, MapPin, Navigation, History, Trophy, TrendingUp } from 'lucide-react';
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

// Visual Ecosystem Graphic
function ForestGraphic({ co2 }) {
  // Determine level based on kg
  let level = 1;
  let label = "Tiny Seedling";
  if (co2 >= 20) { level = 2; label = "Growing Sapling"; }
  if (co2 >= 100) { level = 3; label = "Healthy Oak"; }
  if (co2 >= 400) { level = 4; label = "Thriving Forest"; }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="h-40 flex flex-col justify-end relative">
        {level === 1 && (
          <div className="relative w-32 h-32 flex flex-col justify-end items-center mb-4">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute bottom-0 w-16 h-2 bg-amber-900/10 dark:bg-amber-100/10 rounded-full" />
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="absolute bottom-1 w-1.5 h-10 bg-amber-700/80 rounded-full origin-bottom" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="absolute bottom-10 w-8 h-8 bg-primary rounded-tr-full rounded-bl-full rounded-tl-[4px] rounded-br-[4px] rotate-45 shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
          </div>
        )}

        {level === 2 && (
          <div className="relative w-40 h-40 flex flex-col justify-end items-center mb-4">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute bottom-0 w-24 h-2 bg-amber-900/10 dark:bg-amber-100/10 rounded-full" />
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="absolute bottom-1 w-3 h-16 bg-amber-800 rounded-full origin-bottom" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="absolute bottom-10 w-20 h-20 bg-primary rounded-full shadow-[0_0_25px_rgba(16,185,129,0.5)]" />
          </div>
        )}

        {level === 3 && (
          <div className="relative w-48 h-48 flex flex-col justify-end items-center mb-2">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute bottom-0 w-32 h-2.5 bg-amber-900/10 dark:bg-amber-100/10 rounded-full" />
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="absolute bottom-1 w-5 h-24 bg-amber-800 rounded-t-sm rounded-b-md origin-bottom" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="absolute bottom-16 w-28 h-28 bg-primary rounded-full shadow-[0_0_35px_rgba(16,185,129,0.6)]" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="absolute bottom-24 left-8 w-14 h-14 bg-emerald-400 rounded-full" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="absolute bottom-20 right-8 w-16 h-16 bg-emerald-600 rounded-full" />

            {/* Flowers blooming */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring", stiffness: 300 }} className="absolute bottom-32 left-[40%] w-3.5 h-3.5 bg-rose-400 rounded-[4px] rotate-12 shadow-[0_0_10px_rgba(251,113,133,0.8)] z-20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: "spring", stiffness: 300 }} className="absolute bottom-24 left-[25%] w-3 h-3 bg-pink-400 rounded-[3px] -rotate-12 shadow-[0_0_8px_rgba(244,114,182,0.8)] z-20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.85, type: "spring", stiffness: 300 }} className="absolute bottom-28 right-[30%] w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] z-20" />
          </div>
        )}

        {level === 4 && (
          <div className="relative w-64 h-48 flex flex-col justify-end items-center mb-2">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute bottom-0 w-48 h-3 bg-amber-900/10 dark:bg-amber-100/10 rounded-full" />

            {/* Left */}
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="absolute bottom-1 left-12 w-3 h-16 bg-amber-800/80 rounded-full origin-bottom" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="absolute bottom-12 left-6 w-14 h-14 bg-emerald-600 rounded-full" />

            {/* Right */}
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="absolute bottom-1 right-14 w-3.5 h-20 bg-amber-800/90 rounded-full origin-bottom" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="absolute bottom-16 right-6 w-16 h-16 bg-emerald-400 rounded-full" />

            {/* Center Big */}
            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="absolute bottom-1 w-6 h-28 bg-amber-800 rounded-t-sm rounded-b-md origin-bottom z-10" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="absolute bottom-20 w-32 h-32 bg-primary rounded-full shadow-[0_0_40px_rgba(16,185,129,0.7)] z-10" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="absolute bottom-32 left-16 w-16 h-16 bg-emerald-400 rounded-full z-10" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }} className="absolute bottom-24 right-16 w-16 h-16 bg-emerald-600 rounded-full z-10" />

            {/* Spring Flowers Sequence */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.75, type: "spring" }} className="absolute bottom-[110px] left-[35%] w-4 h-4 bg-rose-400 rounded-[4px] rotate-45 shadow-[0_0_12px_rgba(251,113,133,0.9)] z-20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.85, type: "spring" }} className="absolute bottom-[90px] right-[30%] w-3.5 h-3.5 bg-yellow-400 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.9)] z-20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.95, type: "spring" }} className="absolute bottom-[140px] left-[45%] w-3 h-3 bg-pink-400 rounded-sm -rotate-12 shadow-[0_0_10px_rgba(244,114,182,0.9)] z-20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.05, type: "spring" }} className="absolute bottom-[115px] right-[40%] w-2.5 h-2.5 bg-purple-400 rounded-full z-20" />

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.15, type: "spring" }} className="absolute bottom-[80px] left-[20%] w-3 h-3 bg-indigo-300 rounded-[3px] shadow-[0_0_8px_rgba(165,180,252,0.8)] z-20" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.25, type: "spring" }} className="absolute bottom-[75px] right-[15%] w-3.5 h-3.5 bg-rose-300 rounded-[3px] shadow-[0_0_8px_rgba(253,164,175,0.8)] z-20" />
          </div>
        )}
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest">
        <span>Level {level}</span>
        <span className="w-1 h-1 rounded-full bg-primary" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
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
          <Card className="h-full flex-1 border-primary/20 bg-card overflow-hidden relative shadow-[0_0_40px_rgba(16,185,129,0.05)]">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <CardHeader className="pt-5 pb-0">
              <CardTitle className="flex items-center gap-2">
                <Trees className="text-primary w-5 h-5" /> Forest Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2 pb-4">
              <ForestGraphic co2={currentCO2} />

              <div className="flex flex-col gap-1 z-10 text-center mt-2">
                <h3 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
                  <AnimatedNumber value={currentCO2} /> <span className="text-xl">kg CO₂ Saved</span>
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
            <div className="absolute top-0 -translate-x-1/2 left-1/2 w-64 h-64 bg-accent/5 blur-[100px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-accent/10" />
            <CardHeader className="pt-5 pb-0">
              <CardTitle className="flex flex-row items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <Target className={goalPct >= 100 ? "text-primary w-5 h-5" : "text-accent w-5 h-5"} /> Weekly Activity
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
            <CardContent className="flex flex-col md:flex-row items-center justify-center h-full gap-6 md:gap-8 p-4 md:p-6 pt-0 md:pt-0">
              {/* Activity Ring */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 176 176" className="transform -rotate-90 w-36 h-36 drop-shadow-xl z-10 overflow-visible">
                  <circle cx="88" cy="88" r="70" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-muted/30" />
                  <motion.circle
                    cx="88" cy="88" r="70"
                    stroke="currentColor" strokeWidth="15" fill="transparent"
                    strokeDasharray={439.82}
                    initial={{ strokeDashoffset: 439.82 }}
                    animate={{ strokeDashoffset: 439.82 - (goalPct / 100) * 439.82 }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                    className={goalPct >= 100 ? "text-primary" : "text-accent"}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 10px ${goalPct >= 100 ? 'rgba(16,185,129,0.5)' : 'rgba(14,165,233,0.5)'})` }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none z-20 mt-1">
                  <span className="text-3xl font-black text-foreground">
                    <AnimatedNumber value={goalPct} />%
                  </span>
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Goal</span>
                </div>
              </div>

              {/* Data Right */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4 w-full z-10 mt-4 md:mt-0">
                <div className="space-y-1">
                  <div className="text-4xl font-black font-mono tracking-tight">
                    <AnimatedNumber value={Math.min(weeklyPoints, weeklyGoal)} /> <span className="text-muted-foreground text-2xl font-semibold">/ {weeklyGoal.toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Points earned towards your customized weekly threshold.
                  </p>
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {goalPct >= 100 ? (
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl shadow-sm">
                      <PartyPopper className="w-4 h-4" /> Weekly goal crushed!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-2 rounded-xl shadow-sm">
                      <Zap className="w-4 h-4" /> {Math.round(weeklyGoal - Math.min(weeklyPoints, weeklyGoal)).toLocaleString()} points remaining.
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
            <Card className="border-border h-full hover:border-accent transition-colors flex items-center p-6 gap-6 relative overflow-hidden">
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
            <Card className="border-border h-full hover:border-orange-500 transition-colors flex items-center p-6 gap-6 relative overflow-hidden">
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
          <Card className="border-border h-full flex flex-col relative overflow-hidden group">
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
                  <div key={commute._id || i} className="flex flex-row items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:bg-muted/50 transition-colors shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-full text-primary">
                        <Navigation className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{commute.transportMode}</span>
                        <span className="text-xs text-muted-foreground">{commute.distanceKm} km</span>
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
          <Card className="border-border h-full flex flex-col relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-600 drop-shadow-sm" /> Campus Rank
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 items-center justify-center p-6 pt-2 text-center gap-5">
              {userRank ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex flex-col items-center justify-center border-4 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)] relative mt-2 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-4xl font-black text-yellow-600 drop-shadow-md">#{userRank.rank}</span>
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
