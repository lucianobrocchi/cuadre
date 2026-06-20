import { useCallback, useMemo, useState } from 'react';
import type { Producto, VentaItem } from '../../db/types';

/** Redondea al múltiplo de `paso` más cercano (para sacar las monedas). */
function redondearA(n: number, paso = 50): number {
  return Math.round(n / paso) * paso;
}

/** Estado del ticket en curso (carrito de la venta actual). */
export function useTicket() {
  const [items, setItems] = useState<VentaItem[]>([]);
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [redondear, setRedondear] = useState(false);

  /** Agrega un producto. `precio` permite forzar el de otra lista (mayorista). */
  const agregar = useCallback((p: Producto, precio?: number) => {
    if (p.id == null) return;
    const id = p.id;
    const precioFinal = precio ?? p.precio;
    setItems((prev) => {
      const existe = prev.find((it) => it.productoId === id);
      if (existe) {
        return prev.map((it) =>
          it.productoId === id ? { ...it, cantidad: it.cantidad + 1 } : it,
        );
      }
      return [
        ...prev,
        { productoId: id, nombre: p.nombre, precio: precioFinal, costo: p.costo, cantidad: 1 },
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

  /** Recalcula el precio unitario de cada renglón (al cambiar de lista de precios). */
  const aplicarPrecios = useCallback((precioDe: (productoId: number) => number) => {
    setItems((prev) => prev.map((it) => ({ ...it, precio: precioDe(it.productoId) })));
  }, []);

  const limpiar = useCallback(() => {
    setItems([]);
    setDescuentoPct(0);
    setRedondear(false);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.precio * it.cantidad, 0),
    [items],
  );

  const conDescuento = useMemo(
    () => Math.max(0, Math.round(subtotal * (1 - descuentoPct / 100))),
    [subtotal, descuentoPct],
  );

  const total = useMemo(
    () => (redondear ? redondearA(conDescuento) : conDescuento),
    [conDescuento, redondear],
  );

  const ahorro = subtotal - total;

  const cantidadTotal = useMemo(
    () => items.reduce((acc, it) => acc + it.cantidad, 0),
    [items],
  );

  /**
   * Items con el precio ajustado para que la suma dé exactamente `total`
   * (reparte el descuento/redondeo proporcionalmente entre los renglones).
   * Así la venta guardada y la ganancia quedan consistentes con lo cobrado.
   */
  const itemsParaCobrar = useCallback((): VentaItem[] => {
    if (subtotal <= 0 || total === subtotal) return items;
    const factor = total / subtotal;
    const lineas = items.map((it) => ({
      it,
      lineTotal: Math.round(it.precio * it.cantidad * factor),
    }));
    const suma = lineas.reduce((acc, l) => acc + l.lineTotal, 0);
    // El sobrante por redondeo va al primer renglón.
    if (lineas.length > 0) lineas[0].lineTotal += total - suma;
    return lineas.map(({ it, lineTotal }) => ({ ...it, precio: lineTotal / it.cantidad }));
  }, [items, subtotal, total]);

  return {
    items,
    subtotal,
    total,
    ahorro,
    descuentoPct,
    setDescuentoPct,
    redondear,
    setRedondear,
    cantidadTotal,
    agregar,
    cambiarCantidad,
    quitar,
    aplicarPrecios,
    limpiar,
    itemsParaCobrar,
  };
}
