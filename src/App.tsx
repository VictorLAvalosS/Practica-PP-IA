import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MCProblema, MCEstado, MCAccion,
  PacmanProblema, PacmanEstado, PacmanAccion,
  ejecutarAlgoritmo, AlgoritmoId as AlgoId,
  Nodo, ResultadoBusqueda,
} from './search';
import {
  MCState, TreeNode, GridCell, PacPos,
  AlgoMetrics, AlgorithmId, Module, SimState,
  ALGO_OPTIONS, ALGO_META,
} from './types/appTypes';
import { SectionLabel } from './components/ui/SectionLabel';
import { Dropdown } from './components/ui/Dropdown';
import { MetricsCard } from './components/ui/MetricsCard';
import { DataInspector } from './components/ui/DataInspector';
import { MCVis, type Viajeros } from './components/mc/MCVis';
import { PacmanVis } from './components/pacman/PacmanVis';

const RE_ACCION_MC = /Mover\((\d+)M,(\d+)C→(Der|Izq)\)/;

export function parsearAccionMC(accionNombre: string): Viajeros {
  const match = accionNombre.match(RE_ACCION_MC);
  if (!match) return { m: 0, c: 0 };
  return {
    m: parseInt(match[1], 10) || 0,
    c: parseInt(match[2], 10) || 0,
  };
}

function buscarPadreId(padre: Nodo<MCEstado, MCAccion>, idMap: Map<string, string>): string | null {
  for (const [clave, id] of idMap.entries()) {
    if (clave.split('|')[0] === padre.estado.clave()) return id;
  }
  return null;
}

function convertirNodoMC(
  nodo: Nodo<MCEstado, MCAccion>, idMap: Map<string, string>,
  idCounter: { value: number }, pruned = false, pruneReason?: string,
): TreeNode {
  const clave = `${nodo.estado.clave()}|${idCounter.value}`;
  const id = `n${idCounter.value++}`;
  idMap.set(clave, id);
  return {
    id,
    state: nodo.estado.aRaw(),
    parent: nodo.padre ? buscarPadreId(nodo.padre, idMap) : null,
    depth: nodo.profundidad,
    action: nodo.accion ? nodo.accion.nombre : 'Inicio',
    pruned, pruneReason,
  };
}

function construirArbolMC(resultado: ResultadoBusqueda<MCEstado, MCAccion>): TreeNode[] {
  const nodos: TreeNode[] = [];
  const idMap = new Map<string, string>();
  const idCounter = { value: 0 };
  if (resultado.nodosGenerados[0]) {
    nodos.push(convertirNodoMC(resultado.nodosGenerados[0], idMap, idCounter, false));
  }
  const expandidosClaves = new Set(resultado.nodosExpandidos.map(n => n.estado.clave()));
  for (let i = 1; i < resultado.nodosGenerados.length; i++) {
    const nodo = resultado.nodosGenerados[i];
    const ec = nodo.estado.clave();
    let esPodado = false; let razon: string | undefined;
    for (const pod of resultado.nodosPodados) {
      if (pod.nodo.estado.clave() === ec) { esPodado = true; razon = pod.razon; break; }
    }
    if (!esPodado && !expandidosClaves.has(ec)) {
      for (let j = 0; j < i; j++) {
        if (resultado.nodosGenerados[j].estado.clave() === ec) {
          esPodado = true; razon = 'Estado repetido (frontera)'; break;
        }
      }
    }
    nodos.push(convertirNodoMC(nodo, idMap, idCounter, esPodado, razon));
  }
  for (const pod of resultado.nodosPodados) {
    const ya = nodos.some(n => n.state.mLeft === pod.nodo.estado.mLeft &&
      n.state.cLeft === pod.nodo.estado.cLeft && n.state.boat === pod.nodo.estado.boat);
    if (!ya) nodos.push(convertirNodoMC(pod.nodo, idMap, idCounter, true, pod.razon));
  }
  return nodos;
}

interface SolveMCOut {
  nodes: TreeNode[]; solution: string[];
  result: ResultadoBusqueda<MCEstado, MCAccion>;
}

function solveMC(algoId: AlgorithmId, m: number, c: number, b: number): SolveMCOut {
  const problema = new MCProblema(m, c, b);
  const resultado = ejecutarAlgoritmo(algoId as AlgoId, problema);
  return {
    nodes: construirArbolMC(resultado),
    solution: resultado.caminoSolucion.map(a => a.nombre),
    result: resultado,
  };
}

