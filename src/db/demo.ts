// Datos de ejemplo: llena la app con varios días de operación realista
// (cajas cerradas, ventas con costo, movimientos) para verla funcionando.
//
// Es NO destructivo: solo agrega días PASADOS y no toca la caja de hoy ni tus
// ventas reales. Es idempotente: marca sus cajas y limpia la tanda anterior
// antes de volver a generar. "Empezar de cero" (Ajustes) borra todo.

import { calcularCierreCaja } from '../lib/caja';
import { inicioDelDia } from '../lib/fecha';
import { nuevoUuid } from '../lib/uuid';
import { db } from './db';
import type { CajaSesion, CategoriaMovimiento, Movimiento, Producto, Venta, VentaItem } from './types';

const MS_DIA = 24 * 60 * 60 * 1000;
const MS_HORA = 60 * 60 * 1000;
/** Marca en notaCierre para reconocer (y limpiar) las cajas de demo. */
const MARCA_DEMO = '🧪 demo';

// PRNG determinístico (mulberry32): la demo sale igual en cada corrida.
function crearRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rint = (r: () => number, min: number, max: number) =>
  min + Math.floor(r() * (max - min + 1));
const pick = <T>(r: () => number, arr: T[]): T => arr[Math.floor(r() * arr.length)];
const redondear = (n: number, paso = 50) => Math.round(n / paso) * paso;

/** Borra la tanda de demo anterior (cajas marcadas + sus ventas y movimientos). */
async function limpiarDemoPrevio(): Promise<void> {
  const cajas = await db.cajas.toArray();
  const demoUuids = new Set(
    cajas.filter((c) => c.notaCierre?.startsWith(MARCA_DEMO)).map((c) => c.uuid),
  );
  if (demoUuids.size === 0) return;

  const [ventas, movs] = await Promise.all([db.ventas.toArray(), db.movimientos.toArray()]);
  await db.transaction('rw', [db.cajas, db.ventas, db.movimientos], async () => {
    for (const v of ventas) if (v.cajaUuid && demoUuids.has(v.cajaUuid) && v.id != null) await db.ventas.delete(v.id);
    for (const m of movs) if (demoUuids.has(m.cajaUuid) && m.id != null) await db.movimientos.delete(m.id);
    const cajasABorrar = cajas.filter((c) => demoUuids.has(c.uuid) && c.id != null);
    for (const c of cajasABorrar) await db.cajas.delete(c.id!);
  });
}

/** Le pone un costo razonable (55–80% del precio) a los productos que no tengan. */
async function asegurarCostos(productos: Producto[], r: () => number): Promise<void> {
  const sinCosto = productos.filter((p) => p.costo == null && p.precio > 0 && p.id != null);
  await db.transaction('rw', db.productos, async () => {
    for (const p of sinCosto) {
      const costo = Math.max(10, redondear(p.precio * (0.55 + r() * 0.25), 10));
      await db.productos.update(p.id!, { costo });
      p.costo = costo;
    }
  });
}

/**
 * Le pone stock de ejemplo a los productos que no lleven, para mostrar el
 * inventario lleno: la mayoría con stock holgado y algunos bajos/agotados
 * para que se vean las alertas. No toca los que ya llevan stock.
 */
async function asegurarStock(productos: Producto[], r: () => number): Promise<void> {
  const sinStock = productos.filter((p) => p.stock == null && p.id != null);
  await db.transaction('rw', db.productos, async () => {
    for (const p of sinStock) {
      const sorteo = r();
      // 10% agotado, 18% bajo, el resto con stock sano.
      const stock = sorteo < 0.1 ? 0 : sorteo < 0.28 ? rint(r, 1, 3) : rint(r, 8, 60);
      await db.productos.update(p.id!, { stock });
      p.stock = stock;
    }
  });
}

export interface ResultadoDemo {
  dias: number;
  cajas: number;
  ventas: number;
}

