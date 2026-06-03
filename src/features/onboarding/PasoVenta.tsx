import type { Producto } from '../../db/types';
import { formatPesos } from '../../lib/format';
import { IconoCheck } from '../../components/Iconos';
import { ProductoGrid } from '../pos/ProductoGrid';
import { TicketLista } from '../pos/TicketLista';
import { useTicket } from '../pos/useTicket';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingCopy } from './onboarding.copy';

interface Props {
  productos: Producto[];
  vendido: number;
  onCobrar: (total: number) => void;
  onContinuar: () => void;
  onAtras: () => void;
}

export function PasoVenta({ productos, vendido, onCobrar, onContinuar, onAtras }: Props) {
  const v = onboardingCopy.venta;
  const ticket = useTicket();
  const enTicket = new Map(ticket.items.map((it) => [it.productoId, it.cantidad]));

  function cobrar() {
    if (ticket.items.length === 0) return;
    onCobrar(ticket.total);
    ticket.limpiar();
  }

  return (
    <OnboardingLayout
      paso={3}
      onAtras={onAtras}
      footer={
        <button type="button" className="btn-primario" disabled={vendido <= 0} onClick={onContinuar}>
          {v.button}
        </button>
      }
    >
      <h1 className="text-2xl font-extrabold leading-tight text-cuadre-900">{v.title}</h1>
      <p className="mt-2 text-cuadre-900/60">{v.subtitle}</p>

      <div className="mt-5">
        <ProductoGrid productos={productos} onAgregar={ticket.agregar} enTicket={enTicket} />
      </div>

      {ticket.items.length > 0 ? (
        <div className="card mt-5 p-4">
          <TicketLista items={ticket.items} onCambiarCantidad={ticket.cambiarCantidad} />
          <div className="mt-2 flex items-center justify-between border-t border-cuadre/10 pt-3">
            <span className="font-semibold text-cuadre-900/65">{v.totalLabel}</span>
            <span className="num text-2xl font-extrabold text-cuadre-900">
              {formatPesos(ticket.total)}
            </span>
          </div>
          <button type="button" onClick={cobrar} className="btn-primario mt-3">
            {v.cobrarButton}
          </button>
        </div>
      ) : vendido > 0 ? (
        <div className="card mt-5 flex flex-col items-center p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cuadra text-white">
            <IconoCheck width={32} height={32} strokeWidth={2.5} />
          </span>
          <h2 className="mt-4 text-xl font-bold text-cuadre-900">{v.ventaHechaTitle}</h2>
          <p className="mt-1 text-cuadre-900/60">{v.ventaHechaSubtitle}</p>
          <p className="num mt-4 rounded-full bg-cuadre-50 px-4 py-1.5 font-bold text-cuadre">
            Vendido: {formatPesos(vendido)}
          </p>
        </div>
      ) : (
        <p className="mt-8 text-center text-cuadre-900/45">{v.ticketVacio}</p>
      )}
    </OnboardingLayout>
  );
}