const DEFAULT_GRID_SIZE = 8;
function makeDefaultGrid(): GridCell[][] {
  const g: GridCell[][] = Array.from({ length: DEFAULT_GRID_SIZE }, () =>
    Array.from({ length: DEFAULT_GRID_SIZE }, () =>
      ({ type: 'path', heatState: 'none' } as GridCell),
    ),
  );
  const walls: [number, number][] = [[1,1],[1,2],[1,3],[2,5],[3,2],[3,3],[4,1],[4,5],[5,3],[5,4],[6,2],[6,5],[2,2]];
  for (const [r, c] of walls) g[r][c].type = 'wall';
  g[0][0].type = 'start';
  g[7][7].type = 'food';
  return g;
}

interface SolvePacOut {
  exploredOrder: PacPos[]; frontierOrder: PacPos[]; path: PacPos[];
  result: ResultadoBusqueda<PacmanEstado, PacmanAccion>;
}

function solvePacman(grid: GridCell[][], algoId: AlgorithmId): SolvePacOut {
  const problema = new PacmanProblema(grid);
  const resultado = ejecutarAlgoritmo(algoId as AlgoId, problema);
  const exploredOrder = resultado.exploradosTraza.map(e => e.aPosicion());
  const frontierOrder: PacPos[] = [];
  const vistos = new Set(resultado.exploradosTraza.map(e => e.clave()));
  for (const f of resultado.fronteraTraza) if (!vistos.has(f.clave())) frontierOrder.push(f.aPosicion());
  return { exploredOrder, frontierOrder, path: resultado.estadosSolucion.map(e => e.aPosicion()), result: resultado };
}

