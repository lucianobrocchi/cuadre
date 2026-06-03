import type { VentaItem } from '../../db/types';
import { formatPesos } from '../../lib/format';
import { IconoMas, IconoMenos } from '../../components/Iconos';

interface Props {
  items: VentaItem[];
  onCambiarCantidad: (productoId: number, delta: number) => void;
}

/** Lista de renglones del ticket, con stepper de cantidad por producto. */
export function TicketLista({ items, onCambiarCantidad }: Props) {
  return (
    <ul className="divide-y divide-cuadre/10">
      {items.map((it) => (
        <li key={it.productoId} className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-cuadre-900">{it.nombre}</p>
            <p className="num text-sm text-cuadre-900/55">
              {formatPesos(it.precio)} c/u
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Quitar uno de ${it.nombre}`}
              onClick={() => onCambiarCantidad(it.productoId, -1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cuadre/15 text-cuadre transition active:scale-95 active:bg-cuadre-50"
            >
              <IconoMenos width={18} height={18} />
            </button>
            <span className="num w-6 text-center text-lg font-bold text-cuadre-900">
              {it.cantidad}
            </span>
            <button
              type="button"
              aria-label={`Agregar uno de ${it.nombre}`}
              onClick={() => onCambiarCantidad(it.productoId, 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-cuadre text-white transition active:scale-95"
            >
              <IconoMas width={18} height={18} />
            </button>
          </div>

          <span className="num w-20 text-right font-bold text-cuadre-900">
            {formatPesos(it.precio * it.cantidad)}
          </span>
        </li>
      ))}
    </ul>
  );
}
