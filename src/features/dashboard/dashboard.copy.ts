export const dashboardCopy = {
  headerTitulo: 'Ganancia',
  headerSubtitulo: 'Cuánto te queda',

  // Selector de período
  periodoHoy: 'Hoy',
  periodoSemana: '7 días',

  // Resumen realizado (lo que ganaste de verdad)
  gananciaLabel: 'Ganancia',
  margen: (pct: string) => `margen ${pct}`,
  vendiste: 'Vendiste',
  costo: 'Costo',
  sinVentas: (semana: boolean) =>
    semana ? 'No vendiste nada en los últimos 7 días.' : 'Todavía no vendiste hoy.',
  sinVentasSub: 'Cuando cobres, acá vas a ver cuánto ganaste.',
  faltanCostosTitulo: 'Vendiste, pero falta saber cuánto ganaste',
  faltanCostosSub: 'Cargá el costo de lo que vendés y la ganancia aparece sola.',
  unidadesSinCosto: (n: number) =>
    `${n} ${n === 1 ? 'unidad' : 'unidades'} sin costo no entran en este número.`,

  // Ranking realizado
  deDondeSalio: 'De dónde salió',

  // Margen del catálogo (potencial)
  catalogoTitulo: 'Margen del catálogo',
  catalogoSub: 'Lo que te deja cada cosa, vendas o no.',
  sinProductosTitulo: 'No tenés productos cargados',
  sinProductosSub: 'Cargá lo que vendés para ver tu margen.',
  sinCosto: 'sin costo',
  nSinCosto: (n: number) => `${n} sin costo`,
  ponerCosto: 'Poné el costo',
  vendidas: (n: number) => `${n} vend.`,

  // Editor de costo
  editorPrecio: 'Precio de venta',
  editorCosto: '¿Cuánto te cuesta?',
  editorGuardar: 'Guardar',
  editorGanancia: (ganancia: string, pct: string) => `Ganás ${ganancia} · ${pct} del precio`,
  editorCostoAlto: 'El costo es mayor que el precio',
};
