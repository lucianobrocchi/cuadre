export const resumenCopy = {
  headerTitulo: 'Resumen del día',
  vendidoLabel: 'Vendido hoy',
  efectivoLabel: 'Efectivo',
  transferenciaLabel: 'Transferencia',
  ventasLabel: 'Ventas',
  egresosLabel: 'Salidas',
  topLabel: 'Lo más vendido',
  sinVentas: 'Todavía no vendiste nada hoy. ¡A darle!',
  sinTop: 'Sin ventas aún',
  unidades: (n: number) => (n === 1 ? '1 unidad' : `${n} unidades`),

  // Lista de ventas
  ventasDeHoy: 'Ventas de hoy',
  itemsResumen: (n: number) => (n === 1 ? '1 ítem' : `${n} ítems`),

  // Detalle de una venta
  detalleTitulo: 'Detalle de la venta',
  totalLabel: 'Total',
  anular: 'Anular venta',
  anularConfirm: '¿Anular esta venta? No se puede deshacer.',
};
