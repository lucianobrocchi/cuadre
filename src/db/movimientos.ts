import { finDelDia, inicioDelDia } from '../lib/fecha';
import { nuevoUuid } from '../lib/uuid';
import { db } from './db';
import type { CategoriaMovimiento, Movimiento, TipoMovimiento } from './types';

/** Anota un movimiento de efectivo (ingreso o egreso) en una caja. */
export async function registrarMovimiento(datos: {
  cajaUuid: string;
  tipo: TipoMovimiento;
  monto: number;
  categoria: CategoriaMovimiento;
  nota?: string;
}): Promise<number> {
  const ahora = Date.now();
  const mov: Movimiento = {
    uuid: nuevoUuid(),
    cajaUuid: datos.cajaUuid,
    tipo: datos.tipo,
    monto: datos.monto,
    categoria: datos.categoria,
    nota: datos.nota?.trim() || undefined,
    fecha: ahora,
    updatedAt: ahora,
    dirty: true,
  };
  return db.movimientos.add(mov);
}

export async function borrarMovimiento(id: number): Promise<void> {
  await db.movimientos.delete(id);
}

/** Movimientos de una caja, más nuevos primero. */
export async function movimientosDeCaja(cajaUuid: string): Promise<Movimiento[]> {
  const lista = await db.movimientos.where('cajaUuid').equals(cajaUuid).toArray();
  return lista.sort((a, b) => b.fecha - a.fecha);
}

/** Movimientos dentro de un rango de fechas, más nuevos primero. */
export async function movimientosEntre(desde: number, hasta: number): Promise<Movimiento[]> {
  const lista = await db.movimientos.where('fecha').between(desde, hasta, true, true).toArray();
  return lista.sort((a, b) => b.fecha - a.fecha);
}

/** Movimientos de hoy. */
export function movimientosDeHoy(): Promise<Movimiento[]> {
  return movimientosEntre(inicioDelDia(), finDelDia());
}

export function totalesDeMovimientos(movs: Movimiento[]): {
  ingresos: number;
  egresos: number;
} {
  let ingresos = 0;
  let egresos = 0;
  for (const m of movs) {
    if (m.tipo === 'ingreso') ingresos += m.monto;
    else egresos += m.monto;
  }
  return { ingresos, egresos };
}
