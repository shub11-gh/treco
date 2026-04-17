import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function Auth({ authMode = 'login', setAuthMode }) {
  const isLogin = authMode === 'login';
  const [formData, setFormData] = useState({ name: '', email: '', collegeName: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    // Client-side college email check
    if (!isLogin && !formData.email.endsWith('.edu.in')) {
      setEmailError('Must be a college email ending in .edu.in');
      return;
    }
    setEmailError('');
    setIsSubmitting(true);
    let res;
    if (isLogin) {
      res = await login(formData.email, formData.password);
    } else {
      res = await register(formData.name, formData.email, formData.collegeName, formData.password);
    }
    if (!res.success) {
      setErrorMsg(res.error);
    }
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (e.target.id === 'email') setEmailError('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24 relative z-10">

      {/* ── Left Side: Modern Branding & Copy ── */}
      <div className="hidden md:flex flex-col justify-center flex-1 text-left relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2 mt-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>Join the Green Movement</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-4 text-foreground">
            Your commute, <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">re-imagined for the planet.</span>
          </h1>

          <p className="text-md lg:text-md text-muted-foreground mb-6 max-w-md leading-relaxed">
            Log your daily eco-trips, reduce carbon emissions, and climb the campus leaderboard. Every green mile earns you real rewards.
          </p>

          {/* <div className="flex flex-col gap-2">
            {[
              { title: 'Track', desc: 'Instantly log walks, metros, and bus rides.' },
              { title: 'Earn', desc: 'Collect green points for every kilogram of CO₂ saved.' },
              { title: 'Compete', desc: 'Rise to the top of your university rankings.' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
                className="flex items-start gap-2"
              >
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div> */}
        </motion.div>
      </div>

      {/* ── Right Side: Auth Card ── */}
      <div className="w-full max-w-md flex-shrink-0 relative z-10 mt-4 md:mt-0">
        <div className="flex justify-center mb-6 md:hidden relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Card className="border-border bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="space-y-1 pb-4 pt-6">
                <CardTitle className="text-2xl text-center font-black tracking-tight">{isLogin ? 'Welcome back' : 'Create an account'}</CardTitle>
                <CardDescription className="text-center font-medium">
                  {isLogin ? 'Enter your details to sign in.' : 'Join your campus leaderboard today.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm mb-4">
                    {errorMsg}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-2">
                  {!isLogin && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" className="h-9" value={formData.name} onChange={handleChange} placeholder="Enter your name" required autoComplete="name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collegeName">College Name</Label>
                        <Input id="collegeName" className="h-9" value={formData.collegeName} onChange={handleChange} placeholder="Enter your university name" required autoComplete="organization" />
                      </div>
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">College Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={isLogin ? 'Enter your college email (@college.edu.in)' : 'Enter your college email (@college.edu.in)'}
                      required
                      autoComplete="email"
                      className={`h-9 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{emailError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="h-9" value={formData.password} placeholder="••••••••" onChange={handleChange} required autoComplete={isLogin ? "current-password" : "new-password"} />
                  </div>
                  <Button className="w-full mt-3 h-10 gap-2 font-bold text-md" type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Log In' : 'Sign Up')}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-border/50 py-3 bg-muted/30">
                <Button variant="link" className="text-muted-foreground font-medium hover:text-foreground transition-colors" onClick={() => {
                  setAuthMode(isLogin ? 'signup' : 'login');
                  setErrorMsg('');
                  setEmailError('');
                }}>
                  {isLogin ? "Don't have an account? Sign up here" : "Already have an account? Log in"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
