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
| **★ Negocio** (centro de control) | Pestaña **Negocio**: **caja en vivo** (efectivo ahora), panel de plata por período (hoy / 7 / 30 días) con **comparativa** vs período anterior, **flujo** (ingresos/egresos/neto), **tendencia 30 días** + **mejores horas** (gráficos SVG), **inteligencia de productos** (más vendidos / más rentables / alertas: pierden plata · sin movimiento), **insights** automáticos y **margen del catálogo** (ex Ganancia, con editar costo). | ✅ Hecho |
| **C — Panel de venta ágil** | Búsqueda + **lector de barras** en el POS, **descuento %**, **redondeo**, atajo **F8** para cobrar, **listas de precio** (Minorista/Mayorista) | ✅ Hecho |
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
- **Productos**: lista **agrupada por categoría** (con el costo de cada uno). Un solo botón **Agregar productos** abre un hub con las 3 vías → **⚡ del catálogo** (con buscador y "agregar toda la categoría"), **📥 Excel o foto**, **✏️ uno a mano**. Editar/borrar; categorías que se crean al vuelo. El alta manual guarda **costo** y **categoría**.
- **Negocio** (centro de control, ex Ganancia + mucho más): lo primero arriba es la **caja en vivo** (efectivo que tendría que haber ahora). Después, selector de período (hoy / 7 / 30 días) que manda en: **hero** de ganancia (o vendido si faltan costos) con **comparativa** vs período anterior; **KPIs** (ticket promedio, ventas, efectivo, transferencia); **flujo de efectivo** (ingresos/egresos/neto); **insights** automáticos en lenguaje claro. Siempre visibles: **tendencia de 30 días** y **mejores horas** (gráficos de barras SVG, sin dependencias), **inteligencia de productos** (más vendidos · más rentables · alertas de los que pierden plata y los que no se mueven), **inventario** (plata invertida a costo y a precio de venta, unidades en mano, qué reponer y qué se acabó) y el **margen del catálogo** por categoría→producto (tocás y le ponés el costo). Analítica pura en `src/lib/negocio.ts` y `src/lib/stock.ts`.
- **Stock** (opt-in por producto): se activa con un toggle al cargar/editar un producto (unidades en mano + umbral de aviso). Se **descuenta solo al vender** y se **devuelve al anular**. El POS muestra "quedan N" / "sin stock" en la card; la lista de Productos muestra un badge por color.
- **Historial**: dos vistas (control segmentado). **Ventas** (por defecto): las ventas de los **últimos 7 días** agrupadas por día — total de la semana (vendido, efectivo/transferencia, ganancia) y una tarjeta por día (total + ganancia); tocás un día y ves cada ticket (hora, medio de pago, ítems). **Cajas**: cajas cerradas con su descuadre y detalle (apertura/cierre, fondo, ventas, ingresos, salidas, esperado, contado).
- **Ajustes**: nombre del kiosco, fondo inicial por defecto, ir a productos, **cargar datos de demo** (~14 días de ventas/cierres para ver la app llena), y empezar de cero (borra todo: productos, categorías, ventas, cajas y movimientos).

## Modelo de datos (Dexie v4)

Tablas sincronizables llevan `uuid · updatedAt · dirty · deleted` (listo para el sync de la Fase D, last-write-wins).

- **productos**: `id, nombre, precio, costo?, precioMayor?, emoji?, categoriaUuid?, codigoBarras?, stock?, stockMin?` — `precioMayor` es la lista mayorista (fallback al `precio`); `stock` es **opt-in**: si está, se descuenta al vender (y se devuelve al anular) y dispara alertas de bajo/sin stock; `stockMin` es el umbral de aviso (default `STOCK_MIN_DEFAULT = 3`). Campos no indexados.
- **categorias**: `id, uuid, nombre, orden, emoji?`
- **ventas**: `id, fecha, items[{ productoId, nombre, precio, costo?, cantidad }], total, medioPago (efectivo|transferencia|fiado), cajaUuid` — el `costo` se copia al vender (snapshot) para que la ganancia histórica no cambie si después tocás el costo.
- **cajas** (sesiones): `id, uuid, estado, montoInicial, abiertaEn, cerradaEn?, ventasEfectivo, ventasTransferencia, ingresosEfectivo, egresosEfectivo, esperadoEfectivo, contadoEfectivo, diferencia, estadoCuadre`
- **movimientos**: `id, uuid, cajaUuid, tipo (ingreso|egreso), monto, categoria, nota?, fecha`
- **clientes** (fiados): `id, uuid, nombre, telefono?`
- **cuentas** (cuenta corriente): `id, uuid, clienteUuid, tipo (cargo|pago), monto, fecha, ventaId?, medioPago?, nota?` — saldo del cliente = Σ cargos − Σ pagos.
- **config**: `nombreKiosco, fondoInicial, onboardingCompletado`

