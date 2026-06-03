import type { FilaImportada } from './tipos';

// Alias de headers comunes (en español e inglés) para autodetectar columnas.
const ALIAS = {
  nombre: ['nombre', 'producto', 'descripcion', 'detalle', 'articulo', 'item', 'name'],
  precio: ['precio', 'precio venta', 'venta', 'price', 'importe', 'valor', 'pvp', 'p venta'],
  categoria: ['categoria', 'rubro', 'tipo', 'category', 'familia'],
  codigo: ['codigo', 'codigo de barras', 'barras', 'ean', 'sku', 'code', 'cod'],
};

const DIACRITICOS = /[̀-ͯ]/g;

function norm(s: unknown): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .toLowerCase()
    .trim();
}

/** Convierte "1.500", "$ 2.300,50", 1500 → número entero de pesos. */
function parsePrecio(v: unknown): number {
  if (typeof v === 'number') return Math.round(v);
  let s = norm(v).replace(/[^\d.,]/g, '');
  if (!s) return 0;
  // Formato AR con coma decimal: "1.500,50" → "1500.50"
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

/** Lee un .xlsx / .csv en el navegador y devuelve las filas de productos. */
export async function parseExcel(file: File): Promise<FilaImportada[]> {
  // Carga diferida: el bundle de SheetJS solo se baja al importar.
  const XLSX = await import('xlsx');
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false });
  if (rows.length === 0) return [];

  const header = (rows[0] as unknown[]).map(norm);
  const findCol = (aliases: string[]) => header.findIndex((h) => aliases.includes(h));

  let idxNombre = findCol(ALIAS.nombre);
  let idxPrecio = findCol(ALIAS.precio);
  let dataStart = 1;

  // Sin header reconocible: asumimos columna 0 = nombre, columna 1 = precio.
  if (idxNombre === -1 || idxPrecio === -1) {
    idxNombre = 0;
    idxPrecio = 1;
    dataStart = 0;
  }
  const idxCat = findCol(ALIAS.categoria);
  const idxCod = findCol(ALIAS.codigo);

  const out: FilaImportada[] = [];
  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const nombre = String(row[idxNombre] ?? '').trim();
    if (!nombre) continue;
    out.push({
      nombre,
      precio: parsePrecio(row[idxPrecio]),
      categoria: idxCat >= 0 ? String(row[idxCat] ?? '').trim() || undefined : undefined,
      codigoBarras: idxCod >= 0 ? String(row[idxCod] ?? '').trim() || undefined : undefined,
      incluir: true,
    });
  }
  return out;
}
