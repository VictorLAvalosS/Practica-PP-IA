import React, { useState, useMemo } from 'react';
import { MCState, TreeNode } from '../../types/appTypes';
import { RiverSVG } from './RiverSVG';

export interface Viajeros {
  m: number;
  c: number;
}

export function layoutTree(nodes: TreeNode[]): TreeNode[] {
  const byDepth = new Map<number, TreeNode[]>();
  for (const n of nodes) {
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth)!.push(n);
  }
  const SLOT_W = 70;
  const LEVEL_H = 80;
  const result = nodes.map((n) => ({ ...n }));
  byDepth.forEach((level, depth) => {
    const total = level.length;
    level.forEach((n, i) => {
      const r = result.find((x) => x.id === n.id)!;
      r.x = (i - (total - 1) / 2) * SLOT_W;
      r.y = depth * LEVEL_H;
    });
  });
  return result;
}

function mcIsGoal(s: MCState) {
  return s.mLeft === 0 && s.cLeft === 0 && s.boat === 'right';
}

interface MCVisProps {
  currentState: MCState;
  treeNodes1: TreeNode[];
  treeNodes2: TreeNode[];
  nombreAlgo1: string;
  nombreAlgo2: string;
  showTree: boolean;
  viajeros?: Viajeros;
  totalM: number;
  totalC: number;
  capBote: number;
}

function renderArbolSVG(laidOut: TreeNode[]) {
  const xs = laidOut.map(n => n.x ?? 0);
  const ys = laidOut.map(n => n.y ?? 0);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 0);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 0);
  const MARGIN = 40;
  const vbX = minX - MARGIN;
  const vbY = minY - MARGIN;
  const vbW = (maxX - minX) + MARGIN * 2 + 80;
  const vbH = (maxY - minY) + MARGIN * 2 + 80;
  const svgW = Math.max(600, vbW);
  const svgH = Math.max(200, vbH);
  const ox = -vbX;
  const oy = -vbY;

  const edges = laidOut
    .filter(n => n.parent)
    .flatMap(n => {
      const parent = laidOut.find(p => p.id === n.parent);
      if (!parent) return [];
      return [{
        key: `e-${n.id}`,
        x1: (parent.x ?? 0) + ox,
        y1: (parent.y ?? 0) + oy + 24,
        x2: (n.x ?? 0) + ox,
        y2: (n.y ?? 0) + oy + 24,
        pruned: n.pruned,
      }];
    });

  const nodeNodes = laidOut.map(n => {
    const nx = (n.x ?? 0) + ox;
    const ny = (n.y ?? 0) + oy + 24;
    const isGoal = mcIsGoal(n.state);
    return { node: n, nx, ny, isGoal };
  });

  return {
    svgW, svgH, vbX, vbY, vbW, vbH, ox, oy,
    edges, nodeNodes,
  };
}

interface TreeViewProps {
  laidOut: TreeNode[];
  compact?: boolean;
}

function TreeView({ laidOut, compact = false }: TreeViewProps) {
  const a = useMemo(() => renderArbolSVG(laidOut), [laidOut]);

  return (
    <svg
      width={compact ? '100%' : a.svgW}
      height={compact ? '100%' : a.svgH}
      viewBox={`${a.vbX} ${a.vbY} ${a.vbW} ${a.vbH}`}
      preserveAspectRatio="xMidYMin meet"
      className="block"
      style={{ minHeight: compact ? 300 : undefined }}
    >
      {a.edges.map(e => (
        <line
          key={e.key}
          x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
          stroke={e.pruned ? '#ff4545aa' : '#2f4055'}
          strokeWidth={e.pruned ? 0.8 : 1.2}
          strokeDasharray={e.pruned ? '4,3' : undefined}
        />
      ))}
      {a.nodeNodes.map(({ node, nx, ny, isGoal }) => (
        <g key={node.id} style={{ animation: 'node-expand 0.2s ease-out' }}>
          <circle
            cx={nx} cy={ny} r={20}
            fill={
              node.pruned ? 'rgba(255,69,69,0.15)' :
              isGoal ? 'rgba(57,255,126,0.16)' : '#1b2030'
            }
            stroke={
              node.pruned ? '#ff4545' :
              isGoal ? '#39ff7e' : '#3c4558'
            }
            strokeWidth={node.pruned ? 1.5 : isGoal ? 1.8 : 1.2}
          />
          {isGoal && (
            <circle cx={nx} cy={ny} r={25} fill="none" stroke="rgba(57,255,126,0.4)" strokeWidth={1} />
          )}
          {node.pruned && (
            <text x={nx} y={ny + 2} textAnchor="middle" fill="rgba(255,69,69,0.25)" fontSize={26}
              fontFamily="monospace" fontWeight="800">✕</text>
          )}
          <text x={nx} y={ny - 1} textAnchor="middle"
            fill={node.pruned ? '#ff8080' : isGoal ? '#39ff7e' : '#aab5c8'}
            fontSize={9} fontFamily="JetBrains Mono,monospace" fontWeight="700">
            {node.state.mLeft}M {node.state.cLeft}C
          </text>
          <text x={nx} y={ny + 11} textAnchor="middle"
            fill={node.pruned ? '#ff4545' : isGoal ? '#39ff7e' : '#808fa8'}
            fontSize={7.5} fontFamily="JetBrains Mono,monospace" fontWeight={node.pruned ? "800" : "normal"}>
            ⛵{node.state.boat === 'left' ? 'L' : 'R'} {node.pruned ? '✕' : `d${node.depth}`}
          </text>
          {isGoal && (
            <text x={nx} y={ny - 28} textAnchor="middle" fill="#39ff7e"
              fontSize={10} fontFamily="JetBrains Mono,monospace" fontWeight="800">★ META</text>
          )}
          {node.pruned && node.pruneReason && <title>{node.pruneReason}</title>}
        </g>
      ))}
    </svg>
  );
}

