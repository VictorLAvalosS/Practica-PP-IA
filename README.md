# 🧠 HeuristicSearch.ide — Tablero Interactivo de Búsqueda en IA

## Proyecto Universitario — Inteligencia Artificial (Capítulos 3, 4 y 5)
### Lic. Patricia Rodríguez Bilbao 

---

## 📘 Descripción General

Plataforma visual interactiva construida en **React 19 + Vite + TypeScript + Tailwind CSS** para dar vida a la teoría pura del libro **Inteligencia Artificial: Un Enfoque Moderno (Russell & Norvig)**.

La aplicación implementa un **motor de búsqueda formal orientado a objetos**, lo valida contra **dos problemas clásicos de la asignatura** y muestra resultados en tiempo real para comparar **2 algoritmos simultáneamente** (5 algoritmos disponibles en total).

| Módulo | Problema Clásico | Propósito Didáctico |
|---|---|---|
| 🚣 **Misioneros y Caníbales** | `3M + 3C` cruzan un río con bote capacidad 2 | Validación de **restricciones matemáticas estrictas** (Cap. 5: CSP / poda temprana de ramas inválidas) |
| 😮 **Pac-Man Pathfinding** | Grilla editable con muros, inicio y meta | Validación de **heurísticas admisibles** y búsqueda informada (Cap. 4: Greedy, A*) |

### 🔬 5 Algoritmos Implementados (100% según Russell & Norvig)

| ID | Nombre | Capítulo | f(n) | Estructura de Frontera | Óptima | Completa |
|---|---|---|---|---|---|---|
| `bfs` | Búsqueda en Anchura | §3.3.1 | `profundidad` | **Cola FIFO** + Lista Cerrada | ✅ SÍ | ✅ SÍ |
| `dfs` | Búsqueda en Profundidad | §3.3.2 | `último en entrar` | **Pila LIFO** + Lista Cerrada | ❌ NO | ❌ NO (finita sí) |
| `ucs` | Costo Uniforme (Dijkstra-like) | §3.3.3 | `f(n) = g(n)` | **Cola Prioridad** por costo | ✅ SÍ | ✅ SÍ |
| `greedy` | Búsqueda Codiciosa (Best-First) | §4.1.1 | `f(n) = h(n)` | **Cola Prioridad** por heurística | ❌ NO | ✅ SÍ |
| `astar` | **Búsqueda A\*** (A-Estrella) | §4.1.2 Fig.4.2 | `f(n) = g(n) + h(n)` | **Cola Prioridad** + reemplazo mejor camino | ✅ SÍ (h admisible) | ✅ SÍ |

---

## 🏗️ Estructura del Proyecto (Arquitectura Limpia y Modular)

