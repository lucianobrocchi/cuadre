// Todos los textos de la pestaña Negocio, en rioplatense informal.

export const negocioCopy = {
  headerTitulo: 'Negocio',
  headerSubtitulo: 'Todo el pulso de tu kiosco',

  // Período
  periodoHoy: 'Hoy',
  periodoSemana: '7 días',
  periodoMes: '30 días',

  // Caja ahora (en vivo)
  cajaAhoraTitulo: 'En caja ahora',
  cajaAhoraSub: 'Plata que tendrías que tener en el cajón',
  cajaVendidoTurno: 'Vendido este turno',
  cajaSinAbrir: 'No tenés una caja abierta',
  cajaSinAbrirSub: 'Abrí caja para empezar a vender y ver el efectivo en vivo.',

  // Hero del período
  gananciaLabel: 'Ganancia',
  vendidoLabel: 'Vendido',
  vsAyer: 'vs. ayer',
  vsSemana: 'vs. semana pasada',
  vsMes: 'vs. 30 días previos',
  sinComparacion: 'sin dato previo',
  sinVentasTitulo: 'Todavía no hay ventas en este período',
  sinVentasSub: 'Cuando vendas, acá vas a ver toda la plata.',
  faltanCostos: 'Cargá costos abajo y la ganancia aparece sola.',

  // KPIs
  kpiVendido: 'Vendido',
  kpiGanancia: 'Ganancia',
  kpiTicket: 'Ticket promedio',
  kpiVentas: 'Ventas',
  kpiEfectivo: 'Efectivo',
  kpiTransferencia: 'Transferencia',
  kpiIngresos: 'Ingresos de caja',
  kpiEgresos: 'Salidas de caja',
  flujoTitulo: 'Flujo de efectivo',
  flujoNeto: 'Neto',

  // Tendencia
  tendenciaTitulo: 'Cómo venís',
  tendenciaSub: 'Vendido por día (últimos 30)',
  leyendaVendido: 'Vendido',
  leyendaGanancia: 'Ganancia',

  // Horas
  horasTitulo: 'Tus mejores horas',
  horasSub: 'Cuándo entra la plata',
  horasVacio: 'Todavía no hay suficientes ventas.',
  franjaHora: (h: number) => `${h}–${h + 1} h`,

  // Inteligencia de productos
  productosTitulo: 'Tus productos',
  tabMasVendidos: 'Más vendidos',
  tabMasRentables: 'Más rentables',
  tabAlertas: 'Alertas',
  unidades: (n: number) => `${n} ${n === 1 ? 'unidad' : 'unidades'}`,
  dejaTotal: 'te dejó',
  pierdenPlataTitulo: 'Perdés plata con estos',
  pierdenPlataSub: 'El costo te come el precio. Subí el precio o bajá el costo.',
  sinMovimientoTitulo: 'No se movieron en este período',
  sinMovimientoSub: 'Quizás conviene ofrecerlos o sacarlos.',
  todoOk: '¡Todo en orden!',
  todoOkSub: 'No hay productos perdiendo plata ni costos sin cargar.',
  verMas: (n: number) => `y ${n} más`,

  // Insights (frases automáticas)
  insightSubiste: (pct: string) => `Vendés ${pct} más que el período anterior. ¡Buen envión!`,
  insightBajaste: (pct: string) => `Vendés ${pct} menos que el período anterior. Ojo con esto.`,
  insightEstrella: (nombre: string, plata: string) => `Tu producto estrella es ${nombre}: te dejó ${plata} de ganancia.`,
  insightHoraPico: (franja: string) => `Tu mejor hora es ${franja}. Tené todo a mano para ese pico.`,
  insightPierden: (n: number) => `Tenés ${n} ${n === 1 ? 'producto que pierde' : 'productos que pierden'} plata. Revisalos en Alertas.`,
  insightSinCosto: (n: number) => `Te faltan costos en ${n} ${n === 1 ? 'producto' : 'productos'}: cargalos para ver tu ganancia real.`,
  insightTicket: (plata: string) => `Cada cliente te deja ${plata} en promedio.`,

  // Fiados (acceso desde el panel)
  fiadosTitulo: 'Fiados · en la calle',
  fiadosDeudores: (n: number) => `${n} ${n === 1 ? 'cliente te debe' : 'clientes te deben'}`,
  fiadosTodoCobrado: 'Nadie te debe nada',

  // Inventario / stock
  inventarioTitulo: 'Inventario',
  inventarioSub: 'La plata parada en mercadería',
  invValorCosto: 'Valor a costo',
  invValorVenta: 'A precio de venta',
  invUnidades: (n: number) => `${n} ${n === 1 ? 'unidad' : 'unidades'} en mano`,
  invSinDatosTitulo: 'Todavía no llevás stock',
  invSinDatosSub: 'Activá "Llevar stock" al cargar o editar un producto y vas a ver acá la plata invertida y qué reponer.',
  invSinStock: 'Se acabaron',
  invBajoStock: 'Por reponer pronto',
  invQuedan: (n: number) => `quedan ${n}`,
  invTodoOk: 'Todo con stock sano 👌',

  // Catálogo (márgenes) — viene de la ex pestaña Ganancia
  catalogoTitulo: 'Margen del catálogo',
  catalogoSub: 'Lo que te deja cada cosa. Tocá un producto para ponerle el costo.',
  sinProductosTitulo: 'Todavía no cargaste productos',
  sinProductosSub: 'Cargá tus productos y vas a ver el margen de cada uno.',
  nSinCosto: (n: number) => `${n} sin costo`,
  sinCosto: 'sin costo',
  ponerCosto: 'Poner costo',
  margen: (pct: string) => `Margen ${pct}`,

  // Editor de costo (sheet)
  editorPrecio: 'Precio de venta',
  editorCosto: '¿Cuánto te cuesta?',
  editorGanancia: (plata: string, pct: string) => `Ganás ${plata} (${pct})`,
  editorCostoAlto: 'El costo es mayor o igual al precio: así no ganás nada.',
  editorGuardar: 'Guardar costo',
};
