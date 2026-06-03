# Cuadre

**POS y cierre de caja para kioscos y almacenes argentinos.** Local-first, offline, PWA instalable.
El kiosquero abre caja, vende con un toque, anota la plata que entra y sale, y al cerrar cuenta el
efectivo: la app le dice si la caja **cuadra, le falta o le sobra**. Mobile-first, pensada para un
Android de gama baja y para usar con el dedo en el mostrador.

Marca: **Verde Cuadre `#0F3D2E`**, tipografías **Cabinet Grotesk** (títulos, Fontshare) + **Inter** (cuerpo, Google Fonts).

---

## Estado del proyecto

| Fase | Qué incluye | Estado |
|---|---|---|
| **A — Núcleo de caja** | Sesión abrir/cerrar obligatoria, bloqueo de venta sin caja, estado siempre visible, movimientos (ingresos/egresos), cierre con descuadre, historial de cajas | ✅ Hecho y verificado |
| **B — Productos** | Categorías + filtro en POS, editar precio al toque (long-press), importar Excel/CSV, lector de fotos con IA (mock), carga rápida desde catálogo precargado | ✅ Hecho y verificado |
| **★ Rentabilidad** | Pestaña **Ganancia**: margen del catálogo (categoría→producto) + **ganancia real** por período (hoy / 7 días). Campo `costo` + snapshot del costo al vender. Editar costo al toque | ✅ Hecho y verificado |
| **C — Panel de venta ágil** | Descuento %, redondeo, atajo F8, búsqueda + lector de barras, múltiples listas de precio | ⏳ Pendiente |
| **D — Backend** | Supabase (auth + sync), permisos, **agente IA real** (fotos + facturas) | ⏳ Pendiente |

Build limpio (`npm run build` pasa el typecheck estricto). Verificado de punta a punta en el navegador.

---

## Arrancar

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción → dist/
npm run preview  # previsualizar el build
```

## Stack y decisiones tomadas

- **Vite 5 + React 18 + TypeScript** · **Tailwind CSS v3** · **Dexie.js** (IndexedDB) · **vite-plugin-pwa**.
- **Tailwind se queda en v3** por ahora (no se migró a v4 — decisión consciente para no romper estilos).
- **Sin backend todavía.** Todo es local-first con Dexie. Supabase + MercadoPago + IA son de la **Fase D**.
- **El agente que lee fotos de cuaderno está MOCKEADO** (`src/features/productos/importar/parseFoto.ts`): hoy devuelve datos de ejemplo. La interfaz (`File → Promise<FilaImportada[]>`) ya está fija; enchufar la **Claude API (visión)** vía una **Supabase Edge Function** es cambiar solo el cuerpo de esa función. La API key vive en el backend, nunca en la PWA. Por eso importar por foto necesitará internet; **vender sigue 100% offline**.
- **Planes (a futuro):** **Pro** = dashboard básico, lindo y simple. **Full** = dashboard ejecutivo avanzado + AFIP + permisos.

## La caja (el núcleo)

```
esperado   = montoInicial + ventasEfectivo + ingresos − egresos
diferencia = contado − esperado     →  0: cuadra · >0: sobra · <0: falta
```

No se puede vender sin una caja abierta. El contado incluye el fondo inicial. Las ventas por
**transferencia** no entran a la caja física (se muestran aparte). El cierre del onboarding es una
versión simplificada (solo vendido vs. contado) para el "ajá" inicial.

## Pantallas (estado actual)

- **Vender** (home): gate de caja (si no hay caja abierta, "Abrir caja"); con caja: barra de estado, chips de categoría, grid de productos (long-press = editar precio), ticket en vivo, medio de pago (efectivo/transferencia), Cobrar. Engranaje arriba = Ajustes.
- **Caja**: abrir/cerrar sesión, estado (fondo / en caja), movimientos de efectivo, resumen del día.
- **Productos**: lista por categoría · 3 vías para cargar → **⚡ Cargar del catálogo** (rápido), **📥 Importar de Excel o foto** (masivo), **+** (manual). Editar/borrar. Categorías que se crean al vuelo. El alta manual ahora guarda **costo** y **categoría** (antes el alta manual se comía la categoría).
- **Ganancia** (dashboard): selector de período (hoy / últimos 7 días). Arriba, **ganancia real** del período (vendido, costo, ganancia, margen %); abajo, **margen del catálogo** por categoría → producto. Tocás un producto y le ponés el costo ahí mismo. Necesita que los productos tengan `costo` cargado.
- **Historial**: cajas cerradas con su descuadre y detalle (apertura/cierre, fondo, ventas, ingresos, salidas, esperado, contado).
- **Ajustes**: nombre del kiosco, fondo inicial por defecto, ir a productos, empezar de cero.

## Modelo de datos (Dexie v3)

Tablas sincronizables llevan `uuid · updatedAt · dirty · deleted` (listo para el sync de la Fase D, last-write-wins).

- **productos**: `id, nombre, precio, costo?, emoji?, categoriaUuid?, codigoBarras?`
- **categorias**: `id, uuid, nombre, orden, emoji?`
- **ventas**: `id, fecha, items[{ productoId, nombre, precio, costo?, cantidad }], total, medioPago, cajaUuid` — el `costo` se copia al vender (snapshot) para que la ganancia histórica no cambie si después tocás el costo.
- **cajas** (sesiones): `id, uuid, estado, montoInicial, abiertaEn, cerradaEn?, ventasEfectivo, ventasTransferencia, ingresosEfectivo, egresosEfectivo, esperadoEfectivo, contadoEfectivo, diferencia, estadoCuadre`
- **movimientos**: `id, uuid, cajaUuid, tipo (ingreso|egreso), monto, categoria, nota?, fecha`
- **config**: `nombreKiosco, fondoInicial, onboardingCompletado`

> Migración: las tablas v1 `egresos`/`cierres` quedaron reemplazadas por `movimientos`/`cajas`. Dexie migra v1→v2→v3 sin perder datos. El `costo` (productos) y el `costo` snapshot (items de venta) son campos **no indexados**: se sumaron sin bump de schema (sigue en **v3**); los productos viejos quedan sin costo hasta que se lo cargues.

## Carga de productos (3 vías, "subida al 200%")

1. **Catálogo precargado** (`src/data/catalogoPrecargado.ts`): **17 categorías, ~230 productos** de kiosco/almacén argentino. Tocás los que vendés (multi-select por categoría) → "Agregar N" → alta masiva en segundos. Detecta duplicados; precio y **costo opcional** editables inline.
2. **Excel/CSV** (`importar/parseExcel.ts`): 100% local (SheetJS, carga diferida). Autodetecta columnas (nombre, precio, **costo**, categoría, código) → preview editable → alta masiva.
3. **Foto del cuaderno** (`importar/parseFoto.ts`): mismo flujo; hoy mock, en Fase D se conecta a la IA.

## Estructura

```
src/
├─ db/            Dexie: db.ts, types.ts, config.ts, productos.ts, ventas.ts, cajas.ts, movimientos.ts, categorias.ts
├─ lib/           Lógica pura: caja.ts (cuentas del cierre), cierre.ts (estados), rentabilidad.ts (márgenes + ganancia), fecha.ts, format.ts, medios.ts, uuid.ts
├─ data/          catalogoInicial.ts (onboarding), catalogoPrecargado.ts (carga rápida)
├─ components/    UI compartida: Header, BottomNav, Sheet, InputPlata, ResultadoCierre, Iconos, Logo, Pantalla
└─ features/      onboarding · pos · caja · productos (+ importar/) · dashboard · resumen · historial · ajustes
                  Cada feature con su *.copy.ts (todos los textos, en rioplatense informal).
