import React from 'react';
import { AlgorithmId, ALGO_OPTIONS } from '../../types/appTypes';

interface DropdownProps {
  label: string;
  value: AlgorithmId;
  onChange: (v: AlgorithmId) => void;
  options: typeof ALGO_OPTIONS;
}

export function Dropdown({ label, value, onChange, options }: DropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs mono" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AlgorithmId)}
        className="w-full rounded px-2 py-1.5 text-xs mono appearance-none cursor-pointer focus:outline-none"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-muted)',
          color: 'var(--color-text-primary)',
        }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
