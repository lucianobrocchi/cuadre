import Dexie, { type Table } from 'dexie';
import type {
  CajaSesion,
  Categoria,
  Cierre,
  Cliente,
  Config,
  Egreso,
  Movimiento,
  MovimientoCuenta,
  Producto,
  Venta,
} from './types';

/**
 * Base de datos local de Cuadre (IndexedDB vía Dexie).
 * Local-first: no hay backend, todo se guarda en el dispositivo.
 */
export class CuadreDB extends Dexie {
  productos!: Table<Producto, number>;
  ventas!: Table<Venta, number>;
  cajas!: Table<CajaSesion, number>;
  movimientos!: Table<Movimiento, number>;
  categorias!: Table<Categoria, number>;
  clientes!: Table<Cliente, number>;
  cuentas!: Table<MovimientoCuenta, number>;
  config!: Table<Config, number>;
  // Legacy (v1): se mantienen declaradas para no perder datos viejos.
  egresos!: Table<Egreso, number>;
  cierres!: Table<Cierre, number>;

  constructor() {
    super('cuadre');

    // v1: modelo original (cierre "del día" + egresos sueltos).
    this.version(1).stores({
      productos: '++id, nombre',
      ventas: '++id, fecha',
      egresos: '++id, fecha',
      cierres: '++id, fecha',
      config: '++id',
    });

    // v2: sesiones de caja (apertura/cierre) + movimientos de efectivo.
    this.version(2).stores({
      productos: '++id, nombre',
      ventas: '++id, fecha, cajaUuid',
      cajas: '++id, &uuid, estado, abiertaEn',
      movimientos: '++id, &uuid, cajaUuid, fecha, tipo',
      config: '++id',
      // Legacy: siguen existiendo pero la UI ya no las usa.
      egresos: '++id, fecha',
      cierres: '++id, fecha',
    });

    // v3: categorías de productos + código de barras.
    this.version(3).stores({
      productos: '++id, nombre, categoriaUuid, codigoBarras',
      ventas: '++id, fecha, cajaUuid',
      cajas: '++id, &uuid, estado, abiertaEn',
      movimientos: '++id, &uuid, cajaUuid, fecha, tipo',
      categorias: '++id, &uuid, orden',
      config: '++id',
      egresos: '++id, fecha',
      cierres: '++id, fecha',
    });

    // v4: fiados / cuenta corriente (clientes + movimientos de cuenta).
    this.version(4).stores({
      productos: '++id, nombre, categoriaUuid, codigoBarras',
      ventas: '++id, fecha, cajaUuid',
      cajas: '++id, &uuid, estado, abiertaEn',
      movimientos: '++id, &uuid, cajaUuid, fecha, tipo',
      categorias: '++id, &uuid, orden',
      clientes: '++id, &uuid, nombre',
      cuentas: '++id, &uuid, clienteUuid, fecha, tipo',
      config: '++id',
      egresos: '++id, fecha',
      cierres: '++id, fecha',
    });
  }
}

export const db = new CuadreDB();
