// Lógica pura del historial de ventas: agrupa las ventas de un período por día
// y arma los totales (vendido, por medio de pago y ganancia) listos para mostrar.
// No toca la base: recibe ventas y productos ya cargados.

import type { Producto, Venta } from '../db/types';
import { inicioDelDia } from './fecha';

export interface DiaVentas {
  /** Timestamp del comienzo del día (clave y orden). */
  fecha: number;
  /** Ventas de ese día, de la más reciente a la más vieja. */
  ventas: Venta[];
  /** Total vendido (todos los medios). */
  total: number;
  efectivo: number;
  transferencia: number;
  /** Ganancia del día, o `null` si ninguna línea tiene costo conocido. */
  ganancia: number | null;
  /** Cantidad de tickets. */
  cantidad: number;
  /** Unidades vendidas (suma de cantidades). */
  unidades: number;
}

export interface ResumenSemana {
  /** Días con ventas, del más reciente al más viejo. */
  dias: DiaVentas[];
  total: number;
  efectivo: number;
  transferencia: number;
  ganancia: number | null;
  cantidad: number;
  /** Cantidad de días que tuvieron al menos una venta. */
  diasConVentas: number;
}

/** Ganancia de una venta: usa el costo snapshot del item y, si falta, el actual. */
function gananciaVenta(venta: Venta, prodById: Map<number, Producto>): number | null {
  let ganancia = 0;
  let algunCosto = false;
  for (const item of venta.items) {
    const costoUnit = item.costo ?? prodById.get(item.productoId)?.costo;
    if (costoUnit == null) continue;
    algunCosto = true;
    ganancia += (item.precio - costoUnit) * item.cantidad;
  }
  return algunCosto ? ganancia : null;
}

function unidadesVenta(venta: Venta): number {
  return venta.items.reduce((acc, it) => acc + it.cantidad, 0);
}

/**
 * Agrupa las ventas por día y arma los totales del período. Las ventas deben
 * venir del rango que se quiera mostrar (p. ej. los últimos 7 días).
 */
export function resumenSemana(ventas: Venta[], productos: Producto[]): ResumenSemana {
  const prodById = new Map<number, Producto>();
  for (const p of productos) if (p.id != null) prodById.set(p.id, p);

  const porDia = new Map<number, DiaVentas>();
  for (const venta of ventas) {
    const clave = inicioDelDia(venta.fecha);
    let dia = porDia.get(clave);
    if (!dia) {
      dia = {
        fecha: clave,
        ventas: [],
        total: 0,
        efectivo: 0,
        transferencia: 0,
        ganancia: null,
        cantidad: 0,
        unidades: 0,
      };
      porDia.set(clave, dia);
    }
    dia.ventas.push(venta);
    dia.total += venta.total;
    dia.cantidad += 1;
    dia.unidades += unidadesVenta(venta);
    if (venta.medioPago === 'transferencia') dia.transferencia += venta.total;
    else dia.efectivo += venta.total;
    const g = gananciaVenta(venta, prodById);
    if (g != null) dia.ganancia = (dia.ganancia ?? 0) + g;
  }

  const dias = [...porDia.values()].sort((a, b) => b.fecha - a.fecha);
  for (const dia of dias) dia.ventas.sort((a, b) => b.fecha - a.fecha);

  let total = 0;
  let efectivo = 0;
  let transferencia = 0;
  let ganancia: number | null = null;
  let cantidad = 0;
  for (const dia of dias) {
    total += dia.total;
    efectivo += dia.efectivo;
    transferencia += dia.transferencia;
    cantidad += dia.cantidad;
    if (dia.ganancia != null) ganancia = (ganancia ?? 0) + dia.ganancia;
  }

  return {
    dias,
    total,
    efectivo,
    transferencia,
    ganancia,
    cantidad,
    diasConVentas: dias.length,
  };
}
