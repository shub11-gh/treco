import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Coffee, Pizza, Laptop, Bus, Droplets, UtensilsCrossed, CheckCircle2, RefreshCw, Shield, Ticket, Smartphone, Gift, GraduationCap, CreditCard, Sparkles, Copy, Check, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { CardGridSkeleton } from '../components/Skeletons';
import Spinner from '../components/ui/Spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

// Map reward titles to icons
const iconMap = {
  'Free Coffee': Coffee,
  '20% Off Pizza': Pizza,
  'MacBook Skin': Laptop,
  'Bus Pass (1 Week)': Bus,
  'Eco Water Bottle': Droplets,
  'Canteen Meal Voucher': UtensilsCrossed,
  'Streak Shield': Shield,
  'Amazon Voucher': Smartphone,
  'Movie Ticket': Ticket,
  'Wireless Earbuds': Gift,
  'Attendance Buffer': GraduationCap,
  'Flipkart Gift Card': CreditCard,
};

const categoryStyles = {
  'Food': { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', hover: 'hover:border-orange-500/50' },
  'Academic': { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', hover: 'hover:border-yellow-500/50' },
  'Digital Cash': { color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', hover: 'hover:border-cyan-500/50' },
  'Tech': { color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20', hover: 'hover:border-violet-500/50' },
  'Lifestyle': { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', hover: 'hover:border-rose-500/50' },
  'General': { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', hover: 'hover:border-primary/50' }
};

function getIcon(title) {
  const entry = Object.entries(iconMap).find(([k]) => title.includes(k));
  return entry ? entry[1] : Gift;
}


export default function RewardsVault() {
  const [claimedIds, setClaimedIds] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [redemptionCodes, setRedemptionCodes] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/rewards');
      setRewards(data.rewards);
    } catch (err) {
      toast.error('Failed to load rewards. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (_reward) => {
    // Codes are generated server-side on claim — nothing to pre-generate here
  };

  const handleClaim = async (reward) => {
    try {
      const { data } = await api.post('/auth/redeem', { rewardId: reward._id });
      // Store the server-generated code so the dialog can display it immediately
      setRedemptionCodes(prev => ({ ...prev, [reward._id]: data.redemptionCode }));
      setClaimedIds(prev => [...prev, reward._id]);
      checkAuth();
      toast.success(`${reward.title} redeemed!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim reward');
    }
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRewards = activeTab === 'All'
    ? rewards
    : rewards.filter(r => r.category === activeTab);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8 pb-10">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black tracking-tighter mb-2 flex justify-center md:justify-start items-center gap-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            <ShoppingBag className="w-10 h-10 text-accent" />
            Rewards Vault
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl mx-auto md:mx-0">Redeem your green points for exclusive perks.</p>
        </div>
        <div className="bg-accent/10 border border-accent/20 px-5 py-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg text-accent-foreground">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-widest">Spendable Balance</div>
            <div className="text-2xl font-black font-mono leading-none">{user?.spendablePoints || 0} pts</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="All" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-background/50 border border-border/50 p-1 rounded-xl h-auto flex flex-wrap gap-1 mb-6">
          {['All', 'Digital Cash', 'Tech', 'Food', 'Lifestyle', 'Academic'].map(cat => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-primary/70 data-[state=active]:text-foreground transition-all"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value={activeTab} key={activeTab} className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10"
            >
              {filteredRewards.length > 0 ? (
                filteredRewards.map((reward, i) => {
                  const Icon = getIcon(reward.title);
                  const isClaimed = claimedIds.includes(reward._id);
                  const canAfford = (user?.spendablePoints || 0) >= reward.pointCost;
                  const code = redemptionCodes[reward._id] || '';
                  const style = categoryStyles[reward.category] || categoryStyles.General;

                  return (
                    <motion.div
                      key={reward._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="h-full"
                    >
                      <Card
                        className={`border-border/50 bg-card/40 backdrop-blur-xl transition-all duration-300 h-full flex flex-col group relative overflow-hidden
                          ${canAfford || isClaimed ? style.hover : ''}
                          ${(!canAfford && !isClaimed) ? 'opacity-60' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-colors 
                            ${canAfford || isClaimed ? `${style.bg} ${style.border} ${style.color}` : 'bg-muted border-border text-muted-foreground'}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${canAfford || isClaimed ? style.color : 'text-muted-foreground'}`}>
                              {reward.category || 'General'}
                            </span>
                            <CardTitle className="text-xl font-bold mt-1">{reward.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 pb-4 flex flex-col">
                          <p className="text-sm text-muted-foreground leading-relaxed mb-6">{reward.description}</p>
                          <div className="flex items-center justify-between mt-auto bg-background/50 p-3 rounded-xl border border-border/50">
                            <div className={`text-xl font-black font-mono ${canAfford || isClaimed ? style.color : 'text-muted-foreground'}`}>
                              {reward.pointCost.toLocaleString()} <span className="text-[10px] uppercase ml-0.5">pts</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Dialog onOpenChange={(open) => open && handleDialogOpen(reward)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full py-6 rounded-xl font-black transition-all ${canAfford || isClaimed ? 'hover:bg-muted-foreground/10 hover:text-primary-foreground border-muted-foreground/20' : 'cursor-not-allowed grayscale opacity-50'}`}
                              >
                                {isClaimed ? (
                                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />View Code</span>
                                ) : (
                                  <span>{canAfford ? 'Redeem Reward' : `Need ${(reward.pointCost - (user?.spendablePoints || 0)).toLocaleString()} pts`}</span>
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-2xl">
                              <DialogHeader>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="w-12 h-12 bg-primary/10 rounded-2xl p-2 border border-primary/20 flex items-center justify-center">
                                    <img src="/trecoLogo.png" alt="" className="w-full h-full object-contain" />
                                  </div>
                                  <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight">{reward.title}</DialogTitle>
                                    <DialogDescription className="font-bold text-primary">
                                      Powered by {reward.sponsorCollege}
                                    </DialogDescription>
                                  </div>
                                </div>
                              </DialogHeader>

                              <div className="flex flex-col items-center justify-center p-6 space-y-6">
                                {!isClaimed ? (
                                  <div className="text-center space-y-4 w-full">
                                    <div className="p-4 bg-muted rounded-2xl border border-border/50">
                                      <p className="text-sm text-muted-foreground font-medium">
                                        Confirming this will deduct <span className="text-foreground font-bold">{reward.pointCost.toLocaleString()} points</span> from your balance.
                                      </p>
                                    </div>
                                    <Button
                                      onClick={() => handleClaim(reward)}
                                      className="w-full py-8 text-lg font-black rounded-2xl transition-all uppercase tracking-widest"
                                    >
                                      Confirm &amp; Deduct
                                    </Button>
                                  </div>
                                ) : (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center w-full space-y-6"
                                  >
                                    <div className="relative">
                                      <div className="bg-white p-5 rounded-2xl border border-border/50">
                                        <QRCodeSVG
                                          value={`Treco:Redeem:${reward._id}:${user?._id}:${code}`}
                                          size={180}
                                          bgColor="#ffffff"
                                          fgColor="#000000"
                                          level="H"
                                        />
                                      </div>
                                    </div>

                                    <div className="w-full">
                                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-center">Redemption Code</div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 text-xl font-black font-mono tracking-[0.1em] bg-muted px-4 py-3 rounded-xl border border-border/50 text-center truncate">
                                          {code}
                                        </div>
                                        <Button
                                          variant="secondary"
                                          size="icon"
                                          className="h-12 w-12 rounded-xl shrink-0"
                                          onClick={() => handleCopyCode(reward._id, code)}
                                        >
                                          {copiedId === reward._id ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-6 py-3 rounded-2xl font-black text-sm w-full justify-center">
                                      <CheckCircle2 className="w-5 h-5" />
                                      <span>Redeemed Successfully!</span>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="text-muted-foreground font-mono text-sm">No rewards available in this category yet.</div>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
