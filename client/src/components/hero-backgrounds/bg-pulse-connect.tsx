import React, { useEffect, useRef } from 'react';

// #2 — Pulse Connect: beam fires from left dot to right dot along curve, ring pulse on arrival

export default function BgPulseConnect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);

    const leftX = w * 0.12, leftY = h * 0.5;
    const rightX = w * 0.88, rightY = h * 0.45;
    let beamProgress = -1; // -1 = idle
    let ringProgress = 0;
    let ringActive = false;
    let idleTimer = 0;
    let showText = 0;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // Left dot (seeker) — lime
      ctx.beginPath();
      ctx.fillStyle = 'rgba(163, 230, 53, 0.25)';
      ctx.arc(leftX, leftY, 6, 0, Math.PI * 2);
      ctx.fill();
      const gl = ctx.createRadialGradient(leftX, leftY, 0, leftX, leftY, 25);
      gl.addColorStop(0, 'rgba(163, 230, 53, 0.08)');
      gl.addColorStop(1, 'rgba(163, 230, 53, 0)');
      ctx.fillStyle = gl;
      ctx.beginPath(); ctx.arc(leftX, leftY, 25, 0, Math.PI * 2); ctx.fill();

      // Right dot (referrer) — violet
      ctx.beginPath();
      ctx.fillStyle = 'rgba(129, 140, 248, 0.25)';
      ctx.arc(rightX, rightY, 6, 0, Math.PI * 2);
      ctx.fill();
      const gr = ctx.createRadialGradient(rightX, rightY, 0, rightX, rightY, 25);
      gr.addColorStop(0, 'rgba(129, 140, 248, 0.08)');
      gr.addColorStop(1, 'rgba(129, 140, 248, 0)');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(rightX, rightY, 25, 0, Math.PI * 2); ctx.fill();

      // Faint curved path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      const cpx = w * 0.5, cpy = h * 0.25;
      ctx.moveTo(leftX, leftY);
      ctx.quadraticCurveTo(cpx, cpy, rightX, rightY);
      ctx.stroke();

      // Beam animation
      if (beamProgress >= 0 && beamProgress <= 1) {
        beamProgress += 0.012;
        const t = beamProgress;
        const bx = (1 - t) * (1 - t) * leftX + 2 * (1 - t) * t * cpx + t * t * rightX;
        const by = (1 - t) * (1 - t) * leftY + 2 * (1 - t) * t * cpy + t * t * rightY;

        // Trail
        for (let i = 0; i < 8; i++) {
          const tt = Math.max(0, t - i * 0.015);
          const tx = (1 - tt) * (1 - tt) * leftX + 2 * (1 - tt) * tt * cpx + tt * tt * rightX;
          const ty = (1 - tt) * (1 - tt) * leftY + 2 * (1 - tt) * tt * cpy + tt * tt * rightY;
          ctx.beginPath();
          ctx.fillStyle = `rgba(163, 230, 53, ${0.3 * (1 - i / 8)})`;
          ctx.arc(tx, ty, 2 * (1 - i / 8), 0, Math.PI * 2);
          ctx.fill();
        }

        // Head
        ctx.beginPath();
        ctx.fillStyle = 'rgba(163, 230, 53, 0.8)';
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
        const gh = ctx.createRadialGradient(bx, by, 0, bx, by, 20);
        gh.addColorStop(0, 'rgba(163, 230, 53, 0.25)');
        gh.addColorStop(1, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = gh;
        ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2); ctx.fill();

        if (beamProgress > 1) { beamProgress = -1; ringActive = true; ringProgress = 0; showText = 1; }
      }

      // Ring pulse on arrival
      if (ringActive) {
        ringProgress += 0.02;
        const rr = ringProgress * 50;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(163, 230, 53, ${0.4 * (1 - ringProgress)})`;
        ctx.lineWidth = 2 * (1 - ringProgress);
        ctx.arc(rightX, rightY, rr, 0, Math.PI * 2);
        ctx.stroke();
        if (ringProgress > 1) ringActive = false;
      }

      // "Rs.249" text
      if (showText > 0) {
        ctx.fillStyle = `rgba(163, 230, 53, ${showText * 0.3})`;
        ctx.font = '11px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('+Rs.249', rightX, rightY + 30);
        showText -= 0.005;
      }

      // Auto-fire every 4 seconds
      idleTimer++;
      if (idleTimer > 240 && beamProgress < 0 && !ringActive) {
        beamProgress = 0;
        idleTimer = 0;
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
