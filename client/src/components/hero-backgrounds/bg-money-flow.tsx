import React, { useEffect, useRef } from 'react';

// #3 — Money Flow Animation
// Particles flow from left (seekers) → center (platform) → right (referrers)
// Rs.499 splits into Rs.249 + Rs.250 visually

interface Particle {
  x: number;
  y: number;
  speed: number;
  phase: 'seeker' | 'split-up' | 'split-down';
  opacity: number;
  size: number;
  splitY?: number;
}

export default function BgMoneyFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const midX = w * 0.5;
    const splitX = w * 0.55;

    const addParticle = () => {
      particles.push({
        x: w * 0.05 + Math.random() * w * 0.1,
        y: h * 0.3 + Math.random() * h * 0.4,
        speed: 1 + Math.random() * 1.5,
        phase: 'seeker',
        opacity: 0.15 + Math.random() * 0.2,
        size: 2 + Math.random() * 2,
      });
    };

    // Labels
    const drawLabels = () => {
      ctx.font = '10px Inter, system-ui';
      ctx.fillStyle = 'rgba(163, 230, 53, 0.06)';
      ctx.textAlign = 'center';
      ctx.fillText('SEEKERS', w * 0.12, h * 0.22);
      ctx.fillText('Rs.499', midX, h * 0.22);

      ctx.fillStyle = 'rgba(129, 140, 248, 0.06)';
      ctx.fillText('REFERRERS', w * 0.85, h * 0.3);
      ctx.fillText('Rs.249', w * 0.85, h * 0.35);

      ctx.fillStyle = 'rgba(251, 146, 60, 0.04)';
      ctx.fillText('PLATFORM', w * 0.85, h * 0.65);
      ctx.fillText('Rs.250', w * 0.85, h * 0.7);
    };

    // Funnel shape
    const drawFunnel = () => {
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.03)';
      ctx.lineWidth = 1;
      // Left converge
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.25);
      ctx.lineTo(midX, h * 0.48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.75);
      ctx.lineTo(midX, h * 0.52);
      ctx.stroke();
      // Right split
      ctx.strokeStyle = 'rgba(129, 140, 248, 0.03)';
      ctx.beginPath();
      ctx.moveTo(splitX, h * 0.48);
      ctx.lineTo(w * 0.9, h * 0.3);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.03)';
      ctx.beginPath();
      ctx.moveTo(splitX, h * 0.52);
      ctx.lineTo(w * 0.9, h * 0.7);
      ctx.stroke();
    };

    let frameCount = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      drawFunnel();
      drawLabels();

      frameCount++;
      if (frameCount % 20 === 0) addParticle();
      if (particles.length > 40) particles.shift();

      particles.forEach((p) => {
        if (p.phase === 'seeker') {
          // Move right toward center
          p.x += p.speed;
          // Converge toward center Y
          const targetY = h * 0.5;
          p.y += (targetY - p.y) * 0.008;

          if (p.x >= splitX) {
            // Split into two paths
            p.phase = Math.random() > 0.5 ? 'split-up' : 'split-down';
            p.splitY = p.y;
          }

          // Draw lime particle
          ctx.beginPath();
          ctx.fillStyle = `rgba(163, 230, 53, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          ctx.beginPath();
          ctx.strokeStyle = `rgba(163, 230, 53, ${p.opacity * 0.3})`;
          ctx.lineWidth = p.size * 0.6;
          ctx.moveTo(p.x - 15, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          p.x += p.speed * 0.8;
          const targetY = p.phase === 'split-up' ? h * 0.3 : h * 0.7;
          p.y += (targetY - p.y) * 0.02;
          p.opacity *= 0.995;

          const color = p.phase === 'split-up' ? '129, 140, 248' : '251, 146, 60';
          ctx.beginPath();
          ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Trail
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${color}, ${p.opacity * 0.3})`;
          ctx.lineWidth = p.size * 0.4;
          ctx.moveTo(p.x - 10, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        // Remove off-screen
        if (p.x > w + 20 || p.opacity < 0.01) {
          p.x = -100; // mark for cleanup
        }
      });

      // Center node (platform)
      ctx.beginPath();
      const grd = ctx.createRadialGradient(midX, h * 0.5, 0, midX, h * 0.5, 20);
      grd.addColorStop(0, 'rgba(163, 230, 53, 0.12)');
      grd.addColorStop(1, 'rgba(163, 230, 53, 0)');
      ctx.fillStyle = grd;
      ctx.arc(midX, h * 0.5, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(163, 230, 53, 0.2)';
      ctx.arc(midX, h * 0.5, 4, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
