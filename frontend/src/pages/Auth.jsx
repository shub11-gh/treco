import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
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
    <div className="w-full max-w-md mx-auto mt-12 md:mt-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="flex justify-center mb-8 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          <Card className="border-border bg-card/60 backdrop-blur-xl shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">{isLogin ? 'Welcome back' : 'Create an account'}</CardTitle>
              <CardDescription className="text-center">
                {isLogin ? 'Enter your details to sign in.' : 'Join your campus leaderboard today.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm mb-4">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collegeName">College Name</Label>
                      <Input id="collegeName" value={formData.collegeName} onChange={handleChange} placeholder="Enter your university name" required />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">College Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={isLogin ? 'Enter your college email' : 'Enter your college email'}
                    required
                    className={emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} placeholder="Enter your password" onChange={handleChange} required />
                </div>
                <Button className="w-full mt-4 gap-2" type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Sign Up')}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-border/50 pt-4">
              <Button variant="link" className="text-muted-foreground" onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg('');
                setEmailError('');
              }}>
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
