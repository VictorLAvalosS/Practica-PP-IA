import React from 'react';
import { MCState } from '../../types/appTypes';
import type { Viajeros } from './MCVis';

interface RiverSVGProps {
  currentState: MCState;
  viajeros?: Viajeros;
  totalM: number;
  totalC: number;
  capBote: number;
}

export function RiverSVG({ currentState, viajeros, totalM, totalC, capBote }: RiverSVGProps) {
  const W = 840;
  const H = 420;
  const riverL = W * 0.40;
  const riverR = W * 0.62;
  const groundY = H * 0.66;
  const waterTop = H * 0.10;

  const boatX = currentState.boat === 'left' ? riverL + 22 : riverR - 22;
  const missionaryColor = '#4a90d9';
  const cannibalColor = '#e05050';

  const FIGS_GAP = 42;
  const FIGS_Y = groundY + 4;
  const LEFT_FIGS_START = 28;
  const RIGHT_FIGS_START = riverR + 28;
  const TREES_Y = groundY;
  const LEFT_TREES = [45, 105, 170];
  const RIGHT_TREES = [670, 732, 795];

  const v = viajeros ?? { m: 0, c: 0 };

  function FigureMiniM({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
    const s = scale;
    return (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <ellipse cx={0} cy={2} rx={11} ry={3} fill="rgba(0,0,0,0.3)" />
        <rect x={-9} y={-28} width={18} height={26} rx={3} fill="#2a4a6a" stroke={missionaryColor} strokeWidth={1.4} />
        <rect x={-1.4} y={-26} width={2.8} height={10} fill={missionaryColor} />
        <rect x={-5} y={-22} width={10} height={2.2} fill={missionaryColor} />
        <circle cx={0} cy={-36} r={8.5} fill="#f0c090" stroke={missionaryColor} strokeWidth={1.4} />
        <circle cx={-2.5} cy={-36} r={1} fill="#1a2030" />
        <circle cx={2.5} cy={-36} r={1} fill="#1a2030" />
        <text x={0} y={8} textAnchor="middle" fontSize={7.5} fontFamily="JetBrains Mono,monospace" fill={missionaryColor} fontWeight="800">M</text>
      </g>
    );
  }

  function FigureMiniC({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
    const s = scale;
    return (
      <g transform={`translate(${x},${y}) scale(${s})`}>
        <ellipse cx={0} cy={2} rx={11} ry={3} fill="rgba(0,0,0,0.3)" />
        <rect x={-9} y={-28} width={18} height={26} rx={2.5} fill="#5a1010" stroke={cannibalColor} strokeWidth={1.4} />
        <polygon points="-6,-46 -3,-51 0,-46" fill={cannibalColor} />
        <polygon points="6,-46 3,-51 0,-46" fill={cannibalColor} />
        <circle cx={0} cy={-36} r={8.5} fill="#c07050" stroke={cannibalColor} strokeWidth={1.4} />
        <circle cx={-2.8} cy={-36.5} r={1.6} fill="#fff" />
        <circle cx={2.8} cy={-36.5} r={1.6} fill="#fff" />
        <circle cx={-2.8} cy={-36.5} r={0.8} fill="#1a0505" />
        <circle cx={2.8} cy={-36.5} r={0.8} fill="#1a0505" />
        <text x={0} y={8} textAnchor="middle" fontSize={7.5} fontFamily="JetBrains Mono,monospace" fill={cannibalColor} fontWeight="800">C</text>
      </g>
    );
  }

  function FigureM({ x, y, idx }: { x: number; y: number; idx: number }) {
    return (
      <g
        transform={`translate(${x},${y})`}
        style={{
          animation: `float-icon ${1.9 + idx * 0.18}s ease-in-out infinite`,
          animationDelay: `${idx * 0.22}s`,
        }}
      >
        <ellipse cx={0} cy={2} rx={12.5} ry={3.5} fill="rgba(0,0,0,0.3)" />
        <rect x={-10.5} y={-32} width={21} height={31} rx={4} fill="#2a4a6a" stroke={missionaryColor} strokeWidth={1.7} />
        <rect x={-1.8} y={-30} width={3.6} height={11} fill={missionaryColor} />
        <rect x={-6} y={-25} width={12} height={2.6} fill={missionaryColor} />
        <circle cx={0} cy={-41} r={10.5} fill="#f0c090" stroke={missionaryColor} strokeWidth={1.7} />
        <circle cx={-3} cy={-41} r={1.25} fill="#1a2030" />
        <circle cx={3} cy={-41} r={1.25} fill="#1a2030" />
        <path d="M-3,-37 Q0,-35 3,-37" stroke="#1a2030" strokeWidth={1} fill="none" strokeLinecap="round" />
        <rect x={-9.5} y={-9} width={19} height={4} fill={missionaryColor} opacity={0.65} />
        <text x={0} y={10.5} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono,monospace" fill={missionaryColor} fontWeight="800">MISIONERO</text>
      </g>
    );
  }

  function FigureC({ x, y, idx }: { x: number; y: number; idx: number }) {
    return (
      <g
        transform={`translate(${x},${y})`}
        style={{
          animation: `float-icon ${2.3 + idx * 0.14}s ease-in-out infinite`,
          animationDelay: `${idx * 0.28}s`,
        }}
      >
        <ellipse cx={0} cy={2} rx={12.5} ry={3.5} fill="rgba(0,0,0,0.3)" />
        <rect x={-10.5} y={-32} width={21} height={31} rx={3} fill="#5a1010" stroke={cannibalColor} strokeWidth={1.7} />
        <polygon points="-7.5,-51 -3.7,-59 0,-51" fill={cannibalColor} stroke="#701010" strokeWidth={0.7} />
        <polygon points="7.5,-51 3.7,-59 0,-51" fill={cannibalColor} stroke="#701010" strokeWidth={0.7} />
        <circle cx={0} cy={-41} r={10.5} fill="#c07050" stroke={cannibalColor} strokeWidth={1.7} />
        <circle cx={-3.5} cy={-42.5} r={2} fill="#fff" />
        <circle cx={3.5} cy={-42.5} r={2} fill="#fff" />
        <circle cx={-3.5} cy={-42.5} r={1} fill="#1a0505" />
        <circle cx={3.5} cy={-42.5} r={1} fill="#1a0505" />
        <path d="M-4,-34 L-2,-31 L0,-34 L2,-31 L4,-34" stroke="#3a0808" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <rect x={-9.5} y={-9} width={19} height={4} fill={cannibalColor} opacity={0.65} />
        <text x={0} y={10.5} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono,monospace" fill={cannibalColor} fontWeight="800">CANÍBAL</text>
      </g>
    );
  }

  function Tree({ x, y }: { x: number; y: number }) {
    return (
      <g transform={`translate(${x},${y})`}>
        <rect x={-5.5} y={-42} width={11} height={42} fill="#3a2210" rx={1} />
        <ellipse cx={0} cy={-48} rx={21} ry={28} fill="#183a16" />
        <ellipse cx={-7} cy={-38} rx={14} ry={19} fill="#1e4d1b" />
        <ellipse cx={7} cy={-52} rx={10} ry={14} fill="#1e5220" opacity={0.9} />
      </g>
    );
  }

  let drawMLeft = currentState.mLeft;
  let drawCLeft = currentState.cLeft;
  let drawMRight = currentState.mRight;
  let drawCRight = currentState.cRight;

  if (v.m > 0 || v.c > 0) {
    if (currentState.boat === 'right') {
      drawMRight -= v.m;
      drawCRight -= v.c;
    } else {
      drawMLeft -= v.m;
      drawCLeft -= v.c;
    }
  }

  const leftGap = Math.min(42, 280 / Math.max(1, drawMLeft + drawCLeft));
  const rightGap = Math.min(42, (W - riverR - 56) / Math.max(1, drawMRight + drawCRight));

  const leftFigs: React.ReactNode[] = [];
  for (let i = 0; i < drawMLeft; i++)
    leftFigs.push(<FigureM key={`ml${i}`} x={LEFT_FIGS_START + i * leftGap} y={FIGS_Y} idx={i} />);
  for (let i = 0; i < drawCLeft; i++)
    leftFigs.push(<FigureC key={`cl${i}`} x={LEFT_FIGS_START + (drawMLeft + i) * leftGap} y={FIGS_Y} idx={i + drawMLeft} />);

  const rightFigs: React.ReactNode[] = [];
  for (let i = 0; i < drawMRight; i++)
    rightFigs.push(<FigureM key={`mr${i}`} x={RIGHT_FIGS_START + i * rightGap} y={FIGS_Y} idx={i} />);
  for (let i = 0; i < drawCRight; i++)
    rightFigs.push(<FigureC key={`cr${i}`} x={RIGHT_FIGS_START + (drawMRight + i) * rightGap} y={FIGS_Y} idx={i + drawMRight} />);

  const pasajeros: React.ReactNode[] = [];
  const sillaA_x = -16;
  const sillaB_x = +16;
  const silla_y = -22;
  let asientos: ('m' | 'c')[] = [];
  for (let i = 0; i < v.m; i++) asientos.push('m');
  for (let i = 0; i < v.c; i++) asientos.push('c');
  if (asientos.length === 1) {
    const unico = asientos[0];
    pasajeros.push(
      unico === 'm'
        ? <FigureMiniM key="p1" x={0} y={silla_y} scale={0.85} />
        : <FigureMiniC key="p1" x={0} y={silla_y} scale={0.85} />,
    );
  } else if (asientos.length === 2) {
    const [a, b] = asientos;
    pasajeros.push(
      a === 'm'
        ? <FigureMiniM key="pA" x={sillaA_x} y={silla_y} scale={0.8} />
        : <FigureMiniC key="pA" x={sillaA_x} y={silla_y} scale={0.8} />,
      b === 'm'
        ? <FigureMiniM key="pB" x={sillaB_x} y={silla_y} scale={0.8} />
        : <FigureMiniC key="pB" x={sillaB_x} y={silla_y} scale={0.8} />,
    );
  }

  const tipoViaje = v.m === 0 && v.c === 0 ? '(bote vacío)'
    : v.m === 1 && v.c === 0 ? '1 MISIONERO'
    : v.m === 2 ? '2 MISIONEROS'
    : v.c === 1 ? '1 CANÍBAL'
    : v.c === 2 ? '2 CANÍBALES'
    : '1 M + 1 C';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"
      style={{ display: 'block' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1420" />
          <stop offset="60%" stopColor="#122438" />
          <stop offset="100%" stopColor="#1b3350" />
        </linearGradient>
        <linearGradient id="river3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2850" />
          <stop offset="55%" stopColor="#0e3a76" />
          <stop offset="100%" stopColor="#081835" />
        </linearGradient>
        <linearGradient id="bank3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d3022" />
          <stop offset="100%" stopColor="#0f1f13" />
        </linearGradient>
        <linearGradient id="boat3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a07048" />
          <stop offset="100%" stopColor="#5e3c1a" />
        </linearGradient>
        <radialGradient id="moon3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffde0" />
          <stop offset="100%" stopColor="#e6d686" />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={W} height={H} fill="url(#sky3)" />

      {[[35,20],[95,38],[160,18],[230,42],[300,22],[540,28],[600,48],[660,18],[720,36],[785,22],[815,40]].map(([sx,sy], i) => (
        <circle key={i} cx={sx} cy={sy} r={1.4} fill="white" opacity={0.45 + ((i*7)%6)*0.09} />
      ))}

      <circle cx={W-72} cy={55} r={28} fill="url(#moon3)" />
      <circle cx={W-62} cy={47} r={21.5} fill="#0a1520" />
      <circle cx={W-80} cy={64} r={6.5} fill="#e6d686" opacity={0.45} />

      <rect x={0} y={groundY} width={riverL} height={H-groundY} fill="url(#bank3)" />
      <path d={`M0,${groundY} Q${riverL*0.3},${groundY-10} ${riverL},${groundY+5} L${riverL},${H} L0,${H} Z`} fill="url(#bank3)" />

      {[30, 95, 160, 225, 285].map((gx, i) => (
        <g key={`gzl-${i}`}>
          <line x1={gx} y1={groundY+5} x2={gx-5} y2={groundY-13} stroke="#2a5a30" strokeWidth={2.3} strokeLinecap="round" />
          <line x1={gx+7.5} y1={groundY+5} x2={gx+12} y2={groundY-11} stroke="#2a5a30" strokeWidth={2.3} strokeLinecap="round" />
        </g>
      ))}

      <rect x={riverR} y={groundY} width={W-riverR} height={H-groundY} fill="url(#bank3)" />
      <path d={`M${riverR},${groundY+5} Q${riverR+(W-riverR)*0.6},${groundY-9} ${W},${groundY} L${W},${H} L${riverR},${H} Z`} fill="url(#bank3)" />

      {[riverR+35, riverR+100, riverR+165, riverR+230].map((gx, i) => (
        <g key={`gzr-${i}`}>
          <line x1={gx} y1={groundY+5} x2={gx-4.5} y2={groundY-12} stroke="#2a5a30" strokeWidth={2.3} strokeLinecap="round" />
          <line x1={gx+8} y1={groundY+5} x2={gx+12} y2={groundY-10} stroke="#2a5a30" strokeWidth={2.3} strokeLinecap="round" />
        </g>
      ))}

      <rect x={riverL} y={waterTop} width={riverR-riverL} height={H-waterTop} fill="url(#river3)" />

      {[0.22, 0.38, 0.52, 0.66, 0.82].map((frac, i) => (
        <line key={`wl-${i}`}
          x1={riverL + 14} y1={waterTop + (H - waterTop) * frac}
          x2={riverR - 14} y2={waterTop + (H - waterTop) * frac}
          stroke="rgba(120,190,255,0.14)" strokeWidth={2} strokeDasharray="22,14" />
      ))}

      <line x1={riverL} y1={waterTop} x2={riverL} y2={H} stroke="#1a4588" strokeWidth={2.6} />
      <line x1={riverR} y1={waterTop} x2={riverR} y2={H} stroke="#1a4588" strokeWidth={2.6} />

      {LEFT_TREES.map((tx, i) => <Tree key={`tl-${i}`} x={tx} y={TREES_Y} />)}
      {RIGHT_TREES.map((tx, i) => <Tree key={`tr-${i}`} x={tx} y={TREES_Y} />)}

      <text x={riverL / 2} y={28} textAnchor="middle" fontSize={13} fontFamily="JetBrains Mono,monospace" fill="#5fa56b" fontWeight="700" letterSpacing="3">IZQUIERDA</text>
      <text x={(riverR + W) / 2} y={28} textAnchor="middle" fontSize={13} fontFamily="JetBrains Mono,monospace" fill="#5fa56b" fontWeight="700" letterSpacing="3">DERECHA</text>

      <g transform={`translate(${riverL / 2},${H - 22})`}>
        <rect x={-52} y={-16} width={104} height={30} rx={6} fill="rgba(8,22,45,0.92)" stroke="#2368cf" strokeWidth={1.2} />
        <text x={0} y={5} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono,monospace" fill="#5aadff" fontWeight="800">
          {currentState.mLeft} M  +  {currentState.cLeft} C
        </text>
      </g>
      <g transform={`translate(${(riverR + W) / 2},${H - 22})`}>
        <rect x={-52} y={-16} width={104} height={30} rx={6} fill="rgba(8,22,45,0.92)" stroke="#2368cf" strokeWidth={1.2} />
        <text x={0} y={5} textAnchor="middle" fontSize={12} fontFamily="JetBrains Mono,monospace" fill="#5aadff" fontWeight="800">
          {currentState.mRight} M  +  {currentState.cRight} C
        </text>
      </g>

      {leftFigs}
      {rightFigs}

      <g
        style={{ transition: 'transform 0.85s cubic-bezier(0.4,0,0.2,1)' }}
        transform={`translate(${boatX},${groundY + 2})`}
      >
        <ellipse cx={0} cy={20} rx={46} ry={10} fill="rgba(10,60,120,0.55)" />

        <path d="M-42,-2 Q-44,22 0,24 Q44,22 42,-2 Z" fill="url(#boat3)" stroke="#8b6040" strokeWidth={1.8} />
        <path d="M-42,-2 Q0,-10 42,-2" fill="none" stroke="#b88558" strokeWidth={2.4} />

        <rect x={-28} y={-6} width={56} height={5} fill="#c88c55" opacity={0.85} rx={2} />

        <rect x={-22} y={-34} width={12} height={16} rx={3} fill="#6a4a20" stroke="#4a3210" strokeWidth={0.8} />
        <rect x={10} y={-34} width={12} height={16} rx={3} fill="#6a4a20" stroke="#4a3210" strokeWidth={0.8} />
        <text x={-16} y={-23} textAnchor="middle" fontSize={6.5} fontFamily="JetBrains Mono,monospace" fill="#f0d090" fontWeight="700">A</text>
        <text x={16} y={-23} textAnchor="middle" fontSize={6.5} fontFamily="JetBrains Mono,monospace" fill="#f0d090" fontWeight="700">B</text>

        {pasajeros}

        <line x1={0} y1={-4} x2={0} y2={-40} stroke="#6a4a20" strokeWidth={3} />
        <path d="M0,-38 L28,-20 L0,-6 Z" fill="rgba(240,220,170,0.78)" stroke="#cca55e" strokeWidth={1.3} />
        <line x1={-36} y1={10} x2={-54} y2={26} stroke="#7a5530" strokeWidth={2.6} strokeLinecap="round" />
        <ellipse cx={-56} cy={28} rx={6.5} ry={3} fill="#7a5530" transform="rotate(-28,-56,28)" />

        <text x={0} y={-46} textAnchor="middle" fontSize={10} fontFamily="JetBrains Mono,monospace" fill="#ffd84a" fontWeight="800">⛵ BOTE</text>

        <g transform={`translate(0,32)`}>
          <rect x={-42} y={0} width={84} height={17} rx={4}
            fill="rgba(0,0,0,0.82)"
            stroke={v.m + v.c > 0 ? 'var(--color-accent-green-dim)' : '#3a3f4a'}
            strokeWidth={1.1}
            style={{ filter: v.m + v.c > 0 ? 'drop-shadow(0 0 6px rgba(57,255,126,0.35))' : undefined }} />
          <text x={0} y={12} textAnchor="middle" fontSize={9.5} fontFamily="JetBrains Mono,monospace"
            fill={v.m + v.c > 0 ? 'var(--color-accent-green)' : '#8a94ab'}
            fontWeight="800">
            PASAJEROS: {tipoViaje} ({v.m}M + {v.c}C / máx {capBote})
          </text>
        </g>
      </g>

      <g transform={`translate(${W / 2},${60})`}>
        <rect x={-210} y={-20} width={420} height={34} rx={7}
          fill="rgba(0,0,0,0.86)"
          stroke="var(--color-accent-green-dim)" strokeWidth={1.3}
          style={{ filter: 'drop-shadow(0 0 10px rgba(57,255,126,0.32))' }} />
        <text x={0} y={4} textAnchor="middle" fontSize={13} fontFamily="JetBrains Mono,monospace"
          fill="var(--color-accent-green)" fontWeight="800" letterSpacing="0.3">
          ESTADO ACTUAL:  [ {currentState.mLeft} , {currentState.cLeft} , {currentState.boat === 'left' ? 'L' : 'R'} , {currentState.mRight} , {currentState.cRight} ]
        </text>
      </g>
    </svg>
  );
}
