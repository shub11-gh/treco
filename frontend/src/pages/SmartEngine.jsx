import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Zap, Trees, Clock, Wallet, MapPin, Sparkles, Navigation, Info, RefreshCw, BrainCircuit, TrainFront, Bus, Car, Footprints, ChevronDown } from 'lucide-react';
import LocationInput from '../components/LocationInput';
import MapModal from '../components/MapModal';
import Spinner from '../components/ui/Spinner';
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
  const [openAccordion, setOpenAccordion] = useState(null);
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
    if (mode === 'Metro' || mode === 'Metro + Bus') return 'https://wa.me/918105556677'; // BMRCL WhatsApp
    if (mode === 'Bus' || mode === 'Electric Bus') return 'https://tummoc.com'; // Tummoc
    if (mode === 'Cab' || mode === 'Auto') return 'https://nammayatri.in'; // Namma Yatri
    // Walk and Cycle need no booking app
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

    return routes.map((r) => {
      const type = (r.type || '').toLowerCase();
      if (type.includes('green')) {
        return { ...r, color: 'emerald', badge: 'Max Eco Impact' };
      }
      if (type.includes('econom')) {
        return { ...r, color: 'orange', badge: 'Economical Choice' };
      }
      // Fastest / default — no badge
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

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleUploadProof = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // Compress if > 2MB
      toast('Compressing image...', { icon: '🔄' });
      file = await compressImage(file);
    }

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
      // 'Electric Bus' → stored as 'Bus'; 'Metro + Bus' → stored as 'Metro' (primary transit component)
      let safeMode;
      if (rawMode === 'Metro + Bus') {
        safeMode = 'Metro';
      } else {
        safeMode = safeEnumList.includes(rawMode)
          ? rawMode
          : (safeEnumList.find(m => rawMode.toLowerCase().includes(m.toLowerCase())) || 'Cab');
      }

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
      // Parse duration from format '25 min' or '1h 10m'
      const timeStr = route.timeString || '30 min';
      const hrsMatch = timeStr.match(/(\d+)h/);
      const minsMatch = timeStr.match(/(\d+)\s*m(?:in)?/);
      const estMinutes = (hrsMatch ? parseInt(hrsMatch[1]) * 60 : 0) + (minsMatch ? parseInt(minsMatch[1]) : 30);
      const reminderMs = (estMinutes + 5) * 60 * 1000;

      setTimeout(() => {
        sendNotification("Treco: Trip Check-in", `You should have arrived at ${destination} by now. Don't forget to verify your ${safeMode} trip!`);
      }, reminderMs);

      // Deep link redirection
      const link = getDeepLink(rawMode);
      if (link) {
        if (rawMode === 'Metro + Bus') {
          toast.success("Opening Metro booking. Please book the bus separately.");
        } else {
          toast.success(`Opening ${safeMode} booking app...`);
        }
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
      <div className="w-full max-w-5xl flex flex-col items-center justify-center h-64">
        <Spinner message="Resyncing Trip State..." />
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

              {/* PROOF UPLOAD SECTION — not required for Walk/Cycle */}
              {activeCommute.transportMode === 'Walk' || activeCommute.transportMode === 'Cycle' ? (
                <div className="w-full max-w-md mt-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center gap-2">
                  <div className="text-emerald-500 font-bold text-sm">No ticket required for {activeCommute.transportMode}</div>
                  <div className="text-[11px] text-muted-foreground">Your eco trip will be verified automatically on completion.</div>
                </div>
              ) : (
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
                    <p className="text-[10px] text-muted-foreground mt-1">Upload your ticket or QR pass to verify your trip.</p>
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
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-all w-full shadow-sm ${isVerified
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-primary text-primary-foreground hover:shadow-lg active:scale-95'
                        }`}
                    >
                      {uploadingProof ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {uploadingProof ? 'AI Scanning...' : isVerified ? 'Proof Authenticated' : 'Capture Proof'}
                    </label>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-2">
                <Button
                  onClick={() => finishJourney(activeCommute._id)}
                  disabled={logging || uploadingProof || (
                    // Walk/Cycle auto-verified, all other modes need proof
                    activeCommute.transportMode !== 'Walk' && activeCommute.transportMode !== 'Cycle' && !isVerified
                  )}
                  className={`flex-1 py-7 font-black text-lg rounded-2xl shadow-xl transition-all ${isVerified
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col justify-center items-center h-40 gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="absolute inset-[38%] bg-primary rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground text-sm font-mono tracking-widest uppercase animate-pulse">Processing Route Data...</p>
          </motion.div>
        )}

        {aiRoutes && !loading && !activeCommute && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            {/* Mock data banner — shown only when Maps API is unavailable */}
            {isMock && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-sm">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Showing estimated routes. Real-time data unavailable — you can still log a commute to earn points.</span>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-6 items-start">
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
                      <span className="text-xl whitespace-nowrap mt-1">{route.type}</span>
                      <span
                        className={`text-xs px-2 py-1 mt-1 rounded font-bold uppercase tracking-tighter truncate max-w-[140px] ${route.color === 'emerald' ? 'bg-primary/20 text-primary' :
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

                    {route.transitSteps && route.transitSteps.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                          className="w-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between outline-none select-none hover:text-foreground transition-colors cursor-pointer"
                        >
                          <span>View Route Details</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${openAccordion === idx ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {openAccordion === idx && (
                          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent mt-4">
                            {route.transitSteps.map((step, sIdx) => (
                              <div key={sIdx} className="relative flex items-start gap-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border z-10 flex-shrink-0 mt-0.5 shadow-sm">
                                  {step.type === 'Metro' ? <TrainFront className="w-3.5 h-3.5 text-primary" /> :
                                    step.type === 'Walk' ? <Footprints className="w-3.5 h-3.5 text-green-500" /> :
                                      step.type === 'Cab' ? <Car className="w-3.5 h-3.5 text-muted-foreground" /> :
                                        <Bus className="w-3.5 h-3.5 text-orange-500" />}
                                </div>
                                <div className="flex-1 bg-background/40 rounded-md border border-border p-2">
                                  <div className="text-xs font-bold flex items-center gap-1.5 mb-1">
                                    <span className={
                                      step.type === 'Metro' ? 'text-primary' :
                                        step.type === 'Walk' ? 'text-green-500' :
                                          step.type === 'Cab' ? 'text-foreground' : 'text-orange-500'
                                    }>{step.type}</span>
                                    {step.line && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{step.line}</span>}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground leading-tight">
                                    <span className="font-medium text-foreground">{step.from}</span>
                                    <span className="mx-1">→</span>
                                    <span className="font-medium text-foreground">{step.to}</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-2">
                                    <span>{step.distKm} km</span>
                                    {step.numStops && (
                                      <>
                                        <span className="w-1 h-1 rounded-full bg-border"></span>
                                        <span>{step.numStops} stops</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      onClick={() => startJourney(route)}
                      disabled={logging}
                      variant={route.color === 'emerald' || route.color === 'orange' ? "default" : "outline"}
                      className={`w-full font-bold gap-2 ${route.color === 'emerald' ? 'shadow-lg shadow-primary/20' :
                        route.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 border-0' :
                          'text-foreground hover:bg-muted'
                        }`}
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
