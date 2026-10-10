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
import { MCVis } from './components/mc/MCVis';
import { PacmanVis } from './components/pacman/PacmanVis';

// ─── Solvers ──────────────────────────────────────────────────────────────────

function mcIsGoal(s: MCState) {
  return s.mLeft === 0 && s.cLeft === 0 && s.boat === 'right';
}

function buscarPadreId(
  padre: Nodo<MCEstado, MCAccion>,
  idMap: Map<string, string>,
): string | null {
  for (const [clave, id] of idMap.entries()) {
    const claveEstado = clave.split('|')[0];
    if (claveEstado === padre.estado.clave()) {
      return id;
    }
  }
  return null;
}

function convertirNodoMC(
  nodo: Nodo<MCEstado, MCAccion>,
  idMap: Map<string, string>,
  idCounter: { value: number },
  pruned = false,
  pruneReason?: string,
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
    pruned,
    pruneReason,
  };
}

function construirArbolMC(
  resultado: ResultadoBusqueda<MCEstado, MCAccion>,
): TreeNode[] {
  const nodos: TreeNode[] = [];
  const idMap = new Map<string, string>();
  const idCounter = { value: 0 };

  const raiz = resultado.nodosGenerados[0];
  if (raiz) {
    nodos.push(convertirNodoMC(raiz, idMap, idCounter, false));
  }

  const expandidosClaves = new Set<string>(
    resultado.nodosExpandidos.map((n) => n.estado.clave()),
  );

  for (let i = 1; i < resultado.nodosGenerados.length; i++) {
    const nodo = resultado.nodosGenerados[i];
    const estadoClave = nodo.estado.clave();

    let esPodado = false;
    let razonPodado: string | undefined;
    for (const pod of resultado.nodosPodados) {
      if (pod.nodo.estado.clave() === estadoClave) {
        esPodado = true;
        razonPodado = pod.razon;
        break;
      }
    }

    if (!esPodado && !expandidosClaves.has(estadoClave)) {
      for (let j = 0; j < i; j++) {
        if (resultado.nodosGenerados[j].estado.clave() === estadoClave) {
          esPodado = true;
          razonPodado = 'Estado repetido (frontera)';
          break;
        }
      }
    }

    nodos.push(convertirNodoMC(nodo, idMap, idCounter, esPodado, razonPodado));
  }

  for (const pod of resultado.nodosPodados) {
    const yaExiste = nodos.some(
      (n) =>
        n.state.mLeft === pod.nodo.estado.mLeft &&
        n.state.cLeft === pod.nodo.estado.cLeft &&
        n.state.boat === pod.nodo.estado.boat,
    );
    if (!yaExiste) {
      nodos.push(convertirNodoMC(pod.nodo, idMap, idCounter, true, pod.razon));
    }
  }

  return nodos;
}

interface SolveMCOutput {
  nodes: TreeNode[];
  solution: string[];
  result: ResultadoBusqueda<MCEstado, MCAccion>;
}

function solveMC(algoId: AlgorithmId): SolveMCOutput {
  const problema = new MCProblema();
  const resultado = ejecutarAlgoritmo(algoId as AlgoId, problema);
  const nodes = construirArbolMC(resultado);
  const solution = resultado.caminoSolucion.map((a) => a.nombre);
  return { nodes, solution, result: resultado };
}

const DEFAULT_GRID_SIZE = 10;

// Escenario de prueba 10×10 — Inicio (0,0), Comida (9,9), 16 muros.
//
//   S . . . . . # . . .
//   . . . . . . # . . .
//   . . # . . . # . . .
//   . . # . . . # . . .
//   . . # . . . # . . .
//   . . . . . . # . . .
//   . . # # # # # . . .
//   . . . . . . . . . .
//   . . . . . . . # . .
//   . . . . . . . # . F
//
// Guiada solo por h(n), la Búsqueda Voraz baja hasta la fila 9 y choca con el muro de la
// columna 7, por lo que debe subir y rodearlo (22 pasos, no óptimo). BPP desciende por ramas
// largas (40 pasos). BPA, UCS y A* encuentran el óptimo de 18 pasos.
function makeDefaultGrid(): GridCell[][] {
  const g: GridCell[][] = Array.from({ length: DEFAULT_GRID_SIZE }, () =>
    Array.from(
      { length: DEFAULT_GRID_SIZE },
      () => ({ type: 'path', heatState: 'none' } as GridCell),
    ),
  );
  const walls: [number, number][] = [
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], // columna 6
    [6, 2], [6, 3], [6, 4], [6, 5],                         // fila 6
    [2, 2], [3, 2], [4, 2],                                 // columna 2
    [8, 7], [9, 7],                                         // columna 7 (abajo)
  ];
  for (const [r, c] of walls) g[r][c].type = 'wall';
  g[0][0].type = 'start';
  g[9][9].type = 'food';
  return g;
}

