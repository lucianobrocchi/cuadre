import { calcularCierreCaja } from '../lib/caja';
import { nuevoUuid } from '../lib/uuid';
import { db } from './db';
import { movimientosDeCaja, totalesDeMovimientos } from './movimientos';
import type { CajaSesion } from './types';

/** La caja abierta en este momento (o undefined si no hay ninguna). */
export function cajaActiva(): Promise<CajaSesion | undefined> {
  return db.cajas.where('estado').equals('abierta').first();
}

/** Abre una caja con un monto inicial. Si ya hay una abierta, la devuelve. */
export async function abrirCaja(montoInicial: number): Promise<CajaSesion> {
  const existente = await cajaActiva();
  if (existente) return existente;

  const ahora = Date.now();
  const caja: CajaSesion = {
    uuid: nuevoUuid(),
    estado: 'abierta',
    montoInicial,
    abiertaEn: ahora,
    updatedAt: ahora,
    dirty: true,
  };
  const id = await db.cajas.add(caja);
  return { ...caja, id };
}

export interface ResumenCaja {
  ventasEfectivo: number;
  ventasTransferencia: number;
  ingresos: number;
  egresos: number;
  cantidadVentas: number;
  esperado: number;
}

/** Suma ventas y movimientos de una caja para mostrar/cerrar. */
export async function resumenDeCaja(caja: CajaSesion): Promise<ResumenCaja> {
  const [ventas, movimientos] = await Promise.all([
    db.ventas.where('cajaUuid').equals(caja.uuid).toArray(),
    movimientosDeCaja(caja.uuid),
  ]);

  const ventasEfectivo = ventas
    .filter((v) => v.medioPago === 'efectivo')
    .reduce((acc, v) => acc + v.total, 0);
  const ventasTransferencia = ventas
    .filter((v) => v.medioPago === 'transferencia')
    .reduce((acc, v) => acc + v.total, 0);

  const { ingresos, egresos } = totalesDeMovimientos(movimientos);
  const esperado = caja.montoInicial + ventasEfectivo + ingresos - egresos;

  return {
    ventasEfectivo,
    ventasTransferencia,
    ingresos,
    egresos,
    cantidadVentas: ventas.length,
    esperado,
  };
}

/** Cierra la caja: congela los totales y guarda el descuadre. */
export async function cerrarCaja(
  caja: CajaSesion,
  contado: number,
  nota?: string,
): Promise<CajaSesion> {
  const r = await resumenDeCaja(caja);
  const calc = calcularCierreCaja(
    {
      montoInicial: caja.montoInicial,
      ventasEfectivo: r.ventasEfectivo,
      ingresosEfectivo: r.ingresos,
      egresosEfectivo: r.egresos,
    },
    contado,
  );

  const cambios: Partial<CajaSesion> = {
    estado: 'cerrada',
    cerradaEn: Date.now(),
    ventasEfectivo: r.ventasEfectivo,
    ventasTransferencia: r.ventasTransferencia,
    ingresosEfectivo: r.ingresos,
    egresosEfectivo: r.egresos,
    esperadoEfectivo: calc.esperado,
    contadoEfectivo: contado,
    diferencia: calc.diferencia,
    estadoCuadre: calc.estado,
    notaCierre: nota?.trim() || undefined,
    updatedAt: Date.now(),
    dirty: true,
  };

  if (caja.id != null) await db.cajas.update(caja.id, cambios);
  return { ...caja, ...cambios };
}

/** Historial de cajas (sesiones), más nuevas primero. */
export function listarCajas(): Promise<CajaSesion[]> {
  return db.cajas.orderBy('abiertaEn').reverse().toArray();
}
