// Siembra datos de ejemplo la primera vez que se abre la app, para que se vea
// funcionando (productos + ~14 días de cajas/ventas/movimientos) sin tener que
// cargar nada a mano. Es de una sola vez (marca en localStorage) y NO pisa
// datos reales: si ya hay productos o cajas, no hace nada. "Empezar de cero"
// (Ajustes) deja la app vacía y no se vuelve a sembrar.

import { actualizarConfig } from './config';
import { cargarDatosDemo } from './demo';
import { asegurarCategorias } from './categorias';
import { agregarProductos } from './productos';
import { catalogoOnboarding } from '../data/catalogoInicial';
import type { Producto } from './types';
import { db } from './db';

const MARCA = 'cuadre.seedDemo.v1';

/** Carga el catálogo del onboarding (categorías + productos). */
async function sembrarCatalogo(): Promise<void> {
  const nombres = catalogoOnboarding.map((c) => c.categoria);
  const mapa = await asegurarCategorias(nombres);

  const productos: Omit<Producto, 'id'>[] = [];
  for (const cat of catalogoOnboarding) {
    const categoriaUuid = mapa.get(cat.categoria.toLowerCase());
    for (const item of cat.items) {
      productos.push({
        nombre: item.nombre,
        precio: item.precio,
        emoji: item.emoji,
        categoriaUuid,
      });
    }
  }
  await agregarProductos(productos);
}

/**
 * Si es la primera vez y la app está vacía, la llena con datos de ejemplo y
 * salta el onboarding. Idempotente y no destructivo. Best-effort: si algo
 * falla, la app igual arranca.
 */
export async function sembrarDemoInicial(): Promise<void> {
  try {
    if (localStorage.getItem(MARCA)) return;

    const [productos, cajas] = await Promise.all([db.productos.count(), db.cajas.count()]);
    // Ya hay datos (reales o demo previa): no tocamos nada, solo marcamos.
    if (productos > 0 || cajas > 0) {
      localStorage.setItem(MARCA, '1');
      return;
    }

    await sembrarCatalogo();
    await cargarDatosDemo(14);
    await actualizarConfig({
      onboardingCompletado: true,
      nombreKiosco: 'Kiosco del barrio',
      fondoInicial: 10000,
    });

    localStorage.setItem(MARCA, '1');
  } catch (e) {
    // No bloqueamos el arranque por la demo.
    console.warn('No se pudo sembrar la demo inicial:', e);
  }
}
