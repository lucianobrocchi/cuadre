export const fiadosCopy = {
  headerTitulo: 'Fiados',
  headerSubtitulo: 'La cuenta de cada cliente',
  enLaCalle: 'En la calle',
  enLaCalleSub: (n: number) => `${n} ${n === 1 ? 'cliente debe' : 'clientes deben'}`,
  todoCobrado: 'Nadie te debe nada 🎉',
  nuevoCliente: 'Nuevo cliente',
  vacioTitulo: 'Todavía no tenés clientes',
  vacioSub: 'Agregá un cliente o fiá desde la pantalla de Vender.',
  debe: 'Debe',
  alDia: 'Al día',
  aFavor: 'A favor',
  sinMovimientos: 'Sin movimientos todavía',

  // Detalle / acciones
  saldoLabel: 'Saldo',
  cobrarBtn: 'Registrar pago',
  fiarBtn: 'Anotar fiado',
  editarBtn: 'Editar',
  borrarBtn: 'Borrar cliente',
  borrarConfirm: (nombre: string) => `¿Borrar a "${nombre}" y toda su cuenta?`,

  // Movimientos
  movCargo: 'Fiado',
  movPago: 'Pago',
  movVenta: 'Venta fiada',

  // Form pago
  pagoTitulo: 'Registrar pago',
  pagoMonto: '¿Cuánto te pagó?',
  pagoTodo: 'Paga todo',
  pagoMedio: '¿Cómo te pagó?',
  pagoEfectivoNota: 'Si hay caja abierta, entra como ingreso de caja.',
  pagoGuardar: 'Guardar pago',

  // Form cargo manual
  cargoTitulo: 'Anotar fiado',
  cargoMonto: '¿Cuánto se llevó fiado?',
  cargoNota: 'Detalle (opcional)',
  cargoNotaPh: 'Ej: 2 gaseosas y pan',
  cargoGuardar: 'Anotar',

  // Form cliente
  nombreLabel: 'Nombre',
  nombrePh: 'Ej: Juan del 3',
  telefonoLabel: 'Teléfono (opcional)',
  telefonoPh: 'Para mandarle el recordatorio',
  guardarCliente: 'Guardar',
};
