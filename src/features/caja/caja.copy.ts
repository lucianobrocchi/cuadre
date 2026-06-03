import type { CategoriaMovimiento, TipoMovimiento } from '../../db/types';

export const cajaCopy = {
  // Estado / barra
  cajaAbierta: 'Caja abierta',
  cajaCerrada: 'Sin caja abierta',
  enCaja: 'En caja',
  desde: (hora: string) => `Abierta ${hora} hs`,

  // Sin caja (gate del POS)
  sinCajaTitulo: 'Abrí la caja para empezar a vender',
  sinCajaSub: 'Contá la plata con la que arrancás y abrí la caja del día.',
  abrirCta: 'Abrir caja',

  // Abrir caja
  abrirTitulo: 'Abrir caja',
  abrirMontoLabel: '¿Con cuánta plata arrancás?',
  abrirMontoHint: 'El efectivo que ya tenés en la caja para dar vuelto.',
  abrirBoton: 'Abrir caja',

  // Hub Caja
  hubAbrirTitulo: 'Abrí la caja',
  hubAbrirSub: 'Necesitás una caja abierta para vender',
  cerrarTitulo: 'Cerrar caja',
  cerrarSub: 'Contá la plata y fijate si cuadra',
  movimientosTitulo: 'Movimientos de caja',
  movimientosSub: 'Ingresos y salidas de efectivo',
  resumenTitulo: 'Resumen del día',
  resumenSub: 'Cuánto vendiste hoy',

  // Cerrar caja
  cerrarHeaderSub: 'El cierre de la caja',
  resumenSesionTitulo: 'Así viene tu caja',
  inicialLabel: 'Fondo inicial',
  ventasEfectivoLabel: 'Ventas en efectivo',
  ingresosLabel: 'Ingresos de caja',
  egresosLabel: 'Salidas de caja',
  esperadoLabel: 'Tendría que haber',
  esperadoHint: 'Inicial + ventas + ingresos − salidas',
  contadoLabel: '¿Cuánta plata contaste en la caja?',
  contadoHint: 'Toda la plata, incluido el fondo inicial.',
  contadoPlaceholder: 'Total contado',
  verSiCuadra: 'Cerrar y ver si cuadra',
  transferenciaNota: (monto: string) =>
    `📱 Además cobraste ${monto} por transferencia. Eso no entra a la caja, por eso no cuenta acá.`,

  // Resultado
  resultado: {
    cuadra: {
      titulo: '¡Cuadró la caja!',
      detalle: 'La plata que contaste coincide justo con lo que tendría que haber. Impecable.',
    },
    falta: (monto: string) => ({
      titulo: `Te faltan ${monto}`,
      detalle:
        'Puede ser un vuelto mal dado o una venta sin registrar. Ya quedó guardado para revisar.',
    }),
    sobra: (monto: string) => ({
      titulo: `Te sobran ${monto}`,
      detalle: 'Quizás cobraste algo que no anotaste. Igual, ya quedó registrado.',
    }),
  },
  detalleEsperado: 'Tendría que haber',
  detalleContado: 'Contaste',
  listo: 'Listo',

  // Movimientos
  movHeaderSub: 'Ingresos y salidas de efectivo',
  anotarIngreso: 'Anotar ingreso',
  anotarEgreso: 'Anotar salida',
  totalIngresos: 'Ingresos',
  totalEgresos: 'Salidas',
  movVacioTitulo: 'Sin movimientos todavía',
  movVacioSub: 'Anotá la plata que entra o sale de la caja durante el día.',
  borrarConfirm: '¿Borrar este movimiento?',
  // Form
  formIngresoTitulo: 'Anotar ingreso',
  formEgresoTitulo: 'Anotar salida',
  montoLabel: 'Monto',
  categoriaLabel: '¿Qué fue?',
  notaLabel: 'Nota (opcional)',
  notaPlaceholder: 'Ej: pago a Coca',
  guardar: 'Guardar',
};

export const tiposMovimiento: { id: TipoMovimiento; label: string; emoji: string }[] = [
  { id: 'egreso', label: 'Sale plata', emoji: '↘️' },
  { id: 'ingreso', label: 'Entra plata', emoji: '↗️' },
];

export const categoriasPorTipo: Record<
  TipoMovimiento,
  { id: CategoriaMovimiento; label: string; emoji: string }[]
> = {
  egreso: [
    { id: 'proveedor', label: 'Proveedor', emoji: '🚚' },
    { id: 'retiro', label: 'Retiro', emoji: '💸' },
    { id: 'gasto', label: 'Gasto', emoji: '🧾' },
    { id: 'otro', label: 'Otro', emoji: '📦' },
  ],
  ingreso: [
    { id: 'aporte', label: 'Aporte', emoji: '💰' },
    { id: 'otro', label: 'Otro', emoji: '📦' },
  ],
};

export function etiquetaCategoriaMov(id: CategoriaMovimiento): { label: string; emoji: string } {
  const todas = [...categoriasPorTipo.egreso, ...categoriasPorTipo.ingreso];
  return todas.find((c) => c.id === id) ?? { label: 'Otro', emoji: '📦' };
}
