import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Zap, Trees, Clock, Wallet, MapPin, Sparkles, Navigation, Info, RefreshCw, BrainCircuit } from 'lucide-react';
import LocationInput from '../components/LocationInput';
import MapModal from '../components/MapModal';
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
  const [isMock, setIsMock] = useState(false);
  const [logging, setLogging] = useState(false);

  const [mapOpen, setMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState(null); // 'source' or 'destination'
  const [activeCommute, setActiveCommute] = useState(null); // stores the activity record
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [recovering, setRecovering] = useState(true);

  // Proof/verification state — declared before the session recovery useEffect that uses them
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofPreview, setProofPreview] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  const { user, checkAuth } = useAuthStore();
  
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${url}`;
  };

  // Load active session on mount
  React.useEffect(() => {
    const fetchActive = async () => {
      try {
        const { data } = await api.get('/commutes/active');
        if (data.activity) {
          setActiveCommute(data.activity);
          // --- RECOVER VERIFICATION STATE ---
          if (data.activity.isVerified) {
            setIsVerified(true);
            setProofPreview(data.activity.proofUrl);
          }
        }
      } catch (err) {
        console.error("Failed to recover session:", err);
      } finally {
        setRecovering(false);
      }
    };
    fetchActive();
  }, []);

  // Timer for active journey
  React.useEffect(() => {
    let timer;
    if (activeCommute) {
      // Use startedAt for accurate sync
      const start = new Date(activeCommute.startedAt).getTime();

      const updateElapsed = () => {
        const now = Date.now();
        const diffSeconds = Math.floor((now - start) / 1000);
        setElapsed(Math.max(0, diffSeconds));
      };

      updateElapsed(); // initial call
      timer = setInterval(updateElapsed, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timer);
  }, [activeCommute]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeepLink = (mode) => {
    if (mode === 'Metro') return 'https://wa.me/918105556677'; // BMRCL WhatsApp
    if (mode === 'Bus') return 'https://tummoc.com'; // Tummoc
    if (mode === 'Cab' || mode === 'Auto') return 'https://nammayatri.in'; // Namma Yatri
    return null;
  };

  const handlePredict = async () => {
    if (!source || !destination) return;
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setErrorMsg('Source and destination cannot be the same. Please select different locations.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setAiRoutes(null);
    try {
      const { data } = await api.post('/commutes/ai-calculate', {
        source,
        destination,
        city: user?.collegeName || 'Bangalore'
      });
      setIsMock(data.some?.(r => r._mock));
      setAiRoutes(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to initialize Treco Commute Engine');
    } finally {
      setLoading(false);
    }
  };

  const getRoutePriority = (routes) => {
    if (!routes || routes.length === 0) return [];

    // Parse metrics for sorting
    const parsed = routes.map((r, idx) => {
      const costStr = r.costString || "0";
      const numbers = costStr.match(/\d+/g);
      const avgCost = numbers ? (numbers.reduce((a, b) => Number(a) + Number(b), 0) / numbers.length) : 9999;
      return { ...r, avgCost, originalIdx: idx };
    });

    // 1st Priority: Max CO2 Saved
    const sortedByEco = [...parsed].sort((a, b) => b.co2SavedKg - a.co2SavedKg);
    const topEcoIdx = sortedByEco[0].originalIdx;

    // 2nd Priority: Lowest Cost (excluding the top eco choice)
    const remainingByCost = parsed.filter(r => r.originalIdx !== topEcoIdx).sort((a, b) => a.avgCost - b.avgCost);
    const topCostIdx = remainingByCost.length > 0 ? remainingByCost[0].originalIdx : -1;

    // Map back to original order with new priority info
    return parsed.map(r => {
      if (r.originalIdx === topEcoIdx) return { ...r, color: 'emerald', badge: 'Max Eco Impact' };
      if (r.originalIdx === topCostIdx) return { ...r, color: 'orange', badge: 'Economical Choice' };
      return { ...r, color: 'border', badge: null };
    });
  };



  // Request notification permission on mount
  React.useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setNotificationPermission);
      }
    }
  }, []);

  const sendNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { 
        body, 
        icon: '/trecoLogo.png',
        badge: '/trecoLogo.png'
      });
    }
  };

  const handleUploadProof = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProof(true);
    const formData = new FormData();
    formData.append('proof', file);
    formData.append('activityId', activeCommute._id);

    try {
      const { data } = await api.post('/commutes/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsVerified(data.isVerified);
      setProofPreview(data.proofUrl);
      toast.success(data.message || 'AI Verification Successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
    } finally {
      setUploadingProof(false);
    }
  };

  const startJourney = async (route) => {
    setLogging(true);
    try {
      const safeEnumList = ['Bus', 'Metro', 'Walk', 'Cycle', 'Cab', 'Auto'];
      const rawMode = (route.mode || 'Bus').trim();
      const safeMode = safeEnumList.includes(rawMode) ? rawMode : (safeEnumList.find(m => rawMode.toLowerCase().includes(m.toLowerCase())) || 'Cab');

      const { data } = await api.post('/commutes/log', {
        mode: safeMode,
        distanceKm: route.distanceKm || 5,
        co2SavedKg: route.co2SavedKg || 0,
        pointsEarned: route.pointsEarned || 0,
        status: 'active',
        isGreenChoice: route.isGreenChoice,
        sourceName: source,
        destinationName: destination
      });

      setActiveCommute({ ...data.activity, routeInfo: route });

      // --- SCHEDULE NOTIFICATION REMINDER ---
      const estMinutes = parseInt(route.timeString) || 30;
      const reminderMs = (estMinutes + 5) * 60 * 1000; // Est time + 5 mins buffer
      
      setTimeout(() => {
        sendNotification("Treco: Trip Check-in", `You should have arrived at ${destination} by now. Don't forget to verify your ${safeMode} trip!`);
      }, reminderMs);

      // Deep link redirection
      const link = getDeepLink(safeMode);
      if (link) {
        toast.success(`Opening ${safeMode} booking app...`);
        window.open(link, '_blank');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start journey.');
    } finally {
      setLogging(false);
    }
  };

  const finishJourney = async (activityId, bypass = false) => {
    setLogging(true);
    try {
      // Verification logic - Flexible bypass for demo presentation
      if (!bypass && user?.email?.toLowerCase() !== 'shub@college.edu.in') {
        // GPS Handshake
        if (!isVerified) {
          throw new Error("Proof Required: Please upload your ticket or destination selfie first.");
        }
      }

      const { data } = await api.post('/commutes/complete', { activityId, bypass });

      // Confetti burst for green choice
      if (activeCommute?.routeInfo?.isGreenChoice || activeCommute?.co2SavedKg > 0) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6'] });
      }

      const shieldMsg = data?.shieldUsed ? ' Streak Shield activated!' : '';
      toast.success(`Journey Verified! +${activeCommute.pointsEarned} points earned.${shieldMsg}`);

      // Reset UI
      setActiveCommute(null);
      setSource('');
      setDestination('');
      setAiRoutes(null);
      setProofPreview(null);
      setIsVerified(false);
      checkAuth();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Verification failed.');
    } finally {
      setLogging(false);
    }
  };

  if (recovering) {
    return (
      <div className="w-full max-w-5xl flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <img src="/trecoLogo.png" alt="" className="absolute inset-2 w-12 h-12 object-contain" />
        </div>
        <p className="text-muted-foreground font-mono animate-pulse uppercase tracking-widest text-xs">Resyncing Trip State...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col gap-8">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex justify-center md:justify-start items-center gap-3">
          <BrainCircuit className="w-10 h-10 text-blue-500" />
          Treco Smart Engine
        </h1>
        <p className="text-muted-foreground max-w-2xl">Use Treco AI to instantly analyze traffic, distance, and emissions to find the optimal commute configuration.</p>
      </div>

      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        onConfirm={(address) => {
          if (mapTarget === 'source') setSource(address);
          if (mapTarget === 'destination') setDestination(address);
        }}
      />

      {/* Input Section */}
      {!activeCommute && (
        <Card className="border-border/50 bg-card/40 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <LocationInput
                value={source}
                onChange={setSource}
                placeholder="e.g. Indiranagar"
                type="origin"
                onMapSelect={() => { setMapTarget('source'); setMapOpen(true); }}
              />
              <LocationInput
                value={destination}
                onChange={setDestination}
                placeholder="e.g. Reva College"
                type="destination"
                onMapSelect={() => { setMapTarget('destination'); setMapOpen(true); }}
              />
              <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
                <Button
                  onClick={handlePredict}
                  disabled={loading || !source || !destination}
                  className="flex-1 md:w-auto h-11 px-8 gap-2 font-bold hover:shadow-primary/40 transition-all rounded-xl"
                >
                  {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                  {loading ? 'Analyzing...' : 'Generate'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => { setSource(''); setDestination(''); setAiRoutes(null); setErrorMsg(''); }}
                  className="h-11 w-11 shrink-0 rounded-xl border-border/50 hover:bg-muted"
                  title="Clear Console"
                >
                  <RefreshCw className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </div>
            {errorMsg && <p className="text-red-500 text-sm mt-4">{errorMsg}</p>}
          </CardContent>
        </Card>
      )}

      {/* Active Journey Console */}
      {activeCommute && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-primary bg-primary/5 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Navigation className="w-32 h-32" /></div>
            <CardContent className="p-8 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin flex items-center justify-center">
                <div className="text-xl font-black font-mono text-primary animate-none rotate-[-45deg]">{elapsed}s</div>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Commute in Progress</h2>
                <p className="text-muted-foreground font-medium">Tracking your {activeCommute.transportMode} trip to {activeCommute.destinationName || destination}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="bg-background/40 border border-border p-4 rounded-2xl">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Elapsed Time</div>
                  <div className="text-2xl font-black font-mono">{formatTime(elapsed)}</div>
                </div>
                <div className="bg-background/40 border border-border p-4 rounded-2xl">
                  <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Target Gain</div>
                  <div className="text-2xl font-black font-mono text-primary">+{activeCommute.pointsEarned} pts</div>
                </div>
              </div>

              {/* MANDATORY PROOF UPLOAD SECTION */}
              <div className="w-full max-w-md mt-4 p-5 rounded-2xl bg-background/60 border-2 border-dashed border-primary/20 flex flex-col items-center gap-4 group hover:border-primary/50 transition-all">
                {proofPreview ? (
                  <div className="relative group">
                    <img 
                      src={getFullUrl(proofPreview)} 
                      alt="Proof" 
                      className="w-32 h-32 object-cover rounded-xl border-2 border-primary shadow-lg"
                    />
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-primary px-2 py-1 rounded">Verified</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 fill-current" />
                  </div>
                )}
                
                <div className="text-center">
                  <h4 className="text-sm font-bold">Mandatory Visual Proof</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">Upload ticket for Bus/Metro/Auto or destination selfie for Walk/Cycle.</p>
                </div>

                <div className="w-full relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleUploadProof}
                    className="hidden"
                    id="proof-upload"
                    disabled={uploadingProof || isVerified}
                  />
                  <label
                    htmlFor="proof-upload"
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-all w-full shadow-sm ${
                      isVerified 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-primary text-primary-foreground hover:shadow-lg active:scale-95'
                    }`}
                  >
                    {uploadingProof ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {uploadingProof ? 'AI Scanning...' : isVerified ? 'Proof Authenticated' : 'Capture Proof'}
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-2">
                <Button
                  onClick={() => finishJourney(activeCommute._id)}
                  disabled={logging || uploadingProof || !isVerified}
                  className={`flex-1 py-7 font-black text-lg rounded-2xl shadow-xl transition-all ${
                    isVerified 
                      ? 'bg-primary text-primary-foreground shadow-primary/20' 
                      : 'bg-muted text-muted-foreground grayscale cursor-not-allowed opacity-50'
                  }`}
                >
                  {logging ? 'Verifying...' : 'Verify Arrival'}
                </Button>

                {/* Specific Demo Bypass for user 'shub' */}
                {user?.email?.toLowerCase().includes('shub') && (
                  <Button
                    onClick={() => finishJourney(activeCommute._id, true)}
                    variant="outline"
                    className="flex-1 py-7 border-accent text-accent font-black text-lg rounded-2xl hover:bg-accent/10"
                  >
                    Simulate Arrival
                  </Button>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground mt-2 italic uppercase tracking-widest font-bold opacity-50">
                Security Protocol Active: Speed & Location Validation Engaged
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

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

        {aiRoutes && !loading && !activeCommute && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            {/* Mock data banner */}
            {isMock && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-sm">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>AI quota exceeded. You can still log a commute to earn points.</span>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              {getRoutePriority(aiRoutes).map((route, idx) => (
                <Card key={idx} className={`relative overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-xl hover:shadow-lg ${route.color === 'emerald' ? 'border-primary bg-primary/10' :
                  route.color === 'orange' ? 'border-orange-500/50 bg-orange-500/10' :
                    'border-border bg-card/40'
                  }`}>
                  {route.badge && (
                    <div className={`absolute top-0 w-full text-white text-[10px] font-black text-center py-1.5 uppercase tracking-widest ${route.color === 'emerald' ? 'bg-gradient-to-r from-emerald-600 to-primary' : 'bg-orange-500'
                      }`}>
                      {route.badge}
                    </div>
                  )}

                  <CardHeader className={`pb-4 ${route.badge ? 'pt-8' : ''}`}>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span className="text-xl whitespace-nowrap">{route.type}</span>
                      <span
                        className={`text-[10px] px-2 py-1 rounded font-mono uppercase tracking-tighter truncate max-w-[140px] ${route.color === 'emerald' ? 'bg-primary/20 text-primary' :
                          route.color === 'orange' ? 'bg-orange-500/20 text-orange-500' :
                            'bg-muted text-muted-foreground'
                          }`}
                        title={route.mode}
                      >
                        {route.mode}
                      </span>
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
                    <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 text-muted-foreground"><Trees className="w-4 h-4 text-green-500" /> Saved</div>
                      <div className="font-bold font-mono text-green-500 flex items-center gap-1">
                        {route.co2SavedKg} kg
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => startJourney(route)}
                      disabled={logging}
                      variant={route.color === 'emerald' ? "default" : "outline"}
                      className={`w-full font-bold gap-2 ${route.color !== 'emerald' ? 'text-foreground hover:bg-muted' : 'shadow-lg shadow-primary/20'}`}
                    >
                      Take Route & Earn {route.pointsEarned} pts
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
