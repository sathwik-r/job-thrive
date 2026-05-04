import React, { useEffect, useRef } from 'react';

// Combined: Shooting stars in background + three-point relay (seeker → platform → company → SUCCESS)

interface ShootingStar {
  x: number; y: number; speed: number; angle: number;
  trail: { x: number; y: number }[]; alive: boolean;
}

export default function BgStarRelay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);

    // ── Shooting stars layer ──
    const stars: ShootingStar[] = [];
    let starTimer = 0;

    const spawnStar = () => {
      stars.push({
        x: Math.random() * w * 0.4,
        y: h * 0.3 + Math.random() * h * 0.5,
        speed: 3 + Math.random() * 3,
        angle: -0.3 - Math.random() * 0.35,
        trail: [], alive: true,
      });
      if (stars.length > 5) stars.shift();
    };

    // ── Relay layer ──
    let phase = 0; // 0=idle, 1=seeker→platform, 2=glow, 3=platform→company, 4=company→success, 5=success burst, 6=hold
    let progress = 0;
    let phaseTimer = 0;
    let ring1Life = 0, ring2Life = 0, ring3Life = 0;
    let successBurst = 0;
    let successTextAlpha = 0;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // Relay anchor points
      const pts = {
        seeker: { x: w * 0.08, y: h * 0.55 },
        platform: { x: w * 0.38, y: h * 0.42 },
        company: { x: w * 0.68, y: h * 0.48 },
        success: { x: w * 0.92, y: h * 0.38 },
      };

      // ━━━ SHOOTING STARS (background layer) ━━━
      starTimer++;
      if (starTimer > 180 + Math.random() * 150) { spawnStar(); starTimer = 0; }

      stars.forEach(s => {
        if (!s.alive) return;
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 15) s.trail.shift();
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Trail
        s.trail.forEach((p, i) => {
          ctx.beginPath();
          ctx.fillStyle = `rgba(163, 230, 53, ${(i / s.trail.length) * 0.12})`;
          ctx.arc(p.x, p.y, 1.2 * (i / s.trail.length), 0, Math.PI * 2);
          ctx.fill();
        });
        // Head
        ctx.beginPath();
        ctx.fillStyle = 'rgba(163, 230, 53, 0.3)';
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();

        if (s.x > w * 1.1 || s.y < -20) s.alive = false;
      });

      // ━━━ RELAY ━━━

      // Faint connection path
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.015)';
      ctx.lineWidth = 1;
      ctx.moveTo(pts.seeker.x, pts.seeker.y);
      ctx.lineTo(pts.platform.x, pts.platform.y);
      ctx.lineTo(pts.company.x, pts.company.y);
      ctx.lineTo(pts.success.x, pts.success.y);
      ctx.stroke();

      // Anchor dots + labels
      const anchors = [
        { p: pts.seeker, label: 'Seeker', sub: 'Rs.499', color: '163,230,53', active: phase >= 1 },
        { p: pts.platform, label: 'Job Thrive', sub: 'Matching', color: '163,230,53', active: phase >= 2 },
        { p: pts.company, label: 'Referrer', sub: 'Submits', color: '129,140,248', active: phase >= 3 },
        { p: pts.success, label: 'SUCCESS', sub: '', color: '163,230,53', active: phase >= 5 },
      ];

      anchors.forEach(a => {
        // Glow
        const g = ctx.createRadialGradient(a.p.x, a.p.y, 0, a.p.x, a.p.y, a.active ? 30 : 18);
        g.addColorStop(0, `rgba(${a.color}, ${a.active ? 0.1 : 0.03})`);
        g.addColorStop(1, `rgba(${a.color}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(a.p.x, a.p.y, a.active ? 30 : 18, 0, Math.PI * 2); ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.fillStyle = `rgba(${a.color}, ${a.active ? 0.45 : 0.1})`;
        ctx.arc(a.p.x, a.p.y, a.active ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.font = '9px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255,255,255, ${a.active ? 0.12 : 0.03})`;
        ctx.fillText(a.label, a.p.x, a.p.y + 20);
        if (a.sub && a.active) {
          ctx.fillStyle = `rgba(${a.color}, 0.12)`;
          ctx.fillText(a.sub, a.p.x, a.p.y + 32);
        }
      });

      phaseTimer++;

      // Helper: draw beam from A to B
      const drawBeam = (from: {x:number;y:number}, to: {x:number;y:number}, p: number, color: string) => {
        const bx = from.x + (to.x - from.x) * p;
        const by = from.y + (to.y - from.y) * p;
        for (let i = 1; i <= 10; i++) {
          const tp = Math.max(0, p - i * 0.015);
          const tx = from.x + (to.x - from.x) * tp;
          const ty = from.y + (to.y - from.y) * tp;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${color}, ${0.35 * (1 - i / 10)})`;
          ctx.arc(tx, ty, 2.5 * (1 - i / 12), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, 0.85)`;
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
        const hg = ctx.createRadialGradient(bx, by, 0, bx, by, 16);
        hg.addColorStop(0, `rgba(${color}, 0.3)`);
        hg.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(bx, by, 16, 0, Math.PI * 2); ctx.fill();
      };

      // Phase 0: idle
      if (phase === 0 && phaseTimer > 100) { phase = 1; progress = 0; phaseTimer = 0; }

      // Phase 1: seeker → platform (lime)
      if (phase === 1) {
        progress += 0.014;
        drawBeam(pts.seeker, pts.platform, progress, '163,230,53');
        if (progress >= 1) { phase = 2; phaseTimer = 0; ring1Life = 1; }
      }

      // Phase 2: platform glow
      if (phase === 2 && phaseTimer > 30) { phase = 3; progress = 0; phaseTimer = 0; }

      // Phase 3: platform → company (violet)
      if (phase === 3) {
        progress += 0.014;
        drawBeam(pts.platform, pts.company, progress, '129,140,248');
        if (progress >= 1) { phase = 4; phaseTimer = 0; ring2Life = 1; progress = 0; }
      }

      // Phase 4: company → SUCCESS (lime, fast)
      if (phase === 4) {
        progress += 0.018;
        drawBeam(pts.company, pts.success, progress, '163,230,53');
        if (progress >= 1) { phase = 5; phaseTimer = 0; ring3Life = 1; successBurst = 1; successTextAlpha = 1; }
      }

      // Phase 5: success burst
      if (phase === 5 && phaseTimer > 120) { phase = 6; phaseTimer = 0; }

      // Phase 6: hold then reset
      if (phase === 6 && phaseTimer > 60) { phase = 0; phaseTimer = 0; }

      // Ring pulses
      const drawRing = (x: number, y: number, life: number, color: string) => {
        if (life <= 0) return;
        const r = (1 - life) * 45;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${color}, ${life * 0.35})`;
        ctx.lineWidth = 2 * life;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      };
      drawRing(pts.platform.x, pts.platform.y, ring1Life, '163,230,53');
      drawRing(pts.company.x, pts.company.y, ring2Life, '129,140,248');
      drawRing(pts.success.x, pts.success.y, ring3Life, '163,230,53');
      if (ring1Life > 0) ring1Life -= 0.018;
      if (ring2Life > 0) ring2Life -= 0.018;
      if (ring3Life > 0) ring3Life -= 0.015;

      // Success burst — expanding bright ring + inner glow
      if (successBurst > 0) {
        const sr = (1 - successBurst) * 60;
        const sg = ctx.createRadialGradient(pts.success.x, pts.success.y, 0, pts.success.x, pts.success.y, sr);
        sg.addColorStop(0, `rgba(163, 230, 53, ${successBurst * 0.15})`);
        sg.addColorStop(1, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(pts.success.x, pts.success.y, sr, 0, Math.PI * 2); ctx.fill();
        successBurst -= 0.012;
      }

      // Success text
      if (successTextAlpha > 0) {
        ctx.font = 'bold 11px Inter, system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(163, 230, 53, ${successTextAlpha * 0.3})`;
        ctx.fillText('✓ Referral Successful', pts.success.x, pts.success.y + 28);
        ctx.font = '9px Inter, system-ui';
        ctx.fillStyle = `rgba(129, 140, 248, ${successTextAlpha * 0.2})`;
        ctx.fillText('+Rs.249 earned', pts.success.x, pts.success.y + 42);
        successTextAlpha -= 0.004;
      }

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}
