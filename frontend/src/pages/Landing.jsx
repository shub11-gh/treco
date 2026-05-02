import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Zap, MapPin, Target, Trophy, Clock, ShieldCheck, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Automatically cycles through mock gamification screens to show value
function HeroCarousel() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto h-[400px] bg-card/40 backdrop-blur-2xl rounded-3xl border border-border flex flex-col justify-center overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="w-full flex justify-center">
            <div className="flex flex-col items-center gap-6 text-center px-8 z-10 w-full">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center border border-accent/40">
                <Navigation className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Smart Eco Routing</h3>
                <p className="text-sm text-muted-foreground font-medium">Instantly map the fastest route from Indiranagar to Reva University using Namma Metro.</p>
              </div>
              <div className="w-full bg-background/50 border border-border p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2"><MapPin className="text-red-500 w-4 h-4" /><span className="font-mono text-sm max-w-[150px] truncate">Indiranagar</span></div>
                <div className="h-[2px] flex-1 bg-border mx-2 relative"><div className="absolute top-0 left-0 h-full bg-accent animate-pulse w-full"></div></div>
                <div className="flex items-center gap-2"><MapPin className="text-primary w-4 h-4" /><span className="font-mono text-sm max-w-[150px] truncate">Reva University</span></div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="w-full flex justify-center">
            <div className="flex flex-col items-center gap-6 text-center px-8 z-10 w-full">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Log Miles, Earn Rewards</h3>
                <p className="text-sm text-muted-foreground font-medium">Offset your carbon footprint via BMTC bus commutes and generate spendable green points.</p>
              </div>
              <div className="w-full bg-background border border-primary/30 p-4 rounded-xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-[3500ms] ease-out w-[100%]" />
                <span className="relative z-10 font-bold text-sm flex items-center gap-2"><CheckCircleIcon /> Commute Saved</span>
                <span className="relative z-10 font-mono font-black text-primary text-xl">+45 pts</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.5 }} className="w-full flex justify-center">
            <div className="flex flex-col items-center gap-6 text-center px-8 z-10 w-full">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/40">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Conquer Your Campus</h3>
                <p className="text-sm text-muted-foreground font-medium">Climb the Global Leaderboard across Bengaluru's massive university network.</p>
              </div>
              <div className="w-full bg-background border border-border p-3 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 p-2 rounded-lg"><span className="font-bold text-xs">#1 You</span><span className="text-yellow-600 font-mono text-xs">12,500</span></div>
                <div className="flex justify-between items-center px-2 py-1"><span className="text-sm text-muted-foreground">#2 RVCE Titans</span><span className="font-mono text-xs text-muted-foreground">11,200</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2].map((dot) => (
          <button
            key={dot}
            onClick={() => setStep(dot)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${step === dot ? 'bg-primary w-6' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
            aria-label={`Go to slide ${dot + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}

export default function Landing({ setAuthMode }) {
  return (
    <div className="w-full">
      {/* ── Hero Section ── */}
      <section id="hero" className="w-full max-w-7xl mx-auto px-4 xl:px-8 pt-10 pb-20 md:pt-10 md:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative z-10 min-h-[calc(100vh-80px)]">
        <div className="flex-1 flex flex-col text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <Leaf className="w-3.5 h-3.5" />
              <span>Join the Green Movement</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-foreground">
              Your commute, <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">re-imagined for the planet.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Use Treco's AI to plot the greenest path across Bengaluru. Log your BMTC & Namma Metro rides and earn real campus rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={() => setAuthMode('signup')} className="px-8 py-4 rounded-xl bg-primary shadow-md hover:shadow-primary/20 text-primary-foreground font-bold text-lg transition-all hover:-translate-y-1">
                Start Earning Points
              </button>
            </div>
          </motion.div>
        </div>
        <div className="flex-1 w-full relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <HeroCarousel />
          </motion.div>
        </div>
      </section>

      {/* ── Campuses Marquee ── */}
      <section id="campuses" className="w-full border-y border-border/50 bg-muted/20 py-10 overflow-hidden relative z-10 backdrop-blur-md">
        <div className="text-center mb-6">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Powering Green Initiatives at</p>
        </div>
        <div className="flex w-[200%] animate-[marquee_20s_linear_infinite] gap-12 lg:gap-24 items-center pl-12 lg:pl-24">
          {['IISc Bengaluru', 'RVCE', 'PES University', 'Christ University', 'Reva University', 'BMSCE', 'IISc Bengaluru', 'RVCE', 'PES University', 'Christ University'].map((college, i) => (
            <h3 key={i} className="text-xl md:text-3xl font-black text-muted-foreground opacity-50 whitespace-nowrap">{college}</h3>
          ))}
        </div>
      </section>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
      `}} />

      {/* ── Core Features ── */}
      <section id="features" className="w-full max-w-7xl mx-auto px-4 xl:px-8 py-10 md:py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Master the Grid</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Beat the Silk Board traffic with data. Convert everyday transportation into aggressive ecological action.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-card/40 backdrop-blur-md border-primary/20 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 border border-primary/20"><Navigation className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold mb-2">BMTC & Metro Logging</h3>
              <p className="text-muted-foreground leading-relaxed">Ditch the cab. Treco natively tracks points for bus and metro rides alongside your daily walks.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-accent/20 hover:border-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4 border border-accent/20"><ShieldCheck className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold mb-2">Streak Shields</h3>
              <p className="text-muted-foreground leading-relaxed">Missed a day? Buy a streak shield from the Rewards Vault using your green points to protect your ranking.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/40 backdrop-blur-md border-yellow-500/20 hover:border-yellow-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 mb-4 border border-yellow-500/20"><Target className="w-6 h-6" /></div>
              <h3 className="text-xl font-bold mb-2">Custom AI Thresholds</h3>
              <p className="text-muted-foreground leading-relaxed">The Smart Engine calculates dynamic point goals based on your specific Bengaluru campus distance.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Mission Statement ── */}
      <section id="mission" className="w-full max-w-7xl mx-auto px-4 xl:px-8 py-10 md:py-20 relative z-10 border-t border-border/50">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Our Ecological Mission.</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Global carbon emissions are reaching critical levels, and urban transportation now contributing significantly to the world's ecological footprint.
            </p>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Treco isn't just an app; it's a movement to reclaim our planet's future. By incentivizing the shift to public transit and sustainable fleets through gamification, we aim to collectively slice millions of kilograms of CO₂ from the atmosphere. Your daily commute is your greatest weapon against the climate crisis.
            </p>
            <div className="pt-4 flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-4 bg-card/60 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-xl">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500"><Zap className="w-6 h-6" /></div>
                <div className="text-left">
                  <div className="text-2xl font-black tracking-tight">-2.4M kg</div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">CO₂ Target for 2026</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="w-full aspect-square md:aspect-[4/3] bg-card/40 backdrop-blur-3xl border border-border/50 rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center">
              {/* Decorative Abstract Map representation */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              <div className="relative z-10 flex flex-col items-center gap-6 p-8">
                <Trophy className="w-20 h-20 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
                <h3 className="text-2xl font-bold font-serif italic max-w-sm text-center">"Empowering the next generation of eco-warriors."</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Global Leaderboard Preview ── */}
      <section id="leaderboard" className="w-full max-w-5xl mx-auto px-4 xl:px-8 py-10 md:py-20 relative z-10 border-t border-border/50">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">The Arena</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Who's leading the charge? Watch colleges across Bengaluru battle for ecological supremacy in real-time.</p>
        </div>

        <div className="relative w-full rounded-3xl overflow-hidden border border-border/50 bg-card/10 backdrop-blur-md shadow-2xl">
          {/* Mock Ranks */}
          <div className="flex flex-col divide-y divide-border/50 p-2 filter blur-[4px] opacity-60 select-none pointer-events-none">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-background/20 rounded-xl m-2">
                <div className="flex items-center gap-4">
                  <div className="w-8 font-black text-xl text-muted-foreground">#{i}</div>
                  <div>
                    <div className="h-4 w-32 bg-foreground/20 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-muted-foreground/20 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-primary/20 rounded"></div>
              </div>
            ))}
          </div>

          {/* Locked Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-background/30 backdrop-blur-[6px] z-20">
            <div className="w-16 h-16 bg-card border border-border rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-foreground">Leaderboard Locked</h3>
            <p className="text-muted-foreground font-medium mb-6 text-center max-w-md">Create an account to join your campus and unveil the live Bengaluru rankings.</p>
            <button onClick={() => setAuthMode('signup')} className="px-6 py-4 rounded-xl bg-foreground text-background font-bold text-md transition-transform hover:-translate-y-1 cursor-pointer shadow-md transition-transform">
              Create Free Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
