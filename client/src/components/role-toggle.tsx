import { Button } from '@/components/ui/button';
import React from 'react';

interface RoleToggleProps {
  currentRole: 'seeker' | 'referrer';
  onRoleChange: (role: 'seeker' | 'referrer') => void;
}

export default function RoleToggle({ currentRole, onRoleChange }: RoleToggleProps) {
  return (
    <div className="bg-gray-100 rounded-2xl p-1 role-toggle">
      <div className="flex">
        <Button
          variant={currentRole === 'seeker' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onRoleChange('seeker')}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            currentRole === 'seeker'
              ? 'bg-[var(--purple-primary)] text-white hover:bg-[var(--purple-primary)]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Seeker
        </Button>
        <Button
          variant={currentRole === 'referrer' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onRoleChange('referrer')}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
            currentRole === 'referrer'
              ? 'bg-[var(--purple-primary)] text-white hover:bg-[var(--purple-primary)]'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Referrer
        </Button>
      </div>
    </div>
  );
}
