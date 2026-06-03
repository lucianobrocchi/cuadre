/** Una fila de producto a importar, antes de confirmar. */
export interface FilaImportada {
  nombre: string;
  precio: number;
  /** Precio de compra (opcional; habilita el margen en el dashboard). */
  costo?: number;
  /** Nombre de la categoría (texto libre; se crea/asigna al confirmar). */
  categoria?: string;
  codigoBarras?: string;
  /** Si el usuario la deja tildada para importar. */
  incluir: boolean;
}

export type FuenteImport = 'excel' | 'foto';
