import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Zap, Trees, Clock, Wallet, MapPin, Sparkles, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

export default function SmartEngine() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [aiRoutes, setAiRoutes] = useState(null);
  const [logging, setLogging] = useState(false);

  const { user, checkAuth } = useAuthStore();

  const handlePredict = async () => {
    if (!source || !destination) return;
    setLoading(true);
    setErrorMsg('');
    setAiRoutes(null);
    try {
      const { data } = await api.post('/commutes/ai-calculate', {
        source,
        destination,
        city: user?.collegeName || 'Bangalore'
      });
      setAiRoutes(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to initialize Smart Commute Engine');
    } finally {
      setLoading(false);
    }
  };

  const logRoute = async (route) => {
    setLogging(true);
    try {
      const safeEnumList = ['Bus', 'Metro', 'Walk', 'Cycle', 'Cab'];
      const rawMode = (route.mode || 'Bus').trim();
      const safeMode = safeEnumList.includes(rawMode) ? rawMode : safeEnumList.find(m => rawMode.includes(m)) || 'Bus';

      const { data: logData } = await api.post('/commutes/log', {
        mode: safeMode,
        distanceKm: route.distanceKm || 5,
        co2SavedKg: route.co2SavedKg || 0,
        pointsEarned: route.pointsEarned || 0,
      });

      // Confetti burst for green choice
      if (route.isGreenChoice) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#a7f3d0', '#bfdbfe'],
        });
      }

      const shieldMsg = logData?.shieldUsed ? ' Streak Shield activated!' : '';
      toast.success(`Commute logged — +${route.pointsEarned} points earned.${shieldMsg}`);
      checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log commute.');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex justify-center md:justify-start items-center gap-2">
          <Sparkles className="w-8 h-8 text-accent animate-pulse" />
          Treco Commute Engine
        </h1>
        <p className="text-muted-foreground max-w-2xl">Use Treco AI to instantly analyze traffic, distance, and emissions to find the optimal commute configuration.</p>
      </div>

      {/* Input Section */}
      <Card className="border-border bg-card/60 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full space-y-2">
              <Label>Current Location / Origin</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input placeholder="e.g. Indiranagar Metro Station" className="pl-10 text-base" value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
            </div>
            <div className="w-full space-y-2">
              <Label>Destination</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input placeholder="e.g. Reva College" className="pl-10 text-base" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
            </div>
            <Button onClick={handlePredict} disabled={loading || !source || !destination} className="w-full md:w-auto h-11 px-8 gap-2 font-bold shadow-lg shadow-primary/20">
              {loading ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 fill-current" />
              )}
              {loading ? 'Analyzing...' : 'Generate'}
            </Button>
          </div>
          {errorMsg && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}
        </CardContent>
      </Card>

      {/* Output Section */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-32">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <p className="text-muted-foreground text-sm font-mono tracking-widest">Processing your request...</p>
            </div>
          </motion.div>
        )}

        {aiRoutes && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-6">
            {aiRoutes.map((route, idx) => (
              <Card key={idx} className={`relative overflow-hidden flex flex-col ${route.isGreenChoice ? 'border-primary shadow-[0_0_30px_rgba(16,185,129,0.15)] bg-primary/5' : 'border-border bg-card'} hover:shadow-lg transition-all`}>
                {route.isGreenChoice && (
                  <div className="absolute top-0 w-full bg-primary text-primary-foreground text-xs font-bold text-center py-1 uppercase tracking-widest">
                    Green Choice + Max Points
                  </div>
                )}

                <CardHeader className={`pb-4 ${route.isGreenChoice ? 'pt-8' : ''}`}>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl">{route.type}</span>
                    <span className="text-sm px-2 py-1 bg-muted rounded font-mono text-muted-foreground">{route.mode}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> Time</div>
                    <div className="font-bold font-mono">{route.timeString}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="w-4 h-4" /> Cost</div>
                    <div className="font-bold font-mono text-lg">{route.costString}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground"><Trees className="w-4 h-4" /> Saved</div>
                    <div className="font-bold font-mono text-primary flex items-center gap-1">
                      {route.co2SavedKg} kg
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button onClick={() => logRoute(route)} disabled={logging} variant={route.isGreenChoice ? "default" : "outline"} className={`w-full font-bold gap-2 ${!route.isGreenChoice ? 'text-foreground' : ''}`}>
                    Take Route & Earn {route.pointsEarned} pts
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
