// Alertas inteligentes para el kiosco.
// Detecta situaciones accionables: stock bajo, desvíos de venta, fiados vencidos, etc.

import type { Venta, Producto, MovimientoCuenta } from '../db/types';
import { estadoStock, llevaStock, umbralStock } from './stock';
import type { ProyeccionDia } from './proyecciones';

export type TipoAlerta = 
  | 'stock_bajo'
  | 'stock_agotado'
  | 'venta_baja'
  | 'venta_alta'
  | 'fiado_vencido'
  | 'producto_sin_costo'
  | 'caja_abierta';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  /** Timestamp de creación. */
  creadaEn: number;
  /** Datos adicionales para actuar sobre la alerta. */
  datos?: Record<string, unknown>;
}

/** Genera todas las alertas relevantes para el kiosco en este momento. */
export function generarAlertas(
  productos: Producto[],
  ventasHoy: Venta[],
  ventasHistoricas: Venta[],
  fiadosVencidos: MovimientoCuenta[],
  proyeccion: ProyeccionDia,
): Alerta[] {
  const alertas: Alerta[] = [];
  const ahora = Date.now();

  // 1. Alertas de stock
  for (const p of productos) {
    if (!llevaStock(p)) continue;
    
    const estado = estadoStock(p);
    if (estado === 'sin') {
      alertas.push({
        id: `stock_agotado_${p.id}`,
        tipo: 'stock_agotado',
        titulo: 'Producto agotado',
        mensaje: `${p.nombre} está sin stock. ¡Reponer urgente!`,
        prioridad: 'alta',
        creadaEn: ahora,
        datos: { productoId: p.id, nombre: p.nombre },
      });
    } else if (estado === 'bajo') {
      alertas.push({
        id: `stock_bajo_${p.id}`,
        tipo: 'stock_bajo',
        titulo: 'Stock bajo',
        mensaje: `${p.nombre} tiene ${p.stock} unidades (umbral: ${umbralStock(p)}).`,
        prioridad: 'media',
        creadaEn: ahora,
        datos: { productoId: p.id, nombre: p.nombre, stock: p.stock, umbral: umbralStock(p) },
      });
    }
  }

  // 2. Alertas de proyección de ventas
  if (proyeccion.horaActual >= 12 && proyeccion.historicoPromedio > 0) {
    if (proyeccion.desvioPct < -20) {
      alertas.push({
        id: 'venta_baja_hoy',
        tipo: 'venta_baja',
        titulo: 'Ventas por debajo del promedio',
        mensaje: `Estás vendiendo ${Math.abs(Math.round(proyeccion.desvioPct))}% menos que el promedio histórico a esta hora.`,
        prioridad: 'alta',
        creadaEn: ahora,
        datos: { desvioPct: proyeccion.desvioPct, proyectadoTotal: proyeccion.proyectadoTotal },
      });
    } else if (proyeccion.desvioPct > 25) {
      alertas.push({
        id: 'venta_alta_hoy',
        tipo: 'venta_alta',
        titulo: '¡Ventas récord!',
        mensaje: `Estás vendiendo ${Math.round(proyeccion.desvioPct)}% más que el promedio. ¡Aprovechá el impulso!`,
        prioridad: 'baja',
        creadaEn: ahora,
        datos: { desvioPct: proyeccion.desvioPct, proyectadoTotal: proyeccion.proyectadoTotal },
      });
    }
  }

  // 3. Alertas de fiados vencidos
  if (fiadosVencidos.length > 0) {
    alertas.push({
      id: `fiados_vencidos_${fiadosVencidos.length}`,
      tipo: 'fiado_vencido',
      titulo: 'Fiados pendientes',
      mensaje: `${fiadosVencidos.length} cliente(s) tienen cuentas pendientes de cobro.`,
      prioridad: 'media',
      creadaEn: ahora,
      datos: { cantidad: fiadosVencidos.length },
    });
  }

  // 4. Productos sin costo (no se puede calcular ganancia)
  const sinCosto = productos.filter(p => p.costo == null && p.precio > 0);
  if (sinCosto.length > 0 && sinCosto.length <= 5) {
    alertas.push({
      id: 'productos_sin_costo',
      tipo: 'producto_sin_costo',
      titulo: 'Productos sin costo',
      mensaje: `${sinCosto.length} producto(s) no tienen costo cargado. No podés ver tu ganancia real.`,
      prioridad: 'baja',
      creadaEn: ahora,
      datos: { cantidad: sinCosto.length, productos: sinCosto.map(p => ({ id: p.id, nombre: p.nombre })) },
    });
  }

  return alertas.sort((a, b) => {
    const prioridadOrden = { alta: 0, media: 1, baja: 2 };
    return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
  });
}

/** Mensaje sugerido para WhatsApp recordando un fiado. */
export function mensajeRecordatorioFiado(clienteNombre: string, monto: number): string {
  return `Hola ${clienteNombre} 👋, te recuerdo que tenés $${monto.toLocaleString('es-AR')} pendiente en el kiosco. ¡Gracias!`;
}

/** Recomendación de reposición basada en ventas históricas. */
export function sugerirReposicion(
  producto: Producto,
  ventasUltimos7Dias: number,
): string | null {
  if (!llevaStock(producto) || producto.stock == null) return null;
  
  const promedioDiario = ventasUltimos7Dias / 7;
  const diasRestantes = producto.stock / (promedioDiario || 1);
  
  if (diasRestantes < 3) {
    return `Reponer pronto: se acaba en ${Math.round(diasRestantes)} días.`;
  }
  return null;
}
