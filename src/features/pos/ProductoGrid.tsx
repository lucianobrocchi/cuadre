import { useRef } from 'react';
import type { Producto } from '../../db/types';
import { formatPesos } from '../../lib/format';
import { estadoStock } from '../../lib/stock';

interface Props {
  productos: Producto[];
  onAgregar: (p: Producto) => void;
  /** Cantidades actuales en el ticket, por id de producto. */
  enTicket?: Map<number, number>;
  /** Si se pasa, mantener presionada la card abre la edición de precio. */
  onEditarPrecio?: (p: Producto) => void;
  /** Precio a mostrar según la lista activa (default: el precio base). */
  precioDe?: (p: Producto) => number;
}

/** Grilla de productos: un toque agrega al ticket; mantener presionado edita el precio. */
export function ProductoGrid({ productos, onAgregar, enTicket, onEditarPrecio, precioDe }: Props) {
  const timer = useRef<number | null>(null);
  const fueLargo = useRef(false);

  function iniciar(p: Producto) {
    if (!onEditarPrecio) return;
    fueLargo.current = false;
    timer.current = window.setTimeout(() => {
      fueLargo.current = true;
      onEditarPrecio(p);
    }, 450);
  }

  function cancelar() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function tocar(p: Producto) {
    if (fueLargo.current) {
      fueLargo.current = false;
      return; // fue mantener presionado: ya abrió la edición
    }
    onAgregar(p);
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {productos.map((p) => {
        const cantidad = p.id != null ? enTicket?.get(p.id) ?? 0 : 0;
        return (
          <button
            key={p.id}
            type="button"
            onPointerDown={() => iniciar(p)}
            onPointerUp={cancelar}
            onPointerLeave={cancelar}
            onPointerCancel={cancelar}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => tocar(p)}
            className="relative flex aspect-square select-none flex-col items-center justify-center gap-1 rounded-2xl bg-white p-2 text-center shadow-card transition active:scale-[0.97] active:bg-cuadre-50"
          >
            {cantidad > 0 && (
              <span className="num absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-cuadre px-1.5 text-sm font-bold text-white">
                {cantidad}
              </span>
            )}
            <span className="text-3xl leading-none" aria-hidden>
              {p.emoji || '🛒'}
            </span>
            <span className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-cuadre-900">
              {p.nombre}
            </span>
            <span className="num text-sm font-medium text-cuadre-900/60">
              {formatPesos(precioDe ? precioDe(p) : p.precio)}
            </span>
            <StockChip p={p} />
          </button>
        );
      })}
    </div>
  );
}

/** Aviso de stock en la card del POS: solo si lleva stock y está bajo o agotado. */
function StockChip({ p }: { p: Producto }) {
  if (p.stock == null) return null;
  const estado = estadoStock(p);
  if (estado === 'ok') return null;
  const sin = estado === 'sin';
  return (
    <span
      className={`num absolute bottom-1.5 left-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        sin ? 'bg-falta/15 text-falta' : 'bg-sobra/20 text-sobra'
      }`}
    >
      {sin ? 'sin stock' : `quedan ${p.stock}`}
    </span>
  );
}
