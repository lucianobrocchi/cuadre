// Proyecciones y análisis predictivo simple para ventas.
// Usa el histórico de ventas para proyectar el día actual y detectar desvíos.

import type { Venta } from '../db/types';
import { inicioDelDia, MS_DIA } from './fecha';

/** Cantidad de días históricos a considerar para proyecciones. */
const DIAS_HISTORICO = 14;

export interface ProyeccionDia {
  /** Hora actual (0-23). */
  horaActual: number;
  /** Ventas acumuladas hasta ahora (desde las 00:00). */
  vendidoAcumulado: number;
  /** Proyección para el día completo (hasta las 23:59). */
  proyectadoTotal: number;
  /** Promedio histórico de los últimos 14 días a esta misma hora. */
  historicoPromedio: number;
  /** Diferencia porcentual vs histórico (+15% = vendiendo mejor). */
  desvioPct: number;
  /** Estado: 'mejor' | 'igual' | 'peor' según desvío. */
  estado: 'mejor' | 'igual' | 'peor';
}

/**
 * Calcula la proyección del día actual comparando con el histórico.
 * Devuelve información accionable para el dueño del kiosco.
 */
export function calcularProyeccion(ventasHoy: Venta[], ventasHistoricas: Venta[]): ProyeccionDia {
  const ahora = Date.now();
  const inicioHoy = inicioDelDia();
  const horaActual = new Date(ahora).getHours() + new Date(ahora).getMinutes() / 60;
  
  // Ventas acumuladas hoy
  const vendidoAcumulado = ventasHoy.reduce((acc, v) => acc + v.total, 0);
  
  // Si es muy temprano, no hay suficiente data
  if (horaActual < 6) {
    return {
      horaActual,
      vendidoAcumulado,
      proyectadoTotal: 0,
      historicoPromedio: 0,
      desvioPct: 0,
      estado: 'igual',
    };
  }
  
  // Calcular promedio histórico a esta misma hora (últimos 14 días excluyendo hoy)
  const historicosPorHora: number[] = [];
  
  for (let i = 1; i <= DIAS_HISTORICO; i++) {
    const diaTs = inicioHoy - i * MS_DIA;
    const desde = diaTs;
    const hasta = diaTs + horaActual * MS_DIA / 24;
    
    const ventasDia = ventasHistoricas.filter(v => v.fecha >= desde && v.fecha <= hasta);
    const totalDia = ventasDia.reduce((acc, v) => acc + v.total, 0);
    historicosPorHora.push(totalDia);
  }
  
  const historicoPromedio = historicosPorHora.length > 0
    ? historicosPorHora.reduce((a, b) => a + b, 0) / historicosPorHora.length
    : 0;
  
  // Proyectar el día completo asumiendo mismo ritmo
  const factorProyeccion = 24 / horaActual;
  const proyectadoTotal = vendidoAcumulado * factorProyeccion;
  
  // Calcular desvío vs histórico
  const desvioPct = historicoPromedio > 0
    ? ((vendidoAcumulado - historicoPromedio) / historicoPromedio) * 100
    : 0;
  
  // Determinar estado
  let estado: 'mejor' | 'igual' | 'peor' = 'igual';
  if (desvioPct > 10) estado = 'mejor';
  else if (desvioPct < -10) estado = 'peor';
  
  return {
    horaActual,
    vendidoAcumulado,
    proyectadoTotal,
    historicoPromedio,
    desvioPct,
    estado,
  };
}

/** Estimación de ventas para la próxima hora basada en promedio histórico. */
export function estimarProximaHora(ventasHistoricas: Venta[]): number {
  const ahora = Date.now();
  const horaActual = new Date(ahora).getHours();
  
  // Agrupar ventas históricas por hora del día
  const ventasPorHora = new Array(24).fill(0).map(() => [] as number[]);
  
  for (const venta of ventasHistoricas) {
    const hora = new Date(venta.fecha).getHours();
    ventasPorHora[hora].push(venta.total);
  }
  
  // Promedio para la próxima hora
  const proximaHora = (horaActual + 1) % 24;
  const promedios = ventasPorHora[proximaHora];
  
  if (promedios.length === 0) return 0;
  
  return promedios.reduce((a, b) => a + b, 0) / promedios.length;
}

/** Días de la semana con mejor rendimiento (ranking). */
export function rankingDiasSemana(ventasHistoricas: Venta[]): { dia: string; promedio: number }[] {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const acumuladoPorDia = new Array(7).fill(0).map(() => ({ suma: 0, cantidad: 0 }));
  
  for (const venta of ventasHistoricas) {
    const diaSemana = new Date(venta.fecha).getDay();
    acumuladoPorDia[diaSemana].suma += venta.total;
    acumuladoPorDia[diaSemana].cantidad++;
  }
  
  return dias
    .map((dia, idx) => ({
      dia,
      promedio: acumuladoPorDia[idx].cantidad > 0
        ? acumuladoPorDia[idx].suma / acumuladoPorDia[idx].cantidad
        : 0,
    }))
    .sort((a, b) => b.promedio - a.promedio);
}
