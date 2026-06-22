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

export type MedioPago = 'efectivo' | 'transferencia' | 'fiado';

export interface Producto {
  id?: number;
  nombre: string;
  precio: number;
  /** Precio de compra. Opcional: habilita el cálculo de margen y ganancia. */
  costo?: number;
  /** Precio mayorista. Opcional: si falta, la lista mayorista usa `precio`. */
  precioMayor?: number;
  emoji?: string;
  /** Categoría a la que pertenece (uuid estable). */
  categoriaUuid?: string;
  /** Código de barras (para el lector). */
  codigoBarras?: string;
  /**
   * Unidades en mano. Opcional: si es `undefined`, el producto NO lleva stock
   * (no se descuenta al vender ni genera alertas). Si es un número, se lleva.
   */
  stock?: number;
  /** Umbral de aviso de stock bajo. Si falta, se usa `STOCK_MIN_DEFAULT`. */
  stockMin?: number;
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

// ---- Fiados / cuenta corriente ----

export interface Cliente extends Sincronizable {
  id?: number;
  nombre: string;
  telefono?: string;
}

/** Movimiento de la cuenta corriente de un cliente. */
export type TipoCuenta = 'cargo' | 'pago';

export interface MovimientoCuenta extends Sincronizable {
  id?: number;
  clienteUuid: string;
  /** `cargo` = se llevó fiado (debe más); `pago` = abonó (debe menos). */
  tipo: TipoCuenta;
  monto: number;
  fecha: number;
  /** Si el cargo nació de una venta del POS. */
  ventaId?: number;
  /** Con qué pagó (solo en `pago`). */
  medioPago?: MedioPago;
  nota?: string;
}

export interface Config {
  /** Singleton: siempre id = 1. */
  id?: number;
  nombreKiosco: string;
  /** Fondo inicial por defecto, editable. */
  fondoInicial: number;
  onboardingCompletado: boolean;
}
