// Lógica pura de stock / inventario. El stock es opt-in por producto:
// `producto.stock === undefined` ⇒ no se lleva. Un número ⇒ se lleva (se
// descuenta al vender y dispara alertas de bajo/sin stock).

import type { Producto } from '../db/types';

/** Umbral de aviso cuando el producto lleva stock pero no fijó uno propio. */
export const STOCK_MIN_DEFAULT = 3;

export type EstadoStock = 'sin' | 'bajo' | 'ok';

/** `true` si el producto lleva control de stock. */
export function llevaStock(p: Producto): boolean {
  return p.stock != null;
}

export function umbralStock(p: Producto): number {
  return p.stockMin ?? STOCK_MIN_DEFAULT;
}

/** Estado de stock de un producto que lleva stock. Para los que no llevan: 'ok'. */
export function estadoStock(p: Producto): EstadoStock {
  if (p.stock == null) return 'ok';
  if (p.stock <= 0) return 'sin';
  if (p.stock <= umbralStock(p)) return 'bajo';
  return 'ok';
}

export interface ResumenInventario {
  /** Plata invertida en mercadería (Σ stock × costo) de lo que tiene costo. */
  valorCosto: number;
  /** Valor a precio de venta (Σ stock × precio). */
  valorVenta: number;
  /** Unidades totales en mano. */
  unidades: number;
  /** Productos que llevan stock. */
  rastreados: number;
  /** Sin stock (stock ≤ 0) y con stock bajo (≤ umbral). */
  sinStock: Producto[];
  bajoStock: Producto[];
}

export function resumenInventario(productos: Producto[]): ResumenInventario {
  let valorCosto = 0;
  let valorVenta = 0;
  let unidades = 0;
  let rastreados = 0;
  const sinStock: Producto[] = [];
  const bajoStock: Producto[] = [];

  for (const p of productos) {
    if (p.stock == null) continue;
    rastreados++;
    const enMano = Math.max(0, p.stock);
    unidades += enMano;
    if (p.costo != null) valorCosto += enMano * p.costo;
    valorVenta += enMano * p.precio;

    const estado = estadoStock(p);
    if (estado === 'sin') sinStock.push(p);
    else if (estado === 'bajo') bajoStock.push(p);
  }

  // Más urgente primero: menos stock arriba.
  bajoStock.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

  return { valorCosto, valorVenta, unidades, rastreados, sinStock, bajoStock };
}
