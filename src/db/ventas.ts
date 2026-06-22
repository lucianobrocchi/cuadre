import { finDelDia, inicioDelDia } from '../lib/fecha';
import { db } from './db';
import type { MedioPago, Venta, VentaItem } from './types';

/** Registra una venta dentro de una caja y devuelve su id. Descuenta stock. */
export async function registrarVenta(
  items: VentaItem[],
  medioPago: MedioPago = 'efectivo',
  cajaUuid?: string,
): Promise<number> {
  const total = items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const venta: Venta = {
    fecha: Date.now(),
    items,
    total,
    medioPago,
    cajaUuid,
  };
  return db.transaction('rw', db.ventas, db.productos, async () => {
    const id = await db.ventas.add(venta);
    await aplicarStock(items, -1);
    return id;
  });
}

/** Anula (borra) una venta y le devuelve el stock descontado. */
export async function borrarVenta(id: number): Promise<void> {
  await db.transaction('rw', db.ventas, db.productos, async () => {
    const venta = await db.ventas.get(id);
    await db.ventas.delete(id);
    if (venta) await aplicarStock(venta.items, +1);
  });
}

/**
 * Aplica el efecto de los items sobre el stock (`signo` = -1 al vender, +1 al
 * anular). Solo toca productos que llevan stock; nunca baja de 0. Corre dentro
 * de una transacción rw sobre `productos`.
 */
async function aplicarStock(items: VentaItem[], signo: 1 | -1): Promise<void> {
  for (const it of items) {
    const p = await db.productos.get(it.productoId);
    if (!p || p.stock == null) continue;
    await db.productos.update(it.productoId, {
      stock: Math.max(0, p.stock + signo * it.cantidad),
    });
  }
}

/** Ventas dentro de un rango [desde, hasta] (timestamps). */
export function ventasEntre(desde: number, hasta: number): Promise<Venta[]> {
  return db.ventas.where('fecha').between(desde, hasta, true, true).toArray();
}

/** Ventas de hoy. */
export function ventasDeHoy(): Promise<Venta[]> {
  return ventasEntre(inicioDelDia(), finDelDia());
}

/** Total vendido en efectivo en un rango. */
export async function totalVendidoEfectivoEntre(
  desde: number,
  hasta: number,
): Promise<number> {
  const ventas = await ventasEntre(desde, hasta);
  return ventas
    .filter((v) => v.medioPago === 'efectivo')
    .reduce((acc, v) => acc + v.total, 0);
}

/** Total vendido (todos los medios) en un rango. */
export async function totalVendidoEntre(desde: number, hasta: number): Promise<number> {
  const ventas = await ventasEntre(desde, hasta);
  return ventas.reduce((acc, v) => acc + v.total, 0);
}
