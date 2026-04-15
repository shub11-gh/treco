import React, { useEffect, useState } from 'react';
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
import OnboardingModal from './components/OnboardingModal';
import ErrorBoundary from './components/ErrorBoundary';
import ImpactCard from './components/ImpactCard';
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
function Header({ dark, setDark, onShowImpact }) {
  const { logout } = useAuthStore();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', icon: Leaf, label: 'Dashboard', accent: false },
    { to: '/engine', icon: RouteIcon, label: 'Engine', accent: true },
    { to: '/leaderboard', icon: Trophy, label: 'Ranks', accent: false },
    { to: '/rewards', icon: Gift, label: 'Vault', accent: false },
    { to: '/history', icon: History, label: 'History', accent: false },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 mx-auto justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ width: "200px" }}>
          <img
            src="/logo.png"
            alt="CarbonCarver Logo"
            className="h-15 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
          <span className="items-center gap-2 font-bold text-lg md:text-xl text-primary tracking-tight hidden">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            Treco
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center justify-center flex-1 gap-6 text-sm font-medium">
          {navLinks.map(({ to, icon: Icon, label, accent }) => (
            <Link
              key={to}
              to={to}
              className={`transition-all flex items-center gap-1.5 ${isActive(to)
                ? accent
                  ? 'text-accent font-bold drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'text-primary font-bold drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : accent
                  ? 'text-muted-foreground hover:text-accent'
                  : 'text-muted-foreground hover:text-primary'
                }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-2" style={{ width: "200px" }}>
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Share eco impact */}
          <button
            onClick={onShowImpact}
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted"
            title="My Eco Impact Card"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Profile link */}
          <Link
            to="/profile"
            className={`p-2 rounded-lg hover:bg-muted transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="My Profile"
          >
            <UserCircle className="w-4 h-4" />
          </Link>

          {/* Logout */}
          {showLogoutConfirm ? (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground hidden lg:inline text-md">Logout?</span>
              <button onClick={() => { logout(); setShowLogoutConfirm(false); }} className="text-red-400 font-bold hover:text-red-300 transition-colors px-2 py-1 rounded border border-red-400/30 hover:border-red-400/60 text-xs">Yes</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border text-xs">No</button>
            </div>
          ) : (
            <button onClick={() => setShowLogoutConfirm(true)} className="text-muted-foreground hover:text-red-400 transition-colors p-2 flex items-center gap-1.5 text-sm font-medium rounded-lg hover:bg-muted">
              <LogOut className="w-4 h-4" />
            </button>
          )}
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
      <div className="min-h-[100dvh] bg-background text-foreground flex flex-col selection:bg-primary/30 items-center overflow-auto px-4 py-8 relative">
        <div className="absolute top-0 right-0 p-[20%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <Auth />
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
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      {showImpact && <ImpactCard user={user} onClose={() => setShowImpact(false)} />}
      <Header dark={dark} setDark={setDark} onShowImpact={() => setShowImpact(true)} />
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
