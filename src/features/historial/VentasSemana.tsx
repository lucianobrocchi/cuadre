import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { listarProductos } from '../../db/productos';
import { ventasEntre } from '../../db/ventas';
import { Sheet } from '../../components/Sheet';
import { IconoChevron } from '../../components/Iconos';
import { formatDiaRelativo, formatHora, rangoUltimosDias } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { resumenSemana, type DiaVentas } from '../../lib/historialVentas';
import { historialCopy as t, medioLabel } from './historial.copy';

export function VentasSemana() {
  const [desde, hasta] = useMemo(() => rangoUltimosDias(7), []);
  const ventas = useLiveQuery(() => ventasEntre(desde, hasta), [desde, hasta], []);
  const productos = useLiveQuery(() => listarProductos(), [], []);
  const resumen = useMemo(() => resumenSemana(ventas, productos), [ventas, productos]);

  const [dia, setDia] = useState<DiaVentas | null>(null);

  if (resumen.dias.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center text-center">
        <span className="text-5xl" aria-hidden>
          🧾
        </span>
        <h2 className="mt-4 text-xl font-bold text-cuadre-900">{t.ventasVacioTitulo}</h2>
        <p className="mt-1 text-cuadre-900/60">{t.ventasVacioSub}</p>
      </div>
    );
  }

  return (
    <>
      {/* Total de la semana */}
      <div className="card mb-4 p-5">
        <p className="text-sm font-semibold text-cuadre-900/55">{t.totalSemana}</p>
        <p className="num text-4xl font-extrabold text-cuadre-900">{formatPesos(resumen.total)}</p>
        <p className="mt-1 text-sm text-cuadre-900/55">
          {t.ventasResumen(resumen.cantidad, resumen.diasConVentas)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Mini label={t.porCobro(formatPesos(resumen.efectivo), formatPesos(resumen.transferencia))} />
          {resumen.ganancia != null && (
            <Mini label={t.gananciaSemana} valor={formatPesos(resumen.ganancia)} />
          )}
        </div>
      </div>

      {/* Un día por tarjeta */}
      <ul className="flex flex-col gap-2">
        {resumen.dias.map((d) => (
          <li key={d.fecha}>
            <button
              type="button"
              onClick={() => setDia(d)}
              className="card flex w-full items-center gap-3 p-4 text-left transition active:scale-[0.99]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-cuadre-900">{formatDiaRelativo(d.fecha)}</p>
                <p className="text-sm text-cuadre-900/45">{t.diaResumen(d.cantidad, d.unidades)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="num font-extrabold text-cuadre-900">{formatPesos(d.total)}</p>
                {d.ganancia != null ? (
                  <p className="num text-xs font-semibold text-cuadra">
                    +{formatPesos(d.ganancia)} {t.gananciaDia}
                  </p>
                ) : (
                  <p className="text-xs text-cuadre-900/40">{t.sinGanancia}</p>
                )}
              </div>
              <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
            </button>
          </li>
        ))}
      </ul>

      <Sheet abierto={dia !== null} onCerrar={() => setDia(null)} titulo={t.detalleDiaTitulo}>
        {dia && <DetalleDia dia={dia} />}
      </Sheet>
    </>
  );
}

function Mini({ label, valor }: { label: string; valor?: string }) {
  return (
    <div className="rounded-xl bg-cuadre-50/60 px-3 py-2">
      {valor != null ? (
        <>
          <p className="text-xs font-medium text-cuadre-900/50">{label}</p>
          <p className="num font-bold text-cuadre-900">{valor}</p>
        </>
      ) : (
        <p className="num text-sm font-semibold text-cuadre-900/70">{label}</p>
      )}
    </div>
  );
}

function DetalleDia({ dia }: { dia: DiaVentas }) {
  return (
    <div>
      <p className="text-sm text-cuadre-900/55">{formatDiaRelativo(dia.fecha)}</p>
      <p className="num mt-0.5 text-2xl font-extrabold text-cuadre-900">{formatPesos(dia.total)}</p>
      <p className="text-sm text-cuadre-900/55">{t.diaResumen(dia.cantidad, dia.unidades)}</p>

      <ul className="mt-4 flex flex-col gap-2">
        {dia.ventas.map((v) => {
          const unidades = v.items.reduce((acc, it) => acc + it.cantidad, 0);
          return (
            <li key={v.id} className="rounded-2xl bg-cuadre-50/50 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="num text-sm font-semibold text-cuadre-900">
                  {t.ticketHora(formatHora(v.fecha))}
                </span>
                <span className="num font-extrabold text-cuadre-900">{formatPesos(v.total)}</span>
              </div>
              <p className="mt-0.5 text-xs text-cuadre-900/45">
                {medioLabel[v.medioPago]} · {t.ticketUnidades(unidades)}
              </p>
              <ul className="mt-2 flex flex-col gap-0.5">
                {v.items.map((it, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate text-cuadre-900/70">
                      {t.itemLinea(it.cantidad, it.nombre)}
                    </span>
                    <span className="num shrink-0 text-cuadre-900/70">
                      {formatPesos(it.precio * it.cantidad)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