interface SolvePacmanOutput {
  exploredOrder: PacPos[];
  frontierOrder: PacPos[];
  path: PacPos[];
  result: ResultadoBusqueda<PacmanEstado, PacmanAccion>;
}

function solvePacman(
  grid: GridCell[][],
  algoId: AlgorithmId,
): SolvePacmanOutput {
  const problema = new PacmanProblema(grid);
  const resultado = ejecutarAlgoritmo(algoId as AlgoId, problema);

  const exploredOrder: PacPos[] = resultado.exploradosTraza.map((e) => e.aPosicion());
  const frontierOrder: PacPos[] = [];
  const vistosExplorados = new Set<string>();
  for (const e of resultado.exploradosTraza) vistosExplorados.add(e.clave());
  for (const f of resultado.fronteraTraza) {
    if (!vistosExplorados.has(f.clave())) {
      frontierOrder.push(f.aPosicion());
    }
  }
  const path: PacPos[] = resultado.estadosSolucion.map((e) => e.aPosicion());

  return { exploredOrder, frontierOrder, path, result: resultado };
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [module, setModule] = useState<Module>('mc');
  const [algo1, setAlgo1] = useState<AlgorithmId>('bfs');
  const [algo2, setAlgo2] = useState<AlgorithmId>('astar');
  const [simState, setSimState] = useState<SimState>('idle');
  const [showTree, setShowTree] = useState(true);

  const [mcState, setMcState] = useState<MCState>({
    mLeft: 3, cLeft: 3, boat: 'left', mRight: 0, cRight: 0,
  });
  const [mcNodes1, setMcNodes1] = useState<TreeNode[]>([]);
  const [mcNodes2, setMcNodes2] = useState<TreeNode[]>([]);
  const [mcStep, setMcStep] = useState(0);
  const [solutionPath, setSolutionPath] = useState<string[]>([]);

  const [grid, setGrid] = useState<GridCell[][]>(makeDefaultGrid());
  const [pacPath, setPacPath] = useState<PacPos[]>([]);
  const [pacStep, setPacStep] = useState(0);
  const [, setPacExplored] = useState<PacPos[]>([]);
  const [, setPacFrontier] = useState<PacPos[]>([]);

  const [metrics1, setMetrics1] = useState<AlgoMetrics>({
    id: algo1,
    name: ALGO_OPTIONS.find((o) => o.id === algo1)!.label,
    solution: [],
    pathCost: 0,
    nodesGenerated: 0,
    nodesExpanded: 0,
    isOptimal: false,
    isComplete: false,
    done: false,
  });
  const [metrics2, setMetrics2] = useState<AlgoMetrics>({
    id: algo2,
    name: ALGO_OPTIONS.find((o) => o.id === algo2)!.label,
    solution: [],
    pathCost: 0,
    nodesGenerated: 0,
    nodesExpanded: 0,
    isOptimal: false,
    isComplete: false,
    done: false,
  });

  const [frontierItems, setFrontierItems] = useState<string[]>([]);
  const [exploredItems, setExploredItems] = useState<string[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimState('idle');
    setMcState({ mLeft: 3, cLeft: 3, boat: 'left', mRight: 0, cRight: 0 });
    setMcNodes1([]);
    setMcNodes2([]);
    setMcStep(0);
    setSolutionPath([]);
    setPacPath([]);
    setPacStep(0);
    setPacExplored([]);
    setPacFrontier([]);
    setFrontierItems([]);
    setExploredItems([]);
    setGrid((g) =>
      g.map((row) =>
        row.map((cell) => ({ ...cell, heatState: 'none', pathStep: undefined })),
      ),
    );
    setMetrics1((m) => ({
      ...m,
      done: false,
      solution: [],
      pathCost: 0,
      nodesGenerated: 0,
      nodesExpanded: 0,
    }));
    setMetrics2((m) => ({
      ...m,
      done: false,
      solution: [],
      pathCost: 0,
      nodesGenerated: 0,
      nodesExpanded: 0,
    }));
  }, []);

  const runFull = useCallback(() => {
    reset();
    setSimState('running');

    if (module === 'mc') {
      const r1 = solveMC(algo1);
      const r2 = solveMC(algo2);
      setMcNodes1(r1.nodes);
      setMcNodes2(r2.nodes);
      setSolutionPath(r1.solution);

      const estadosRaw = r1.result.estadosSolucion.map((e) => e.aRaw());
      const states: MCState[] = estadosRaw.length > 0
        ? estadosRaw
        : [{ mLeft: 3, cLeft: 3, boat: 'left', mRight: 0, cRight: 0 }];

      const fronteraValida = r1.result.fronteraTraza.map(
        (e) =>
          `[${e.mLeft},${e.cLeft},${e.boat === 'left' ? 'L' : 'R'}] h=${
            r1.result.nodoMeta ? Math.ceil((e.mLeft + e.cLeft) / 2) : 0
          }`,
      );
      const exploradosValidos = r1.result.nodosPodados.map(
        (pod) =>
          `[${pod.nodo.estado.mLeft},${pod.nodo.estado.cLeft},${
            pod.nodo.estado.boat === 'left' ? 'L' : 'R'
          }] — ${pod.razon}`,
      );
      for (const exp of r1.result.exploradosTraza) {
        fronteraValida.push(
          `[${exp.mLeft},${exp.cLeft},${exp.boat === 'left' ? 'L' : 'R'}] ✓`,
        );
      }
      setFrontierItems(fronteraValida);
      setExploredItems(exploradosValidos);

      setMetrics1({
        id: algo1,
        name: ALGO_OPTIONS.find((o) => o.id === algo1)!.label,
        solution: r1.solution,
        pathCost: r1.result.nodoMeta ? r1.result.nodoMeta.costoAcumulado : 0,
        nodesGenerated: r1.result.nodosGenerados.length,
        nodesExpanded: r1.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo1].isOptimal,
        isComplete: ALGO_META[algo1].isComplete,
        done: true,
      });
      setMetrics2({
        id: algo2,
        name: ALGO_OPTIONS.find((o) => o.id === algo2)!.label,
        solution: r2.solution,
        pathCost: r2.result.nodoMeta ? r2.result.nodoMeta.costoAcumulado : 0,
        nodesGenerated: r2.result.nodosGenerados.length,
        nodesExpanded: r2.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo2].isOptimal,
        isComplete: ALGO_META[algo2].isComplete,
        done: true,
      });

      let step = 0;
      intervalRef.current = setInterval(() => {
        step++;
        if (step < states.length) {
          setMcState(states[step]);
        } else {
          clearInterval(intervalRef.current!);
          setSimState('done');
        }
      }, 700);
    } else {
      const r1 = solvePacman(grid, algo1);
      const r2 = solvePacman(grid, algo2);
      setPacPath(r1.path);

      const sol1 = r1.result.caminoSolucion.map((a, i) =>
        i === 0 ? `Inicio(${r1.path[0].r},${r1.path[0].c})` : `${a.nombre}`,
      );
      const sol2 = r2.result.caminoSolucion.map((a, i) =>
        i === 0 ? `Inicio(${r2.path[0].r},${r2.path[0].c})` : `${a.nombre}`,
      );

      setMetrics1({
        id: algo1,
        name: ALGO_OPTIONS.find((o) => o.id === algo1)!.label,
        solution: sol1,
        pathCost: r1.result.nodoMeta ? r1.result.nodoMeta.costoAcumulado : 0,
        nodesGenerated: r1.result.nodosGenerados.length,
        nodesExpanded: r1.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo1].isOptimal,
        isComplete: ALGO_META[algo1].isComplete,
        done: true,
      });
      setMetrics2({
        id: algo2,
        name: ALGO_OPTIONS.find((o) => o.id === algo2)!.label,
        solution: sol2,
        pathCost: r2.result.nodoMeta ? r2.result.nodoMeta.costoAcumulado : 0,
        nodesGenerated: r2.result.nodosGenerados.length,
        nodesExpanded: r2.result.nodosExpandidos.length,
        isOptimal: ALGO_META[algo2].isOptimal,
        isComplete: ALGO_META[algo2].isComplete,
        done: true,
      });

      const allSteps = [
        ...r1.exploredOrder.map((p) => ({ p, type: 'explored' as const })),
        ...r1.frontierOrder.map((p) => ({ p, type: 'frontier' as const })),
      ];
      let step = 0;
      const frontierQ: string[] = [];
      const exploredQ: string[] = [];
      intervalRef.current = setInterval(() => {
        if (step < allSteps.length) {
          const { p, type } = allSteps[step];
          setGrid((g) => {
            const ng = g.map((row) => row.map((c) => ({ ...c })));
            if (ng[p.r][p.c].type !== 'start' && ng[p.r][p.c].type !== 'food')
              ng[p.r][p.c].heatState = type;
            return ng;
          });
          if (type === 'frontier') frontierQ.push(`(${p.r},${p.c})`);
          if (type === 'explored') exploredQ.push(`(${p.r},${p.c})`);
          setFrontierItems([...frontierQ]);
          setExploredItems([...exploredQ]);
          step++;
        } else {
          clearInterval(intervalRef.current!);
          setSimState('done');
        }
      }, 80);
    }
  }, [module, algo1, algo2, grid, reset]);

  const stepForward = useCallback(() => {
    if (module === 'mc') {
      const result = solveMC(algo1);
      const result2 = solveMC(algo2);
      const states: MCState[] = result.result.estadosSolucion.map((e) => e.aRaw());
      if (states.length === 0)
        states.push({ mLeft: 3, cLeft: 3, boat: 'left', mRight: 0, cRight: 0 });
      setMcNodes1(result.nodes.slice(0, mcStep + 5));
      setMcNodes2(result2.nodes.slice(0, mcStep + 5));
      if (mcStep < states.length - 1) {
        setMcState(states[mcStep + 1]);
        setMcStep((s) => s + 1);
      }
    }
  }, [module, algo1, algo2, mcStep]);

  useEffect(() => {
    setMetrics1((m) => ({
      ...m,
      id: algo1,
      name: ALGO_OPTIONS.find((o) => o.id === algo1)!.label,
      done: false,
    }));
  }, [algo1]);
  useEffect(() => {
    setMetrics2((m) => ({
      ...m,
      id: algo2,
      name: ALGO_OPTIONS.find((o) => o.id === algo2)!.label,
      done: false,
    }));
  }, [algo2]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--color-bg-base)', fontFamily: 'var(--font-sans)' }}
    >
      <header
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          borderBottom: '1px solid var(--color-border-subtle)',
          background: 'var(--color-bg-panel)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#27c93f' }} />
          </div>
          <span
            className="mono text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            HeuristicSearch
            <span style={{ color: 'var(--color-accent-green)' }}>.ide</span>
          </span>
          <span
            className="mono text-xs px-2 py-0.5 rounded"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            v1.0.0
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono text-xs" style={{ color: 'var(--color-text-disabled)' }}>
            {simState === 'idle'
              ? '○ INACTIVO'
              : simState === 'running'
                ? '● EJECUTANDO'
                : simState === 'paused'
                  ? '⏸ PAUSADO'
                  : '✓ COMPLETO'}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background:
                simState === 'running'
                  ? 'var(--color-accent-green)'
                  : simState === 'done'
                    ? 'var(--color-accent-blue)'
                    : 'var(--color-text-disabled)',
              animation:
                simState === 'running' ? 'blink 1s ease-in-out infinite' : 'none',
            }}
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden" style={{ gap: 0 }}>
        <aside
          className="flex-shrink-0 flex flex-col overflow-y-auto"
          style={{
            width: 240,
            background: 'var(--color-bg-panel)',
            borderRight: '1px solid var(--color-border-subtle)',
            padding: '12px',
          }}
        >
          <SectionLabel>// ENTORNO</SectionLabel>
          <div
            className="flex rounded overflow-hidden mb-4"
            style={{ border: '1px solid var(--color-border-muted)' }}
          >
            {(['mc', 'pacman'] as Module[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  reset();
                  setModule(m);
                }}
                className="flex-1 py-1.5 text-xs mono font-semibold transition-all"
                style={{
                  background: module === m ? 'var(--color-bg-elevated)' : 'transparent',
                  color:
                    module === m
                      ? 'var(--color-accent-green)'
                      : 'var(--color-text-muted)',
                  borderRight: m === 'mc' ? '1px solid var(--color-border-muted)' : 'none',
                }}
              >
                {m === 'mc' ? 'M&C' : 'Pac-Man'}
              </button>
            ))}
          </div>

          <SectionLabel>// METODOLOGÍA</SectionLabel>
          <div className="flex flex-col gap-2 mb-4">
            <Dropdown
              label="Algoritmo 1 ──────"
              value={algo1}
              onChange={setAlgo1}
              options={ALGO_OPTIONS}
            />
            <Dropdown
              label="Algoritmo 2 ──────"
              value={algo2}
              onChange={setAlgo2}
              options={ALGO_OPTIONS}
            />
          </div>

          <SectionLabel>// EJECUCIÓN</SectionLabel>
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={runFull}
              disabled={simState === 'running'}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs font-semibold transition-all"
              style={{
                background:
                  simState === 'running'
                    ? 'var(--color-bg-elevated)'
                    : 'var(--color-accent-green-glow)',
                border: '1px solid var(--color-accent-green-dim)',
                color:
                  simState === 'running'
                    ? 'var(--color-text-muted)'
                    : 'var(--color-accent-green)',
                cursor: simState === 'running' ? 'not-allowed' : 'pointer',
              }}
            >
              <span>▶</span> Play
            </button>
            <button
              onClick={stepForward}
              disabled={simState === 'running' || module === 'pacman'}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-muted)',
                color:
                  simState !== 'idle' && module === 'mc'
                    ? 'var(--color-text-secondary)'
                    : 'var(--color-text-disabled)',
                cursor: module === 'pacman' ? 'not-allowed' : 'pointer',
              }}
            >
              <span>⏭</span> Step-by-Step
            </button>
            <button
              onClick={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setSimState('paused');
              }}
              disabled={simState !== 'running'}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-muted)',
                color:
                  simState === 'running'
                    ? 'var(--color-accent-yellow)'
                    : 'var(--color-text-disabled)',
              }}
            >
              <span>⏸</span> Pause
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-3 py-2 rounded mono text-xs transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-muted)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              <span>↺</span> Reset
            </button>
          </div>

          {module === 'mc' && (
            <>
              <SectionLabel>// OPCIONES</SectionLabel>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTree}
                  onChange={(e) => setShowTree(e.target.checked)}
                  className="accent-green-400"
                />
                <span
                  className="mono text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Mostrar árbol
                </span>
              </label>
            </>
          )}

          {simState === 'done' && (
            <div
              className="mt-4 rounded p-2"
              style={{
                background: 'var(--color-accent-green-glow)',
                border: '1px solid var(--color-accent-green-dim)',
              }}
            >
              <div
                className="mono text-xs"
                style={{ color: 'var(--color-accent-green)' }}
              >
                ✓ Simulación completa
              </div>
              <div
                className="mono text-xs mt-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Ruta: {module === 'mc' ? solutionPath.length : pacPath.length - 1} pasos
              </div>
            </div>
          )}
        </aside>

        <main
          className="flex-1 flex flex-col overflow-hidden"
          style={{ background: 'var(--color-bg-base)', padding: '12px', gap: '12px' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="mono text-xs font-semibold"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {module === 'mc'
                ? '// MÓDULO: MISIONEROS Y CANÍBALES'
                : '// MÓDULO: PAC-MAN PATHFINDING'}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {module === 'mc' ? (
              <MCVis
                currentState={mcState}
                treeNodes1={mcNodes1}
                treeNodes2={mcNodes2}
                nombreAlgo1={ALGO_OPTIONS.find((o) => o.id === algo1)!.label}
                nombreAlgo2={ALGO_OPTIONS.find((o) => o.id === algo2)!.label}
                showTree={showTree}
                totalM={3}
                totalC={3}
                capBote={2}
              />
            ) : (
              <PacmanVis grid={grid} onGridChange={setGrid} path={pacPath} />
            )}
          </div>
        </main>

        <aside
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{
            width: 280,
            background: 'var(--color-bg-panel)',
            borderLeft: '1px solid var(--color-border-subtle)',
            padding: '12px',
            gap: '10px',
          }}
        >
          <SectionLabel>// INSPECTOR DE DATOS</SectionLabel>
          <div className="flex flex-col gap-2" style={{ height: 180 }}>
            <DataInspector
              title="FRONTERA (Lista Abierta)"
              items={frontierItems}
              accent="var(--color-accent-yellow)"
            />
            <DataInspector
              title="EXPLORADOS (Cerrado)"
              items={exploredItems}
              accent="var(--color-accent-red)"
            />
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
