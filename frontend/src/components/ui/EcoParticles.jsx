import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function EcoParticles() {
  // Generate random stable particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 8 + 4, // 4px to 12px
      left: Math.random() * 100, // 0% to 100% viewpoint width
      duration: Math.random() * 15 + 10, // 10s to 25s floating up
      delay: Math.random() * 10, // 0s to 10s staggered start
      isAccent: Math.random() > 0.6, // 40% chance to be blue accent, 60% green primary
      opacityBase: Math.random() * 0.4 + 0.1, // 0.1 to 0.5 opacity max
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            y: '100vh', 
            x: `${p.left}vw`, 
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            y: '-10vh', 
            x: [`${p.left}vw`, `${p.left + (Math.random() * 5 - 2.5)}vw`], // Slight horizontal drift
            opacity: [0, p.opacityBase, p.opacityBase, 0],
            scale: [0.5, 1, 1, 0.5]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            filter: 'blur(1px)',
            left: 0,
            top: 0
          }}
          className={p.isAccent ? 'bg-accent shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]'}
        />
      ))}
    </div>
  );
}
