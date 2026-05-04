import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// #2 — Floating Company Logos Constellation
// Real logos floating slowly, pulse when ticker mentions them

const LOGOS = [
  { name: 'Google', url: 'https://logo.clearbit.com/google.com', x: 15, y: 20 },
  { name: 'Microsoft', url: 'https://logo.clearbit.com/microsoft.com', x: 75, y: 15 },
  { name: 'Amazon', url: 'https://logo.clearbit.com/amazon.com', x: 45, y: 70 },
  { name: 'Meta', url: 'https://logo.clearbit.com/meta.com', x: 85, y: 55 },
  { name: 'Flipkart', url: 'https://logo.clearbit.com/flipkart.com', x: 25, y: 60 },
  { name: 'Adobe', url: 'https://logo.clearbit.com/adobe.com', x: 65, y: 30 },
  { name: 'Atlassian', url: 'https://logo.clearbit.com/atlassian.com', x: 10, y: 80 },
  { name: 'Stripe', url: 'https://logo.clearbit.com/stripe.com', x: 55, y: 45 },
  { name: 'Razorpay', url: 'https://logo.clearbit.com/razorpay.com', x: 35, y: 35 },
  { name: 'Swiggy', url: 'https://logo.clearbit.com/swiggy.com', x: 80, y: 75 },
  { name: 'Uber', url: 'https://logo.clearbit.com/uber.com', x: 50, y: 85 },
  { name: 'Netflix', url: 'https://logo.clearbit.com/netflix.com', x: 90, y: 40 },
];

interface Props {
  activeCompany?: string;
}

export default function BgFloatingLogos({ activeCompany }: Props) {
  const [loadedLogos, setLoadedLogos] = useState<Set<string>>(new Set());

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {LOGOS.map((logo, i) => {
        const isActive = activeCompany === logo.name;
        const duration = 15 + (i % 5) * 3;
        const delay = i * 0.8;

        return (
          <motion.div
            key={logo.name}
            className="absolute"
            style={{ left: `${logo.x}%`, top: `${logo.y}%` }}
            animate={{
              x: [0, 20 * Math.sin(i), -15 * Math.cos(i), 0],
              y: [0, -15 * Math.cos(i), 10 * Math.sin(i), 0],
            }}
            transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.4, 1], opacity: [0.15, 0.5, 0.15] } : {}}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Glow ring when active */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 2, opacity: [0, 0.3, 0] }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'rgba(163, 230, 53, 0.2)', filter: 'blur(8px)' }}
                />
              )}
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: '#141414',
                  border: `1px solid ${isActive ? '#A3E63540' : '#1F1F1F'}`,
                  opacity: isActive ? 0.6 : 0.12,
                  boxShadow: isActive ? '0 0 20px rgba(163,230,53,0.15)' : 'none',
                }}
              >
                <img
                  src={logo.url}
                  alt=""
                  className="w-6 h-6 md:w-7 md:h-7 rounded object-contain"
                  onLoad={() => setLoadedLogos(prev => new Set(prev).add(logo.name))}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Connecting lines between some logos */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
        {LOGOS.slice(0, 6).map((logo, i) => {
          const next = LOGOS[(i + 3) % LOGOS.length];
          return (
            <line key={i} x1={`${logo.x}%`} y1={`${logo.y}%`} x2={`${next.x}%`} y2={`${next.y}%`}
              stroke="#A3E635" strokeWidth="1" />
          );
        })}
      </svg>
    </div>
  );
}
