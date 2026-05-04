import React, { useEffect, useRef } from 'react';

// #3 — Spark Trails: embers rise from bottom, some accelerate horizontally → green flash

interface Spark {
  x: number; y: number; vy: number; vx: number;
  life: number; maxLife: number; launched: boolean;
  size: number; color: string;
}

export default function BgSparkTrails() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);

    const sparks: Spark[] = [];
    let frameCount = 0;
    let flashX = 0, flashY = 0, flashLife = 0;

    const colors = ['163,230,53', '129,140,248', '251,146,60'];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frameCount++;

      // Spawn embers from bottom
      if (frameCount % 8 === 0) {
        const c = colors[Math.floor(Math.random() * 3)];
        sparks.push({
          x: Math.random() * w,
          y: h + 10,
          vy: -0.5 - Math.random() * 1,
          vx: (Math.random() - 0.5) * 0.5,
          life: 0,
          maxLife: 200 + Math.random() * 200,
          launched: false,
          size: 1 + Math.random() * 2,
          color: c,
        });
      }

      // Every ~4 sec, pick a spark and launch it
      if (frameCount % 240 === 0) {
        const candidates = sparks.filter(s => !s.launched && s.life > 30 && s.y > h * 0.3 && s.y < h * 0.7);
        if (candidates.length > 0) {
          const s = candidates[Math.floor(Math.random() * candidates.length)];
          s.launched = true;
          s.vx = 6 + Math.random() * 4;
          s.vy = -1 + Math.random() * 2;
          s.size = 3;
          s.color = '163,230,53';
          s.maxLife = s.life + 100;
        }
      }

      // Update & draw
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;

        const alpha = Math.max(0, 1 - s.life / s.maxLife);

        if (s.launched) {
          // Speed trail
          for (let j = 1; j <= 6; j++) {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${s.color}, ${alpha * 0.2 * (1 - j / 6)})`;
            ctx.arc(s.x - s.vx * j * 2, s.y - s.vy * j * 2, s.size * (1 - j / 8), 0, Math.PI * 2);
            ctx.fill();
          }
          // Head glow
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 12);
          g.addColorStop(0, `rgba(${s.color}, ${alpha * 0.4})`);
          g.addColorStop(1, `rgba(${s.color}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, Math.PI * 2); ctx.fill();

          // Flash on exit
          if (s.x > w * 0.85) {
            flashX = s.x; flashY = s.y; flashLife = 1;
            sparks.splice(i, 1);
            continue;
          }
        }

        // Draw spark
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.color}, ${alpha * (s.launched ? 0.7 : 0.15)})`;
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        if (s.life >= s.maxLife) { sparks.splice(i, 1); }
      }

      // Flash effect
      if (flashLife > 0) {
        const r = flashLife * 40;
        const g = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, r);
        g.addColorStop(0, `rgba(163, 230, 53, ${0.5 * flashLife})`);
        g.addColorStop(1, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(flashX, flashY, r, 0, Math.PI * 2); ctx.fill();
        flashLife -= 0.02;
      }

      if (sparks.length > 80) sparks.splice(0, 20);
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
