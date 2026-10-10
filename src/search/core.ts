export interface Accion {
  nombre: string;
  costo: number;
}

export interface Estado {
  clave(): string;
  igual(otro: Estado): boolean;
}

export abstract class Problema<S extends Estado, A extends Accion> {
  constructor(
    public estadoInicial: S,
  ) {}

  abstract testObjetivo(estado: S): boolean;

  abstract acciones(estado: S): A[];

  abstract aplica(estado: S, accion: A): S;

  // g(n') = g(n) + c(n, a, n'): el costo del camino se ACUMULA desde el estado inicial
  costoCamino(costoAcumulado: number, _estadoOrigen: S, accion: A, _estadoDestino: S): number {
    return costoAcumulado + accion.costo;
  }

  heuristica(_estado: S): number {
    return 0;
  }

  estadoEsValido(_estado: S): boolean {
    return true;
  }
}

export class Nodo<S extends Estado, A extends Accion> {
  public estado: S;
  public padre: Nodo<S, A> | null;
  public accion: A | null;
  public costoAcumulado: number;
  public profundidad: number;

  constructor(
    estado: S,
    padre: Nodo<S, A> | null = null,
    accion: A | null = null,
    costoAcumulado: number = 0,
    profundidad: number = 0,
  ) {
    this.estado = estado;
    this.padre = padre;
    this.accion = accion;
    this.costoAcumulado = costoAcumulado;
    this.profundidad = profundidad;
  }

  caminoSolucion(): A[] {
    const camino: A[] = [];
    let actual: Nodo<S, A> | null = this;
    while (actual !== null && actual.accion !== null) {
      camino.unshift(actual.accion);
      actual = actual.padre;
    }
    return camino;
  }

  estadosCamino(): S[] {
    const estados: S[] = [];
    let actual: Nodo<S, A> | null = this;
    while (actual !== null) {
      estados.unshift(actual.estado);
      actual = actual.padre;
    }
    return estados;
  }

  static expandir<S extends Estado, A extends Accion>(
    problema: Problema<S, A>,
    nodo: Nodo<S, A>,
  ): Nodo<S, A>[] {
    const sucesores: Nodo<S, A>[] = [];
    const acciones = problema.acciones(nodo.estado);

    for (const accion of acciones) {
      const estadoSiguiente = problema.aplica(nodo.estado, accion);

      if (!problema.estadoEsValido(estadoSiguiente)) {
        continue;
      }

      const costoAcumulado = problema.costoCamino(
        nodo.costoAcumulado,
        nodo.estado,
        accion,
        estadoSiguiente,
      );

      const nodoHijo = new Nodo<S, A>(
        estadoSiguiente,
        nodo,
        accion,
        costoAcumulado,
        nodo.profundidad + 1,
      );

      sucesores.push(nodoHijo);
    }

    return sucesores;
  }
}

export interface ResultadoBusqueda<S extends Estado, A extends Accion> {
  exito: boolean;
  nodoMeta: Nodo<S, A> | null;
  caminoSolucion: A[];
  estadosSolucion: S[];
  nodosGenerados: Nodo<S, A>[];
  nodosExpandidos: Nodo<S, A>[];
  nodosPodados: { nodo: Nodo<S, A>; razon: string }[];
  fronteraTraza: S[];
  exploradosTraza: S[];
}
