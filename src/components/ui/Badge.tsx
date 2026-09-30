import React from 'react';

interface BadgeProps {
  on: boolean;
  label: string;
}

export function Badge({ on, label }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs mono font-medium"
      style={{
        background: on ? 'var(--color-accent-green-glow)' : 'var(--color-accent-red-glow)',
        border: `1px solid ${on ? 'var(--color-accent-green-dim)' : 'var(--color-accent-red-dim)'}`,
        color: on ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: on ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
          animation: on ? 'blink 1.5s ease-in-out infinite' : 'none',
        }}
      />
      {label}: {on ? 'SÍ' : 'NO'}
    </span>
  );
}
