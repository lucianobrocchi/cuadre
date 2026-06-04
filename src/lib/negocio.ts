// Motor de analítica del negocio. Lógica pura: recibe los datos ya cargados
// (ventas, movimientos, productos) y devuelve los números que pinta la pestaña
// Negocio. No toca la base.
//
// La ganancia de cada línea sale del costo snapshot guardado al vender
// (`item.costo`) y, si falta (ventas viejas), del costo actual del producto.

import type { Movimiento, Producto, Venta } from '../db/types';
import { inicioDelDia } from './fecha';

const MS_DIA = 24 * 60 * 60 * 1000;

// ---- Helpers de costo / ganancia por venta ----

function unidadesDe(v: Venta): number {
  return v.items.reduce((acc, it) => acc + it.cantidad, 0);
}

/** Ganancia de una venta y si se conoce el costo de TODAS sus líneas. */
function gananciaDe(v: Venta, prodById: Map<number, Producto>): { ganancia: number; algunCosto: boolean } {
  let ganancia = 0;
  let algunCosto = false;
  for (const it of v.items) {
    const costoUnit = it.costo ?? prodById.get(it.productoId)?.costo;
    if (costoUnit == null) continue;
    algunCosto = true;
    ganancia += (it.precio - costoUnit) * it.cantidad;
  }
  return { ganancia, algunCosto };
}

export function indexarProductos(productos: Producto[]): Map<number, Producto> {
  const m = new Map<number, Producto>();
  for (const p of productos) if (p.id != null) m.set(p.id, p);
  return m;
}

// ---- Resumen de plata de un período ----

export interface ResumenPlata {
  vendido: number;
  efectivo: number;
  transferencia: number;
  /** Costo de lo vendido con costo conocido. */
  costo: number;
  ganancia: number;
  /** Fracción 0..1 sobre lo vendido con costo, o `null` si no hay costos. */
  margenPct: number | null;
  /** Tickets (cantidad de ventas). */
  cantidad: number;
  unidades: number;
  /** Venta promedio por ticket. */
  ticket: number;
  /** Ingresos de caja (movimientos), aparte de las ventas. */
  ingresos: number;
  egresos: number;
}

export function resumenPlata(
  ventas: Venta[],
  movimientos: Movimiento[],
  prodById: Map<number, Producto>,
): ResumenPlata {
  let vendido = 0;
  let efectivo = 0;
  let transferencia = 0;
  let costo = 0;
  let ganancia = 0;
  let vendidoConCosto = 0;
  let unidades = 0;

  for (const v of ventas) {
    vendido += v.total;
    // El fiado no es cobro: suma a "vendido" pero no a efectivo ni transferencia.
    if (v.medioPago === 'efectivo') efectivo += v.total;
    else if (v.medioPago === 'transferencia') transferencia += v.total;
    unidades += unidadesDe(v);
    const g = gananciaDe(v, prodById);
    if (g.algunCosto) {
      ganancia += g.ganancia;
      vendidoConCosto += v.total;
      costo += v.total - g.ganancia;
    }
  }

  let ingresos = 0;
  let egresos = 0;
  for (const m of movimientos) {
    if (m.tipo === 'ingreso') ingresos += m.monto;
    else egresos += m.monto;
  }

  return {
    vendido,
    efectivo,
    transferencia,
    costo,
    ganancia,
    margenPct: vendidoConCosto > 0 ? ganancia / vendidoConCosto : null,
    cantidad: ventas.length,
    unidades,
    ticket: ventas.length > 0 ? vendido / ventas.length : 0,
    ingresos,
    egresos,
  };
}

// ---- Filtros por rango ----

export function ventasEnRango(ventas: Venta[], desde: number, hasta: number): Venta[] {
  return ventas.filter((v) => v.fecha >= desde && v.fecha <= hasta);
}

export function movsEnRango(movs: Movimiento[], desde: number, hasta: number): Movimiento[] {
  return movs.filter((m) => m.fecha >= desde && m.fecha <= hasta);
}

// ---- Comparativa (actual vs período anterior) ----

