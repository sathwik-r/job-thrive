import React, { useEffect, useRef } from 'react';

// #4 — Orbit & Launch: dots orbit in circle, one breaks off and shoots right → ring pulse

export default function BgOrbitLaunch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);

    const cx = w * 0.25, cy = h * 0.5, orbitR = 60;
    const targetX = w * 0.85, targetY = h * 0.4;

    interface Orb { angle: number; speed: number; color: string; launched: boolean; lx: number; ly: number; lvx: number; lvy: number; trail: {x:number;y:number}[] }
    const orbs: Orb[] = Array.from({ length: 8 }, (_, i) => ({
      angle: (Math.PI * 2 / 8) * i,
      speed: 0.008 + Math.random() * 0.004,
      color: i % 3 === 0 ? '163,230,53' : i % 3 === 1 ? '129,140,248' : '251,146,60',
      launched: false, lx: 0, ly: 0, lvx: 0, lvy: 0, trail: [],
    }));

    let launchTimer = 0;
    let ringPulse = 0, ringX = 0, ringY = 0;
    let successText = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      launchTimer++;

      // Orbit center glow
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbitR + 20);
      cg.addColorStop(0, 'rgba(163, 230, 53, 0.03)');
      cg.addColorStop(1, 'rgba(163, 230, 53, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, orbitR + 20, 0, Math.PI * 2); ctx.fill();

      // Orbit path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.04)';
      ctx.lineWidth = 1;
      ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
      ctx.stroke();

      // Target dot
      ctx.beginPath();
      ctx.fillStyle = 'rgba(129, 140, 248, 0.15)';
      ctx.arc(targetX, targetY, 5, 0, Math.PI * 2);
      ctx.fill();
      const tg = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 20);
      tg.addColorStop(0, 'rgba(129, 140, 248, 0.05)');
      tg.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.arc(targetX, targetY, 20, 0, Math.PI * 2); ctx.fill();

      // Launch one every 4s
      if (launchTimer % 250 === 0) {
        const candidates = orbs.filter(o => !o.launched);
        if (candidates.length > 0) {
          const o = candidates[0];
          o.launched = true;
          o.lx = cx + Math.cos(o.angle) * orbitR;
          o.ly = cy + Math.sin(o.angle) * orbitR;
          const dx = targetX - o.lx, dy = targetY - o.ly;
          const dist = Math.sqrt(dx * dx + dy * dy);
          o.lvx = (dx / dist) * 5;
          o.lvy = (dy / dist) * 5;
          o.trail = [];
          o.color = '163,230,53';
        }
      }

      orbs.forEach(o => {
        if (!o.launched) {
          // Orbit
          o.angle += o.speed;
          const ox = cx + Math.cos(o.angle) * orbitR;
          const oy = cy + Math.sin(o.angle) * orbitR;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${o.color}, 0.2)`;
          ctx.arc(ox, oy, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Flying
          o.trail.push({ x: o.lx, y: o.ly });
          if (o.trail.length > 15) o.trail.shift();
          o.lx += o.lvx;
          o.ly += o.lvy;

          // Trail
          o.trail.forEach((p, i) => {
            ctx.beginPath();
            ctx.fillStyle = `rgba(${o.color}, ${0.25 * (i / o.trail.length)})`;
            ctx.arc(p.x, p.y, 2 * (i / o.trail.length), 0, Math.PI * 2);
            ctx.fill();
          });

          // Head
          ctx.beginPath();
          ctx.fillStyle = `rgba(${o.color}, 0.7)`;
          ctx.arc(o.lx, o.ly, 4, 0, Math.PI * 2);
          ctx.fill();
          const hg = ctx.createRadialGradient(o.lx, o.ly, 0, o.lx, o.ly, 15);
          hg.addColorStop(0, `rgba(${o.color}, 0.2)`);
          hg.addColorStop(1, `rgba(${o.color}, 0)`);
          ctx.fillStyle = hg;
          ctx.beginPath(); ctx.arc(o.lx, o.ly, 15, 0, Math.PI * 2); ctx.fill();

          // Arrived
          const dx = o.lx - targetX, dy = o.ly - targetY;
          if (Math.sqrt(dx * dx + dy * dy) < 15) {
            o.launched = false;
            o.angle = Math.random() * Math.PI * 2;
            ringPulse = 1; ringX = targetX; ringY = targetY;
            successText = 1;
          }
        }
      });

      // Ring pulse
      if (ringPulse > 0) {
        const r = (1 - ringPulse) * 50;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(163, 230, 53, ${ringPulse * 0.4})`;
        ctx.lineWidth = 2 * ringPulse;
        ctx.arc(ringX, ringY, r, 0, Math.PI * 2);
        ctx.stroke();
        ringPulse -= 0.015;
      }

      // Success text
      if (successText > 0) {
        ctx.fillStyle = `rgba(163, 230, 53, ${successText * 0.25})`;
        ctx.font = 'bold 10px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Referred ✓', targetX, targetY + 28);
        successText -= 0.004;
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
