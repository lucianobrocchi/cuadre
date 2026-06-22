import type { MedioPago } from '../../db/types';
import { IconoChevron } from '../../components/Iconos';
import { formatPesos } from '../../lib/format';
import { medios } from '../../lib/medios';
import { TicketLista } from './TicketLista';
import { posCopy as t } from './pos.copy';
import type { useTicket } from './useTicket';

type Ticket = ReturnType<typeof useTicket>;

interface Props {
  ticket: Ticket;
  medio: MedioPago;
  onMedio: (m: MedioPago) => void;
  onCobrar: () => void;
  onFiar: () => void;
  variante: 'mobile' | 'desktop';
  expandido?: boolean;
  onToggleExpandir?: () => void;
}

/** Panel de cobro: ticket + descuento/redondeo + medio + cobrar/fiar.
 *  En mobile es la barra flotante colapsable; en escritorio, panel lateral fijo. */
export function PanelCobro({
  ticket,
  medio,
  onMedio,
  onCobrar,
  onFiar,
  variante,
  expandido,
  onToggleExpandir,
}: Props) {
  const desktop = variante === 'desktop';

  return (
    <div className={desktop ? 'flex h-full flex-col' : 'overflow-hidden rounded-3xl bg-white shadow-sheet ring-1 ring-cuadre/10'}>
      {/* Encabezado + lista de ítems */}
      {(desktop || expandido) && (
        <div className={desktop ? 'flex min-h-0 flex-1 flex-col px-4 pt-4' : 'px-4 pt-3'}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-cuadre-900/55">Ticket</span>
            <button type="button" onClick={ticket.limpiar} className="text-sm font-semibold text-falta">
              {t.vaciar}
            </button>
          </div>
          <div className={desktop ? 'min-h-0 flex-1 overflow-y-auto' : 'max-h-[32vh] overflow-y-auto'}>
            <TicketLista items={ticket.items} onCambiarCantidad={ticket.cambiarCantidad} />
          </div>

          {/* Descuento y redondeo */}
          <div className="mt-1 flex flex-col gap-2 border-t border-cuadre/10 py-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-cuadre-900/55">{t.descuento}</span>
              <div className="flex gap-1">
                {[0, 5, 10, 15].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => ticket.setDescuentoPct(d)}
                    className={`num min-w-9 rounded-lg px-2 py-1 text-sm font-bold transition ${
                      ticket.descuentoPct === d ? 'bg-cuadre text-white' : 'bg-cuadre-50 text-cuadre-900/65'
                    }`}
                  >
                    {d === 0 ? t.sinDescuento : `${d}%`}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => ticket.setRedondear(!ticket.redondear)}
              className="flex items-center justify-between"
            >
              <span className="text-sm font-semibold text-cuadre-900/55">{t.redondear}</span>
              <span
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${
                  ticket.redondear ? 'bg-cuadre' : 'bg-cuadre-900/15'
                }`}
              >
                <span className={`h-5 w-5 rounded-full bg-white shadow transition ${ticket.redondear ? 'translate-x-5' : ''}`} />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Medio + total + acciones */}
      <div className="flex flex-col gap-2.5 border-t border-cuadre/10 p-3">
        <div className="grid grid-cols-2 gap-2">
          {medios.map((m) => {
            const activo = medio === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onMedio(m.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition ${
                  activo ? 'bg-cuadre text-white' : 'bg-cuadre-50 text-cuadre-900/70 active:bg-cuadre-100'
                }`}
              >
                <span aria-hidden>{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={onToggleExpandir}
            disabled={desktop}
            className="flex flex-1 items-center gap-2 rounded-2xl px-3 py-1 text-left transition disabled:cursor-default active:bg-cuadre-50"
          >
            {!desktop && (
              <IconoChevron
                width={18}
                height={18}
                className={`shrink-0 text-cuadre-900/40 transition-transform ${expandido ? 'rotate-90' : '-rotate-90'}`}
              />
            )}
            <span>
              <span className="block text-xs font-medium text-cuadre-900/55">
                {ticket.ahorro > 0
                  ? t.ahorro(formatPesos(ticket.ahorro))
                  : `${t.productosLabel(ticket.cantidadTotal)}${desktop ? '' : ` · ${t.verTicket}`}`}
              </span>
              <span className="flex items-baseline gap-2 leading-tight">
                {ticket.ahorro > 0 && (
                  <span className="num text-sm font-semibold text-cuadre-900/35 line-through">
                    {formatPesos(ticket.subtotal)}
                  </span>
                )}
                <span className="num text-2xl font-extrabold text-cuadre-900">{formatPesos(ticket.total)}</span>
              </span>
            </span>
          </button>
          <button type="button" onClick={onCobrar} className="btn-primario w-auto px-7 text-xl">
            {t.cobrar}
          </button>
        </div>

        <button
          type="button"
          onClick={onFiar}
          className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold text-cuadre-900/60 transition active:bg-cuadre-50"
        >
          <span aria-hidden>📓</span> {t.fiar}
        </button>
      </div>
    </div>
  );
}
