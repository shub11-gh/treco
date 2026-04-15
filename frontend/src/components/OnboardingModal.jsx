import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Zap, Trophy, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const STEPS = [
  {
    icon: Leaf,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Welcome to Treco',
    body: 'Treco helps you track your daily commutes, reduce your carbon footprint, and earn rewards for choosing greener transport.',
  },
  {
    icon: Zap,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    title: 'Earn Green Points',
    body: 'Every eco-friendly trip earns you carbon points. Walk = max points. Metro & Bus = great points. Cab = 0 points (but we won\'t judge). Points stack your leaderboard rank.',
  },
  {
    icon: Trophy,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-500/10',
    title: 'Compete & Win Rewards',
    body: 'Climb your campus leaderboard and spend points in the Rewards Vault for real perks — coffee, pizza, gadgets, and more. Ready to go green?',
  },
];

export default function OnboardingModal({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="p-8 flex flex-col items-center text-center gap-6"
          >
            <div className={`w-16 h-16 rounded-2xl ${current.iconBg} flex items-center justify-center border border-border`}>
              <Icon className={`w-8 h-8 ${current.iconColor}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">{current.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{current.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="px-8 pb-8 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{step + 1} / {STEPS.length}</span>
          <Button
            onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
            className="gap-2 font-bold"
          >
            {isLast ? 'Get Started' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
