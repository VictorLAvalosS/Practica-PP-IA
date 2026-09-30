import { Problema, Nodo, Estado, Accion, ResultadoBusqueda } from './core';

interface ColaPrioridadItem<S extends Estado, A extends Accion> {
  nodo: Nodo<S, A>;
  prioridad: number;
}

class ColaPrioridad<S extends Estado, A extends Accion> {
  private items: ColaPrioridadItem<S, A>[] = [];

  insertar(nodo: Nodo<S, A>, prioridad: number): void {
    this.items.push({ nodo, prioridad });
    this.ordenar();
  }

  extraerMin(): Nodo<S, A> | null {
    return this.items.shift()?.nodo ?? null;
  }

  estaVacia(): boolean {
    return this.items.length === 0;
  }

  tamano(): number {
    return this.items.length;
  }

  contieneNodoConEstado(claveEstado: string): boolean {
    return this.items.some(item => item.nodo.estado.clave() === claveEstado);
  }

  obtenerCostoNodo(claveEstado: string): number | null {
    const item = this.items.find(i => i.nodo.estado.clave() === claveEstado);
    return item ? item.nodo.costoAcumulado : null;
  }

  reemplazarSiMejor(nodo: Nodo<S, A>, prioridad: number): boolean {
    const idx = this.items.findIndex(i => i.nodo.estado.clave() === nodo.estado.clave());
    if (idx === -1) {
      this.insertar(nodo, prioridad);
      return true;
    }
    if (this.items[idx].nodo.costoAcumulado > nodo.costoAcumulado) {
      this.items[idx] = { nodo, prioridad };
      this.ordenar();
      return true;
    }
    return false;
  }

  private ordenar(): void {
    this.items.sort((a, b) => a.prioridad - b.prioridad);
  }

  obtenerNodos(): Nodo<S, A>[] {
    return this.items.map(i => i.nodo);
  }
}

export function busquedaEnProfundidad<S extends Estado, A extends Accion>(
  problema: Problema<S, A>,
): ResultadoBusqueda<S, A> {
  const nodoInicial = new Nodo<S, A>(problema.estadoInicial);

  if (problema.testObjetivo(nodoInicial.estado)) {
    return construirResultado(true, nodoInicial, [nodoInicial], [], [], [nodoInicial.estado], [nodoInicial.estado]);
  }

  const pila: Nodo<S, A>[] = [nodoInicial];
  const cerrado = new Set<string>();
  const nodosGenerados: Nodo<S, A>[] = [nodoInicial];
  const nodosExpandidos: Nodo<S, A>[] = [];
  const nodosPodados: { nodo: Nodo<S, A>; razon: string }[] = [];
  const fronteraTraza: S[] = [nodoInicial.estado];
  const exploradosTraza: S[] = [];

  while (pila.length > 0) {
    const nodoActual = pila.pop()!;
    const claveActual = nodoActual.estado.clave();

    if (cerrado.has(claveActual)) {
      nodosPodados.push({ nodo: nodoActual, razon: 'Estado repetido (cerrado)' });
      continue;
    }

    nodosExpandidos.push(nodoActual);
    cerrado.add(claveActual);
    exploradosTraza.push(nodoActual.estado);

    if (problema.testObjetivo(nodoActual.estado)) {
      return construirResultado(
        true,
        nodoActual,
        nodosGenerados,
        nodosExpandidos,
        nodosPodados,
        fronteraTraza,
        exploradosTraza,
      );
    }

    const sucesores = Nodo.expandir(problema, nodoActual);

    for (let i = sucesores.length - 1; i >= 0; i--) {
      const hijo = sucesores[i];
      nodosGenerados.push(hijo);
      const claveHijo = hijo.estado.clave();

      if (cerrado.has(claveHijo)) {
        nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (cerrado)' });
        continue;
      }

      if (pila.some(n => n.estado.clave() === claveHijo)) {
        nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (frontera)' });
        continue;
      }

      pila.push(hijo);
      fronteraTraza.push(hijo.estado);
    }
  }

  return construirResultado(
    false,
    null,
    nodosGenerados,
    nodosExpandidos,
    nodosPodados,
    fronteraTraza,
    exploradosTraza,
  );
}

