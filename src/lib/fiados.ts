// Lógica pura de fiados / cuenta corriente. Saldo = Σ cargos − Σ pagos.
// Saldo > 0 ⇒ el cliente te debe. Saldo ≤ 0 ⇒ está al día (o a favor).

import type { Cliente, MovimientoCuenta } from '../db/types';

export interface ClienteConSaldo {
  cliente: Cliente;
  saldo: number;
  /** Fecha del último movimiento (0 si no tuvo). */
  ultimaFecha: number;
}

export interface ResumenFiados {
  /** Clientes ordenados: primero los que más deben. */
  lista: ClienteConSaldo[];
  /** Plata "en la calle": suma de las deudas (saldos positivos). */
  totalEnLaCalle: number;
  /** Cuántos clientes deben algo. */
  deudores: number;
}

/** Saldo de un cliente a partir de sus movimientos. */
export function saldoDeMovimientos(movs: MovimientoCuenta[]): number {
  let saldo = 0;
  for (const m of movs) saldo += m.tipo === 'cargo' ? m.monto : -m.monto;
  return saldo;
}

export function resumenFiados(
  clientes: Cliente[],
  movimientos: MovimientoCuenta[],
): ResumenFiados {
  const saldo = new Map<string, number>();
  const ultima = new Map<string, number>();
  for (const m of movimientos) {
    saldo.set(m.clienteUuid, (saldo.get(m.clienteUuid) ?? 0) + (m.tipo === 'cargo' ? m.monto : -m.monto));
    ultima.set(m.clienteUuid, Math.max(ultima.get(m.clienteUuid) ?? 0, m.fecha));
  }

  const lista: ClienteConSaldo[] = clientes.map((cliente) => ({
    cliente,
    saldo: saldo.get(cliente.uuid) ?? 0,
    ultimaFecha: ultima.get(cliente.uuid) ?? 0,
  }));

  // Primero los que más deben; los que están al día, al final por nombre.
  lista.sort((a, b) => {
    if (a.saldo > 0 && b.saldo <= 0) return -1;
    if (b.saldo > 0 && a.saldo <= 0) return 1;
    if (a.saldo !== b.saldo) return b.saldo - a.saldo;
    return a.cliente.nombre.localeCompare(b.cliente.nombre, 'es');
  });

  let totalEnLaCalle = 0;
  let deudores = 0;
  for (const c of lista) {
    if (c.saldo > 0) {
      totalEnLaCalle += c.saldo;
      deudores++;
    }
  }

  return { lista, totalEnLaCalle, deudores };
}
