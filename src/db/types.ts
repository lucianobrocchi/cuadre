// Tipos del modelo de datos de Cuadre. Todo vive local en IndexedDB (Dexie).

/**
 * Campos comunes para sincronizar con Supabase más adelante (Fase D).
 * `uuid` es la clave estable cross-device; `updatedAt` resuelve conflictos
 * con last-write-wins; `dirty` marca lo que falta subir; `deleted` propaga borrados.
 */
export interface Sincronizable {
  uuid: string;
  updatedAt: number;
  dirty: boolean;
  deleted?: boolean;
}

export type MedioPago = 'efectivo' | 'transferencia';

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  /** Precio de compra. Opcional: habilita el cálculo de margen y ganancia. */
  costo?: number;
  emoji?: string;
  /** Categoría a la que pertenece (uuid estable). */
  categoriaUuid?: string;
  /** Código de barras (para el lector). */
  codigoBarras?: string;
}

export interface Categoria extends Sincronizable {
  id?: number;
  nombre: string;
  orden: number;
  emoji?: string;
}

export interface VentaItem {
  productoId: number;
  nombre: string;
  precio: number;
  /** Costo al momento de vender (snapshot). Mantiene exacta la ganancia histórica. */
  costo?: number;
  cantidad: number;
}

export interface Venta {
  id?: number;
  /** Timestamp (Date.now()) del momento de la venta. */
  fecha: number;
  items: VentaItem[];
  total: number;
  medioPago: MedioPago;
  /** Sesión de caja a la que pertenece. */
  cajaUuid?: string;
}

// ---- Caja (sesiones) ----

export type EstadoCaja = 'abierta' | 'cerrada';

export interface CajaSesion extends Sincronizable {
  id?: number;
  estado: EstadoCaja;
  /** Efectivo con el que se abre la caja. */
  montoInicial: number;
  abiertaEn: number;
  cerradaEn?: number;
  // Calculados y congelados al cerrar:
  ventasEfectivo?: number;
  ventasTransferencia?: number;
  ingresosEfectivo?: number;
  egresosEfectivo?: number;
  /** inicial + ventasEf + ingresos − egresos */
  esperadoEfectivo?: number;
  contadoEfectivo?: number;
  /** contado − esperado */
  diferencia?: number;
  estadoCuadre?: EstadoCierre;
  notaCierre?: string;
}

// ---- Movimientos de caja (ingresos / egresos de efectivo) ----

export type TipoMovimiento = 'ingreso' | 'egreso';

export type CategoriaMovimiento =
  | 'proveedor'
  | 'retiro'
  | 'gasto'
  | 'aporte'
  | 'otro';

export interface Movimiento extends Sincronizable {
  id?: number;
  cajaUuid: string;
  tipo: TipoMovimiento;
  monto: number;
  categoria: CategoriaMovimiento;
  nota?: string;
  fecha: number;
}

export type CategoriaEgreso = 'proveedor' | 'retiro' | 'gasto' | 'otro';

export interface Egreso {
  id?: number;
  /** Timestamp (Date.now()) del momento del egreso. */
  fecha: number;
  monto: number;
  categoria: CategoriaEgreso;
  nota?: string;
}

export type EstadoCierre = 'cuadra' | 'falta' | 'sobra';

export interface Cierre {
  id?: number;
  /** Timestamp (Date.now()) del momento del cierre. */
  fecha: number;
  fondoInicial: number;
  totalVendidoEfectivo: number;
  totalEgresosEfectivo: number;
  cajaTeorica: number;
  efectivoContado: number;
  diferencia: number;
  estado: EstadoCierre;
}

export interface Config {
  /** Singleton: siempre id = 1. */
  id?: number;
  nombreKiosco: string;
  /** Fondo inicial por defecto, editable. */
  fondoInicial: number;
  onboardingCompletado: boolean;
}
