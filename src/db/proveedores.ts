// Base de datos para proveedores y pedidos.
// Conectado con stock, productos y caja.

import { nuevoUuid } from '../lib/uuid';
import { db } from './db';
import type { Producto } from '../db/types';

export interface Proveedor {
  id?: number;
  uuid: string;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
  /** Días habituales de entrega (ej: [1,3,5] = lunes, miércoles, viernes). */
  diasEntrega?: number[];
  updatedAt: number;
  dirty: boolean;
}

export interface PedidoItem {
  productoId: number;
  nombre: string;
  cantidadSolicitada: number;
  cantidadRecibida?: number;
  costoUnitario?: number;
}

export type EstadoPedido = 'pendiente' | 'parcial' | 'recibido' | 'cancelado';

export interface Pedido {
  id?: number;
  uuid: string;
  proveedorUuid: string;
  fecha: number;
  items: PedidoItem[];
  estado: EstadoPedido;
  totalEstimado?: number;
  notas?: string;
  recibidoEn?: number;
  updatedAt: number;
  dirty: boolean;
}

/** Lista de proveedores ordenada por nombre. */
export function listarProveedores(): Promise<Proveedor[]> {
  return db.proveedores.orderBy('nombre').toArray();
}

export async function agregarProveedor(p: Omit<Proveedor, 'id' | 'uuid' | 'updatedAt' | 'dirty'>): Promise<number> {
  const ahora = Date.now();
  return db.proveedores.add({
    ...p,
    uuid: nuevoUuid(),
    updatedAt: ahora,
    dirty: true,
  });
}

export async function editarProveedor(id: number, cambios: Partial<Proveedor>): Promise<void> {
  await db.proveedores.update(id, {
    ...cambios,
    updatedAt: Date.now(),
    dirty: true,
  });
}

export async function borrarProveedor(id: number): Promise<void> {
  await db.proveedores.delete(id);
}

/** Pedidos de un proveedor, más nuevos primero. */
export async function pedidosDeProveedor(proveedorUuid: string): Promise<Pedido[]> {
  const lista = await db.pedidos.where('proveedorUuid').equals(proveedorUuid).toArray();
  return lista.sort((a, b) => b.fecha - a.fecha);
}

/** Pedidos pendientes o parciales. */
export async function pedidosPendientes(): Promise<Pedido[]> {
  const lista = await db.pedidos.toArray();
  return lista.filter(p => p.estado === 'pendiente' || p.estado === 'parcial')
    .sort((a, b) => a.fecha - b.fecha);
}

/** Crea un pedido a proveedor. */
export async function crearPedido(datos: {
  proveedorUuid: string;
  items: PedidoItem[];
  notas?: string;
}): Promise<number> {
  const ahora = Date.now();
  const totalEstimado = datos.items.reduce(
    (acc, item) => acc + (item.costoUnitario ?? 0) * item.cantidadSolicitada,
    0
  );
  
  const pedido: Pedido = {
    uuid: nuevoUuid(),
    proveedorUuid: datos.proveedorUuid,
    fecha: ahora,
    items: datos.items,
    estado: 'pendiente',
    totalEstimado,
    notas: datos.notas?.trim(),
    updatedAt: ahora,
    dirty: true,
  };
  
  return db.pedidos.add(pedido);
}

/** Actualiza el estado de un pedido y opcionalmente recibe mercadería. */
export async function recibirPedido(
  pedidoId: number,
  itemsRecibidos: { productoId: number; cantidad: number; costoUnitario?: number }[],
): Promise<void> {
  await db.transaction('rw', db.pedidos, db.productos, async () => {
    const pedido = await db.pedidos.get(pedidoId);
    if (!pedido) return;
    
    // Actualizar items del pedido
    for (const itemRecibido of itemsRecibidos) {
      const itemPedido = pedido.items.find(i => i.productoId === itemRecibido.productoId);
      if (itemPedido) {
        itemPedido.cantidadRecibida = itemRecibido.cantidad;
        itemPedido.costoUnitario = itemRecibido.costoUnitario;
      }
    }
    
    // Verificar si está completo
    const todosCompleto = pedido.items.every(
      i => (i.cantidadRecibida ?? 0) >= i.cantidadSolicitada
    );
    
    pedido.estado = todosCompleto ? 'recibido' : 'parcial';
    pedido.recibidoEn = todosCompleto ? Date.now() : undefined;
    pedido.updatedAt = Date.now();
    pedido.dirty = true;
    
    await db.pedidos.update(pedidoId, pedido);
    
    // Si está recibido, actualizar costos y stock de productos
    if (todosCompleto) {
      for (const item of pedido.items) {
        if (item.cantidadRecibida && item.costoUnitario != null) {
          const producto = await db.productos.get(item.productoId);
          if (producto) {
            await db.productos.update(item.productoId, {
              costo: item.costoUnitario,
              stock: (producto.stock ?? 0) + item.cantidadRecibida,
            });
          }
        }
      }
    }
  });
}

export async function cancelarPedido(pedidoId: number): Promise<void> {
  await db.pedidos.update(pedidoId, {
    estado: 'cancelado',
    updatedAt: Date.now(),
    dirty: true,
  });
}

/** Generar sugerencia de pedido basada en stock bajo y ventas históricas. */
export async function sugerirPedidoAutomatico(
  proveedorUuid: string,
  productosDelProveedor: Producto[],
): Promise<PedidoItem[]> {
  const itemsSugeridos: PedidoItem[] = [];
  
  for (const producto of productosDelProveedor) {
    if (producto.stock == null) continue;
    
    const umbral = producto.stockMin ?? 3;
    if (producto.stock <= umbral) {
      // Sugerir reposición para llegar a 2 semanas de stock promedio
      const cantidadSugerida = Math.max(umbral * 4 - producto.stock, umbral * 2);
      
      itemsSugeridos.push({
        productoId: producto.id!,
        nombre: producto.nombre,
        cantidadSolicitada: cantidadSugerida,
        costoUnitario: producto.costo,
      });
    }
  }
  
  return itemsSugeridos;
}

/** Historial de compras a un proveedor (total gastado). */
export async function historialComprasProveedor(proveedorUuid: string): Promise<{ total: number; cantidadPedidos: number }> {
  const pedidos = await pedidosDeProveedor(proveedorUuid);
  const recibidos = pedidos.filter(p => p.estado === 'recibido');
  
  const total = recibidos.reduce((acc, pedido) => {
    return acc + (pedido.items.reduce((sum, item) => {
      return sum + (item.costoUnitario ?? 0) * (item.cantidadRecibida ?? item.cantidadSolicitada);
    }, 0) || pedido.totalEstimado || 0);
  }, 0);
  
  return {
    total,
    cantidadPedidos: recibidos.length,
  };
}
