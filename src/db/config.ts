import { db } from './db';
import type { Config } from './types';

/** La config es un singleton: siempre vive en la fila con id = 1. */
export const CONFIG_ID = 1;

export const CONFIG_DEFAULT: Config = {
  id: CONFIG_ID,
  nombreKiosco: '',
  fondoInicial: 0,
  onboardingCompletado: false,
};

/**
 * Garantiza que exista la fila de config antes de arrancar la app.
 * Se llama una vez en el bootstrap (main.tsx).
 */
export async function asegurarConfig(): Promise<Config> {
  const actual = await db.config.get(CONFIG_ID);
  if (actual) return actual;
  await db.config.put(CONFIG_DEFAULT);
  return CONFIG_DEFAULT;
}

/** Lectura puntual de la config (ya seedeada). */
export function obtenerConfig(): Promise<Config | undefined> {
  return db.config.get(CONFIG_ID);
}

/** Actualiza campos sueltos de la config. */
export async function actualizarConfig(cambios: Partial<Config>): Promise<void> {
  await db.config.update(CONFIG_ID, cambios);
}

/**
 * Borra TODO (productos, categorías, ventas, cajas, movimientos y las tablas
 * legacy) y deja la config en cero, con el onboarding sin completar. La app
 * vuelve sola al onboarding.
 */
export async function reiniciarTodo(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.productos,
      db.categorias,
      db.ventas,
      db.cajas,
      db.movimientos,
      db.clientes,
      db.cuentas,
      db.egresos,
      db.cierres,
      db.config,
    ],
    async () => {
      await db.productos.clear();
      await db.categorias.clear();
      await db.ventas.clear();
      await db.cajas.clear();
      await db.movimientos.clear();
      await db.clientes.clear();
      await db.cuentas.clear();
      await db.egresos.clear();
      await db.cierres.clear();
      await db.config.clear();
      await db.config.put(CONFIG_DEFAULT);
    },
  );
}
