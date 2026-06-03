import type { EstadoCierre } from '../db/types';

// La fórmula real del cierre de caja. No tocar sin pensarlo dos veces.

/** cajaTeorica = fondoInicial + totalVendidoEfectivo − totalEgresosEfectivo */
export function calcularCajaTeorica(
  fondoInicial: number,
  totalVendidoEfectivo: number,
  totalEgresosEfectivo: number,
): number {
  return fondoInicial + totalVendidoEfectivo - totalEgresosEfectivo;
}

/** diferencia = efectivoContado − cajaTeorica */
export function calcularDiferencia(efectivoContado: number, cajaTeorica: number): number {
  return efectivoContado - cajaTeorica;
}

/**
 * Estado según la diferencia:
 *  - 'cuadra' si es 0
 *  - 'sobra'  si es positiva
 *  - 'falta'  si es negativa
 */
export function estadoDeCierre(diferencia: number): EstadoCierre {
  if (diferencia === 0) return 'cuadra';
  return diferencia > 0 ? 'sobra' : 'falta';
}

/** Calcula todo el cierre de una, a partir de los insumos. */
export function calcularCierre(insumos: {
  fondoInicial: number;
  totalVendidoEfectivo: number;
  totalEgresosEfectivo: number;
  efectivoContado: number;
}): {
  cajaTeorica: number;
  diferencia: number;
  estado: EstadoCierre;
} {
  const cajaTeorica = calcularCajaTeorica(
    insumos.fondoInicial,
    insumos.totalVendidoEfectivo,
    insumos.totalEgresosEfectivo,
  );
  const diferencia = calcularDiferencia(insumos.efectivoContado, cajaTeorica);
  return { cajaTeorica, diferencia, estado: estadoDeCierre(diferencia) };
}
