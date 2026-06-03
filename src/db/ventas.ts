import { finDelDia, inicioDelDia } from '../lib/fecha';
import { db } from './db';
import type { MedioPago, Venta, VentaItem } from './types';

/** Registra una venta dentro de una caja y devuelve su id. */
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
  return db.ventas.add(venta);
}

/** Anula (borra) una venta. */
export async function borrarVenta(id: number): Promise<void> {
  await db.ventas.delete(id);
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