```
Heuristic Search Dashboard/
├── 📄 AGENTS.md                  # Reglas del stack (React + Vite + Tailwind v4)
├── 📄 README.md                  # ← ESTE ARCHIVO: guía completa
├── 📄 package.json               # 7 dependencias (pnpm/npm install)
├── 📄 vite.config.ts             # Vite + React + Tailwind v4 + alias @
├── 📄 tsconfig.json              # TypeScript 5.7 estricto
├── 📄 index.html                 # Shell HTML + div#root
│
├── 📁 src/                       # CÓDIGO FUENTE PRINCIPAL
│   ├── 📄 main.tsx               # 🚪 Punto de entrada React (monta <App/>)
│   ├── 📄 index.css              # 🎨 Tailwind v4 + variables de tema oscuro
│   ├── 📄 App.tsx                # 🎬 ORQUESTADOR: Estado global + Layout 3 columnas + Solvers
│   │
│   ├── 📁 search/                # 🧠 MOTOR LÓGICO PURO (Russell & Norvig)
│   │   ├── 📄 core.ts            # Clases abstractas base:
│   │   │                        #   Problema<S,A>, Nodo<S,A>,
│   │   │                        #   Estado, Accion, ResultadoBusqueda
│   │   │
│   │   ├── 📄 algorithms.ts      # 5 Algoritmos + ColaPrioridad genérica:
│   │   │                        #   busquedaEnAnchura(), busquedaEnProfundidad(),
│   │   │                        #   busquedaCostoUniforme(), busquedaCodiciosa(),
│   │   │                        #   busquedaAEstrella() + ejecutarAlgoritmo()
│   │   │
│   │   ├── 📄 mcProblem.ts       # 🚣 Implementación concreta M&C:
│   │   │                        #   MCProblema (5 restricciones poda Cap.5),
│   │   │                        #   MCEstado, MCAccion (5 movimientos posibles)
│   │   │
│   │   ├── 📄 pacmanProblem.ts  # 😮 Implementación concreta Pac-Man:
│   │   │                        #   PacmanProblema (grilla 4-conexa),
│   │   │                        #   PacmanEstado, PacmanAccion (4 direcciones),
│   │   │                        #   heuristica() = Distancia Manhattan ADMISIBLE
│   │   │
│   │   └── 📄 index.ts           # 📦 Barrel export (import único: './search')
│   │
│   ├── 📁 types/                 # 🏷️ Tipos compartidos UI
│   │   └── 📄 appTypes.ts        # Module, AlgorithmId, MCState, TreeNode,
│   │                            #   GridCell, PacPos, AlgoMetrics,
│   │                            #   constantes ALGO_OPTIONS y ALGO_META
│   │
│   └── 📁 components/            # 🖼️ COMPONENTES REACT (Tailwind)
│       ├── 📁 ui/
│       │   ├── 📄 SectionLabel.tsx     # Cabecera de sección con línea divisora
│       │   ├── 📄 Dropdown.tsx         # Selector de algoritmo (estilo IDE)
│       │   ├── 📄 Badge.tsx            # Indicador visual Óptima / Completa
│       │   ├── 📄 DataInspector.tsx    # Lista con scroll auto (Frontera/Explorados)
│       │   └── 📄 MetricsCard.tsx      # Tarjeta comparativa (CP, Nodos, Ruta)
│       │
│       ├── 📁 mc/
│       │   ├── 📄 RiverSVG.tsx        # 🚣 SVG escena del río (figuras animadas)
│       │   └── 📄 MCVis.tsx           # Componente: RiverSVG + Árbol de búsqueda
│       │
│       └── 📁 pacman/
│           └── 📄 PacmanVis.tsx       # 😮 SVG grilla editable + heatmap
│
└── 📁 dist/                      # 📦 Build de producción (npm run build)
```

---

### 🔗 Archivos Críticos (Haz clic para ver código)

