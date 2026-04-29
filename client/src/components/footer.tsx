import React from 'react';
import Logo from './logo';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`py-6 ${className}`} style={{ borderTop: '1px solid #252336', background: '#0B0A10' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo size={20} showText={false} />
            <span className="text-xs" style={{ color: '#3F3D52' }}>
              &copy; {new Date().getFullYear()} jobthrive
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <a href="/terms" className="transition-colors" style={{ color: '#5C5A72' }}>Terms</a>
            <a href="/privacy" className="transition-colors" style={{ color: '#5C5A72' }}>Privacy</a>
            <a href="/refund" className="transition-colors" style={{ color: '#5C5A72' }}>Refund</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