function TreePanel({ laidOut, titulo, onExpand, isExpanded }: { laidOut: TreeNode[]; titulo: string; onExpand?: () => void; isExpanded?: boolean }) {
  const totalNodos = laidOut.length;
  const generados = laidOut.filter(n => !n.pruned).length;
  const podados = laidOut.filter(n => n.pruned).length;
  const maxDepth = Math.max(0, ...laidOut.map(n => n.depth));

  return (
    <div
      className="flex-1 overflow-auto rounded-lg flex flex-col"
      style={{
        background: isExpanded ? 'transparent' : 'var(--color-bg-surface)',
        border: isExpanded ? 'none' : '1px solid var(--color-border-subtle)',
        minHeight: 250,
      }}
    >
      <div
        className="px-3 py-2 mono text-xs flex items-center gap-3 flex-shrink-0"
        style={{
          color: 'var(--color-text-muted)',
          borderBottom: isExpanded ? 'none' : '1px solid var(--color-border-subtle)',
          background: isExpanded ? 'transparent' : 'var(--color-bg-panel)',
          position: 'sticky', top: 0, zIndex: 2,
        }}
      >
        <span className={isExpanded ? "font-bold text-sm" : ""} style={{ color: isExpanded ? 'var(--color-accent-green)' : 'var(--color-text-primary)' }}>{isExpanded ? '🌳 ' : '// '}{titulo} — {totalNodos} nodos</span>
        <span
          className="px-1.5 py-0.5 rounded"
          style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-accent-blue)' }}
        >
          ✓ {generados} válidos
        </span>
        <span
          className="px-1.5 py-0.5 rounded"
          style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-accent-red)' }}
        >
          ✕ {podados} podados
        </span>
        {isExpanded && (
          <span className="px-2 py-0.5 rounded" style={{ background: 'var(--color-bg-elevated)' }}>
            Nivel: {maxDepth}
          </span>
        )}
        {!isExpanded && onExpand && (
          <div className="ml-auto">
            <button
              onClick={onExpand}
              className="px-2 py-1 rounded mono text-xs font-semibold transition-all flex items-center gap-1"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-accent-green-dim)',
                color: 'var(--color-accent-green)',
                cursor: 'pointer',
              }}
              title="Expandir a pantalla completa"
            >
              <span>⛶</span> Expandir
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 p-3 overflow-auto">
        {laidOut.length === 0 ? (
          <div className="mono text-xs text-center py-12"
            style={{ color: 'var(--color-text-disabled)' }}>
            Pulsa ▶ Play para generar el árbol
          </div>
        ) : (
          <TreeView laidOut={laidOut} compact={!isExpanded} />
        )}
      </div>
    </div>
  );
}

export function MCVis({ currentState, treeNodes1, treeNodes2, nombreAlgo1, nombreAlgo2, showTree, viajeros, totalM, totalC, capBote }: MCVisProps) {
  const laidOut1 = useMemo(() => layoutTree(treeNodes1), [treeNodes1]);
  const laidOut2 = useMemo(() => layoutTree(treeNodes2), [treeNodes2]);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div
        className="relative rounded-xl overflow-hidden flex-shrink-0"
        style={{ background: '#0a1520', border: '1px solid #1a3060', minHeight: 360 }}
      >
        <RiverSVG currentState={currentState} viajeros={viajeros} totalM={totalM} totalC={totalC} capBote={capBote} />
      </div>

      {showTree && (
        <div className="flex flex-row gap-4 flex-1 min-h-[250px]">
          <TreePanel 
            laidOut={laidOut1} 
            titulo={`ÁRBOL ALG. 1 (${nombreAlgo1})`} 
            onExpand={() => setExpanded(true)} 
          />
          <TreePanel 
            laidOut={laidOut2} 
            titulo={`ÁRBOL ALG. 2 (${nombreAlgo2})`} 
            onExpand={() => setExpanded(true)} 
          />
        </div>
      )}

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
          onClick={() => setExpanded(false)}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
            style={{
              background: 'var(--color-bg-panel)',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="ml-auto flex gap-2 items-center">
              <span className="mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Haz clic fuera para cerrar
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="px-3 py-1 rounded mono text-xs font-semibold"
                style={{
                  background: 'var(--color-accent-red-glow)',
                  border: '1px solid var(--color-accent-red-dim)',
                  color: 'var(--color-accent-red)',
                  cursor: 'pointer',
                }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
          <div
            className="flex-1 overflow-hidden flex flex-row gap-6 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1 flex flex-col bg-[#13151a] rounded-lg border border-[#363b47]">
              <TreePanel laidOut={laidOut1} titulo={`ALG. 1 (${nombreAlgo1})`} isExpanded />
            </div>
            <div className="flex-1 flex flex-col bg-[#13151a] rounded-lg border border-[#363b47]">
              <TreePanel laidOut={laidOut2} titulo={`ALG. 2 (${nombreAlgo2})`} isExpanded />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
