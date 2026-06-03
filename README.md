# Cuadre

**El cierre de caja diario de tu kiosco, simple y rápido.** Cargás tus productos, registrás ventas con un toque, anotás la plata que sale durante el día y, al cerrar, contás el efectivo: Cuadre te dice si la caja **cuadra**, te **falta** o te **sobra**.

Mobile-first, pensada para un Android de gama baja, y anda **100% offline**.

## Arrancar

```bash
npm install
npm run dev
```

Abrí la URL que muestra Vite (por defecto `http://localhost:5173`).
Para el build de producción: `npm run build` y `npm run preview`.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS** (Verde Cuadre `#0F3D2E`, tipografías Cabinet Grotesk para títulos + Inter para el cuerpo)
- **Dexie.js (IndexedDB)** para toda la persistencia: local-first, sin backend
- **PWA** con `vite-plugin-pwa`: instalable (Add to Home Screen) y funcional offline

No hay login, ni backend, ni pasarelas de pago. Todo vive en el dispositivo.

## La fórmula del cierre

La app gira alrededor de la **sesión de caja**: se **abre** con un monto inicial, durante el día
acumula ventas y movimientos de efectivo, y se **cierra** contando la plata. **No se puede vender
sin una caja abierta.**

```
esperado   = montoInicial + ventasEfectivo + ingresos − egresos
diferencia = contado − esperado

diferencia = 0  → cuadra
diferencia > 0  → sobra (descuadre sobrante)
diferencia < 0  → falta (descuadre faltante)
```

El **contado** que ingresás incluye el fondo inicial (toda la plata que hay en la caja). Las ventas
por **transferencia** no entran a la caja física, así que no cuentan para el esperado (se muestran aparte).

> El cierre del **onboarding** es una versión simplificada (solo vendido vs. contado, sin fondo ni movimientos), pensada para lograr el "ajá" en 5 minutos. La app real usa la sesión de caja completa de arriba.

## Pantallas

- **Onboarding** (solo la primera vez): bienvenida → cargar productos → venta de práctica → primer cierre.
- **Vender** (home): si no hay caja abierta, **bloquea la venta** y muestra "Abrir caja". Con caja abierta: barra de estado siempre visible (en caja $X), **chips de categoría** para filtrar, grid de productos (mantené presionada una card para **editar su precio al toque**), ticket en vivo, **medio de pago** (efectivo / transferencia) y botón **Cobrar**.
- **Caja**: gestiona la **sesión** — abrir caja, estado (fondo / en caja), **Cerrar caja** (la estrella), **Movimientos de caja** (ingresos y salidas de efectivo) y **Resumen del día**.
- **Resumen del día**: vendido hoy con desglose efectivo/transferencia, ventas, salidas, lo más vendido, y la **lista de ventas del día** (tocás una para ver el detalle y **anularla** si la cargaste mal).
- **Productos**: alta / edición / borrado, con **categorías** (las creás al vuelo desde el formulario). **Importar** masivamente desde **Excel/CSV** (autodetecta columnas) o desde una **foto del cuaderno** con IA → preview editable → carga en segundos.
- **Historial**: **cajas cerradas** con su descuadre y el detalle (apertura/cierre, fondo, ventas, ingresos, salidas, esperado, contado).
- **Ajustes** (engranaje arriba en Vender): editás el **nombre del kiosco**, el **fondo inicial por defecto** (se precarga al abrir la caja), vas a tus productos, o **empezás de cero**.

## Medios de pago y la caja

Cada venta se cobra en **efectivo** o por **transferencia**. La caja física solo cuadra contra el
efectivo, así que el cierre usa `totalVendidoEfectivo`; lo cobrado por transferencia se muestra
aparte (en el resumen y como nota en el cierre) porque no entra al cajón.

## Importación de productos (Excel / foto con IA)

- **Excel/CSV** → 100% local (SheetJS, carga diferida). Autodetecta las columnas (nombre, precio,
  categoría, código) → preview editable → alta masiva. Las categorías nuevas se crean solas.
- **Foto del cuaderno** → mismo flujo, pero la fuente es una imagen. Hoy `parseFoto()` es un **mock**;
  en la Fase D se reemplaza su cuerpo por una llamada a una **Supabase Edge Function** que invoca la
  **Claude API (visión)** y devuelve el catálogo en JSON. La interfaz (`File → Promise<FilaImportada[]>`)
  ya está fija, así que enchufar la IA real no toca la UI. La API key vive en el backend, nunca en la PWA.

## Estructura

```
src/
├─ db/                 Capa Dexie (esquema, tipos y acceso a datos)
│  ├─ db.ts            Definición de la base y tablas (Dexie v2, con migración)
│  ├─ types.ts         Tipos del modelo (Producto, Venta, CajaSesion, Movimiento, Config)
│  ├─ config.ts        Config singleton (nombre, fondo, onboarding) + reset
│  ├─ productos.ts · ventas.ts · cajas.ts · movimientos.ts
├─ lib/                Lógica pura
│  ├─ caja.ts          Cuentas del cierre de caja (esperado / descuadre)
│  ├─ cierre.ts        Estados cuadra/falta/sobra (compartido)
│  ├─ uuid.ts          Claves estables para sync (Fase D)
│  ├─ fecha.ts         Helpers de fechas (inicio/fin del día, formatos)
│  └─ format.ts        Formato de plata en pesos argentinos
├─ components/         UI compartida (Header, BottomNav, Sheet, InputPlata, Iconos…)
├─ data/               Catálogo precargado de kiosco
└─ features/           Una carpeta por feature, con su `*.copy.ts` de textos
   ├─ onboarding/  pos/  productos/  egresos/  cierre/  resumen/  caja/  historial/
```

Los textos de la UI viven en archivos `*.copy.ts` por feature, para editarlos fácil sin tocar la lógica.

## Modelo de datos (Dexie)

- **productos**: `id, nombre, precio, emoji?, categoriaUuid?, codigoBarras?`
- **categorias**: `id, uuid, nombre, orden, emoji?`
- **ventas**: `id, fecha, items[{ productoId, nombre, precio, cantidad }], total, medioPago, cajaUuid`
- **cajas** (sesiones): `id, uuid, estado, montoInicial, abiertaEn, cerradaEn?, ventasEfectivo, ventasTransferencia, ingresosEfectivo, egresosEfectivo, esperadoEfectivo, contadoEfectivo, diferencia, estadoCuadre`
- **movimientos**: `id, uuid, cajaUuid, tipo (ingreso|egreso), monto, categoria, nota?, fecha`
- **config**: `nombreKiosco, fondoInicial, onboardingCompletado`

> Las tablas sincronizables llevan `uuid · updatedAt · dirty · deleted` para el offline-first y el
> last-write-wins de la **Fase D** (Supabase). Las tablas v1 `egresos`/`cierres` quedaron reemplazadas
> por `movimientos`/`cajas` (Dexie migra de v1 a v2 sin perder datos).

## Offline / PWA

El service worker precachea el shell de la app (HTML/JS/CSS/íconos) y cachea en runtime las
tipografías de Fontshare y Google Fonts. Después de la primera carga online, Cuadre anda
sin conexión de punta a punta. El manifest declara nombre, `theme_color #0F3D2E` e íconos
(incluido uno *maskable*) para instalarla en la pantalla de inicio.
