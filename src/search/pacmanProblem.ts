import { Problema, Estado, Accion } from './core';

export type TipoCelda = 'wall' | 'path' | 'start' | 'food';

export interface GridCelda {
  type: TipoCelda;
  heatState?: 'none' | 'frontier' | 'explored';
  pathStep?: number;
}

export interface Posicion {
  r: number;
  c: number;
}

export class PacmanEstado implements Estado {
  r: number;
  c: number;

  constructor(r: number, c: number) {
    this.r = r;
    this.c = c;
  }

  clave(): string {
    return `${this.r},${this.c}`;
  }

  igual(otro: Estado): boolean {
    if (!(otro instanceof PacmanEstado)) return false;
    return this.r === otro.r && this.c === otro.c;
  }

  aPosicion(): Posicion {
    return { r: this.r, c: this.c };
  }

  static desdePosicion(pos: Posicion): PacmanEstado {
    return new PacmanEstado(pos.r, pos.c);
  }
}

export type DireccionMovimiento = 'ARRIBA' | 'ABAJO' | 'IZQUIERDA' | 'DERECHA';

export class PacmanAccion implements Accion {
  nombre: string;
  costo: number;
  dr: number;
  dc: number;
  direccion: DireccionMovimiento;

  constructor(direccion: DireccionMovimiento) {
    this.direccion = direccion;
    this.costo = 1;
    switch (direccion) {
      case 'ARRIBA':
        this.dr = -1; this.dc = 0;
        this.nombre = '↑ Arriba';
        break;
      case 'ABAJO':
        this.dr = 1; this.dc = 0;
        this.nombre = '↓ Abajo';
        break;
      case 'IZQUIERDA':
        this.dr = 0; this.dc = -1;
        this.nombre = '← Izquierda';
        break;
      case 'DERECHA':
        this.dr = 0; this.dc = 1;
        this.nombre = '→ Derecha';
        break;
    }
  }
}

export class PacmanProblema extends Problema<PacmanEstado, PacmanAccion> {
  public grid: GridCelda[][];
  public filas: number;
  public columnas: number;
  public estadoMeta: PacmanEstado;

  constructor(grid: GridCelda[][]) {
    const posInicio = PacmanProblema.encontrarTipo(grid, 'start');
    const posMeta = PacmanProblema.encontrarTipo(grid, 'food');

    super(new PacmanEstado(posInicio.r, posInicio.c));

    this.grid = grid;
    this.filas = grid.length;
    this.columnas = grid[0].length;
    this.estadoMeta = new PacmanEstado(posMeta.r, posMeta.c);
  }

  static encontrarTipo(grid: GridCelda[][], tipo: TipoCelda): Posicion {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c].type === tipo) {
          return { r, c };
        }
      }
    }
    return { r: 0, c: 0 };
  }

  testObjetivo(estado: PacmanEstado): boolean {
    return estado.igual(this.estadoMeta);
  }

  estadoEsValido(estado: PacmanEstado): boolean {
    if (estado.r < 0 || estado.r >= this.filas) return false;
    if (estado.c < 0 || estado.c >= this.columnas) return false;
    if (this.grid[estado.r][estado.c].type === 'wall') return false;
    return true;
  }

  acciones(estado: PacmanEstado): PacmanAccion[] {
    const todasDirecciones: DireccionMovimiento[] = [
      'ARRIBA', 'ABAJO', 'IZQUIERDA', 'DERECHA',
    ];

    const validas: PacmanAccion[] = [];

    for (const dir of todasDirecciones) {
      const accion = new PacmanAccion(dir);
      const nuevaFila = estado.r + accion.dr;
      const nuevaCol = estado.c + accion.dc;

      const estadoPrueba = new PacmanEstado(nuevaFila, nuevaCol);
      if (this.estadoEsValido(estadoPrueba)) {
        validas.push(accion);
      }
    }

    return validas;
  }

  aplica(estado: PacmanEstado, accion: PacmanAccion): PacmanEstado {
    return new PacmanEstado(
      estado.r + accion.dr,
      estado.c + accion.dc,
    );
  }

  costoCamino(
    costoAcumulado: number,
    _estadoOrigen: PacmanEstado,
    accion: PacmanAccion,
    _estadoDestino: PacmanEstado,
  ): number {
    return costoAcumulado + accion.costo;
  }

  heuristica(estado: PacmanEstado): number {
    return this.distanciaManhattan(estado, this.estadoMeta);
  }

  distanciaManhattan(a: PacmanEstado, b: PacmanEstado): number {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
  }

  heuristicaEsAdmisible(): boolean {
    return true;
  }
}