export function busquedaCostoUniforme<S extends Estado, A extends Accion>(
  problema: Problema<S, A>,
): ResultadoBusqueda<S, A> {
  const nodoInicial = new Nodo<S, A>(problema.estadoInicial);

  if (problema.testObjetivo(nodoInicial.estado)) {
    return construirResultado(true, nodoInicial, [nodoInicial], [], [], [nodoInicial.estado], [nodoInicial.estado]);
  }

  const frontera = new ColaPrioridad<S, A>();
  frontera.insertar(nodoInicial, nodoInicial.costoAcumulado);

  const cerrado = new Set<string>();
  const nodosGenerados: Nodo<S, A>[] = [nodoInicial];
  const nodosExpandidos: Nodo<S, A>[] = [];
  const nodosPodados: { nodo: Nodo<S, A>; razon: string }[] = [];
  const fronteraTraza: S[] = [nodoInicial.estado];
  const exploradosTraza: S[] = [];

  while (!frontera.estaVacia()) {
    const nodoActual = frontera.extraerMin()!;
    nodosExpandidos.push(nodoActual);
    cerrado.add(nodoActual.estado.clave());
    exploradosTraza.push(nodoActual.estado);

    if (problema.testObjetivo(nodoActual.estado)) {
      return construirResultado(
        true,
        nodoActual,
        nodosGenerados,
        nodosExpandidos,
        nodosPodados,
        fronteraTraza,
        exploradosTraza,
      );
    }

    const sucesores = Nodo.expandir(problema, nodoActual);

    for (const hijo of sucesores) {
      nodosGenerados.push(hijo);
      const claveHijo = hijo.estado.clave();

      if (cerrado.has(claveHijo)) {
        nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (cerrado)' });
        continue;
      }

      const gN = hijo.costoAcumulado;

      if (frontera.contieneNodoConEstado(claveHijo)) {
        const costoExistente = frontera.obtenerCostoNodo(claveHijo);
        if (costoExistente !== null && costoExistente <= gN) {
          nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (frontera con mejor g(n))' });
          continue;
        }
      }

      frontera.reemplazarSiMejor(hijo, gN);
      fronteraTraza.push(hijo.estado);
    }
  }

  return construirResultado(
    false,
    null,
    nodosGenerados,
    nodosExpandidos,
    nodosPodados,
    fronteraTraza,
    exploradosTraza,
  );
}

export function busquedaEnAnchura<S extends Estado, A extends Accion>(
  problema: Problema<S, A>,
): ResultadoBusqueda<S, A> {
  const nodoInicial = new Nodo<S, A>(problema.estadoInicial);

  if (problema.testObjetivo(nodoInicial.estado)) {
    return construirResultado(true, nodoInicial, [nodoInicial], [], [], [nodoInicial.estado], [nodoInicial.estado]);
  }

  const frontera: Nodo<S, A>[] = [nodoInicial];
  const cerrado = new Set<string>();
  const nodosGenerados: Nodo<S, A>[] = [nodoInicial];
  const nodosExpandidos: Nodo<S, A>[] = [];
  const nodosPodados: { nodo: Nodo<S, A>; razon: string }[] = [];
  const fronteraTraza: S[] = [nodoInicial.estado];
  const exploradosTraza: S[] = [];

  while (frontera.length > 0) {
    const nodoActual = frontera.shift()!;
    nodosExpandidos.push(nodoActual);
    cerrado.add(nodoActual.estado.clave());
    exploradosTraza.push(nodoActual.estado);

    const sucesores = Nodo.expandir(problema, nodoActual);

    for (const hijo of sucesores) {
      nodosGenerados.push(hijo);

      const claveHijo = hijo.estado.clave();

      if (problema.testObjetivo(hijo.estado)) {
        return construirResultado(
          true,
          hijo,
          nodosGenerados,
          nodosExpandidos,
          nodosPodados,
          fronteraTraza,
          exploradosTraza,
        );
      }

      if (cerrado.has(claveHijo)) {
        nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (cerrado)' });
        continue;
      }

      if (frontera.some(n => n.estado.clave() === claveHijo)) {
        nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (frontera)' });
        continue;
      }

      frontera.push(hijo);
      fronteraTraza.push(hijo.estado);
    }
  }

  return construirResultado(
    false,
    null,
    nodosGenerados,
    nodosExpandidos,
    nodosPodados,
    fronteraTraza,
    exploradosTraza,
  );
}

export function busquedaCodiciosa<S extends Estado, A extends Accion>(
  problema: Problema<S, A>,
): ResultadoBusqueda<S, A> {
  const nodoInicial = new Nodo<S, A>(problema.estadoInicial);

  if (problema.testObjetivo(nodoInicial.estado)) {
    return construirResultado(true, nodoInicial, [nodoInicial], [], [], [nodoInicial.estado], [nodoInicial.estado]);
  }

  const frontera = new ColaPrioridad<S, A>();
  frontera.insertar(nodoInicial, problema.heuristica(nodoInicial.estado));

  const cerrado = new Set<string>();
  const nodosGenerados: Nodo<S, A>[] = [nodoInicial];
  const nodosExpandidos: Nodo<S, A>[] = [];
  const nodosPodados: { nodo: Nodo<S, A>; razon: string }[] = [];
  const fronteraTraza: S[] = [nodoInicial.estado];
  const exploradosTraza: S[] = [];

  while (!frontera.estaVacia()) {
    const nodoActual = frontera.extraerMin()!;
    nodosExpandidos.push(nodoActual);
    cerrado.add(nodoActual.estado.clave());
    exploradosTraza.push(nodoActual.estado);

    if (problema.testObjetivo(nodoActual.estado)) {
      return construirResultado(
        true,
        nodoActual,
        nodosGenerados,
        nodosExpandidos,
        nodosPodados,
        fronteraTraza,
        exploradosTraza,
      );
    }

    const sucesores = Nodo.expandir(problema, nodoActual);

    for (const hijo of sucesores) {
      nodosGenerados.push(hijo);
      const claveHijo = hijo.estado.clave();

      if (cerrado.has(claveHijo)) {
        nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (cerrado)' });
        continue;
      }

      const fN = problema.heuristica(hijo.estado);

      if (frontera.contieneNodoConEstado(claveHijo)) {
        const costoExistente = frontera.obtenerCostoNodo(claveHijo);
        if (costoExistente !== null && costoExistente <= hijo.costoAcumulado) {
          nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (frontera con mejor f(n))' });
          continue;
        }
      }

      frontera.reemplazarSiMejor(hijo, fN);
      fronteraTraza.push(hijo.estado);
    }
  }

  return construirResultado(
    false,
    null,
    nodosGenerados,
    nodosExpandidos,
    nodosPodados,
    fronteraTraza,
    exploradosTraza,
  );
}

