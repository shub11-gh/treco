import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function Auth({ authMode, setAuthMode }) {
  const isLogin = authMode === 'login';
  const isOpen = authMode === 'login' || authMode === 'signup';

  const [formData, setFormData] = useState({ name: '', email: '', collegeName: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setAuthMode(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setAuthMode]);

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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuthMode(null)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md shadow-2xl"
          >
            <Card className="border-border bg-card/90 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="space-y-1 pb-6 pt-6 flex flex-col items-center">
                <div className="w-16 h-16 mb-4 bg-background/50 rounded-2xl border border-border/50 p-2 flex items-center justify-center shadow-inner overflow-hidden">
                  <img src="/trecoLogo.png" alt="Treco" className="w-full h-full object-contain" />
                </div>
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
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" className="h-9 bg-background/50 mt-2" value={formData.name} onChange={handleChange} placeholder="Enter your name" required autoComplete="name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collegeName">College Name</Label>
                        <Input id="collegeName" className="h-9 mt-2 bg-background/50" value={formData.collegeName} onChange={handleChange} placeholder="Enter your university name" required autoComplete="organization" />
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
                      className={`h-9 mt-2 bg-background/50 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    />
                    {emailError && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{emailError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="h-9 bg-background/50 mt-2" value={formData.password} placeholder="********" onChange={handleChange} required autoComplete={isLogin ? "current-password" : "new-password"} />
                  </div>
                  <Button className="w-full mt-3 h-10 gap-2 font-bold text-md hover:shadow-md transition-shadow" type="submit" disabled={isSubmitting}>
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
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
