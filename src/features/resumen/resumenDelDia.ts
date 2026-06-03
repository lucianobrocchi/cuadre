import type { Venta } from '../../db/types';
import { listarProductos } from '../../db/productos';
import { movimientosDeHoy, totalesDeMovimientos } from '../../db/movimientos';
import { ventasDeHoy } from '../../db/ventas';

export interface ProductoTop {
  nombre: string;
  emoji?: string;
  cantidad: number;
}

export interface ResumenDia {
  totalVendido: number;
  totalEfectivo: number;
  totalTransferencia: number;
  cantidadVentas: number;
  totalEgresos: number;
  productoTop: ProductoTop | null;
  /** Ventas del día, más nuevas primero. */
  ventas: Venta[];
}

/** Arma el resumen del día con la data que ya tenemos guardada. */
export async function resumenDelDia(): Promise<ResumenDia> {
  const [ventas, movimientos, productos] = await Promise.all([
    ventasDeHoy(),
    movimientosDeHoy(),
    listarProductos(),
  ]);

  const totalVendido = ventas.reduce((acc, v) => acc + v.total, 0);
  const totalEfectivo = ventas
    .filter((v) => v.medioPago === 'efectivo')
    .reduce((acc, v) => acc + v.total, 0);
  const totalTransferencia = totalVendido - totalEfectivo;
  const totalEgresos = totalesDeMovimientos(movimientos).egresos;

  // Emoji por producto, para mostrarlo junto al más vendido.
  const emojiPorId = new Map<number, string | undefined>();
  for (const p of productos) {
    if (p.id != null) emojiPorId.set(p.id, p.emoji);
  }

  // Unidades vendidas por producto.
  const conteo = new Map<number, ProductoTop>();
  for (const v of ventas) {
    for (const it of v.items) {
      const prev = conteo.get(it.productoId);
      if (prev) {
        prev.cantidad += it.cantidad;
      } else {
        conteo.set(it.productoId, {
          nombre: it.nombre,
          emoji: emojiPorId.get(it.productoId),
          cantidad: it.cantidad,
        });
      }
    }
  }

  let productoTop: ProductoTop | null = null;
  for (const item of conteo.values()) {
    if (!productoTop || item.cantidad > productoTop.cantidad) {
      productoTop = item;
    }
  }

  return {
    totalVendido,
    totalEfectivo,
    totalTransferencia,
    cantidadVentas: ventas.length,
    totalEgresos,
    productoTop,
    ventas: [...ventas].sort((a, b) => b.fecha - a.fecha),
  };
}
