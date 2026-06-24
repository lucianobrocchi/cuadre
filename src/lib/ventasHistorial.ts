// Lógica pura del historial de ventas. Recibe las ventas ya cargadas y las
// agrupa por día calendario para mostrar "la semana" de un vistazo.
// No toca la base.

import type { Venta } from '../db/types';
import { inicioDelDia } from './fecha';

export interface VentasDia {
  /** Timestamp del comienzo del día (00:00). Sirve de key y para etiquetar. */
  dia: number;
  total: number;
  efectivo: number;
  transferencia: number;
  /** Cantidad de ventas (tickets) del día. */
  cantidad: number;
  /** Ventas del día, más recientes primero. */
  ventas: Venta[];
}

export interface ResumenVentas {
  /** Días con ventas, más recientes primero. */
  dias: VentasDia[];
  total: number;
  efectivo: number;
  transferencia: number;
  cantidad: number;
}

/**
 * Agrupa las ventas por día calendario. Sólo aparecen los días que tuvieron
 * al menos una venta; el resto se omite (lista compacta).
 */
export function agruparVentasPorDia(ventas: Venta[]): ResumenVentas {
  const porDia = new Map<number, VentasDia>();
  let total = 0;
  let efectivo = 0;
  let transferencia = 0;

  for (const v of ventas) {
    const dia = inicioDelDia(v.fecha);
    let acc = porDia.get(dia);
    if (!acc) {
      acc = { dia, total: 0, efectivo: 0, transferencia: 0, cantidad: 0, ventas: [] };
      porDia.set(dia, acc);
    }
    acc.total += v.total;
    acc.cantidad++;
    acc.ventas.push(v);
    if (v.medioPago === 'transferencia') acc.transferencia += v.total;
    else acc.efectivo += v.total;

    total += v.total;
    if (v.medioPago === 'transferencia') transferencia += v.total;
    else efectivo += v.total;
  }

  const dias = [...porDia.values()].sort((a, b) => b.dia - a.dia);
  for (const d of dias) d.ventas.sort((a, b) => b.fecha - a.fecha);

  return { dias, total, efectivo, transferencia, cantidad: ventas.length };
}