export interface Comparativa {
  actual: number;
  previo: number;
  /** Variación relativa (0.2 = +20%). `null` si no hay base previa. */
  deltaPct: number | null;
}

export function comparar(actual: number, previo: number): Comparativa {
  const deltaPct = previo > 0 ? (actual - previo) / previo : null;
  return { actual, previo, deltaPct };
}

// ---- Serie diaria (para el gráfico de tendencia) ----

export interface PuntoDia {
  fecha: number;
  vendido: number;
  ganancia: number;
}

/** Vendido y ganancia por día de los últimos `dias` (incluye días en cero). */
export function serieDiaria(ventas: Venta[], prodById: Map<number, Producto>, dias = 30): PuntoDia[] {
  const hoy = inicioDelDia();
  const puntos: PuntoDia[] = [];
  const idx = new Map<number, PuntoDia>();
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = hoy - i * MS_DIA;
    const p: PuntoDia = { fecha, vendido: 0, ganancia: 0 };
    puntos.push(p);
    idx.set(fecha, p);
  }
  for (const v of ventas) {
    const p = idx.get(inicioDelDia(v.fecha));
    if (!p) continue;
    p.vendido += v.total;
    const g = gananciaDe(v, prodById);
    if (g.algunCosto) p.ganancia += g.ganancia;
  }
  return puntos;
}

// ---- Ventas por hora (mejores horas) ----

export interface FranjaHora {
  hora: number;
  vendido: number;
  cantidad: number;
}

export function ventasPorHora(ventas: Venta[]): FranjaHora[] {
  const franjas: FranjaHora[] = Array.from({ length: 24 }, (_, hora) => ({
    hora,
    vendido: 0,
    cantidad: 0,
  }));
  for (const v of ventas) {
    const h = new Date(v.fecha).getHours();
    franjas[h].vendido += v.total;
    franjas[h].cantidad += 1;
  }
  return franjas;
}

// ---- Inteligencia de productos ----

export interface ProductoStat {
  productoId: number;
  nombre: string;
  emoji?: string;
  unidades: number;
  vendido: number;
  /** `null` si no se conoce el costo. */
  ganancia: number | null;
}

export interface InteligenciaProductos {
  /** Más vendidos por unidades. */
  topUnidades: ProductoStat[];
  /** Los que más ganancia dejaron (solo con costo conocido). */
  topGanancia: ProductoStat[];
  /** Cargados pero sin ninguna venta en el período. */
  sinMovimiento: Producto[];
  /** Catálogo: el costo iguala o supera al precio (perdés o no ganás nada). */
  pierdenPlata: Producto[];
}

export function inteligenciaProductos(
  ventas: Venta[],
  productos: Producto[],
): InteligenciaProductos {
  const stats = new Map<number, ProductoStat>();
  const prodById = indexarProductos(productos);

  for (const v of ventas) {
    for (const it of v.items) {
      let s = stats.get(it.productoId);
      if (!s) {
        const p = prodById.get(it.productoId);
        s = {
          productoId: it.productoId,
          nombre: it.nombre,
          emoji: p?.emoji,
          unidades: 0,
          vendido: 0,
          ganancia: null,
        };
        stats.set(it.productoId, s);
      }
      s.unidades += it.cantidad;
      s.vendido += it.precio * it.cantidad;
      const costoUnit = it.costo ?? prodById.get(it.productoId)?.costo;
      if (costoUnit != null) s.ganancia = (s.ganancia ?? 0) + (it.precio - costoUnit) * it.cantidad;
    }
  }

  const lista = [...stats.values()];
  const topUnidades = [...lista].sort((a, b) => b.unidades - a.unidades);
  const topGanancia = lista
    .filter((s) => s.ganancia != null)
    .sort((a, b) => (b.ganancia ?? 0) - (a.ganancia ?? 0));

  const vendidos = new Set(stats.keys());
  const sinMovimiento = productos.filter((p) => p.id != null && !vendidos.has(p.id));
  const pierdenPlata = productos.filter((p) => p.costo != null && p.precio > 0 && p.costo >= p.precio);

  return { topUnidades, topGanancia, sinMovimiento, pierdenPlata };
}
