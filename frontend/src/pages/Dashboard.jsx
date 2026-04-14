import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Flame, Trees, Zap, Target, Pencil, Check, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import useAuthStore from '../store/useAuthStore';

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

export default function Dashboard() {
  const { user } = useAuthStore();

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

  return (
    <div className="w-full max-w-4xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome Back, {user?.name?.split(' ')[0] || 'Warrior'}.
        </h1>
        <p className="text-muted-foreground w-full max-w-[600px]">
          You're steadily dropping your carbon footprint. Prioritize public transit this week to hit your goal.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* CO2 Ring Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 md:col-span-2"
        >
          <Card className="h-full border-primary/20 bg-card overflow-hidden relative shadow-[0_0_40px_rgba(16,185,129,0.05)]">
            <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trees className="text-primary" /> Forest Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 py-8">
              <div className="relative flex items-center justify-center">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted" />
                  <motion.circle
                    cx="96" cy="96" r={radius}
                    stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    className="text-primary"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-foreground">
                    <AnimatedNumber value={currentCO2} />
                  </span>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">kg CO₂</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 z-10 text-center md:text-left">
                <h3 className="text-2xl font-bold">
                  ~ <AnimatedNumber value={Math.floor(currentCO2 / 20)} /> Trees Saved
                </h3>
                <p className="text-sm text-muted-foreground">
                  You are {Math.max(0, targetCO2 - currentCO2)} kg away from your target this month.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="h-full">
            <Card className="border-border h-full hover:border-accent transition-colors delay-75">
              <CardContent className="flex flex-col items-center justify-center p-6 h-full gap-2 text-center">
                <div className="p-3 bg-accent/10 text-accent rounded-full mb-2">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-4xl font-bold flex">
                  <AnimatedNumber value={user?.totalPoints || 0} />
                </span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Points</span>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="h-full">
            <Card className="border-border h-full relative overflow-hidden">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-24 bg-orange-500/10 blur-2xl pointer-events-none" />
              <CardContent className="flex flex-col items-center justify-center p-6 h-full gap-2 z-10 relative text-center">
                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-full mb-2">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-4xl font-bold">
                  <AnimatedNumber value={user?.currentStreak || 0} /> Days
                </span>
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Green Streak</span>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ── Weekly Goal Card ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" /> Weekly Goal
              </span>
              {!editingGoal ? (
                <button
                  onClick={() => { setGoalInput(weeklyGoal); setEditingGoal(true); }}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    className="w-24 bg-muted text-foreground border border-border rounded-md px-2 py-1 text-sm font-mono text-right focus:outline-none focus:ring-1 focus:ring-accent"
                    min={10}
                  />
                  <span className="text-xs text-muted-foreground">pts</span>
                  <button onClick={saveGoal} className="text-primary hover:text-primary/80 transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Points earned this week</span>
              <span className="font-bold font-mono">
                <AnimatedNumber value={Math.min(weeklyPoints, weeklyGoal)} /> / {weeklyGoal.toLocaleString()} pts
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${goalPct >= 100 ? 'bg-primary shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-accent'
                  }`}
                initial={{ width: 0 }}
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {goalPct >= 100 ? (
                <>
                  <PartyPopper className="w-3.5 h-3.5 text-primary" />
                  Weekly goal crushed — you are on fire!
                </>
              ) : (
                `${Math.round(weeklyGoal - Math.min(weeklyPoints, weeklyGoal)).toLocaleString()} pts to go — keep commuting green!`
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
