import { Problema, Estado, Accion } from './core';

export type Orilla = 'left' | 'right';

export interface MCStateRaw {
  mLeft: number;
  cLeft: number;
  boat: Orilla;
  mRight: number;
  cRight: number;
}

export class MCEstado implements Estado, MCStateRaw {
  mLeft: number;
  cLeft: number;
  boat: Orilla;
  mRight: number;
  cRight: number;

  constructor(mLeft: number, cLeft: number, boat: Orilla, mRight: number, cRight: number) {
    this.mLeft = mLeft;
    this.cLeft = cLeft;
    this.boat = boat;
    this.mRight = mRight;
    this.cRight = cRight;
  }

  clave(): string {
    return `${this.mLeft},${this.cLeft},${this.boat}`;
  }

  igual(otro: Estado): boolean {
    if (!(otro instanceof MCEstado)) return false;
    return this.clave() === otro.clave();
  }

  aRaw(): MCStateRaw {
    return {
      mLeft: this.mLeft,
      cLeft: this.cLeft,
      boat: this.boat,
      mRight: this.mRight,
      cRight: this.cRight,
    };
  }

  static desdeRaw(raw: MCStateRaw): MCEstado {
    return new MCEstado(raw.mLeft, raw.cLeft, raw.boat, raw.mRight, raw.cRight);
  }
}

export class MCAccion implements Accion {
  nombre: string;
  costo: number;
  misioneros: number;
  canibales: number;

  constructor(misioneros: number, canibales: number, direccion: Orilla) {
    this.misioneros = misioneros;
    this.canibales = canibales;
    this.costo = 1;
    const dirEtiqueta = direccion === 'left' ? 'Der' : 'Izq';
    this.nombre = `Mover(${misioneros}M,${canibales}C→${dirEtiqueta})`;
  }
}

export class MCProblema extends Problema<MCEstado, MCAccion> {
  public totalM: number;
  public totalC: number;
  public capBote: number;

  constructor(totalM: number = 3, totalC: number = 3, capBote: number = 2, estadoInicial?: MCEstado) {
    super(
      estadoInicial ?? new MCEstado(
        totalM,
        totalC,
        'left',
        0,
        0,
      ),
    );
    this.totalM = totalM;
    this.totalC = totalC;
    this.capBote = capBote;
  }

  testObjetivo(estado: MCEstado): boolean {
    return (
      estado.mLeft === 0 &&
      estado.cLeft === 0 &&
      estado.boat === 'right' &&
      estado.mRight === this.totalM &&
      estado.cRight === this.totalC
    );
  }

  estadoEsValido(estado: MCEstado): boolean {
    if (
      estado.mLeft < 0 || estado.cLeft < 0 ||
      estado.mRight < 0 || estado.cRight < 0
    ) return false;

    if (
      estado.mLeft > this.totalM ||
      estado.cLeft > this.totalC ||
      estado.mRight > this.totalM ||
      estado.cRight > this.totalC
    ) return false;

    if (estado.mLeft > 0 && estado.mLeft < estado.cLeft) return false;
    if (estado.mRight > 0 && estado.mRight < estado.cRight) return false;

    const misionerosTotal = estado.mLeft + estado.mRight;
    const canibalesTotal = estado.cLeft + estado.cRight;
    if (misionerosTotal !== this.totalM) return false;
    if (canibalesTotal !== this.totalC) return false;

    return true;
  }

  acciones(estado: MCEstado): MCAccion[] {
    const combinaciones: [number, number][] = [];
    for (let m = 0; m <= this.capBote; m++) {
      for (let c = 0; c <= this.capBote; c++) {
        if (m + c === 0 || m + c > this.capBote) continue;
        combinaciones.push([m, c]);
      }
    }

    const validas: MCAccion[] = [];

    for (const [m, c] of combinaciones) {

      if (estado.boat === 'left') {
        if (estado.mLeft >= m && estado.cLeft >= c) {
          validas.push(new MCAccion(m, c, 'left'));
        }
      } else {
        if (estado.mRight >= m && estado.cRight >= c) {
          validas.push(new MCAccion(m, c, 'right'));
        }
      }
    }

    return validas;
  }

  aplica(estado: MCEstado, accion: MCAccion): MCEstado {
    if (estado.boat === 'left') {
      return new MCEstado(
        estado.mLeft - accion.misioneros,
        estado.cLeft - accion.canibales,
        'right',
        estado.mRight + accion.misioneros,
        estado.cRight + accion.canibales,
      );
    } else {
      return new MCEstado(
        estado.mLeft + accion.misioneros,
        estado.cLeft + accion.canibales,
        'left',
        estado.mRight - accion.misioneros,
        estado.cRight - accion.canibales,
      );
    }
  }

  costoCamino(
    _costoAcumulado: number,
    _estadoOrigen: MCEstado,
    _accion: MCAccion,
    _estadoDestino: MCEstado,
  ): number {
    return 1;
  }

  heuristica(estado: MCEstado): number {
    const personasIzquierda = estado.mLeft + estado.cLeft;
    const botePenalizacion = estado.boat === 'left' ? 0 : 1;
    return Math.max(0, Math.ceil(personasIzquierda / this.capBote) + botePenalizacion - 1);
  }
}
