import React, { useEffect, useRef } from 'react';

// #5 — Light Beam Relay: left → center → right, three-point relay showing the business model

export default function BgLightBeamRelay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);

    // Three points
    const getPoints = () => ({
      seeker: { x: w * 0.1, y: h * 0.5 },
      platform: { x: w * 0.5, y: h * 0.4 },
      company: { x: w * 0.9, y: h * 0.45 },
    });

    let phase = 0; // 0=idle, 1=seeker→platform, 2=platform glow, 3=platform→company, 4=company flash, 5=success
    let progress = 0;
    let phaseTimer = 0;
    let ring1 = 0, ring2 = 0;

    const labels = [
      { text: 'Seeker', sub: 'Rs.499' },
      { text: 'Job Thrive', sub: '' },
      { text: 'Company', sub: '+Rs.249' },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const pts = getPoints();
      const points = [pts.seeker, pts.platform, pts.company];

      // Draw faint connection lines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.03)';
      ctx.lineWidth = 1;
      ctx.moveTo(pts.seeker.x, pts.seeker.y);
      ctx.lineTo(pts.platform.x, pts.platform.y);
      ctx.lineTo(pts.company.x, pts.company.y);
      ctx.stroke();

      // Draw three anchor points
      points.forEach((p, i) => {
        const colors = ['163,230,53', '163,230,53', '129,140,248'];
        const isActive = (phase === 1 && i === 0) || (phase === 2 && i === 1) || (phase >= 3 && phase <= 5 && i === 2);

        // Glow
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, isActive ? 35 : 20);
        g.addColorStop(0, `rgba(${colors[i]}, ${isActive ? 0.12 : 0.04})`);
        g.addColorStop(1, `rgba(${colors[i]}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, isActive ? 35 : 20, 0, Math.PI * 2); ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.fillStyle = `rgba(${colors[i]}, ${isActive ? 0.5 : 0.15})`;
        ctx.arc(p.x, p.y, isActive ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = `rgba(255,255,255, ${isActive ? 0.15 : 0.04})`;
        ctx.font = '10px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i].text, p.x, p.y + 22);
        if (labels[i].sub && isActive) {
          ctx.fillStyle = `rgba(163, 230, 53, 0.2)`;
          ctx.fillText(labels[i].sub, p.x, p.y + 35);
        }
      });

      // Phase logic
      phaseTimer++;

      if (phase === 0 && phaseTimer > 120) {
        phase = 1; progress = 0; phaseTimer = 0;
      }

      // Phase 1: beam seeker → platform
      if (phase === 1) {
        progress += 0.015;
        const bx = pts.seeker.x + (pts.platform.x - pts.seeker.x) * progress;
        const by = pts.seeker.y + (pts.platform.y - pts.seeker.y) * progress;

        // Trail
        for (let i = 1; i <= 8; i++) {
          const tp = Math.max(0, progress - i * 0.02);
          const tx = pts.seeker.x + (pts.platform.x - pts.seeker.x) * tp;
          const ty = pts.seeker.y + (pts.platform.y - pts.seeker.y) * tp;
          ctx.beginPath();
          ctx.fillStyle = `rgba(163, 230, 53, ${0.3 * (1 - i / 8)})`;
          ctx.arc(tx, ty, 2.5 * (1 - i / 10), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(163, 230, 53, 0.8)';
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
        const hg = ctx.createRadialGradient(bx, by, 0, bx, by, 18);
        hg.addColorStop(0, 'rgba(163, 230, 53, 0.3)');
        hg.addColorStop(1, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fill();

        if (progress >= 1) { phase = 2; phaseTimer = 0; ring1 = 1; }
      }

      // Phase 2: platform glows
      if (phase === 2) {
        if (phaseTimer > 40) { phase = 3; progress = 0; phaseTimer = 0; }
      }

      // Ring at platform
      if (ring1 > 0) {
        const r = (1 - ring1) * 40;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(163, 230, 53, ${ring1 * 0.3})`;
        ctx.lineWidth = 2 * ring1;
        ctx.arc(pts.platform.x, pts.platform.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ring1 -= 0.02;
      }

      // Phase 3: beam platform → company
      if (phase === 3) {
        progress += 0.015;
        const bx = pts.platform.x + (pts.company.x - pts.platform.x) * progress;
        const by = pts.platform.y + (pts.company.y - pts.platform.y) * progress;

        for (let i = 1; i <= 8; i++) {
          const tp = Math.max(0, progress - i * 0.02);
          const tx = pts.platform.x + (pts.company.x - pts.platform.x) * tp;
          const ty = pts.platform.y + (pts.company.y - pts.platform.y) * tp;
          ctx.beginPath();
          ctx.fillStyle = `rgba(129, 140, 248, ${0.3 * (1 - i / 8)})`;
          ctx.arc(tx, ty, 2.5 * (1 - i / 10), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = 'rgba(129, 140, 248, 0.8)';
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
        const hg2 = ctx.createRadialGradient(bx, by, 0, bx, by, 18);
        hg2.addColorStop(0, 'rgba(129, 140, 248, 0.3)');
        hg2.addColorStop(1, 'rgba(129, 140, 248, 0)');
        ctx.fillStyle = hg2;
        ctx.beginPath(); ctx.arc(bx, by, 18, 0, Math.PI * 2); ctx.fill();

        if (progress >= 1) { phase = 4; phaseTimer = 0; ring2 = 1; }
      }

      // Phase 4: company flash
      if (phase === 4 && phaseTimer > 60) { phase = 5; phaseTimer = 0; }

      // Ring at company
      if (ring2 > 0) {
        const r = (1 - ring2) * 50;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(129, 140, 248, ${ring2 * 0.4})`;
        ctx.lineWidth = 2 * ring2;
        ctx.arc(pts.company.x, pts.company.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ring2 -= 0.015;
      }

      // Phase 5: show success briefly then reset
      if (phase === 5) {
        ctx.fillStyle = `rgba(163, 230, 53, ${Math.max(0, 0.2 - phaseTimer * 0.002)})`;
        ctx.font = 'bold 11px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Referral Complete ✓', w * 0.5, h * 0.65);
        if (phaseTimer > 100) { phase = 0; phaseTimer = 0; }
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
