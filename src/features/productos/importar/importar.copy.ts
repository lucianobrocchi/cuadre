export const importarCopy = {
  headerTitulo: 'Importar productos',

  // Elegir fuente
  fuenteTitulo: '¿De dónde traés tus productos?',
  excelTitulo: 'Desde Excel o planilla',
  excelSub: 'Subí un .xlsx o .csv. Detecto nombre, precio y categoría solos.',
  fotoTitulo: 'Desde una foto del cuaderno',
  fotoSub: 'Sacale una foto a tu lista y la armamos sola.',
  fotoBadge: 'IA',
  excelUpload: 'Tocá para elegir el archivo',
  fotoUpload: 'Tocá para sacar o subir una foto',

  // Estados
  analizando: 'Leyendo la foto y armando el catálogo…',
  leyendoExcel: 'Leyendo la planilla…',
  errorVacio: 'No encontré productos. Revisá que tenga columnas de nombre y precio.',
  errorArchivo: 'No pude leer el archivo. Probá con otro .xlsx o .csv.',
  reintentar: 'Probar de nuevo',

  // Preview
  previewTitulo: (n: number) => `${n} ${n === 1 ? 'producto' : 'productos'} para importar`,
  previewSub: 'Revisá, editá lo que haga falta y destildá lo que no quieras.',
  todos: 'Todos',
  importarBtn: (n: number) => `Importar ${n} ${n === 1 ? 'producto' : 'productos'}`,
  importando: 'Importando…',
  sinSeleccion: 'Elegí al menos un producto',

  // Listo
  listoTitulo: '¡Catálogo cargado!',
  listoSub: (n: number) => `Se importaron ${n} ${n === 1 ? 'producto' : 'productos'}.`,
  volver: 'Volver a productos',

  // Placeholders de edición
  phNombre: 'Nombre',
  phCategoria: 'Categoría',
};
