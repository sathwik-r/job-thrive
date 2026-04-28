import React from 'react';
import Logo from './logo';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`border-t border-gray-100 py-6 bg-white ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo size={24} showText={false} />
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} JobThrive. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/refund" className="text-muted-foreground hover:text-foreground transition-colors">
              Refund
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