export function busquedaAEstrella<S extends Estado, A extends Accion>(
  problema: Problema<S, A>,
): ResultadoBusqueda<S, A> {
  const nodoInicial = new Nodo<S, A>(problema.estadoInicial);

  if (problema.testObjetivo(nodoInicial.estado)) {
    return construirResultado(true, nodoInicial, [nodoInicial], [], [], [nodoInicial.estado], [nodoInicial.estado]);
  }

  const frontera = new ColaPrioridad<S, A>();
  const hInicial = problema.heuristica(nodoInicial.estado);
  frontera.insertar(nodoInicial, nodoInicial.costoAcumulado + hInicial);

  const cerrado = new Set<string>();
  const nodosGenerados: Nodo<S, A>[] = [nodoInicial];
  const nodosExpandidos: Nodo<S, A>[] = [];
  const nodosPodados: { nodo: Nodo<S, A>; razon: string }[] = [];
  const fronteraTraza: S[] = [nodoInicial.estado];
  const exploradosTraza: S[] = [];

  while (!frontera.estaVacia()) {
    const nodoActual = frontera.extraerMin()!;
    nodosExpandidos.push(nodoActual);
    cerrado.add(nodoActual.estado.clave());
    exploradosTraza.push(nodoActual.estado);

    if (problema.testObjetivo(nodoActual.estado)) {
      return construirResultado(
        true,
        nodoActual,
        nodosGenerados,
        nodosExpandidos,
        nodosPodados,
        fronteraTraza,
        exploradosTraza,
      );
    }

    const sucesores = Nodo.expandir(problema, nodoActual);

    for (const hijo of sucesores) {
      nodosGenerados.push(hijo);
      const claveHijo = hijo.estado.clave();

      if (cerrado.has(claveHijo)) {
        nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (cerrado)' });
        continue;
      }

      const gN = hijo.costoAcumulado;
      const hN = problema.heuristica(hijo.estado);
      const fN = gN + hN;

      if (frontera.contieneNodoConEstado(claveHijo)) {
        const costoExistente = frontera.obtenerCostoNodo(claveHijo);
        if (costoExistente !== null && costoExistente <= gN) {
          nodosPodados.push({ nodo: hijo, razon: 'Estado repetido (frontera con mejor g(n))' });
          continue;
        }
      }

      frontera.reemplazarSiMejor(hijo, fN);
      fronteraTraza.push(hijo.estado);
    }
  }

  return construirResultado(
    false,
    null,
    nodosGenerados,
    nodosExpandidos,
    nodosPodados,
    fronteraTraza,
    exploradosTraza,
  );
}

function construirResultado<S extends Estado, A extends Accion>(
  exito: boolean,
  nodoMeta: Nodo<S, A> | null,
  nodosGenerados: Nodo<S, A>[],
  nodosExpandidos: Nodo<S, A>[],
  nodosPodados: { nodo: Nodo<S, A>; razon: string }[],
  fronteraTraza: S[],
  exploradosTraza: S[],
): ResultadoBusqueda<S, A> {
  return {
    exito,
    nodoMeta,
    caminoSolucion: nodoMeta?.caminoSolucion() ?? [],
    estadosSolucion: nodoMeta?.estadosCamino() ?? [],
    nodosGenerados,
    nodosExpandidos,
    nodosPodados,
    fronteraTraza,
    exploradosTraza,
  };
}

export type AlgoritmoId = 'bfs' | 'dfs' | 'ucs' | 'astar' | 'greedy';

export function ejecutarAlgoritmo<S extends Estado, A extends Accion>(
  algoritmo: AlgoritmoId,
  problema: Problema<S, A>,
): ResultadoBusqueda<S, A> {
  switch (algoritmo) {
    case 'bfs':
      return busquedaEnAnchura(problema);
    case 'dfs':
      return busquedaEnProfundidad(problema);
    case 'ucs':
      return busquedaCostoUniforme(problema);
    case 'greedy':
      return busquedaCodiciosa(problema);
    case 'astar':
      return busquedaAEstrella(problema);
  }
}
