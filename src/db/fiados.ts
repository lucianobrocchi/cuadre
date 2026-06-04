import { nuevoUuid } from '../lib/uuid';
import { db } from './db';
import { cajaActiva } from './cajas';
import { registrarMovimiento } from './movimientos';
import type { MedioPago, MovimientoCuenta } from './types';

/** Todos los movimientos de cuenta (cargos y pagos). */
export function listarCuentas(): Promise<MovimientoCuenta[]> {
  return db.cuentas.toArray();
}

/** Movimientos de un cliente, más nuevos primero. */
export async function movimientosDeCliente(clienteUuid: string): Promise<MovimientoCuenta[]> {
  const lista = await db.cuentas.where('clienteUuid').equals(clienteUuid).toArray();
  return lista.sort((a, b) => b.fecha - a.fecha);
}

function nuevoMov(
  clienteUuid: string,
  tipo: 'cargo' | 'pago',
  monto: number,
  extra: Partial<MovimientoCuenta> = {},
): MovimientoCuenta {
  const ahora = Date.now();
  return {
    uuid: nuevoUuid(),
    clienteUuid,
    tipo,
    monto,
    fecha: ahora,
    updatedAt: ahora,
    dirty: true,
    ...extra,
  };
}

/** Carga un fiado a la cuenta de un cliente (sube la deuda). */
export async function registrarCargo(datos: {
  clienteUuid: string;
  monto: number;
  ventaId?: number;
  nota?: string;
}): Promise<number> {
  return db.cuentas.add(
    nuevoMov(datos.clienteUuid, 'cargo', datos.monto, {
      ventaId: datos.ventaId,
      nota: datos.nota?.trim() || undefined,
    }),
  );
}

/**
 * Registra un pago del cliente (baja la deuda). Si paga en efectivo y hay una
 * caja abierta, también entra como ingreso de caja para que el cierre cuadre.
 */
export async function registrarPago(datos: {
  clienteUuid: string;
  monto: number;
  medioPago: MedioPago;
  nota?: string;
  nombreCliente?: string;
}): Promise<void> {
  await db.cuentas.add(
    nuevoMov(datos.clienteUuid, 'pago', datos.monto, {
      medioPago: datos.medioPago,
      nota: datos.nota?.trim() || undefined,
    }),
  );

  if (datos.medioPago === 'efectivo') {
    const caja = await cajaActiva();
    if (caja) {
      await registrarMovimiento({
        cajaUuid: caja.uuid,
        tipo: 'ingreso',
        monto: datos.monto,
        categoria: 'otro',
        nota: datos.nombreCliente ? `Pago fiado · ${datos.nombreCliente}` : 'Pago de fiado',
      });
    }
  }
}
