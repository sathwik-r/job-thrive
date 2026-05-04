import React, { useEffect, useRef } from 'react';

// #1 — Shooting Stars: lime dots streak diagonally, starburst on arrival

interface Star {
  x: number; y: number; speed: number; angle: number;
  trail: { x: number; y: number }[]; alive: boolean; burst: number;
}

export default function BgShootingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);

    const stars: Star[] = [];
    let last = 0;

    const spawn = () => {
      stars.push({
        x: Math.random() * w * 0.3,
        y: h * 0.5 + Math.random() * h * 0.4,
        speed: 4 + Math.random() * 4,
        angle: -0.4 - Math.random() * 0.3,
        trail: [], alive: true, burst: 0,
      });
      if (stars.length > 6) stars.shift();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      if (time - last > 2500 + Math.random() * 2000) { spawn(); last = time; }

      stars.forEach(s => {
        if (s.alive) {
          s.trail.push({ x: s.x, y: s.y });
          if (s.trail.length > 20) s.trail.shift();
          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;

          // Trail
          s.trail.forEach((p, i) => {
            const alpha = (i / s.trail.length) * 0.3;
            ctx.beginPath();
            ctx.fillStyle = `rgba(163, 230, 53, ${alpha})`;
            ctx.arc(p.x, p.y, 1.5 * (i / s.trail.length), 0, Math.PI * 2);
            ctx.fill();
          });

          // Head
          ctx.beginPath();
          ctx.fillStyle = 'rgba(163, 230, 53, 0.7)';
          ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
          ctx.fill();
          // Head glow
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 15);
          g.addColorStop(0, 'rgba(163, 230, 53, 0.2)');
          g.addColorStop(1, 'rgba(163, 230, 53, 0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(s.x, s.y, 15, 0, Math.PI * 2); ctx.fill();

          if (s.x > w * 0.75 || s.y < h * 0.1) { s.alive = false; s.burst = 1; }
        } else if (s.burst > 0) {
          // Starburst
          const r = s.burst * 30;
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
          g.addColorStop(0, `rgba(163, 230, 53, ${0.4 * (1 - s.burst)})`);
          g.addColorStop(1, 'rgba(163, 230, 53, 0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.fill();
          s.burst += 0.03;
          if (s.burst > 1) s.burst = 0;
        }
      });
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