export default function App() {
  const [module, setModule] = useState<Module>('mc');
  const [algo1, setAlgo1] = useState<AlgorithmId>('bfs');
  const [algo2, setAlgo2] = useState<AlgorithmId>('astar');
  const [simState, setSimState] = useState<SimState>('idle');
  const [showTree, setShowTree] = useState(true);
  const [totalM, setTotalM] = useState(3);
  const [totalC, setTotalC] = useState(3);
  const [capBote, setCapBote] = useState(2);
  const [mcState, setMcState] = useState<MCState>({ mLeft:3, cLeft:3, boat:'left', mRight:0, cRight:0 });
  const [mcNodes1, setMcNodes1] = useState<TreeNode[]>([]);
  const [mcNodes2, setMcNodes2] = useState<TreeNode[]>([]);
  const [mcStep, setMcStep] = useState(0);
  const [solutionPath, setSolutionPath] = useState<string[]>([]);
  const [grid, setGrid] = useState<GridCell[][]>(makeDefaultGrid());
  const [pacPath, setPacPath] = useState<PacPos[]>([]);
  const [, setPacStep] = useState(0);
  const [, setPacExplored] = useState<PacPos[]>([]);
  const [, setPacFrontier] = useState<PacPos[]>([]);
  const [frontierItems, setFrontierItems] = useState<string[]>([]);
  const [exploredItems, setExploredItems] = useState<string[]>([]);
  const [viajerosActuales, setViajerosActuales] = useState<Viajeros>({ m: 0, c: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nombreAlgo = (a: AlgorithmId) => ALGO_OPTIONS.find(o => o.id === a)!.label;
  const emptyMetrics = (a: AlgorithmId): AlgoMetrics => ({
    id: a, name: nombreAlgo(a), solution: [], pathCost: 0,
    nodesGenerated: 0, nodesExpanded: 0, isOptimal: false, isComplete: false, done: false,
  });
  const [metrics1, setMetrics1] = useState<AlgoMetrics>(emptyMetrics(algo1));
  const [metrics2, setMetrics2] = useState<AlgoMetrics>(emptyMetrics(algo2));

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimState('idle');
    setMcState({ mLeft:totalM, cLeft:totalC, boat:'left', mRight:0, cRight:0 });
    setMcNodes1([]); setMcNodes2([]); setMcStep(0); setSolutionPath([]);
    setPacPath([]); setPacStep(0); setPacExplored([]); setPacFrontier([]);
    setFrontierItems([]); setExploredItems([]);
    setViajerosActuales({ m: 0, c: 0 });
    setGrid(g => g.map(r => r.map(c => ({ ...c, heatState: 'none', pathStep: undefined }))));
    setMetrics1(m => ({ ...emptyMetrics(m.id), done: false }));
    setMetrics2(m => ({ ...emptyMetrics(m.id), done: false }));
  }, [totalM, totalC]);

  const runFull = useCallback(() => {
    reset();
    setSimState('running');
    if (module === 'mc') {
      const r1 = solveMC(algo1, totalM, totalC, capBote);
      const r2 = solveMC(algo2, totalM, totalC, capBote);
      setSolutionPath(r1.solution);
      const raw = r1.result.estadosSolucion.map(e => e.aRaw());
      const states: MCState[] = raw.length ? raw : [{ mLeft:totalM, cLeft:totalC, boat:'left', mRight:0, cRight:0 }];
      const f = r1.result.fronteraTraza.map(e =>
        `[${e.mLeft},${e.cLeft},${e.boat==='left'?'L':'R'}] h=${r1.result.nodoMeta ? Math.ceil((e.mLeft+e.cLeft)/2) : 0}`);
      const x = r1.result.nodosPodados.map(p =>
        `[${p.nodo.estado.mLeft},${p.nodo.estado.cLeft},${p.nodo.estado.boat==='left'?'L':'R'}] — ${p.razon}`);
      for (const e of r1.result.exploradosTraza) f.push(`[${e.mLeft},${e.cLeft},${e.boat==='left'?'L':'R'}] ✓`);
      setFrontierItems(f); setExploredItems(x);
      setMetrics1({
        id: algo1, name: nombreAlgo(algo1), solution: r1.solution,
        pathCost: r1.result.nodoMeta?.costoAcumulado ?? 0,
        nodesGenerated: r1.result.nodosGenerados.length,
        nodesExpanded: r1.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo1].isOptimal, isComplete: ALGO_META[algo1].isComplete, done: true,
      });
      setMetrics2({
        id: algo2, name: nombreAlgo(algo2), solution: r2.solution,
        pathCost: r2.result.nodoMeta?.costoAcumulado ?? 0,
        nodesGenerated: r2.result.nodosGenerados.length,
        nodesExpanded: r2.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo2].isOptimal, isComplete: ALGO_META[algo2].isComplete, done: true,
      });
      const animFrames: { state: MCState, v: Viajeros, boat: 'left' | 'right' }[] = [];
      animFrames.push({ state: states[0], v: {m:0, c:0}, boat: states[0].boat });
      for (let i = 0; i < r1.solution.length; i++) {
        const v = parsearAccionMC(r1.solution[i]);
        animFrames.push({ state: states[i], v, boat: states[i].boat });
        animFrames.push({ state: states[i+1], v, boat: states[i+1].boat });
        animFrames.push({ state: states[i+1], v: {m:0, c:0}, boat: states[i+1].boat });
      }

      let s = 0;
      intervalRef.current = setInterval(() => {
        if (s < animFrames.length) {
          const frame = animFrames[s];
          setViajerosActuales(frame.v);
          setMcState({ ...frame.state, boat: frame.boat });

          const fraction = Math.min(1, (s + 1) / animFrames.length);
          const nodesToShow1 = Math.max(1, Math.floor(r1.nodes.length * fraction));
          const nodesToShow2 = Math.max(1, Math.floor(r2.nodes.length * fraction));
          setMcNodes1(r1.nodes.slice(0, nodesToShow1));
          setMcNodes2(r2.nodes.slice(0, nodesToShow2));

          s++;
        } else {
          setViajerosActuales({ m: 0, c: 0 });
          setMcNodes1(r1.nodes);
          setMcNodes2(r2.nodes);
          clearInterval(intervalRef.current!);
          setSimState('done');
        }
      }, 700);
    } else {
      const r1 = solvePacman(grid, algo1);
      const r2 = solvePacman(grid, algo2);
      setPacPath(r1.path);
      const sol1 = r1.result.caminoSolucion.map((a, i) =>
        i === 0 ? `Inicio(${r1.path[0].r},${r1.path[0].c})` : a.nombre);
      const sol2 = r2.result.caminoSolucion.map((a, i) =>
        i === 0 ? `Inicio(${r2.path[0].r},${r2.path[0].c})` : a.nombre);
      setMetrics1({
        id: algo1, name: nombreAlgo(algo1), solution: sol1,
        pathCost: r1.result.nodoMeta?.costoAcumulado ?? 0,
        nodesGenerated: r1.result.nodosGenerados.length,
        nodesExpanded: r1.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo1].isOptimal, isComplete: ALGO_META[algo1].isComplete, done: true,
      });
      setMetrics2({
        id: algo2, name: nombreAlgo(algo2), solution: sol2,
        pathCost: r2.result.nodoMeta?.costoAcumulado ?? 0,
        nodesGenerated: r2.result.nodosGenerados.length,
        nodesExpanded: r2.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo2].isOptimal, isComplete: ALGO_META[algo2].isComplete, done: true,
      });
      const steps = [...r1.exploredOrder.map(p => ({ p, type: 'explored' as const })),
                     ...r1.frontierOrder.map(p => ({ p, type: 'frontier' as const }))];
      let s = 0; const fQ: string[] = []; const xQ: string[] = [];
      intervalRef.current = setInterval(() => {
        if (s < steps.length) {
          const { p, type } = steps[s];
          setGrid(g => {
            const ng = g.map(r => r.map(c => ({ ...c })));
            if (ng[p.r][p.c].type !== 'start' && ng[p.r][p.c].type !== 'food')
              ng[p.r][p.c].heatState = type;
            return ng;
          });
          if (type === 'frontier') fQ.push(`(${p.r},${p.c})`);
          if (type === 'explored') xQ.push(`(${p.r},${p.c})`);
          setFrontierItems([...fQ]); setExploredItems([...xQ]);
          s++;
        } else { clearInterval(intervalRef.current!); setSimState('done'); }
      }, 80);
    }
  }, [module, algo1, algo2, grid, reset]);

  const stepForward = useCallback(() => {
    if (module !== 'mc') return;
    const r1 = solveMC(algo1, totalM, totalC, capBote);
    const r2 = solveMC(algo2, totalM, totalC, capBote);
    const states = r1.result.estadosSolucion.map(e => e.aRaw());
    if (!states.length) states.push({ mLeft:totalM, cLeft:totalC, boat:'left', mRight:0, cRight:0 });
    
    // Animate tree progressively
    setMcNodes1(r1.nodes.slice(0, Math.min(r1.nodes.length, (mcStep + 1) * 3)));
    setMcNodes2(r2.nodes.slice(0, Math.min(r2.nodes.length, (mcStep + 1) * 3)));
    
    if (mcStep < states.length - 1) {
      const v = parsearAccionMC(r1.solution[mcStep]);
      setViajerosActuales(v);
      setMcState(states[mcStep + 1]);
      setMcStep(s => s + 1);
    } else {
      setViajerosActuales({ m:0, c:0 });
    }
  }, [module, algo1, algo2, mcStep, totalM, totalC, capBote]);

  useEffect(() => { setMetrics1(m => ({ ...emptyMetrics(algo1), done: false })); }, [algo1]);
  useEffect(() => { setMetrics2(m => ({ ...emptyMetrics(algo2), done: false })); }, [algo2]);

  const statusLabel = simState === 'idle' ? '○ INACTIVO'
    : simState === 'running' ? '● EJECUTANDO'
    : simState === 'paused' ? '⏸ PAUSADO' : '✓ COMPLETO';
  const statusColor = simState === 'running' ? 'var(--color-accent-green)'
    : simState === 'done' ? 'var(--color-accent-blue)'
    : 'var(--color-text-disabled)';
  const statusBlink = simState === 'running' ? 'blink 1s ease-in-out infinite' : 'none';

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--color-bg-base)', fontFamily: 'var(--font-sans)' }}>
      <header className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-panel)' }}>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#27c93f' }} />
          </div>
          <span className="mono text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            HeuristicSearch<span style={{ color: 'var(--color-accent-green)' }}>.ide</span>
          </span>
          <span className="mono text-xs px-2 py-0.5 rounded"
            style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border-subtle)' }}>v1.0.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono text-xs" style={{ color: 'var(--color-text-disabled)' }}>{statusLabel}</span>
          <div className="w-1.5 h-1.5 rounded-full"
            style={{ background: statusColor, animation: statusBlink }} />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{ width: 240, background: 'var(--color-bg-panel)',
            borderRight: '1px solid var(--color-border-subtle)', padding: '12px' }}>
          <SectionLabel>// ENTORNO</SectionLabel>
          <div className="flex rounded overflow-hidden mb-4" style={{ border: '1px solid var(--color-border-muted)' }}>
            {(['mc', 'pacman'] as Module[]).map(m => (
              <button key={m} onClick={() => { reset(); setModule(m); }}
                className="flex-1 py-1.5 text-xs mono font-semibold transition-all"
                style={{
                  background: module === m ? 'var(--color-bg-elevated)' : 'transparent',
                  color: module === m ? 'var(--color-accent-green)' : 'var(--color-text-muted)',
                  borderRight: m === 'mc' ? '1px solid var(--color-border-muted)' : 'none',
                }}>
                {m === 'mc' ? 'M&C' : 'Pac-Man'}
              </button>
            ))}
          </div>
          <SectionLabel>// METODOLOGÍA</SectionLabel>
          <div className="flex flex-col gap-2 mb-4">
            <Dropdown label="Algoritmo 1 ──────" value={algo1} onChange={setAlgo1} options={ALGO_OPTIONS} />
            <Dropdown label="Algoritmo 2 ──────" value={algo2} onChange={setAlgo2} options={ALGO_OPTIONS} />
          </div>
          <SectionLabel>// EJECUCIÓN</SectionLabel>
          <div className="flex flex-col gap-2 mb-4">
            <button onClick={runFull} disabled={simState === 'running'}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs font-semibold transition-all"
              style={{
                background: simState === 'running' ? 'var(--color-bg-elevated)' : 'var(--color-accent-green-glow)',
                border: '1px solid var(--color-accent-green-dim)',
                color: simState === 'running' ? 'var(--color-text-muted)' : 'var(--color-accent-green)',
                cursor: simState === 'running' ? 'not-allowed' : 'pointer',
              }}>▶ Play</button>
            <button onClick={stepForward} disabled={simState === 'running' || module === 'pacman'}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-muted)',
                color: simState !== 'idle' && module === 'mc' ? 'var(--color-text-secondary)' : 'var(--color-text-disabled)',
                cursor: module === 'pacman' ? 'not-allowed' : 'pointer',
              }}>⏭ Step-by-Step</button>
            <button onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); setSimState('paused'); }}
              disabled={simState !== 'running'}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-muted)',
                color: simState === 'running' ? 'var(--color-accent-yellow)' : 'var(--color-text-disabled)',
              }}>⏸ Pause</button>
            <button onClick={reset}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-muted)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}>↺ Reset</button>
          </div>
          {module === 'mc' && (
            <>
              <SectionLabel>// OPCIONES M&C</SectionLabel>
              <div className="flex flex-col gap-2 mb-3">
                <label className="flex flex-col gap-1">
                  <span className="mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>Total Misioneros: {totalM}</span>
                  <input type="range" min="1" max="15" value={totalM} onChange={e => { setTotalM(Number(e.target.value)); reset(); }} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>Total Caníbales: {totalC}</span>
                  <input type="range" min="1" max="15" value={totalC} onChange={e => { setTotalC(Number(e.target.value)); reset(); }} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>Capacidad Bote: {capBote}</span>
                  <input type="range" min="2" max="5" value={capBote} onChange={e => { setCapBote(Number(e.target.value)); reset(); }} />
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showTree} onChange={e => setShowTree(e.target.checked)}
                  className="accent-green-400" />
                <span className="mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>Mostrar árbol</span>
              </label>
            </>
          )}
          {simState === 'done' && (
            <div className="mt-4 rounded p-2"
              style={{ background: 'var(--color-accent-green-glow)',
                border: '1px solid var(--color-accent-green-dim)' }}>
              <div className="mono text-xs" style={{ color: 'var(--color-accent-green)' }}>✓ Simulación completa</div>
              <div className="mono text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Ruta: {module === 'mc' ? solutionPath.length : pacPath.length - 1} pasos
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden"
          style={{ background: 'var(--color-bg-base)', padding: '12px', gap: '12px' }}>
          <div className="flex items-center gap-2">
            <span className="mono text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {module === 'mc' ? '// MÓDULO: MISIONEROS Y CANÍBALES' : '// MÓDULO: PAC-MAN PATHFINDING'}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {module === 'mc'
              ? <MCVis currentState={mcState} treeNodes1={mcNodes1} treeNodes2={mcNodes2} nombreAlgo1={nombreAlgo(algo1)} nombreAlgo2={nombreAlgo(algo2)} showTree={showTree} viajeros={viajerosActuales} totalM={totalM} totalC={totalC} capBote={capBote} />
              : <PacmanVis grid={grid} onGridChange={setGrid} path={pacPath} />}
          </div>
        </main>

        <aside className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: 280, background: 'var(--color-bg-panel)',
            borderLeft: '1px solid var(--color-border-subtle)', padding: '12px', gap: '10px' }}>
          <SectionLabel>// INSPECTOR DE DATOS</SectionLabel>
          <div className="flex flex-col gap-2" style={{ height: 180 }}>
            <DataInspector title="FRONTERA (Lista Abierta)" items={frontierItems}
              accent="var(--color-accent-yellow)" />
            <DataInspector title="EXPLORADOS (Cerrado)" items={exploredItems}
              accent="var(--color-accent-red)" />
          </div>
          <SectionLabel>// EVALUACIÓN COMPARATIVA</SectionLabel>
          <div className="flex flex-col gap-2 flex-1 overflow-auto">
            <MetricsCard metrics={metrics1} algoNum={1} />
            <MetricsCard metrics={metrics2} algoNum={2} />
          </div>
        </aside>
      </div>
    </div>
  );
}
