import { nuevoUuid } from '../lib/uuid';
import { db } from './db';
import type { Categoria } from './types';

export function listarCategorias(): Promise<Categoria[]> {
  return db.categorias.orderBy('orden').toArray();
}

export async function agregarCategoria(nombre: string, emoji?: string): Promise<Categoria> {
  const orden = await db.categorias.count();
  const ahora = Date.now();
  const cat: Categoria = {
    uuid: nuevoUuid(),
    nombre: nombre.trim(),
    orden,
    emoji,
    updatedAt: ahora,
    dirty: true,
  };
  const id = await db.categorias.add(cat);
  return { ...cat, id };
}

export async function editarCategoria(
  id: number,
  cambios: Partial<Pick<Categoria, 'nombre' | 'emoji' | 'orden'>>,
): Promise<void> {
  await db.categorias.update(id, { ...cambios, updatedAt: Date.now(), dirty: true });
}

/** Borra la categoría y desasigna sus productos (quedan "sin categoría"). */
export async function borrarCategoria(uuid: string, id: number): Promise<void> {
  await db.transaction('rw', db.categorias, db.productos, async () => {
    const prods = await db.productos.where('categoriaUuid').equals(uuid).toArray();
    for (const p of prods) {
      if (p.id != null) await db.productos.update(p.id, { categoriaUuid: undefined });
    }
    await db.categorias.delete(id);
  });
}

/**
 * Crea las categorías que falten (por nombre, case-insensitive) y devuelve
 * un mapa nombre→uuid. Se usa al importar productos con columna de categoría.
 */
export async function asegurarCategorias(nombres: string[]): Promise<Map<string, string>> {
  const existentes = await listarCategorias();
  const mapa = new Map<string, string>();
  for (const c of existentes) mapa.set(c.nombre.toLowerCase(), c.uuid);

  for (const nombre of nombres) {
    const limpio = nombre.trim();
    const key = limpio.toLowerCase();
    if (!key || mapa.has(key)) continue;
    const cat = await agregarCategoria(limpio);
    mapa.set(key, cat.uuid);
  }
  return mapa;
}
