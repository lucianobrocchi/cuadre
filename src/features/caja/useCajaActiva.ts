import { useLiveQuery } from 'dexie-react-hooks';
import { cajaActiva } from '../../db/cajas';
import type { CajaSesion } from '../../db/types';

/**
 * Caja abierta en este momento.
 * - `undefined` → cargando
 * - `null` → no hay caja abierta
 * - `CajaSesion` → la caja activa
 */
export function useCajaActiva(): CajaSesion | null | undefined {
  return useLiveQuery(() => cajaActiva().then((c) => c ?? null), []);
}