> Migración: las tablas v1 `egresos`/`cierres` quedaron reemplazadas por `movimientos`/`cajas`. Dexie migra v1→v4 sin perder datos. **v4** suma `clientes`/`cuentas` (fiados). El `costo` (productos), el `costo` snapshot (items) y `stock`/`stockMin` son campos **no indexados** (se suman sin tocar el resto del schema). Una **venta fiada** (`medioPago: 'fiado'`) suma a "vendido" pero **no** a efectivo/transferencia ni a la caja; cuando el cliente paga en efectivo con caja abierta, ese pago entra como **ingreso de caja** para que el cierre cuadre.

## Carga de productos (3 vías, "subida al 200%")

Las 3 vías viven en un hub único **Agregar productos** (`Productos.tsx`), en vez de botones sueltos.

1. **Catálogo precargado** (`src/data/catalogoPrecargado.ts`): **17 categorías, ~230 productos** de kiosco/almacén argentino. Tocás los que vendés (por categoría, con **buscador** sobre todo el catálogo y botón **"agregar toda la categoría"**) → "Agregar N" → alta masiva en segundos. Detecta duplicados; precio y **costo opcional** editables inline.
2. **Excel/CSV** (`importar/parseExcel.ts`): 100% local (SheetJS, carga diferida). Autodetecta columnas (nombre, precio, **costo**, categoría, código) → preview editable → alta masiva.
3. **Foto del cuaderno** (`importar/parseFoto.ts`): mismo flujo; hoy mock, en Fase D se conecta a la IA.

## Estructura

```
src/
├─ db/            Dexie: db.ts, types.ts, config.ts, productos.ts, ventas.ts, cajas.ts, movimientos.ts, categorias.ts, demo.ts (datos de ejemplo)
├─ lib/           Lógica pura: caja.ts (cuentas del cierre), cierre.ts (estados), rentabilidad.ts (márgenes + ganancia), fecha.ts, format.ts, medios.ts, uuid.ts
├─ data/          catalogoInicial.ts (onboarding), catalogoPrecargado.ts (carga rápida)
├─ components/    UI compartida: Header, BottomNav, Sheet, InputPlata, ResultadoCierre, Iconos, Logo, Pantalla
└─ features/      onboarding · pos · caja · productos (+ importar/) · negocio · resumen · historial · ajustes
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
2. ✅ **Historial de ventas de la semana** *(hecho)* — pestaña **Historial** → vista **Ventas**: los últimos 7 días agrupados por día, con total de la semana y el detalle de cada ticket. Lógica pura en `src/lib/historialVentas.ts`.
3. ✅ **Onboarding rework** *(hecho)* — flujo: nombre → elegir del catálogo **por categorías** con **costo opcional** → venta de práctica → primer cierre → cierra invitando a la pestaña **Ganancia**. Persiste categoría + costo al terminar (`src/features/onboarding/`, catálogo curado en `catalogoInicial.ts`).
4. ✅ **Fase C — panel de venta ágil** *(hecho)* — **búsqueda + lector de barras** en el POS (Enter agrega el match exacto por código o el único resultado), **descuento %** (chips 0/5/10/15) y **redondeo** al múltiplo de 50, atajo **F8** para cobrar, y **listas de precio** Minorista/Mayorista (campo `precioMayor`, toggle que aparece cuando hay precios mayoristas cargados). El descuento/redondeo se reparte en los renglones al guardar (`useTicket.itemsParaCobrar`) para que venta y ganancia queden exactas.
5. **Fase D — backend**: Supabase (auth + sync last-write-wins), **permisos granulares**, y el **agente IA real** (fotos de cuaderno + lectura de facturas con la Claude API).
6. **Integraciones**: AFIP (factura electrónica), ticketera térmica, pago a proveedor desde el POS, etiquetas para góndola. ✅ **Control de fiados** *(hecho)* — clientes con cuenta corriente: fiar desde el POS (botón **Fiar** → elegir/crear cliente), registrar pagos (el pago en efectivo entra a la caja), historial por cliente y total **en la calle** en Negocio. Lógica pura en `src/lib/fiados.ts`.

## Para retomar en otra conversación

- Todo el código está en el repo (`main`). Build verificado.
- **Hecho en esta tanda:** dashboard de rentabilidad (`src/lib/rentabilidad.ts` + `src/features/dashboard/`), costo en toda la carga, **datos de demo** (`src/db/demo.ts`, botón en Ajustes), **productos agrupados por categoría**, **carga 2.0** (hub + buscador + "agregar toda la categoría") y **onboarding 2.0** (con categorías y costos).
- **Para ver la app llena:** Ajustes → "Cargar datos de demo" (~14 días de cajas/ventas/movimientos). No es destructivo; se saca con "empezar de cero".
- Próximo paso natural: **Fase D — backend** (roadmap #5): Supabase (auth + sync last-write-wins), permisos, y el agente IA real (fotos + facturas).
- **Historial de ventas de la semana** ya está hecho (`src/lib/historialVentas.ts` + `src/features/historial/VentasSemana.tsx`; la pestaña Historial ahora tiene las vistas **Ventas** y **Cajas**).
- El catálogo precargado se edita en `src/data/catalogoPrecargado.ts`; el del onboarding en `src/data/catalogoInicial.ts` (`catalogoOnboarding`).
- Convención: textos de UI siempre en archivos `*.copy.ts` por feature; español rioplatense informal (vos, tocá, cargá, la plata).
