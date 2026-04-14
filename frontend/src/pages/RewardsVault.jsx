import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Coffee, Pizza, Laptop, Bus, Droplets, UtensilsCrossed, CheckCircle2, RefreshCw, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { CardGridSkeleton } from '../components/Skeletons';

// Map reward titles to icons (fallback to a generic icon)
const iconMap = {
  'Free Coffee':          Coffee,
  '20% Off Pizza':        Pizza,
  'MacBook Skin':         Laptop,
  'Bus Pass (1 Week)':    Bus,
  'Eco Water Bottle':     Droplets,
  'Canteen Meal Voucher': UtensilsCrossed,
  'Streak Shield':        Shield,
};

function getIcon(title) {
  return iconMap[title] || Coffee;
}

// Generate a stable redemption code for each reward claim session
function genRedemptionCode(rewardId) {
  return `TRC-${rewardId.toString().slice(-4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export default function RewardsVault() {
  const [claimedIds, setClaimedIds] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redemptionCodes, setRedemptionCodes] = useState({});
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

  const handleDialogOpen = (reward) => {
    // Generate a stable code when dialog opens
    if (!redemptionCodes[reward._id]) {
      setRedemptionCodes(prev => ({
        ...prev,
        [reward._id]: genRedemptionCode(reward._id)
      }));
    }
  };

  const handleClaim = async (reward) => {
    try {
      await api.post('/auth/redeem', { cost: reward.pointCost });
      setClaimedIds([...claimedIds, reward._id]);
      checkAuth();
      toast.success(`${reward.title} redeemed successfully! Show the QR code to claim.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim reward');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl flex flex-col gap-6">
        <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Rewards Vault</h1>
        <p className="text-muted-foreground">
          Trade your spendable carbon points for real-world perks. You currently have{' '}
          <strong className="text-primary">{user?.spendablePoints || 0} pts</strong> available to spend.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {rewards.map((reward, i) => {
          const Icon = getIcon(reward.title);
          const isClaimed = claimedIds.includes(reward._id);
          const canAfford = (user?.spendablePoints || 0) >= reward.pointCost;
          const code = redemptionCodes[reward._id] || '';

          return (
            <motion.div
              key={reward._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`border-border bg-card hover:border-accent transition-all duration-300 h-full flex flex-col drop-shadow-sm hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.1)]
                  ${(!canAfford && !isClaimed) ? 'opacity-50 grayscale select-none pointer-events-none' : ''}`}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent border border-accent/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{reward.title}</CardTitle>
                  <CardDescription>{reward.sponsorCollege}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="inline-block bg-muted px-3 py-1 rounded-md font-mono font-bold text-lg text-primary">
                      {reward.pointCost.toLocaleString()} pts
                    </div>
                    {reward.inventoryLimit > 0 && (
                      <span className="text-xs text-muted-foreground">{reward.inventoryLimit} left</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full relative overflow-hidden group border-primary/20 hover:border-primary/50 text-foreground"
                        onClick={() => handleDialogOpen(reward)}
                      >
                        <span className="relative z-10 font-bold flex items-center gap-1.5 group-hover:text-primary-foreground transition-colors">
                          {isClaimed
                            ? <><CheckCircle2 className="w-4 h-4" /> Claimed</>  
                            : 'Claim QR'}
                        </span>
                        <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-primary/20 bg-background/95 backdrop-blur-xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Redeem {reward.title}</DialogTitle>
                        <DialogDescription>
                          Present this QR code to {reward.sponsorCollege} at checkout. Cost: {reward.pointCost.toLocaleString()} pts.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center p-6 space-y-4">
                        {/* Real QR Code */}
                        <div className="bg-white p-4 rounded-xl shadow-inner">
                          <QRCodeSVG
                            value={`TRECO:REDEEM:${reward._id}:${user?._id}:${code}`}
                            size={160}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="M"
                          />
                        </div>
                        <div className="text-sm font-mono text-foreground font-bold tracking-widest bg-muted px-4 py-2 rounded-md">
                          {code}
                        </div>

                        {isClaimed ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 text-primary mt-2 bg-primary/10 px-4 py-2 rounded-full font-bold"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Successfully Redeemed!</span>
                          </motion.div>
                        ) : (
                          <Button
                            onClick={() => handleClaim(reward)}
                            className="w-full mt-4 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                          >
                            Confirm &amp; Deduct Points
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
