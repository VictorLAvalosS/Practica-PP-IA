import React from 'react';
import { AlgoMetrics } from '../../types/appTypes';
import { Badge } from './Badge';

interface MetricsCardProps {
  metrics: AlgoMetrics;
  algoNum: 1 | 2;
}

export function MetricsCard({ metrics, algoNum }: MetricsCardProps) {
  const color = algoNum === 1 ? 'var(--color-accent-blue)' : 'var(--color-accent-purple)';
  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-3 flex-1"
      style={{
        background: 'var(--color-bg-surface)',
        border: `1px solid var(--color-border-subtle)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="mono text-xs font-semibold" style={{ color }}>
          ALG. {algoNum}
        </span>
        <span
          className="mono text-xs px-2 py-0.5 rounded"
          style={{
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {metrics.name}
        </span>
      </div>

      {!metrics.done ? (
        <div className="mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
          — en espera —
        </div>
      ) : (
        <>
          <div>
            <div className="mono text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              // RUTA SOLUCIÓN
            </div>
            <div
              className="rounded p-2 overflow-auto max-h-20"
              style={{
                background: 'var(--color-bg-base)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              {metrics.solution.length === 0 ? (
                <span className="mono text-xs" style={{ color: 'var(--color-accent-red)' }}>
                  Sin solución
                </span>
              ) : (
                metrics.solution.map((a, i) => (
                  <div
                    key={i}
                    className="mono text-xs leading-5"
                    style={{
                      color: 'var(--color-text-primary)',
                      animation: 'slide-in 0.15s ease-out',
                      animationDelay: `${i * 0.05}s`,
                      animationFillMode: 'both',
                    }}
                  >
                    <span style={{ color }}>{i + 1}.</span> {a}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'CP (Costo)', value: metrics.pathCost },
              { label: 'Nodos Gen.', value: metrics.nodesGenerated },
              { label: 'Nodos Exp.', value: metrics.nodesExpanded },
              { label: 'Profundidad', value: metrics.solution.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded p-2"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div
                  className="mono text-xs"
                  style={{ color: 'var(--color-text-muted)', fontSize: 10 }}
                >
                  {label}
                </div>
                <div className="mono text-sm font-semibold" style={{ color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge on={metrics.isOptimal} label="Óptima" />
            <Badge on={metrics.isComplete} label="Completa" />
          </div>
        </>
      )}
    </div>
  );
}