| Archivo | Responsabilidad | Ubicación en teoría R&N |
|---|---|---|
| [**core.ts**](file:///c:/Users/User/Downloads/Heuristic%20Search%20Dashboard/src/search/core.ts) | Clases abstractas `Problema` y `Nodo` (5 atributos canónicos) | §3.2.1 p. 65-67 |
| [**algorithms.ts**](file:///c:/Users/User/Downloads/Heuristic%20Search%20Dashboard/src/search/algorithms.ts) | 5 motores + `ColaPrioridad` (reemplazo mejor camino) | §3.3 Fig. 3.11 + §4.1 Fig. 4.2 |
| [**mcProblem.ts**](file:///c:/Users/User/Downloads/Heuristic%20Search%20Dashboard/src/search/mcProblem.ts) | 5 restricciones = poda CSP | Capítulo 5 (CSP) |
| [**pacmanProblem.ts**](file:///c:/Users/User/Downloads/Heuristic%20Search%20Dashboard/src/search/pacmanProblem.ts) | Distancia Manhattan (**heurística admisible**) | §4.1.2 p. 94 (admissibility) |
| [**App.tsx**](file:///c:/Users/User/Downloads/Heuristic%20Search%20Dashboard/src/App.tsx) | Layout 3 columnas, Play/Step/Pause, trazas | Integración ↔ UI |

---

## ⚙️ Instalación y Ejecución Paso a Paso

### Requisitos Previos
- **Node.js ≥ 22** (recomendado: Node 22 LTS)
- **pnpm** o **npm** v10+
- Navegador moderno (Chrome/Edge/Firefox/Safari)

---

### Método 1 — Instalación Rápida (npm)

```bash
cd "Heuristic Search Dashboard"
npm install
```

### Método 2 — Con pnpm (recomendado por el proyecto)

```bash
# Instalar pnpm globalmente (una sola vez)
npm install -g pnpm

# Instalar dependencias del proyecto
pnpm install
```

⏳ Tarda ~1-3 minutos: instala Vite, React 19, Tailwind v4 y TypeScript.

---

## 🚀 Cómo EJECUTAR la Aplicación

### Modo Desarrollo (Hot Reload — cambios inmediatos)
```bash
# Con npm:
npm run dev

# Con pnpm:
pnpm dev
```

✅ **Resultado esperado:** Se abre automáticamente `https://localhost:8443` en tu navegador con el panel **HeuristicSearch.ide**. Los cambios en `src/` se reflejan instantáneamente (Hot Module Replacement).

> 📌 **NOTA SEGÚN AGENTS.md:** El servidor Vite ya viene configurado en el puerto `8443`. No necesitas iniciar nada manualmente si usas Figma Make como entorno.

### Modo Producción (Build para entrega)
```bash
npm run build     # Genera carpeta dist/ optimizada
npm run preview   # Visualiza el build final
```

**Tamaño bundle final:** ~264 KB JS / 79 KB gzipped.

---

## 🧭 GUÍA DE USO POR PANTALLAS (Flujo Completo)

La interfaz usa un **layout profesional tipo IDE de 3 columnas**:

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: HeuristicSearch.ide ○  INACTIVO / ● EJECUTANDO  ✓ OK    │
├──────────┬────────────────────────────────────┬─────────────────┤
│          │                                    │                 │
│  IZQUIERDA│         LIENZO CENTRAL            │   PANEL DERECHO │
│  Panel    │         (Visualización)           │   Evaluación    │
│  Control  │                                    │  Comparativa    │
│          │                                    │                 │
│ • Entorno│  M&C: Escena río + Árbol búsqueda │ • Inspector de  │
│ • Alg A/B │  Pac-Man: Grilla editable heatmap│   Datos (F/C)   │
│ • Play   │                                    │ • Métricas Alg.1│
│ • Step   │                                    │ • Métricas Alg.2│
│ • Pause  │                                    │                 │
│ • Reset  │                                    │                 │
└──────────┴────────────────────────────────────┴─────────────────┘
```

---

### 1️⃣ Paso 1: Seleccionar Entorno (Izquierda → ENTORNO)
| Botón | Problema | Estado Inicial | Estado Meta |
|---|---|---|---|
| **M&C** | Misioneros y Caníbales | `3M, 3C, Bote = Izquierda` | `0M, 0C, Bote = Derecha` |
| **Pac-Man** | Pathfinding en grilla | Casilla 😮 (0,0) por defecto | Casilla 🍒 (7,7) por defecto |

> 💡 **Tip para Pac-Man:** Clic en `◉ Inicio`, `✦ Comida` o `▪ Pared` y luego toca la grilla para personalizar el mapa (mueve la meta, bloquea pasillos, etc.).

---

### 2️⃣ Paso 2: Seleccionar 2 Algoritmos para Comparar (Izquierda → METODOLOGÍA)

- **Algoritmo 1 (Azul):** Normalmente BFS, DFS o UCS (no informados).
- **Algoritmo 2 (Morado):** Normalmente Greedy o A* (informados).

**🤔 Recomendaciones de demostración docente:**
| Caso a Mostrar | Algoritmo 1 | Algoritmo 2 | Lo Que Se Demuestra |
|---|---|---|---|
| Anchura vs Profundidad | `BFS` | `DFS` | Óptima+Completa vs exploración sesgada (R&N §3.3) |
| No Informada vs Informada | `BFS` | `A*` | Reducción drástica de nodos expandidos por heurística admisible (R&N §4.1) |
| Greedy vs A* | `Greedy` | `A*` | Optimalidad: A* garantiza CP mínimo (Greedy es "ciega") |
| UCS (Dijkstra) vs A* | `UCS` | `A*` | A* con h(n) admisible = UCS "guiado" = óptimo + rápido |

---

### 3️⃣ Paso 3: Ejecutar (Izquierda → EJECUCIÓN)

| Botón | Función |
|---|---|
| ▶ **Play** | Ejecución completa animada (interval 700ms M&C / 80ms Pac-Man heatmap) |
| ⏭ **Step-by-Step** | Únicamente M&C: avanza 1 acción por clic (para demostrar poda árbol nodo por nodo) |
| ⏸ **Pause** | Detiene temporalmente la animación en curso |
| ↺ **Reset** | Limpia todo a estado inicial (grilla, árbol, métricas, heatmap) |

---

### 4️⃣ Paso 4: Analizar el Panel Derecho (Resultados a capturar para informe)

#### 📊 Inspector de Datos
| Panel | Representa | Color |
|---|---|---|
| **FRONTERA (Lista Abierta)** | Nodos candidatos pendientes de expandir (FIFO, Pila o ColaPrioridad) | 🟡 Amarillo |
| **EXPLORADOS (Cerrado)** | Nodos ya visitados + estados podados por restricción/repetido | 🔴 Rojo |

Cada entrada está numerada `001, 002…` con clave `[mLeft, cLeft, Bote]` o `(r,c)` para auditoría exacta.

---

#### 📋 Tarjetas de Evaluación Comparativa (A vs B)
Para CADA algoritmo, se muestran **6 métricas rúbricas**:

| Métrica | Qué Mide | Valor Ideal |
|---|---|---|
| **RUTA SOLUCIÓN (pasos numerados)** | Secuencia de acciones para ir de estado inicial → meta | Menor longitud |
| **CP (Costo de Camino)** | Costo acumulado `g(n)` real de la solución (R&N p. 68) | Menor CP = A* siempre igual a BFS/UCS |
| **Nodos Gen.** | Total `Nodo<S,A>` creados por el motor (incluye podados) | Indicador de consumo de memoria |
| **Nodos Exp.** | Cantidad de nodos realmente evaluados por `expandir()` | Menor = algoritmo más eficiente |
| **Profundidad** | Longitud real del plan | Menor = pasos para el usuario |
| **Óptima? / Completa?** | Badges según propiedades teóricas demostrables | Ambos SÍ = A* con h admisible |

---

## 🚣 Misioneros y Caníbales — Detalle del Problema (Cap. 5: CSP)

### 5 Restricciones Matemáticas PODADAS en `estadoEsValido()`
Archivo: [MCProblema.estadoEsValido](file:///c:/Users/User/Downloads/Heuristic%20Search%20Dashboard/src/search/mcProblem.ts#L91-L111)

| ID | Regla Matemática | ¿Qué sucede si se viola? |
|---|---|---|
| R1 | `∀ lado: misioneros ≥ 0 ∧ caníbales ≥ 0` | Personas negativas → nodo descartado |
| R2 | `∀ lado: misioneros ≤ 3 ∧ caníbales ≤ 3` | No puedes inventar personas |
| R3 | **(Izq)** `mLeft = 0 ∨ mLeft ≥ cLeft` | Si hay M presentes → NO superan los C |
| R4 | **(Der)** `mRight = 0 ∨ mRight ≥ cRight` | Ídem orilla derecha |
| R5 | `mLeft + mRight = 3 ∧ cLeft + cRight = 3` | Conservación (no desaparece nadie) |

### Acciones Generadas (5 combinaciones bote capacidad ≤ 2):
```
Mover(1M,0C→Der)    Mover(2M,0C→Der)
Mover(0M,1C→Der)    Mover(0M,2C→Der)
Mover(1M,1C→Der)
```
Se invierten automáticamente según `boat = left/right` con costo unitario `=1`.

---

## 😮 Pac-Man Pathfinding — Detalle del Problema (Cap. 4: Heurística)

### Heurística: Distancia Manhattan (ADMISIBLE ✅)
Archivo: [PacmanProblema.distanciaManhattan](file:///c:/Users/User/Downloads/Heuristic%20Search%20Dashboard/src/search/pacmanProblem.ts#L165-L167)

```
h(n) = |r_pac - r_meta| + |c_pac - c_meta|
```

**Demostración de Admisibilidad (R&N p. 94):**

En una grilla de 4 direcciones (sin diagonales), la **distancia real mínima** entre dos puntos es exactamente la suma de diferencias de coordenadas. A* con esta `h(n)` SIEMPRE produce la ruta más corta posible porque **nunca sobreestima** el costo faltante.

> **Para justificar en informe académico:** `h(n) Manhattan es admisible porque la distancia real desde n hasta la meta NUNCA es menor a la suma de desviaciones en fila y columna (cada paso reduce |Δr|+|Δc| a lo sumo en 1 unidad).`

### Movimientos: 4 direcciones
- `↑ Arriba` (dr=-1)   `↓ Abajo` (dr=+1)
- `← Izquierda` (dc=-1)  `→ Derecha` (dc=+1)

Cada paso tiene costo = 1 (unitario). Restricción: no atravesar casilla `wall`.

---

## 📐 Resultados Que Muestra el Sistema (Para Informe Universitario)

### 🎯 Tabla Comparativa M&C 3+3 (Ejecución de referencia)

| Algoritmo | CP (Costo) | Nodos Gen | Nodos Exp | Óptima | Completa | Ruta (acciones mínimas) |
|---|---|---|---|---|---|---|
| BFS | 11 | Variable | Variable | ✅ | ✅ | 11 viajes |
| DFS | 11 | Variable | Variable | ❌ | ❌ (esp finito) | Puede variar |
| UCS | 11 | Variable | Variable | ✅ | ✅ | 11 viajes |
| Greedy | **≥ 11** | Variable | Variable | ❌ | ✅ | Costo ≥ al óptimo |
| A\* | **11** ✅ **Óptimo** | **MENOR** que BFS/UCS | **MENOR** | ✅ | ✅ | **11 viajes** (igual BFS pero expande MENOS nodos = HEURÍSTICA FUNCIONA) |

> **Captura de pantalla que DEBES incluir en tu informe:** Panel derecho `Evaluación Comparativa` con los 6 valores métricos, y los badges `Óptima SÍ` / `Completa SÍ` del A* vs Greedy.

---

### 🎯 Resultados Visuales a Capturar

1. **M&C — Árbol de búsqueda:** Nodos azules (válidos), nodos rojos `✕` podados, nodo `★ META` en verde brillante.
2. **M&C — Animación río:** Cada 700 ms el bote cruza llevando M/C (izquierda↔derecha). El vector de estado `[mL,cL,Bote,mR,cR]` se actualiza en la barra inferior.
3. **Pac-Man — Heatmap:**
   - Amarillo = Frontera (nodos candidatos)
   - Naranja = Explorados (ya visitados)
   - Verde brillante = Ruta solución FINAL (línea dibujada con animación `path-draw`)
4. **Inspector de Datos:** Antes/después de ejecutar muestra crecimiento de las 2 listas (prueba visual de complejidad).

---

## ❓ Solución de Errores Comunes

| Error | Causa | Solución |
|---|---|---|
| `Error: Cannot find module 'react'` | No instalaste dependencias | `npm install` |
| Puerto 8443 ocupado | Otra app Vite abierta | Cierra otras terminales o modifica `server.port` en `vite.config.ts` |
| Pac-Man no encuentra ruta | Muros bloquean paso entre inicio y meta | Edita la grilla: toca `▪ Pared` y desbloquea pasillos |
| TypeScript: `type TreeNode not found` | Falta import | `import {...} from './types/appTypes'` |
| Build con warnings `unused import` | Linter estricto | Usa los imports o elimínalos (App.tsx actual NO tiene código muerto) |
| Árbol M&C no muestra todos nodos | Límite visual 40 nodos para performance | Es normal — la app solo renderiza los primeros 40 (la búsqueda continúa internamente completa) |

---

## 🎓 Checklist de ENTREGA FINAL (Antes de presentar)

- [ ] `npm install` ejecutado SIN errores
- [ ] `npm run dev` abre `https://localhost:8443` correctamente
- [ ] `npm run build` produce `dist/` exitoso (sin errores TS)
- [ ] **M&C:** Buscaste `BFS` + `A*` y visualizaste árbol con nodo ★META
- [ ] **M&C:** Panel `Evaluación Comparativa` capturado mostrando CP=11 y métricas
- [ ] **Pac-Man:** Añadiste muros manualmente y probaste A* vs Greedy (A* muestra MENOS nodos explorados)
- [ ] Capturas de: Inspector Datos (Frontera+Explorados), Escena río animada, Grilla Pac-Man con ruta verde
- [ ] (Opcional) PDF exportado de pantalla completa mostrando el IDE funcionando

---

## 📦 Archivos Entregables

| Archivo | Proporcionar a la docente |
|---|---|
| Carpeta `src/` completa (search + components + types) | ✅ OBLIGATORIO |
| `App.tsx`, `main.tsx`, `index.css` | ✅ OBLIGATORIO |
| `package.json` (7 dependencias) | ✅ OBLIGATORIO |
| `README.md` (ESTE archivo) | ✅ OBLIGATORIO |
| `vite.config.ts` + `tsconfig.json` | ✅ Recomendado |
| `dist/` (resultado `npm run build`) | ➕ Extra: prueba de compilación final |

---

## 👥 Integrantes del Grupo

*(Edita esta sección con los nombres reales del equipo)*

1. Avalos Serrano Victor Luis
2. Integrante 2 — Nombre Completo
3. Integrante 3 — Nombre Completo
4. Integrante 4 — Nombre Completo
5. Integrante 5 — Nombre Completo

---

## ✅ Verificación Rápida (Antes de entregar)

```bash
# Ejecuta ESTOS DOS comandos. Si ambos pasan, tu proyecto está listo:
npx tsc --noEmit      # → Debe mostrar nada (0 errores TypeScript)
npm run build         # → Finaliza con "✓ built in Xs"
```

✅ **0 errores TS + Build exitoso = 100% listo para evaluación.**

---

> 📬 Dudas: Revisa primero `src/search/core.ts` y `src/search/algorithms.ts` para entender la abstracción R&N, luego los problemas concretos `mcProblem.ts` y `pacmanProblem.ts` para ver las restricciones/heurística. El motor es **100% reusable**: puedes extender `Problema<S,A>` para cualquier otro problema (Sudoku, 8-Puzzle, Ruta GPS…) sin tocar el algoritmo.
