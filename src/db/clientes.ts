import { nuevoUuid } from '../lib/uuid';
import { db } from './db';
import type { Cliente } from './types';

export function listarClientes(): Promise<Cliente[]> {
  return db.clientes.orderBy('nombre').toArray();
}

export function obtenerCliente(uuid: string): Promise<Cliente | undefined> {
  return db.clientes.where('uuid').equals(uuid).first();
}

export async function agregarCliente(nombre: string, telefono?: string): Promise<Cliente> {
  const ahora = Date.now();
  const cliente: Cliente = {
    uuid: nuevoUuid(),
    nombre: nombre.trim(),
    telefono: telefono?.trim() || undefined,
    updatedAt: ahora,
    dirty: true,
  };
  const id = await db.clientes.add(cliente);
  return { ...cliente, id };
}

export async function editarCliente(
  id: number,
  cambios: Partial<Pick<Cliente, 'nombre' | 'telefono'>>,
): Promise<void> {
  await db.clientes.update(id, { ...cambios, updatedAt: Date.now(), dirty: true });
}

/** Borra el cliente y todos sus movimientos de cuenta. */
export async function borrarCliente(uuid: string, id: number): Promise<void> {
  await db.transaction('rw', db.clientes, db.cuentas, async () => {
    const movs = await db.cuentas.where('clienteUuid').equals(uuid).toArray();
    for (const m of movs) if (m.id != null) await db.cuentas.delete(m.id);
    await db.clientes.delete(id);
  });
}