/** Genera ~`dias` días de operación de ejemplo. Devuelve cuánto creó. */
export async function cargarDatosDemo(dias = 14): Promise<ResultadoDemo> {
  const r = crearRandom(0x0f3d2e);
  await limpiarDemoPrevio();

  const productos = await db.productos.toArray();
  if (productos.length === 0) return { dias: 0, cajas: 0, ventas: 0 };
  await asegurarCostos(productos, r);
  await asegurarStock(productos, r);

  const egresoCats: CategoriaMovimiento[] = ['proveedor', 'gasto', 'retiro'];
  const cajasNuevas: CajaSesion[] = [];
  const ventasNuevas: Venta[] = [];
  const movsNuevos: Movimiento[] = [];

  for (let d = dias; d >= 1; d--) {
    const base = inicioDelDia(Date.now() - d * MS_DIA);
    const cajaUuid = nuevoUuid();
    const abiertaEn = base + 9 * MS_HORA + rint(r, 0, 40) * 60000;
    const cerradaEn = base + (20 + rint(r, 0, 2)) * MS_HORA + rint(r, 0, 50) * 60000;
    const montoInicial = pick(r, [8000, 10000, 12000, 15000]);

    // Ventas del día.
    let ventasEfectivo = 0;
    let ventasTransferencia = 0;
    const nVentas = rint(r, 9, 24);
    for (let i = 0; i < nVentas; i++) {
      const items: VentaItem[] = [];
      const nItems = rint(r, 1, 4);
      for (let j = 0; j < nItems; j++) {
        const p = pick(r, productos);
        if (p.id == null) continue;
        items.push({
          productoId: p.id,
          nombre: p.nombre,
          precio: p.precio,
          costo: p.costo,
          cantidad: rint(r, 1, 3),
        });
      }
      if (items.length === 0) continue;
      const total = items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
      const medioPago = r() < 0.8 ? 'efectivo' : 'transferencia';
      if (medioPago === 'efectivo') ventasEfectivo += total;
      else ventasTransferencia += total;
      ventasNuevas.push({
        fecha: base + Math.floor((9.5 + r() * 10.5) * MS_HORA),
        items,
        total,
        medioPago,
        cajaUuid,
      });
    }

    // Movimientos del día (0–3).
    let ingresos = 0;
    let egresos = 0;
    const nMovs = rint(r, 0, 3);
    for (let i = 0; i < nMovs; i++) {
      const esEgreso = r() < 0.7;
      const fecha = base + Math.floor((10 + r() * 9) * MS_HORA);
      if (esEgreso) {
        const monto = redondear(rint(r, 2000, 35000));
        egresos += monto;
        movsNuevos.push(mov(cajaUuid, 'egreso', monto, pick(r, egresoCats), fecha));
      } else {
        const monto = redondear(rint(r, 2000, 12000));
        ingresos += monto;
        movsNuevos.push(mov(cajaUuid, 'ingreso', monto, 'aporte', fecha));
      }
    }

    // Cierre: la mayoría cuadra, algunas con descuadre chico.
    const esperado = montoInicial + ventasEfectivo + ingresos - egresos;
    const sorteo = r();
    const descuadre = sorteo < 0.6 ? 0 : redondear(rint(r, 100, 2500), 50) * (sorteo < 0.8 ? -1 : 1);
    const contado = esperado + descuadre;
    const calc = calcularCierreCaja(
      { montoInicial, ventasEfectivo, ingresosEfectivo: ingresos, egresosEfectivo: egresos },
      contado,
    );

    cajasNuevas.push({
      uuid: cajaUuid,
      estado: 'cerrada',
      montoInicial,
      abiertaEn,
      cerradaEn,
      ventasEfectivo,
      ventasTransferencia,
      ingresosEfectivo: ingresos,
      egresosEfectivo: egresos,
      esperadoEfectivo: calc.esperado,
      contadoEfectivo: contado,
      diferencia: calc.diferencia,
      estadoCuadre: calc.estado,
      notaCierre: MARCA_DEMO,
      updatedAt: cerradaEn,
      dirty: true,
    });
  }

  await db.transaction('rw', [db.cajas, db.ventas, db.movimientos], async () => {
    await db.cajas.bulkAdd(cajasNuevas);
    await db.ventas.bulkAdd(ventasNuevas);
    await db.movimientos.bulkAdd(movsNuevos);
  });

  return { dias, cajas: cajasNuevas.length, ventas: ventasNuevas.length };
}

function mov(
  cajaUuid: string,
  tipo: 'ingreso' | 'egreso',
  monto: number,
  categoria: CategoriaMovimiento,
  fecha: number,
): Movimiento {
  return { uuid: nuevoUuid(), cajaUuid, tipo, monto, categoria, fecha, updatedAt: fecha, dirty: true };
}
