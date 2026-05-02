import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Leaf, Route as RouteIcon, Trophy, Gift, Moon, Sun, UserCircle, History, Sparkles } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import SmartEngine from './pages/SmartEngine';
import Leaderboard from './pages/Leaderboard';
import RewardsVault from './pages/RewardsVault';
import HistoryPage from './pages/History';
import ProfilePage from './pages/Profile';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import OnboardingModal from './components/OnboardingModal';
import ErrorBoundary from './components/ErrorBoundary';
import ImpactCard from './components/ImpactCard';
import TopographicBackground from './components/ui/TopographicBackground';
import EcoParticles from './components/ui/EcoParticles';
import useAuthStore from './store/useAuthStore';

// ── Page title hook ─────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/': 'Dashboard — Treco',
  '/engine': 'Smart Engine — Treco',
  '/leaderboard': 'Leaderboard — Treco',
  '/rewards': 'Rewards Vault — Treco',
  '/history': 'Activity History — Treco',
  '/profile': 'My Profile — Treco',
};
function usePageTitle() {
  const location = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] || 'Treco — Green Commutes. Real Rewards.';
  }, [location.pathname]);
}

// ── Dark / Light mode hook ───────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true; // default dark
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark];
}

// ── Header ──────────────────────────────────────────────────────────────────
function Header({ dark, setDark, onShowImpact, setAuthMode }) {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', icon: Leaf, label: 'Dashboard', accent: false },
    { to: '/engine', icon: RouteIcon, label: 'Engine', accent: true },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', accent: false },
    { to: '/rewards', icon: Gift, label: 'Rewards', accent: false },
    { to: '/history', icon: History, label: 'History', accent: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center px-4 md:px-8 mx-auto justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ width: "200px" }}>
          <img
            src="/trecoLogo.png"
            alt="Treco Logo"
            className="h-15 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          <span className="flex items-center gap-2 font-black text-2xl md:text-3xl text-[#138851ff] tracking-tight">
            Treco
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center justify-center flex-1 gap-8 text-base font-medium">
          {navLinks.map(({ to, icon: Icon, label, accent }) => (
            <Link
              key={to}
              to={to}
              className={`transition-all flex items-center gap-1.5 ${isActive(to)
                ? accent
                  ? 'text-accent font-bold'
                  : 'text-[#138851ff] font-bold'
                : accent
                  ? 'text-muted-foreground hover:text-accent'
                  : 'text-muted-foreground hover:text-[#138851ff]'
                }`}
            >
              <Icon className="w-5.5 h-5.5" /> {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-2" style={{ width: "200px" }}>
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className="text-muted-foreground hover:text-[#138851ff] transition-colors p-2 rounded-lg hover:bg-muted"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="w-5.5 h-5.5" /> : <Moon className="w-5.5 h-5.5" />}
          </button>

          {/* Share eco impact */}
          <button
            onClick={onShowImpact}
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
            title="My Eco Impact Card"
          >
            <Sparkles className="w-5.5 h-5.5" />
          </button>

          {/* Profile link */}
          <Link
            to="/profile"
            className={`p-2 rounded-lg hover:bg-muted transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-[#138851ff]'}`}
            title="My Profile"
          >
            <UserCircle className="w-5.5 h-5.5" />
          </Link>

          {/* Logout Trigger */}
          <button onClick={() => setShowLogoutConfirm(true)} className="text-muted-foreground hover:text-red-400 transition-colors p-2 flex items-center gap-1.5 text-base font-medium rounded-lg hover:bg-muted" title="Logout">
            <LogOut className="w-5.5 h-5.5" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex h-16 items-center px-2 justify-around border-t border-border bg-background/95 backdrop-blur fixed bottom-0 w-full z-50">
        {[
          { to: '/', icon: Leaf, label: 'Home', accent: false },
          { to: '/engine', icon: RouteIcon, label: 'Engine', accent: true },
          { to: '/leaderboard', icon: Trophy, label: 'Ranks', accent: false },
          { to: '/history', icon: History, label: 'History', accent: false },
          { to: '/rewards', icon: Gift, label: 'Vault', accent: false },
          { to: '/profile', icon: UserCircle, label: 'Profile', accent: false },
        ].map(({ to, icon: Icon, label, accent }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 transition-colors ${isActive(to)
              ? accent ? 'text-accent' : 'text-primary'
              : accent ? 'text-muted-foreground hover:text-accent' : 'text-muted-foreground hover:text-primary'
              }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Logout Modal Overlay */}
      {createPortal(
        <AnimatePresence>
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-sm rounded-[2rem] border border-border shadow-2xl p-6 md:p-8 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <LogOut className="w-8 h-8 ml-1" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-foreground tracking-tight">Ready to leave?</h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Your eco-impact is safe with us. We'll be here when you're ready to hit the road again!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-bold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setAuthMode(null);
                      setShowLogoutConfirm(false);
                      if (window.location.pathname !== '/') {
                        window.location.href = '/';
                      }
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}

// ── Auth Header ─────────────────────────────────────────────────────────────
function AuthHeader({ dark, setDark, authMode, setAuthMode }) {
  return (
    <header className="w-full border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container flex h-20 items-center px-4 md:px-8 mx-auto justify-between relative">
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10 w-[200px]">
          <img src="/trecoLogo.png" alt="Treco Logo" className="h-10 md:h-12 w-auto object-contain" />
          <span className="flex items-center gap-2 font-black text-2xl md:text-3xl text-[#138851ff] tracking-tight">
            Treco
          </span>
        </div>

        {/* Middle Navigation (Hidden on small screens) */}
        <nav className="hidden xl:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-lg text-muted-foreground whitespace-nowrap">
          <a href="#features" className="hover:text-accent transition-colors">Features</a>
          <a href="#campuses" className="hover:text-accent transition-colors">Campuses</a>
          <a href="#mission" className="hover:text-accent transition-colors">Mission</a>
          <a href="#leaderboard" className="flex items-center gap-1.5 hover:text-accent transition-colors">Global Leaderboard</a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-3 md:gap-4 relative z-10 w-[200px]">
          <div className="hidden sm:flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/50">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-2 py-2 rounded-md text-sm font-bold transition-all ${authMode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/70 hover:text-primary-foreground hover:shadow-md'
                }`}
            >
              Log In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`px-2 py-2 rounded-md text-sm font-bold transition-all ${authMode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-primary/70 hover:text-primary-foreground hover:shadow-md'
                }`}
            >
              Sign Up
            </button>
          </div>

          <button
            onClick={() => setDark(d => !d)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
// ── Animated Routes ──────────────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  usePageTitle();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: 'blur(4px)' }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full h-full flex-1 flex justify-center pb-20 md:pb-0"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/engine" element={<ErrorBoundary><SmartEngine /></ErrorBoundary>} />
          <Route path="/leaderboard" element={<ErrorBoundary><Leaderboard /></ErrorBoundary>} />
          <Route path="/rewards" element={<ErrorBoundary><RewardsVault /></ErrorBoundary>} />
          <Route path="/history" element={<ErrorBoundary><HistoryPage /></ErrorBoundary>} />
          <Route path="/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
  const [dark, setDark] = useDarkMode();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show onboarding on first ever login
  useEffect(() => {
    if (isAuthenticated && !localStorage.getItem('onboardingComplete')) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background text-foreground">
        <Leaf className="w-8 h-8 animate-pulse text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 relative overflow-x-hidden">
        {/* Ambient background glows & Particles */}
        <div className="fixed top-0 left-0 w-full lg:w-[800px] h-[500px] bg-gradient-to-b from-primary/10 to-transparent blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none z-0" />
        <div className="fixed inset-0 z-0 pointer-events-none">
          <EcoParticles />
        </div>

        <AuthHeader dark={dark} setDark={setDark} authMode={authMode} setAuthMode={setAuthMode} />

        <main className="flex-1 w-full flex flex-col items-center justify-start z-10 relative">
          <Landing setAuthMode={setAuthMode} />
        </main>

        {/* Portal-mounted Auth Modal */}
        <Auth authMode={authMode} setAuthMode={setAuthMode} />

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: dark ? '#1c1c1e' : '#ffffff',
              color: dark ? '#f0fdf4' : '#09090b',
              border: `1px solid ${dark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.3)'}`,
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            error: { iconTheme: { primary: '#f87171', secondary: dark ? '#1c1c1e' : '#ffffff' }, duration: 5000 },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/30 relative">
      {!dark && <TopographicBackground />}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {showImpact && <ImpactCard user={user} onClose={() => setShowImpact(false)} />}
      <Header dark={dark} setDark={setDark} onShowImpact={() => setShowImpact(true)} setAuthMode={setAuthMode} />
      <main className="flex-1 flex flex-col items-center p-4 md:px-8 md:py-10 w-full z-10">
        <AnimatedRoutes />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: dark ? '#1c1c1e' : '#ffffff',
            color: dark ? '#f0fdf4' : '#09090b',
            border: `1px solid ${dark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.3)'}`,
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: dark
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 4px 24px rgba(0,0,0,0.08)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: dark ? '#1c1c1e' : '#ffffff' },
            duration: 4000,
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: dark ? '#1c1c1e' : '#ffffff' },
            duration: 5000,
          },
        }}
      />
    </div>
  );
}
