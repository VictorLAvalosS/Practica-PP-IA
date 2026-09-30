import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className="text-xs mono font-semibold tracking-widest uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {children}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: 'var(--color-border-subtle)' }}
      />
    </div>
  );
}
