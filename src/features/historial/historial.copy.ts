import type { EstadoCierre } from '../../db/types';

export const historialCopy = {
  headerTitulo: 'Historial',
  headerSubtitulo: 'Tus cajas cerradas',
  vacioTitulo: 'Todavía no cerraste ninguna caja',
  vacioSub: 'Cuando cierres tu primera caja, va a aparecer acá.',
  detalleTitulo: 'Detalle de la caja',
  aperturaLabel: 'Apertura',
  cierreLabel: 'Cierre',
  inicialLabel: 'Fondo inicial',
  ventasEfectivoLabel: 'Ventas en efectivo',
  ventasTransfLabel: 'Ventas por transferencia',
  ingresosLabel: 'Ingresos de caja',
  egresosLabel: 'Salidas de caja',
  esperadoLabel: 'Tendría que haber',
  contadoLabel: 'Contado',
  diferenciaLabel: 'Diferencia',
};

export const estadoCierreLabel: Record<EstadoCierre, string> = {
  cuadra: 'Cuadró',
  falta: 'Faltó',
  sobra: 'Sobró',
};

/** Clases de color por estado (texto y fondo tenue). */
export const estadoCierreEstilo: Record<EstadoCierre, { texto: string; chip: string }> = {
  cuadra: { texto: 'text-cuadra', chip: 'bg-cuadra/10 text-cuadra' },
  falta: { texto: 'text-falta', chip: 'bg-falta/10 text-falta' },
  sobra: { texto: 'text-sobra', chip: 'bg-sobra/10 text-sobra' },
};
