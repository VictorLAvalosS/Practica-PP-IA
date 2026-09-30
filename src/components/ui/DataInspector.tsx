import React, { useEffect, useRef } from 'react';

interface DataInspectorProps {
  title: string;
  items: string[];
  accent: string;
}

export function DataInspector({ title, items, accent }: DataInspectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [items]);

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden flex-1"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        minHeight: 100,
      }}
    >
      <div
        className="px-3 py-1.5 flex items-center gap-2 flex-shrink-0"
        style={{
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-panel)',
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        <span className="mono text-xs font-semibold" style={{ color: accent }}>
          {title}
        </span>
        <span
          className="mono text-xs ml-auto px-1.5 py-0.5 rounded"
          style={{
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-muted)',
          }}
        >
          {items.length}
        </span>
      </div>
      <div ref={ref} className="flex-1 overflow-auto p-2 flex flex-col gap-0.5">
        {items.length === 0 ? (
          <span className="mono text-xs" style={{ color: 'var(--color-text-disabled)' }}>
            vacío
          </span>
        ) : (
          items.map((item, i) => (
            <div
              key={i}
              className="mono text-xs leading-5"
              style={{
                color: 'var(--color-text-secondary)',
                animation: 'slide-in 0.1s ease-out',
                animationFillMode: 'both',
              }}
            >
              <span style={{ color: 'var(--color-text-disabled)' }}>
                {String(i).padStart(3, '0')}{' '}
              </span>
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
