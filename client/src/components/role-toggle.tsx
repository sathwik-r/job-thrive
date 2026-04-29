import { Button } from '@/components/ui/button';
import { Search, Share2 } from 'lucide-react';
import React from 'react';

interface RoleToggleProps {
  currentRole: 'seeker' | 'referrer';
  onRoleChange: (role: 'seeker' | 'referrer') => void;
}

export default function RoleToggle({ currentRole, onRoleChange }: RoleToggleProps) {
  return (
    <div className="relative flex p-0.5 rounded-xl" style={{ background: '#1A1828' }}>
      {/* Sliding gradient pill */}
      <div
        className="absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-[10px] transition-all duration-300 ease-out"
        style={{
          left: currentRole === 'seeker' ? '2px' : 'calc(50%)',
          background: 'linear-gradient(135deg, #6D5BF7, #1DB954)',
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRoleChange('seeker')}
        className={`relative z-10 px-4 py-1.5 rounded-[10px] text-xs font-bold transition-colors duration-200 hover:bg-transparent ${
          currentRole === 'seeker' ? 'text-white' : 'text-[#5C5A72]'
        }`}
      >
        <Search className="w-3 h-3 mr-1.5" />
        Seeker
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRoleChange('referrer')}
        className={`relative z-10 px-4 py-1.5 rounded-[10px] text-xs font-bold transition-colors duration-200 hover:bg-transparent ${
          currentRole === 'referrer' ? 'text-white' : 'text-[#5C5A72]'
        }`}
      >
        <Share2 className="w-3 h-3 mr-1.5" />
        Referrer
      </Button>
    </div>
  );
}