```

## Deploy

- Repo: **github.com/lucianobrocchi/cuadre** (privado). `netlify.toml` ya configurado (build `npm run build`, publish `dist`).
- **Pendiente:** conectar el repo en Netlify (**Add new site → Import from GitHub → cuadre**). Desde ahí, cada push publica solo. (Un intento previo con Netlify Drop quedó incompleto — usar el deploy desde el repo.)
- Como es HTTPS, ahí sí se **instala como app** (Add to Home Screen) y anda **offline**.

---

## Roadmap (lo que sigue, en orden acordado)

1. ✅ **Dashboard de rentabilidad** *(hecho y verificado)* — pestaña **Ganancia**: margen del catálogo (por categoría y por producto) + **ganancia real** del período (hoy / 7 días). Se agregó `costo` a `Producto` y un **snapshot del costo** en cada venta (la ganancia histórica no cambia si después tocás el costo; las ventas viejas usan el costo actual como respaldo). El costo se carga/edita desde el form de producto y desde el propio dashboard.
   - El `costo` se carga **producto por producto** (form / dashboard), en la **carga rápida del catálogo** (campo opcional al seleccionar) y en la **importación Excel/foto** (autodetecta la columna *costo* y se edita en el preview).
   - **Pro**: este dashboard, lindo y simple. **Full**: ejecutivo avanzado (tendencias, comparativas por semana/mes).
2. **Historial de ventas de la semana** — vista de los últimos 7 días.
3. **Onboarding rework** — se retoma cuando la app esté más terminada (decisión del usuario).
4. **Fase C — panel de venta ágil**: descuento %, redondeo auto/manual, atajo **F8** para cobrar, búsqueda + **lector de barras** (el campo `codigoBarras` ya existe), **múltiples listas de precio** (Minorista/Mayorista).
5. **Fase D — backend**: Supabase (auth + sync last-write-wins), **permisos granulares**, y el **agente IA real** (fotos de cuaderno + lectura de facturas con la Claude API).
6. **Integraciones**: AFIP (factura electrónica), ticketera térmica, pago a proveedor desde el POS, etiquetas para góndola, **control de fiados**.

## Para retomar en otra conversación

- Todo el código está en el repo (`main`). Build verificado.
- **Dashboard de rentabilidad: hecho.** Lógica pura en `src/lib/rentabilidad.ts`, pantalla en `src/features/dashboard/`.
- **Costo en la carga masiva: hecho.** Autodetección de la columna `costo` en `parseExcel.ts` + campo editable en el preview; costo opcional al seleccionar en `CargarCatalogo.tsx`. `catalogoPrecargado.ts` **no** trae costos de referencia (los pone el comerciante).
- Próximo paso natural: **historial de ventas de la semana** (roadmap #2).
- El catálogo precargado se edita en `src/data/catalogoPrecargado.ts`.
- Convención: textos de UI siempre en archivos `*.copy.ts` por feature; español rioplatense informal (vos, tocá, cargá, la plata).
