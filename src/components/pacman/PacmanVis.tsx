import React, { useEffect, useRef, useState } from 'react';
import { GridCell, PacPos, TipoCelda } from '../../types/appTypes';

interface PacmanVisProps {
  grid: GridCell[][];
  onGridChange: (g: GridCell[][]) => void;
  path: PacPos[];
}

export function PacmanVis({ grid, onGridChange, path }: PacmanVisProps) {
  const rows = grid.length;
  const cols = grid[0].length;
  const [placing, setPlacing] = useState<TipoCelda | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(52);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const byW = Math.floor((width - 4) / cols);
      const byH = Math.floor((height - 4) / rows);
      setCellSize(Math.max(32, Math.min(byW, byH, 72)));
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [rows, cols]);

  const CELL = cellSize;
  const svgW = cols * CELL;
  const svgH = rows * CELL;

  const handleCellClick = (r: number, c: number) => {
    if (!placing) return;
    const g = grid.map((row) => row.map((cell) => ({ ...cell })));
    if (placing === 'start')
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++)
          if (g[i][j].type === 'start') g[i][j].type = 'path';
    if (placing === 'food')
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++)
          if (g[i][j].type === 'food') g[i][j].type = 'path';
    if (placing === 'wall' && g[r][c].type === 'wall') g[r][c].type = 'path';
    else g[r][c].type = placing;
    onGridChange(g);
  };

  const pathSet = new Set(path.map((p) => `${p.r},${p.c}`));
  const half = CELL / 2;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {(['start', 'food', 'wall'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setPlacing(placing === t ? null : t)}
            className="px-3 py-1.5 rounded mono text-xs font-medium transition-all"
            style={{
              background: placing === t ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
              border: `1px solid ${placing === t ? 'var(--color-accent-yellow)' : 'var(--color-border-subtle)'}`,
              color: placing === t ? 'var(--color-accent-yellow)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {t === 'start' ? '◉ Inicio (Pac-Man)' : t === 'food' ? '✦ Comida (objetivo)' : '▪ Pared (toggle)'}
          </button>
        ))}
        <span className="text-xs mono" style={{ color: 'var(--color-text-muted)' }}>
          {placing ? `modo: ${placing}` : 'clic para editar'}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{ minHeight: 0 }}
      >
        <svg
          width={svgW}
          height={svgH}
          style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="cellGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="pathGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="wallGrad" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#0f2050" />
              <stop offset="100%" stopColor="#050e28" />
            </radialGradient>
            <radialGradient id="exploredGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7a3010" />
              <stop offset="100%" stopColor="#3d1500" />
            </radialGradient>
          </defs>

          <rect x={0} y={0} width={svgW} height={svgH} fill="#080a0e" />

          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isOnPath = pathSet.has(`${r},${c}`);
              const cx2 = c * CELL;
              const cy2 = r * CELL;
              const isWall = cell.type === 'wall';
              const isFrontier = cell.heatState === 'frontier';
              const isExplored = cell.heatState === 'explored';

              return (
                <g
                  key={`${r},${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{ cursor: placing ? 'pointer' : 'default' }}
                >
                  {isWall ? (
                    <>
                      <rect x={cx2} y={cy2} width={CELL} height={CELL} fill="url(#wallGrad)" />
                      <rect x={cx2 + 1} y={cy2 + 1} width={CELL - 2} height={CELL - 2} rx={2} fill="none" stroke="#1a3570" strokeWidth={1} />
                      <line x1={cx2 + CELL / 2} y1={cy2 + 2} x2={cx2 + CELL / 2} y2={cy2 + CELL - 2} stroke="#0d1a40" strokeWidth={0.5} />
                      <line x1={cx2 + 2} y1={cy2 + CELL / 2} x2={cx2 + CELL - 2} y2={cy2 + CELL / 2} stroke="#0d1a40" strokeWidth={0.5} />
                      <rect x={cx2 + 2} y={cy2 + 2} width={4} height={4} rx={1} fill="#1a3060" opacity={0.6} />
                      <rect x={cx2 + CELL - 6} y={cy2 + 2} width={4} height={4} rx={1} fill="#1a3060" opacity={0.6} />
                      <rect x={cx2 + 2} y={cy2 + CELL - 6} width={4} height={4} rx={1} fill="#1a3060" opacity={0.6} />
                      <rect x={cx2 + CELL - 6} y={cy2 + CELL - 6} width={4} height={4} rx={1} fill="#1a3060" opacity={0.6} />
                    </>
                  ) : (
                    <>
                      <rect
                        x={cx2}
                        y={cy2}
                        width={CELL}
                        height={CELL}
                        fill={isExplored ? '#2a0e00' : isFrontier ? '#121210' : '#0c0e12'}
                      />
                      {!isOnPath && !isExplored && !isFrontier && (
                        <circle cx={cx2 + half} cy={cy2 + half} r={1.5} fill="#1a1f2a" />
                      )}
                      {isFrontier && (
                        <>
                          <rect
                            x={cx2 + 1}
                            y={cy2 + 1}
                            width={CELL - 2}
                            height={CELL - 2}
                            rx={3}
                            fill="none"
                            stroke="#f0c040"
                            strokeWidth={1.5}
                            opacity={0.7}
                          />
                          <rect
                            x={cx2 + 4}
                            y={cy2 + 4}
                            width={CELL - 8}
                            height={CELL - 8}
                            rx={2}
                            fill="rgba(240,192,64,0.06)"
                          />
                        </>
                      )}
                      {isExplored && (
                        <>
                          <rect
                            x={cx2 + 1}
                            y={cy2 + 1}
                            width={CELL - 2}
                            height={CELL - 2}
                            rx={2}
                            fill="url(#exploredGrad)"
                            opacity={0.6}
                          />
                          <circle
                            cx={cx2 + half}
                            cy={cy2 + half}
                            r={CELL * 0.22}
                            fill="#e06030"
                            opacity={0.5}
                          />
                        </>
                      )}
                      {isOnPath && cell.type === 'path' && (
                        <>
                          <rect
                            x={cx2 + 1}
                            y={cy2 + 1}
                            width={CELL - 2}
                            height={CELL - 2}
                            rx={2}
                            fill="rgba(57,255,126,0.06)"
                            stroke="rgba(57,255,126,0.5)"
                            strokeWidth={1}
                          />
                          <circle
                            cx={cx2 + half}
                            cy={cy2 + half}
                            r={CELL * 0.18}
                            fill="#39ff7e"
                            filter="url(#pathGlow)"
                          />
                        </>
                      )}
                    </>
                  )}

                  {cell.type === 'start' && (
                    <>
                      <rect
                        x={cx2 + 1}
                        y={cy2 + 1}
                        width={CELL - 2}
                        height={CELL - 2}
                        rx={3}
                        fill="rgba(74,144,217,0.1)"
                        stroke="#4a90d9"
                        strokeWidth={1.5}
                      />
                      <text
                        x={cx2 + half}
                        y={cy2 + half + CELL * 0.18}
                        textAnchor="middle"
                        fontSize={CELL * 0.5}
                        style={{ userSelect: 'none' }}
                      >
                        😮
                      </text>
                    </>
                  )}
                  {cell.type === 'food' && (
                    <>
                      <rect
                        x={cx2 + 1}
                        y={cy2 + 1}
                        width={CELL - 2}
                        height={CELL - 2}
                        rx={3}
                        fill="rgba(57,255,126,0.08)"
                        stroke="#39ff7e"
                        strokeWidth={1.5}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(57,255,126,0.4))' }}
                      />
                      <text
                        x={cx2 + half}
                        y={cy2 + half + CELL * 0.18}
                        textAnchor="middle"
                        fontSize={CELL * 0.48}
                        style={{ userSelect: 'none' }}
                      >
                        🍒
                      </text>
                    </>
                  )}

                  <rect
                    x={cx2}
                    y={cy2}
                    width={CELL}
                    height={CELL}
                    fill="none"
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth={0.5}
                  />
                </g>
              );
            })
          )}

          {path.length > 1 && (
            <polyline
              points={path.map((p) => `${p.c * CELL + half},${p.r * CELL + half}`).join(' ')}
              fill="none"
              stroke="#39ff7e"
              strokeWidth={Math.max(2, CELL * 0.07)}
              strokeDasharray="2000"
              strokeDashoffset="0"
              opacity={0.55}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                animation: 'path-draw 1.2s ease-out forwards',
                filter: 'drop-shadow(0 0 5px rgba(57,255,126,0.6))',
              }}
            />
          )}
        </svg>
      </div>

      <div className="flex gap-4 flex-wrap justify-center pb-1">
        {[
          { color: '#f0c040', label: 'Frontera', border: '#f0c04050' },
          { color: '#e06030', label: 'Explorado', border: 'transparent' },
          { color: '#39ff7e', label: 'Ruta Solución', border: 'transparent' },
          { color: '#0f2050', label: 'Pared', border: '#1a3570' },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: color, border: `1px solid ${border}` }}
            />
            <span
              className="mono text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
