import { useCallback, useMemo, useState } from 'react';
import type { Producto, VentaItem } from '../../db/types';

/** Estado del ticket en curso (carrito de la venta actual). */
export function useTicket() {
  const [items, setItems] = useState<VentaItem[]>([]);

  const agregar = useCallback((p: Producto) => {
    if (p.id == null) return;
    const id = p.id;
    setItems((prev) => {
      const existe = prev.find((it) => it.productoId === id);
      if (existe) {
        return prev.map((it) =>
          it.productoId === id ? { ...it, cantidad: it.cantidad + 1 } : it,
        );
      }
      return [
        ...prev,
        { productoId: id, nombre: p.nombre, precio: p.precio, costo: p.costo, cantidad: 1 },
      ];
    });
  }, []);

  const cambiarCantidad = useCallback((productoId: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.productoId === productoId
            ? { ...it, cantidad: it.cantidad + delta }
            : it,
        )
        .filter((it) => it.cantidad > 0),
    );
  }, []);

  const quitar = useCallback((productoId: number) => {
    setItems((prev) => prev.filter((it) => it.productoId !== productoId));
  }, []);

  const limpiar = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.precio * it.cantidad, 0),
    [items],
  );

  const cantidadTotal = useMemo(
    () => items.reduce((acc, it) => acc + it.cantidad, 0),
    [items],
  );

  return { items, total, cantidadTotal, agregar, cambiarCantidad, quitar, limpiar };
}
