import { db } from './db';
import type { Producto } from './types';

/** Lista de productos ordenada por nombre. */
export function listarProductos(): Promise<Producto[]> {
  return db.productos.orderBy('nombre').toArray();
}

export async function agregarProducto(p: Omit<Producto, 'id'>): Promise<number> {
  return db.productos.add({
    nombre: p.nombre.trim(),
    precio: p.precio,
    costo: p.costo,
    precioMayor: p.precioMayor,
    emoji: p.emoji,
    categoriaUuid: p.categoriaUuid,
    codigoBarras: p.codigoBarras,
    stock: p.stock,
    stockMin: p.stockMin,
  });
}

/** Inserta varios productos de una (onboarding e importación masiva). */
export async function agregarProductos(ps: Omit<Producto, 'id'>[]): Promise<void> {
  await db.productos.bulkAdd(
    ps.map((p) => ({
      nombre: p.nombre.trim(),
      precio: p.precio,
      costo: p.costo,
      precioMayor: p.precioMayor,
      emoji: p.emoji,
      categoriaUuid: p.categoriaUuid,
      codigoBarras: p.codigoBarras,
      stock: p.stock,
      stockMin: p.stockMin,
    })),
  );
}

/** Cambia solo el precio de un producto (edición en el momento desde el POS). */
export async function editarPrecio(id: number, precio: number): Promise<void> {
  await db.productos.update(id, { precio });
}

/**
 * Ajusta el stock de un producto en `delta` (suma o resta), sin bajar de 0.
 * No hace nada si el producto no lleva stock (`stock == null`).
 */
export async function ajustarStock(id: number, delta: number): Promise<void> {
  await db.transaction('rw', db.productos, async () => {
    const p = await db.productos.get(id);
    if (!p || p.stock == null) return;
    await db.productos.update(id, { stock: Math.max(0, p.stock + delta) });
  });
}

export async function editarProducto(id: number, cambios: Partial<Producto>): Promise<void> {
  await db.productos.update(id, cambios);
}

export async function borrarProducto(id: number): Promise<void> {
  await db.productos.delete(id);
}

export async function contarProductos(): Promise<number> {
  return db.productos.count();
}
