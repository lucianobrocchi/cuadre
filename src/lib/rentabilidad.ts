// Lógica pura de rentabilidad. No toca la base: recibe los datos ya cargados
// (productos, categorías, ventas) y devuelve los números listos para mostrar.
//
// Dos miradas:
//  - Catálogo (potencial): por cada producto, precio − costo. "¿Qué me deja?"
//  - Período (real): sobre las ventas, cuánto ganaste de verdad. "¿Cuánto gané?"

import type { Categoria, Producto, Venta } from '../db/types';

const SIN_CATEGORIA = 'Sin categoría';

// ---- Margen unitario (catálogo) ----

export interface Margen {
  /** precio − costo (puede ser negativo si el costo supera al precio). */
  ganancia: number;
  /** Fracción de ganancia sobre el precio de venta (0..1). */
  pct: number;
}

/** Margen de un producto, o `null` si no tiene costo cargado. */
export function margenUnitario(p: Producto): Margen | null {
  if (p.costo == null || p.precio <= 0) return null;
  const ganancia = p.precio - p.costo;
  return { ganancia, pct: ganancia / p.precio };
}

export interface ProductoConMargen {
  producto: Producto;
  margen: Margen | null;
}

export interface CategoriaCatalogo {
  uuid: string | null;
  nombre: string;
  emoji?: string;
  /** Margen ponderado por precio sobre los productos con costo, o `null`. */
  margenPct: number | null;
  conCosto: number;
  sinCosto: number;
  productos: ProductoConMargen[];
}

export interface ResumenCatalogo {
  categorias: CategoriaCatalogo[];
  totalProductos: number;
  sinCosto: number;
}

/** Margen potencial del catálogo, agrupado por categoría y producto. */
export function resumenCatalogo(
  productos: Producto[],
  categorias: Categoria[],
): ResumenCatalogo {
  const meta = new Map(categorias.map((c) => [c.uuid, c]));
  const grupos = new Map<string, Producto[]>();
  for (const p of productos) {
    const key = p.categoriaUuid && meta.has(p.categoriaUuid) ? p.categoriaUuid : '__sin__';
    const arr = grupos.get(key);
    if (arr) arr.push(p);
    else grupos.set(key, [p]);
  }

  let sinCostoTotal = 0;
  const cats: CategoriaCatalogo[] = [];

  for (const [key, ps] of grupos) {
    let sumGanancia = 0;
    let sumPrecio = 0;
    let conCosto = 0;
    let sinCosto = 0;
    const conMargen: ProductoConMargen[] = ps.map((producto) => {
      const margen = margenUnitario(producto);
      if (margen) {
        conCosto++;
        sumGanancia += margen.ganancia;
        sumPrecio += producto.precio;
      } else {
        sinCosto++;
      }
      return { producto, margen };
    });
    sinCostoTotal += sinCosto;
    conMargen.sort(ordenarPorMargen);

    const c = key === '__sin__' ? undefined : meta.get(key);
    cats.push({
      uuid: key === '__sin__' ? null : key,
      nombre: c?.nombre ?? SIN_CATEGORIA,
      emoji: c?.emoji,
      margenPct: sumPrecio > 0 ? sumGanancia / sumPrecio : null,
      conCosto,
      sinCosto,
      productos: conMargen,
    });
  }

  // Categorías reales por su orden; "Sin categoría" al final.
  cats.sort((a, b) => {
    if (a.uuid === null) return 1;
    if (b.uuid === null) return -1;
    return (meta.get(a.uuid)?.orden ?? 0) - (meta.get(b.uuid)?.orden ?? 0);
  });

  return { categorias: cats, totalProductos: productos.length, sinCosto: sinCostoTotal };
}

function ordenarPorMargen(a: ProductoConMargen, b: ProductoConMargen): number {
  // Mejor margen primero; los sin costo al final, en orden alfabético.
  if (a.margen && b.margen) return b.margen.pct - a.margen.pct;
  if (a.margen) return -1;
  if (b.margen) return 1;
  return a.producto.nombre.localeCompare(b.producto.nombre, 'es');
}

// ---- Ganancia realizada (ventas de un período) ----

export interface ProductoGanancia {
  productoId: number;
  nombre: string;
  unidades: number;
  vendido: number;
  /** `null` si no se conoce el costo (no se pudo calcular la ganancia). */
  ganancia: number | null;
}

export interface CategoriaGanancia {
  uuid: string | null;
  nombre: string;
  emoji?: string;
  vendido: number;
  ganancia: number;
  margenPct: number | null;
  unidadesSinCosto: number;
  productos: ProductoGanancia[];
}

