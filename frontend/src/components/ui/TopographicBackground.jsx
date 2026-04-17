import React from 'react';

export default function TopographicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none transition-colors duration-500">
      
      {/* Theme base layer (slate-50 light / zinc-950 dark) */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950 transition-colors duration-500" />

      {/* Gentle gradient to create depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-accent/5 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-1000" />
      
      {/* Massive SVG Vector Contour Lines spanning the screen */}
      <svg 
        className="absolute w-[200vw] h-[200vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.15] dark:opacity-[0.05]" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeWidth="1.2" fill="none" className="text-slate-500 dark:text-slate-400">
          
          {/* Main Peak (Center) */}
          <path d="M 500 480 C 530 480, 530 520, 500 520 C 470 520, 470 480, 500 480 Z" />
          <path d="M 500 450 C 560 450, 580 550, 500 550 C 420 550, 440 450, 500 450 Z" />
          <path d="M 500 420 C 600 400, 640 580, 500 580 C 380 580, 380 440, 500 420 Z" />
          <path d="M 500 390 C 650 350, 700 600, 500 620 C 320 640, 300 400, 500 390 Z" />
          <path d="M 500 360 C 700 300, 780 650, 500 680 C 250 710, 220 380, 500 360 Z" />
          <path d="M 500 330 C 800 240, 850 720, 500 730 C 150 740, 150 350, 500 330 Z" />
          <path d="M 500 300 C 900 150, 950 800, 500 800 C 50 800, 50 300, 500 300 Z" />
          <path d="M 500 250 C 1050 50, 1050 900, 500 900 C -50 900, -50 200, 500 250 Z" />
          <path d="M 500 200 C 1200 -50, 1150 1000, 500 1000 C -150 1000, -200 100, 500 200 Z" />
          <path d="M 500 150 C 1350 -150, 1250 1100, 500 1100 C -250 1100, -350 0, 500 150 Z" />
          <path d="M 500 100 C 1500 -250, 1350 1200, 500 1200 C -350 1200, -500 -100, 500 100 Z" />
          <path d="M 500  50 C 1650 -350, 1450 1300, 500 1300 C -450 1300, -600 -200, 500  50 Z" />
          
          {/* Secondary Peak (Bottom Right) */}
          <path d="M 800 800 C 820 780, 840 820, 800 840 C 780 820, 780 780, 800 800 Z" />
          <path d="M 800 760 C 850 720, 880 850, 800 880 C 720 860, 730 750, 800 760 Z" />
          <path d="M 800 720 C 900 660, 950 900, 800 930 C 650 900, 680 700, 800 720 Z" />
          <path d="M 800 660 C 980 580, 1020 950, 800 980 C 580 940, 620 620, 800 660 Z" />
          <path d="M 800 600 C 1050 500, 1100 1000, 800 1040 C 500 1000, 550 550, 800 600 Z" />

          {/* Tertiary Peak (Top Left) */}
          <path d="M 200 200 C 230 180, 240 220, 200 240 C 170 220, 160 180, 200 200 Z" />
          <path d="M 200 150 C 260 110, 290 250, 200 280 C 110 250, 130 120, 200 150 Z" />
          <path d="M 200 100 C 320 50, 360 300, 200 340 C 50 300, 70 80, 200 100 Z" />
          <path d="M 200  40 C 400 -20, 440 380, 200 410 C -20 370, -10 0, 200  40 Z" />
          <path d="M 200 -20 C 500 -120, 540 460, 200 490 C -120 460, -110 -100, 200 -20 Z" />
          
        </g>
      </svg>

      {/* Edge vignette to softly fade the massive vector lines at screen edges */}
      <div className="absolute inset-0 shadow-[inset_0_0_100px_40px_rgba(248,250,252,1)] dark:shadow-[inset_0_0_100px_40px_rgba(9,9,11,1)] pointer-events-none" />
    </div>
  );
}
