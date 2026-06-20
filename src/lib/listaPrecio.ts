// Listas de precio del POS: minorista (precio base) y mayorista (precioMayor,
// con fallback al precio base si el producto no tiene mayorista cargado).

import type { Producto } from '../db/types';

export type ListaPrecio = 'minorista' | 'mayorista';

/** Precio activo de un producto según la lista elegida. */
export function precioSegunLista(p: Producto, lista: ListaPrecio): number {
  if (lista === 'mayorista') return p.precioMayor ?? p.precio;
  return p.precio;
}
