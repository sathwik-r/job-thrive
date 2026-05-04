import React from 'react';
import { motion } from 'framer-motion';

// #4 — Live Dashboard Preview
// Semi-transparent, slowly scrolling dashboard mockup in background

const MOCK_JOBS = [
  { title: 'Sr. Software Engineer', company: 'Google', fee: '499', status: 'Matched' },
  { title: 'Product Manager', company: 'Microsoft', fee: '499', status: 'Applied' },
  { title: 'Frontend Developer', company: 'Amazon', fee: '499', status: 'Referred' },
  { title: 'Data Scientist', company: 'Flipkart', fee: '499', status: 'Pending' },
  { title: 'DevOps Engineer', company: 'Swiggy', fee: '499', status: 'Matched' },
  { title: 'Backend Developer', company: 'Razorpay', fee: '499', status: 'Applied' },
  { title: 'ML Engineer', company: 'Adobe', fee: '499', status: 'Referred' },
  { title: 'iOS Developer', company: 'Atlassian', fee: '499', status: 'Matched' },
];

const NOTIFICATIONS = [
  { text: 'Priya got referred to Google', time: '2m ago', color: '#A3E635' },
  { text: 'Amit earned Rs.249 from referral', time: '5m ago', color: '#818CF8' },
  { text: 'New job: PM at Microsoft', time: '12m ago', color: '#FB923C' },
  { text: 'Sneha\'s referral was verified', time: '18m ago', color: '#A3E635' },
];

export default function BgLiveDashboard() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ opacity: 0.06 }}>
      {/* Scrolling job list */}
      <motion.div
        className="absolute right-[5%] top-[10%] w-[350px]"
        animate={{ y: [0, -200, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[...MOCK_JOBS, ...MOCK_JOBS].map((job, i) => (
          <div key={i} className="mb-3 rounded-xl p-4" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: '#F5F5F5' }}>{job.title}</p>
                <p className="text-xs" style={{ color: '#737373' }}>{job.company}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold" style={{ color: '#A3E635' }}>Rs.{job.fee}</p>
                <p className="text-[10px]" style={{ color: '#525252' }}>{job.status}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Notification feed */}
      <motion.div
        className="absolute left-[8%] top-[20%] w-[280px]"
        animate={{ y: [0, -100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {[...NOTIFICATIONS, ...NOTIFICATIONS].map((n, i) => (
          <div key={i} className="mb-2 rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: n.color }} />
            <p className="text-xs flex-1" style={{ color: '#D4D4D4' }}>{n.text}</p>
            <span className="text-[9px] shrink-0" style={{ color: '#525252' }}>{n.time}</span>
          </div>
        ))}
      </motion.div>

      {/* Stats cards */}
      <div className="absolute left-[10%] bottom-[15%] flex gap-3">
        {[
          { n: '500+', l: 'Referrals', c: '#A3E635' },
          { n: 'Rs.1.2L', l: 'Earned', c: '#818CF8' },
          { n: '94%', l: 'Success', c: '#FB923C' },
        ].map((s) => (
          <div key={s.l} className="rounded-xl p-4 text-center w-24" style={{ background: '#141414', border: '1px solid #1F1F1F' }}>
            <p className="text-lg font-black" style={{ color: s.c }}>{s.n}</p>
            <p className="text-[8px] uppercase tracking-widest" style={{ color: '#525252' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Gradient overlay to fade edges */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, #0C0C0C 70%)',
      }} />
    </div>
  );
}
