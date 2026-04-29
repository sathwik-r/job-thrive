import { Button } from '@/components/ui/button';
import { Search, Share2 } from 'lucide-react';
import React from 'react';

interface RoleToggleProps {
  currentRole: 'seeker' | 'referrer';
  onRoleChange: (role: 'seeker' | 'referrer') => void;
}

export default function RoleToggle({ currentRole, onRoleChange }: RoleToggleProps) {
  return (
    <div className="relative flex p-0.5 rounded-xl" style={{ background: '#1C1C1C' }}>
      {/* Sliding gradient pill */}
      <div
        className="absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-[10px] transition-all duration-300 ease-out"
        style={{
          left: currentRole === 'seeker' ? '2px' : 'calc(50%)',
          background: '#A3E635',
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRoleChange('seeker')}
        className={`relative z-10 px-4 py-1.5 rounded-[10px] text-xs font-bold transition-colors duration-200 hover:bg-transparent ${
          currentRole === 'seeker' ? 'text-[#0C0C0C]' : 'text-[#525252]'
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
          currentRole === 'referrer' ? 'text-[#0C0C0C]' : 'text-[#525252]'
        }`}
      >
        <Share2 className="w-3 h-3 mr-1.5" />
        Referrer
      </Button>
    </div>
  );
}
