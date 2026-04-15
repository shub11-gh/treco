import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Zap, Flame, Trees, Lock, Shield, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

export default function Profile() {
  const { user, checkAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [activatingShield, setActivatingShield] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) return;
    setSavingName(true);
    try {
      await api.patch('/auth/profile', { name: name.trim() });
      await checkAuth();
      toast.success('Name updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setSavingPw(true);
    try {
      await api.patch('/auth/profile', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleActivateShield = async () => {
    setActivatingShield(true);
    try {
      const { data } = await api.post('/auth/shield');
      await checkAuth();
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate shield');
    } finally {
      setActivatingShield(false);
    }
  };

  const co2Saved = Math.round((user?.totalPoints || 0) / 10);

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account and track your impact.</p>
      </div>

      {/* Avatar + stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-24 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            {/* Avatar initials */}
            <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-3xl font-black tracking-tight shadow-[0_0_30px_rgba(16,185,129,0.2)] flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1 justify-center md:justify-start">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </p>
              <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5 justify-center md:justify-start">
                <Building2 className="w-3.5 h-3.5" /> {user?.collegeName}
              </p>
            </div>
            {/* Quick stats — 4 cards */}
            <div className="flex gap-4 flex-wrap justify-center">
              <div className="flex flex-col items-center gap-1">
                <div className="p-2 bg-accent/10 rounded-lg"><Zap className="w-5 h-5 text-accent" /></div>
                <span className="text-xl font-bold">{(user?.totalPoints || 0).toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Total Points</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="p-2 bg-orange-500/10 rounded-lg"><Flame className="w-5 h-5 text-orange-500" /></div>
                <span className="text-xl font-bold">{user?.currentStreak || 0}</span>
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="p-2 bg-yellow-500/10 rounded-lg"><TrendingUp className="w-5 h-5 text-yellow-500" /></div>
                <span className="text-xl font-bold">{user?.bestStreak || user?.currentStreak || 0}</span>
                <span className="text-xs text-muted-foreground">Best Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="p-2 bg-primary/10 rounded-lg"><Trees className="w-5 h-5 text-primary" /></div>
                <span className="text-xl font-bold">{co2Saved}</span>
                <span className="text-xs text-muted-foreground">kg CO2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Name */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" /> Edit Display Name
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="flex-1" />
            <Button onClick={handleSaveName} disabled={savingName || !name.trim() || name === user?.name}>
              {savingName ? 'Saving...' : 'Save'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-accent" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <Button onClick={handleChangePassword} disabled={savingPw || !currentPassword || !newPassword} className="w-full md:w-auto">
              {savingPw ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Shield */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className={`border-border relative overflow-hidden ${user?.streakShield ? 'border-primary/40' : ''}`}>
          {user?.streakShield && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {user?.streakShield
                ? <ShieldCheck className="w-5 h-5 text-primary" />
                : <Shield className="w-5 h-5 text-muted-foreground" />
              }
              Streak Shield
              {user?.streakShield && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  ACTIVE
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.streakShield ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                Your streak is protected. The shield will activate automatically the next time you miss a day.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Miss a day without losing your streak. Costs{' '}
                  <strong className="text-foreground">2,000 spendable points</strong>.
                  You have <strong className="text-primary">{user?.spendablePoints || 0}</strong> available.
                </p>
                <Button
                  onClick={handleActivateShield}
                  disabled={activatingShield || (user?.spendablePoints || 0) < 2000}
                  variant="outline"
                  className="w-full md:w-auto border-primary/20 hover:border-primary/50 text-foreground"
                >
                  <Shield className="w-4 h-4 mr-2 text-primary" />
                  {activatingShield ? 'Activating...' : 'Activate Shield — 2,000 pts'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
