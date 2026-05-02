import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Zap, Flame, Trees, Lock, Shield, ShieldCheck, TrendingUp, Settings, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import BadgeVault from '../components/BadgeVault';
import { Progress } from '../components/ui/progress';

export default function Profile() {
  const { user, checkAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [activatingShield, setActivatingShield] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const { data } = await api.get('/auth/stats');
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

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
  const campusContribution = (stats?.campusTotal && stats.campusTotal > 0 && user?.totalPoints)
    ? ((user.totalPoints / stats.campusTotal) * 100).toFixed(1)
    : "0.0";

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

  const handleDeleteAccount = async () => {
    if (!window.confirm("ARE YOU SURE? This action is permanent and all your points, streaks, and history will be lost forever.")) return;

    setDeletingAccount(true);
    try {
      const res = await useAuthStore.getState().deleteAccount();
      if (res.success) {
        toast.success("Account deleted. We're sad to see you go!");
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("An error occurred during deletion.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const co2Saved = Math.round((user?.totalPoints || 0) / 10);

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex justify-center md:justify-start items-center gap-3">
          <User className="w-10 h-10 text-primary" />
          My Profile
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto md:mx-0">Manage your account and track your impact.</p>
      </div>

      {/* Avatar + stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-primary/20 bg-card overflow-hidden relative">
          <div className="absolute top-0 right-0 p-24 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none w-48 h-48 rotate-12">
            <img src="/trecoLogo.png" alt="" className="w-full h-full object-contain grayscale" />
          </div>
          <CardContent className="p-6 flex flex-col gap-6">
            {/* Top Row: Info + Stats */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar initials */}
                <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-3xl font-black tracking-tight flex-shrink-0">
                  {initials}
                </div>
                <div className="text-center md:text-left space-y-1">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 justify-center md:justify-start">
                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                  </p>
                  <p className="text-muted-foreground text-sm flex items-center gap-1 justify-center md:justify-start">
                    <Building2 className="w-3.5 h-3.5" /> {user?.collegeName}
                  </p>
                </div>
              </div>

              {/* Quick stats — 4 cards */}
              <div className="flex gap-3 flex-wrap justify-center md:justify-end">
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-accent/5 rounded-lg border border-accent/10">
                    < Zap className="w-5 h-5 text-accent" /></div>
                  <span className="text-xl font-bold">{(user?.totalPoints || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Points</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-orange-500/5 rounded-lg border border-orange-500/10"><Flame className="w-5 h-5 text-orange-500" /></div>
                  <span className="text-xl font-bold">{user?.currentStreak || 0}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-yellow-500/5 rounded-lg border border-yellow-500/10"><TrendingUp className="w-5 h-5 text-yellow-500" /></div>
                  <span className="text-xl font-bold">{stats?.rank || '--'}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Campus Rank</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="p-2 bg-primary/5 rounded-lg border border-primary/10"><Trees className="w-5 h-5 text-primary" /></div>
                  <span className="text-xl font-bold">{co2Saved}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">kg CO2</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Level Badge + Progress */}
            <div className="flex flex-col items-center md:items-start w-full gap-3 mt-2">
              <div className="w-full max-w-md space-y-3">
                <div className="flex justify-start">
                  <span className="text-xs font-bold text-foreground uppercase tracking-[0.1em] bg-slate-600/5 px-3 py-1 rounded-sm border border-gray /10 whitespace-nowrap">
                    LEVEL {levelInfo.level} • {levelInfo.title}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground font-mono">Progress to Level {levelInfo.nextLevel}</span>
                    <span className="text-primary font-mono">{Math.round(levelInfo.progress)}%</span>
                  </div>
                  <Progress value={levelInfo.progress} className="h-1.5 bg-primary/10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <BadgeVault user={user} stats={stats} />
      </motion.div>

      {/* RE-DESIGNED: Carbon Accountability Section (Minimal Ledger) */}
      {user?.carbonDebt > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className={`border-border bg-card/10 backdrop-blur-md overflow-hidden relative ${user?.carbonDebt > 50 ? 'border-red-500/20' : ''}`}>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Metric + Label */}
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-2xl ${user?.carbonDebt > 50 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {user?.carbonDebt > 50 ? <AlertTriangle className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5">Carbon Debt</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black font-mono tracking-tighter ${user?.carbonDebt > 50 ? 'text-red-500' : 'text-foreground'}`}>
                        {user?.carbonDebt.toFixed(1)}
                      </span>
                      <span className="text-xs font-bold opacity-40 uppercase">kg CO₂</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status + Action */}
                <div className="flex-1 max-w-sm w-full">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Accountability Status</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${user?.carbonDebt > 50 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                      {user?.carbonDebt > 50 ? 'RANK FROZEN' : 'CLIMATE SAFE'}
                    </span>
                  </div>

                  {user?.carbonDebt > 50 ? (
                    <div className="space-y-3">
                      <div className="h-1.5 w-full bg-red-500/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (user.carbonDebt / 100) * 100)}%` }}
                          className="h-full bg-red-500"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium text-center italic">
                        Choose <span className="text-emerald-500 font-bold">Green Commutes</span> to clear your debt.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-emerald-500 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4" />
                      <span>You are Carbon Neutral.</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Campus Teaser Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border bg-card/30 backdrop-blur-sm overflow-hidden relative group">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h4 className="text-lg font-bold leading-tight">Campus Impact Contribution</h4>
                <p className="text-sm text-muted-foreground mt-0.5">You have contributed <span className="text-primary font-bold">{statsLoading ? '...' : `${campusContribution}%`}</span> of {user?.collegeName}'s total green points!</p>
              </div>
            </div>
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
                ? <ShieldCheck className="w-6 h-6 text-primary" />
                : <Shield className="w-6 h-6 text-muted-foreground" />
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
                  <Shield className="w-4 h-4 mr-2" />
                  {activatingShield ? 'Activating...' : 'Activate Shield — 2,000 pts'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings (Combined Name & Password) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-6 h-6" /> Account Settings
            </CardTitle>
          </CardHeader>
          <Tabs defaultValue="general" className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
                <TabsTrigger value="general" className="gap-2">
                  <User className="w-4 h-4" /> General
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="w-4 h-4" /> Security
                </TabsTrigger>
                <TabsTrigger value="danger" className="gap-2 data-[state=active]:text-red-500">
                  <Trash2 className="w-4 h-4" /> Delete Account
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="mt-0">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="m-1">Display Name</Label>
                  <div className="flex gap-3">
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="flex-1 h-10 mt-1" />
                    <Button onClick={handleSaveName} disabled={savingName || !name.trim() || name === user?.name} className="h-10 px-6 mt-1">
                      {savingName ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground m-1">This is how your name will appear on the global leaderboard.</p>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <CardContent className="pt-6 flex flex-col gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="curr-pw">Current Password</Label>
                    <Input id="curr-pw" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input id="new-pw" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="h-10" />
                  </div>
                </div>
                <div className="flex justify-start">
                  <Button onClick={handleChangePassword} disabled={savingPw || !currentPassword || !newPassword} className="w-full md:w-auto h-10 px-6">
                    {savingPw ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="danger" className="mt-0">
              <CardContent className="pt-6 space-y-6">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-start">
                  <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                  <div className="space-y-1">
                    <p className="text-sm text-red-400 font-medium">Removing your account is irreversible. You will lose your rank, streaks, and all spendable carbon points.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="w-full md:w-auto h-10 px-6  tracking-widest shadow-md"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deletingAccount ? 'Deleting...' : 'Delete My Account Permanently'}
                  </Button>
                  <p className="text-xs text-muted-foreground">Note: By clicking, you acknowledge that this action cannot be undone.</p>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}
