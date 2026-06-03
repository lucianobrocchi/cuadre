import type { EstadoCierre } from '../db/types';
import { estadoDeCierre } from './cierre';

// Cuentas del cierre de una sesión de caja.

export interface InsumosCaja {
  montoInicial: number;
  ventasEfectivo: number;
  ingresosEfectivo: number;
  egresosEfectivo: number;
}

/** esperado = inicial + ventas en efectivo + ingresos − egresos */
export function calcularEsperado(i: InsumosCaja): number {
  return i.montoInicial + i.ventasEfectivo + i.ingresosEfectivo - i.egresosEfectivo;
}

/** descuadre = contado − esperado */
export function calcularDescuadre(contado: number, esperado: number): number {
  return contado - esperado;
}

/** Estado del descuadre: 'cuadra' | 'falta' | 'sobra'. */
export function estadoDescuadre(diferencia: number): EstadoCierre {
  return estadoDeCierre(diferencia);
}

export interface CierreCalculado {
  esperado: number;
  diferencia: number;
  estado: EstadoCierre;
}

export function calcularCierreCaja(i: InsumosCaja, contado: number): CierreCalculado {
  const esperado = calcularEsperado(i);
  const diferencia = calcularDescuadre(contado, esperado);
  return { esperado, diferencia, estado: estadoDeCierre(diferencia) };
}
