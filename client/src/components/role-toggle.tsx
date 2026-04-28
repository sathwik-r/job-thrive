import { Button } from '@/components/ui/button';
import { Search, Share2 } from 'lucide-react';
import React from 'react';

interface RoleToggleProps {
  currentRole: 'seeker' | 'referrer';
  onRoleChange: (role: 'seeker' | 'referrer') => void;
}

export default function RoleToggle({ currentRole, onRoleChange }: RoleToggleProps) {
  return (
    <div className="relative bg-gray-100/80 rounded-xl p-0.5 flex">
      {/* Sliding pill indicator */}
      <div
        className="absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-[10px] bg-[var(--purple-primary)] shadow-sm transition-all duration-300 ease-out"
        style={{ left: currentRole === 'seeker' ? '2px' : 'calc(50% + 0px)' }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRoleChange('seeker')}
        className={`relative z-10 px-4 py-1.5 rounded-[10px] text-xs font-semibold transition-colors duration-200 hover:bg-transparent ${
          currentRole === 'seeker' ? 'text-white' : 'text-gray-500'
        }`}
      >
        <Search className="w-3 h-3 mr-1.5" />
        Seeker
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRoleChange('referrer')}
        className={`relative z-10 px-4 py-1.5 rounded-[10px] text-xs font-semibold transition-colors duration-200 hover:bg-transparent ${
          currentRole === 'referrer' ? 'text-white' : 'text-gray-500'
        }`}
      >
        <Share2 className="w-3 h-3 mr-1.5" />
        Referrer
      </Button>
    </div>
  );
}
