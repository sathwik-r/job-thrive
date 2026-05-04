import React from 'react';
import { motion } from 'framer-motion';

// #5 — Gradient Mesh + Particles
// Slow-moving color blobs (like iOS wallpapers) + subtle particles trailing toward center

export default function BgGradientMesh() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Large gradient blobs */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '60vw', height: '60vw', maxWidth: 800, maxHeight: 800,
          top: '-10%', left: '-10%',
          background: 'radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: '50vw', height: '50vw', maxWidth: 700, maxHeight: 700,
          top: '30%', right: '-15%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: '45vw', height: '45vw', maxWidth: 600, maxHeight: 600,
          bottom: '-5%', left: '20%',
          background: 'radial-gradient(circle, rgba(251,146,60,0.04) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Small floating particles */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = 10 + Math.random() * 80;
        const y = 10 + Math.random() * 80;
        const duration = 8 + Math.random() * 12;
        const size = 2 + Math.random() * 3;
        const color = i % 3 === 0 ? '#A3E635' : i % 3 === 1 ? '#818CF8' : '#FB923C';

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              left: `${x}%`, top: `${y}%`,
              background: color,
              opacity: 0.1 + Math.random() * 0.1,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, 0],
              y: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        );
      })}

      {/* Central glow pulse */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200, height: 200,
          top: '40%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(163,230,53,0.04) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        opacity: 0.4,
      }} />
    </div>
  );
}