export interface ResumenPeriodo {
  vendido: number;
  costo: number;
  ganancia: number;
  margenPct: number | null;
  /** Unidades vendidas sin costo conocido (quedan fuera de la ganancia). */
  unidadesSinCosto: number;
  cantidadVentas: number;
  categorias: CategoriaGanancia[];
}

interface AccCategoria {
  vendido: number;
  ganancia: number;
  vendidoConCosto: number;
  unidadesSinCosto: number;
  productos: Map<number, ProductoGanancia>;
}

/**
 * Ganancia real de las ventas dadas. El costo de cada línea sale del snapshot
 * guardado al vender (`item.costo`) y, si falta (ventas viejas), del costo
 * actual del producto. Las líneas sin costo conocido suman a "vendido" pero no
 * a la ganancia.
 */
export function gananciaPeriodo(
  ventas: Venta[],
  productos: Producto[],
  categorias: Categoria[],
): ResumenPeriodo {
  const prodById = new Map<number, Producto>();
  for (const p of productos) if (p.id != null) prodById.set(p.id, p);
  const meta = new Map(categorias.map((c) => [c.uuid, c]));
  const porCat = new Map<string, AccCategoria>();

  let vendidoTotal = 0;
  let costoTotal = 0;
  let gananciaTotal = 0;
  let vendidoConCostoTotal = 0;
  let unidadesSinCostoTotal = 0;

  for (const venta of ventas) {
    for (const item of venta.items) {
      const prod = prodById.get(item.productoId);
      const vendido = item.precio * item.cantidad;
      const costoUnit = item.costo ?? prod?.costo;
      const tieneCosto = costoUnit != null;
      const costoLinea = costoUnit != null ? costoUnit * item.cantidad : 0;
      const gananciaLinea = vendido - costoLinea;

      vendidoTotal += vendido;
      if (tieneCosto) {
        costoTotal += costoLinea;
        gananciaTotal += gananciaLinea;
        vendidoConCostoTotal += vendido;
      } else {
        unidadesSinCostoTotal += item.cantidad;
      }

      const catKey =
        prod?.categoriaUuid && meta.has(prod.categoriaUuid) ? prod.categoriaUuid : '__sin__';
      let acc = porCat.get(catKey);
      if (!acc) {
        acc = { vendido: 0, ganancia: 0, vendidoConCosto: 0, unidadesSinCosto: 0, productos: new Map() };
        porCat.set(catKey, acc);
      }
      acc.vendido += vendido;
      if (tieneCosto) {
        acc.ganancia += gananciaLinea;
        acc.vendidoConCosto += vendido;
      } else {
        acc.unidadesSinCosto += item.cantidad;
      }

      let pg = acc.productos.get(item.productoId);
      if (!pg) {
        pg = { productoId: item.productoId, nombre: item.nombre, unidades: 0, vendido: 0, ganancia: tieneCosto ? 0 : null };
        acc.productos.set(item.productoId, pg);
      }
      pg.unidades += item.cantidad;
      pg.vendido += vendido;
      if (tieneCosto) pg.ganancia = (pg.ganancia ?? 0) + gananciaLinea;
    }
  }

  const cats: CategoriaGanancia[] = [...porCat.entries()].map(([key, acc]) => {
    const c = key === '__sin__' ? undefined : meta.get(key);
    return {
      uuid: key === '__sin__' ? null : key,
      nombre: c?.nombre ?? SIN_CATEGORIA,
      emoji: c?.emoji,
      vendido: acc.vendido,
      ganancia: acc.ganancia,
      margenPct: acc.vendidoConCosto > 0 ? acc.ganancia / acc.vendidoConCosto : null,
      unidadesSinCosto: acc.unidadesSinCosto,
      productos: [...acc.productos.values()].sort(
        (a, b) => (b.ganancia ?? -Infinity) - (a.ganancia ?? -Infinity) || b.vendido - a.vendido,
      ),
    };
  });
  cats.sort((a, b) => b.ganancia - a.ganancia || b.vendido - a.vendido);

  return {
    vendido: vendidoTotal,
    costo: costoTotal,
    ganancia: gananciaTotal,
    margenPct: vendidoConCostoTotal > 0 ? gananciaTotal / vendidoConCostoTotal : null,
    unidadesSinCosto: unidadesSinCostoTotal,
    cantidadVentas: ventas.length,
    categorias: cats,
  };
}

/** "+45%" / "12%" — formatea una fracción (0..1) como porcentaje entero. */
export function formatPct(fraccion: number): string {
  return `${Math.round(fraccion * 100)}%`;
}
