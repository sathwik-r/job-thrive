import React, { useEffect, useRef } from 'react';

// #1 — Animated Connection Lines
// Network graph: seeker dots connect to referrer dots, money flows along lines

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'seeker' | 'referrer' | 'company';
  label: string;
  radius: number;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  active: boolean;
  startTime: number;
}

const COMPANIES = ['G', 'M', 'A', 'F', 'S', 'Ad', 'At', 'R'];

export default function BgConnectionLines() {
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

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', resize);

    // Create nodes
    const nodes: Node[] = [];
    // Seekers (left side)
    for (let i = 0; i < 6; i++) {
      nodes.push({
        x: Math.random() * w * 0.3 + w * 0.05,
        y: Math.random() * h * 0.6 + h * 0.2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        type: 'seeker',
        label: ['P', 'A', 'S', 'R', 'N', 'V'][i],
        radius: 4,
      });
    }
    // Companies (center-right)
    for (let i = 0; i < 8; i++) {
      nodes.push({
        x: Math.random() * w * 0.3 + w * 0.55,
        y: Math.random() * h * 0.6 + h * 0.2,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        type: 'company',
        label: COMPANIES[i],
        radius: 6,
      });
    }

    // Connections that animate
    const connections: Connection[] = [];
    let lastConnection = 0;

    const addConnection = (time: number) => {
      const seekerIdx = Math.floor(Math.random() * 6);
      const companyIdx = 6 + Math.floor(Math.random() * 8);
      connections.push({
        from: seekerIdx,
        to: companyIdx,
        progress: 0,
        active: true,
        startTime: time,
      });
      if (connections.length > 5) connections.shift();
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      // New connection every 2.5s
      if (time - lastConnection > 2500) {
        addConnection(time);
        lastConnection = time;
      }

      // Update nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        // Bounce
        if (n.type === 'seeker') {
          if (n.x < w * 0.03 || n.x > w * 0.35) n.vx *= -1;
        } else {
          if (n.x < w * 0.5 || n.x > w * 0.95) n.vx *= -1;
        }
        if (n.y < h * 0.15 || n.y > h * 0.85) n.vy *= -1;
      });

      // Draw faint lines between nearby nodes of same type
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[j].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw active connections
      connections.forEach((c) => {
        if (!c.active) return;
        const elapsed = time - c.startTime;
        c.progress = Math.min(elapsed / 1500, 1);

        const from = nodes[c.from];
        const to = nodes[c.to];
        const cx = from.x + (to.x - from.x) * c.progress;
        const cy = from.y + (to.y - from.y) * c.progress;

        // Line
        ctx.beginPath();
        ctx.strokeStyle = `rgba(163, 230, 53, ${0.15 * (1 - c.progress * 0.5)})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Moving dot
        ctx.beginPath();
        ctx.fillStyle = '#A3E635';
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.beginPath();
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
        grd.addColorStop(0, 'rgba(163, 230, 53, 0.3)');
        grd.addColorStop(1, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = grd;
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();

        if (c.progress >= 1) {
          c.active = false;
        }
      });

      // Draw nodes
      nodes.forEach((n) => {
        // Glow
        ctx.beginPath();
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 4);
        grd.addColorStop(0, n.type === 'seeker' ? 'rgba(163, 230, 53, 0.08)' : 'rgba(129, 140, 248, 0.08)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.arc(n.x, n.y, n.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.fillStyle = n.type === 'seeker' ? 'rgba(163, 230, 53, 0.4)' : 'rgba(129, 140, 248, 0.4)';
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.8 }} />;
}
