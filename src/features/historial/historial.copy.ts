import type { EstadoCierre, MedioPago } from '../../db/types';

export const historialCopy = {
  headerTitulo: 'Historial',
  // Pestañas de la pantalla.
  tabVentas: 'Ventas',
  tabCajas: 'Cajas',

  // ---- Ventas de la semana ----
  ventasSubtitulo: 'Tus ventas de los últimos 7 días',
  ventasVacioTitulo: 'Todavía no vendiste nada esta semana',
  ventasVacioSub: 'Cuando hagas tu primera venta, va a aparecer acá.',
  totalSemana: 'Vendido en la semana',
  gananciaSemana: 'Ganancia',
  ventasResumen: (cant: number, dias: number) =>
    `${cant} ${cant === 1 ? 'venta' : 'ventas'} en ${dias} ${dias === 1 ? 'día' : 'días'}`,
  porCobro: (efectivo: string, transferencia: string) =>
    `💵 ${efectivo} · 📱 ${transferencia}`,
  diaResumen: (cant: number, unidades: number) =>
    `${cant} ${cant === 1 ? 'venta' : 'ventas'} · ${unidades} ${unidades === 1 ? 'producto' : 'productos'}`,
  gananciaDia: 'ganancia',
  sinGanancia: 'sin costos',
  // Detalle de un día.
  detalleDiaTitulo: 'Ventas del día',
  ticketHora: (hora: string) => `${hora} hs`,
  ticketUnidades: (n: number) => `${n} ${n === 1 ? 'producto' : 'productos'}`,
  itemLinea: (cantidad: number, nombre: string) =>
    cantidad > 1 ? `${cantidad} × ${nombre}` : nombre,

  // ---- Cajas cerradas ----
  cajasSubtitulo: 'Tus cajas cerradas',
  cajasVacioTitulo: 'Todavía no cerraste ninguna caja',
  cajasVacioSub: 'Cuando cierres tu primera caja, va a aparecer acá.',
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

export const medioLabel: Record<MedioPago, string> = {
  efectivo: '💵 Efectivo',
  transferencia: '📱 Transferencia',
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
