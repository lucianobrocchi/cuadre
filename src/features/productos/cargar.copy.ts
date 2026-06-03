export const cargarCopy = {
  headerTitulo: 'Cargar del catálogo',
  headerSub: 'Tocá lo que vendés y agregalo todo junto',
  yaCargado: 'Ya está',
  precio: 'Precio',
  costo: 'Costo',
  gananciaPct: (pct: number) => `+${pct}%`,
  buscarPh: 'Buscar producto…',
  agregarCategoria: (n: number) => `Agregar los ${n} de esta categoría`,
  quitarCategoria: 'Quitar todos',
  sinResultados: 'No encontré nada con eso.',
  agregarBtn: (n: number) => `Agregar ${n} ${n === 1 ? 'producto' : 'productos'}`,
  sinSeleccion: 'Tocá los productos que vendés',
  listoTitulo: '¡Productos cargados!',
  listoSub: (n: number) =>
    `Se agregaron ${n} ${n === 1 ? 'producto' : 'productos'} a tu catálogo.`,
  seguir: 'Seguir cargando',
  volver: 'Volver a productos',
};
