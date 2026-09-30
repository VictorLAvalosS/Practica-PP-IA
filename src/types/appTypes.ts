export type Module = 'mc' | 'pacman';
export type AlgorithmId = 'bfs' | 'dfs' | 'ucs' | 'astar' | 'greedy';
export type SimState = 'idle' | 'running' | 'paused' | 'done';

export type Orilla = 'left' | 'right';

export interface MCState {
  mLeft: number;
  cLeft: number;
  boat: Orilla;
  mRight: number;
  cRight: number;
}

export interface TreeNode {
  id: string;
  state: MCState;
  parent: string | null;
  depth: number;
  action: string;
  pruned: boolean;
  pruneReason?: string;
  x?: number;
  y?: number;
}

export type TipoCelda = 'wall' | 'path' | 'start' | 'food';

export interface GridCell {
  type: TipoCelda;
  heatState: 'none' | 'frontier' | 'explored';
  pathStep?: number;
}

export interface AlgoMetrics {
  id: AlgorithmId;
  name: string;
  solution: string[];
  pathCost: number;
  nodesGenerated: number;
  nodesExpanded: number;
  isOptimal: boolean;
  isComplete: boolean;
  done: boolean;
}

export interface PacPos {
  r: number;
  c: number;
}

export const ALGO_OPTIONS: { id: AlgorithmId; label: string }[] = [
  { id: 'bfs', label: 'Búsqueda en Anchura (BFS)' },
  { id: 'dfs', label: 'Búsqueda en Profundidad (DFS)' },
  { id: 'ucs', label: 'Costo Uniforme (UCS)' },
  { id: 'astar', label: 'Búsqueda A*' },
  { id: 'greedy', label: 'Búsqueda Codiciosa' },
];

export const ALGO_META: Record<AlgorithmId, { isOptimal: boolean; isComplete: boolean }> = {
  bfs:    { isOptimal: true,  isComplete: true },
  dfs:    { isOptimal: false, isComplete: false },
  ucs:    { isOptimal: true,  isComplete: true },
  astar:  { isOptimal: true,  isComplete: true },
  greedy: { isOptimal: false, isComplete: true },
};
