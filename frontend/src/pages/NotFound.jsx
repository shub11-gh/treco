import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 text-center px-4">
      {/* Animated 404 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative"
      >
        <div className="text-[9rem] font-black leading-none tracking-tighter select-none">
          <span className="text-muted/30">4</span>
          <span className="relative inline-block">
            <span className="text-muted/30">0</span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
            </div>
          </span>
          <span className="text-muted/30">4</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-3"
      >
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground max-w-sm">
          Looks like this route went off the green path. Head back to the dashboard to continue your eco journey.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex gap-3"
      >
        <Button asChild>
          <Link to="/" className="gap-2">
            <Home className="w-4 h-4" /> Go to Dashboard
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()} className="gap-2 text-foreground">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </motion.div>
    </div>
  );
}
