import type { FilaImportada } from './tipos';

/**
 * Lee una foto de un cuaderno/lista de precios y devuelve el catálogo.
 *
 * ⚠️ MOCK por ahora. En la Fase D esto va a llamar a una Supabase Edge Function
 * que invoca la Claude API (visión) con un prompt que pide devolver JSON
 * estructurado [{ nombre, precio, categoria }]. La API key vive en el backend,
 * nunca en la PWA. La interfaz (File → Promise<FilaImportada[]>) ya queda fija,
 * así que enchufar la IA real es cambiar solo el cuerpo de esta función.
 */
export async function parseFoto(_file: File): Promise<FilaImportada[]> {
  // Simula el tiempo de "analizando la foto…".
  await new Promise((resolve) => setTimeout(resolve, 1800));

  // Catálogo de ejemplo, como si la IA hubiera leído un cuaderno de kiosco.
  return [
    { nombre: 'Coca Cola 1.5L', precio: 2500, categoria: 'Bebidas', incluir: true },
    { nombre: 'Sprite 1.5L', precio: 2300, categoria: 'Bebidas', incluir: true },
    { nombre: 'Agua Villavicencio 500ml', precio: 1000, categoria: 'Bebidas', incluir: true },
    { nombre: 'Marlboro Box', precio: 3200, categoria: 'Cigarrillos', incluir: true },
    { nombre: 'Philip Morris', precio: 3000, categoria: 'Cigarrillos', incluir: true },
    { nombre: 'Alfajor Jorgito', precio: 1200, categoria: 'Golosinas', incluir: true },
    { nombre: 'Rhodesia', precio: 1300, categoria: 'Golosinas', incluir: true },
    { nombre: 'Chicle Beldent', precio: 600, categoria: 'Golosinas', incluir: true },
    { nombre: 'Galletitas Oreo', precio: 1500, categoria: 'Galletitas', incluir: true },
    { nombre: 'Criollitas', precio: 1100, categoria: 'Galletitas', incluir: true },
  ];
}
