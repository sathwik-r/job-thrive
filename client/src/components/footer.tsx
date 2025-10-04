import React from 'react';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`bg-gray-50 border-t border-gray-200 py-6 ${className}`}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © 2025 JobThrive. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a 
              href="/terms.html" 
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Terms & Conditions
            </a>
            <a 
              href="/privacy.html" 
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Privacy Policy
            </a>
            <a 
              href="/refund.html" 
              className="text-gray-600 hover:text-gray-900 underline"
            >
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
