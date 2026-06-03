import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { listarCajas } from '../../db/cajas';
import type { CajaSesion, EstadoCierre } from '../../db/types';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { IconoChevron } from '../../components/Iconos';
import { formatFecha, formatHora } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import {
  estadoCierreEstilo,
  estadoCierreLabel,
  historialCopy as t,
} from './historial.copy';

/** "+$1.000" / "−$500" / "$0" según el estado. */
function difTexto(estado: EstadoCierre, diferencia: number): string {
  if (estado === 'cuadra') return formatPesos(0);
  const signo = diferencia > 0 ? '+' : '−';
  return `${signo}${formatPesos(Math.abs(diferencia))}`;
}

export function Historial() {
  const cajas = useLiveQuery(() => listarCajas(), [], []);
  const cerradas = cajas.filter((c) => c.estado === 'cerrada');
  const [detalle, setDetalle] = useState<CajaSesion | null>(null);

  return (
    <>
      <Header titulo={t.headerTitulo} subtitulo={t.headerSubtitulo} />

      <Pantalla>
        {cerradas.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              📋
            </span>
            <h2 className="mt-4 text-xl font-bold text-cuadre-900">{t.vacioTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{t.vacioSub}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {cerradas.map((c) => {
              const estado = c.estadoCuadre ?? 'cuadra';
              const est = estadoCierreEstilo[estado];
              const cuando = c.cerradaEn ?? c.abiertaEn;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setDetalle(c)}
                    className="card flex w-full items-center gap-3 p-4 text-left transition active:scale-[0.99]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="num font-semibold text-cuadre-900">{formatFecha(cuando)}</p>
                      <p className="num text-sm text-cuadre-900/45">{formatHora(cuando)} hs</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-bold ${est.chip}`}>
                      {estadoCierreLabel[estado]}
                    </span>
                    <span className={`num w-24 text-right font-extrabold ${est.texto}`}>
                      {difTexto(estado, c.diferencia ?? 0)}
                    </span>
                    <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Pantalla>

      <Sheet abierto={detalle !== null} onCerrar={() => setDetalle(null)} titulo={t.detalleTitulo}>
        {detalle && <DetalleCaja caja={detalle} />}
      </Sheet>
    </>
  );
}

function DetalleCaja({ caja }: { caja: CajaSesion }) {
  const estado = caja.estadoCuadre ?? 'cuadra';
  const est = estadoCierreEstilo[estado];
  const filas: { label: string; valor: string }[] = [
    { label: t.inicialLabel, valor: formatPesos(caja.montoInicial) },
    { label: t.ventasEfectivoLabel, valor: `+${formatPesos(caja.ventasEfectivo ?? 0)}` },
    { label: t.ingresosLabel, valor: `+${formatPesos(caja.ingresosEfectivo ?? 0)}` },
    { label: t.egresosLabel, valor: `−${formatPesos(caja.egresosEfectivo ?? 0)}` },
    { label: t.esperadoLabel, valor: formatPesos(caja.esperadoEfectivo ?? 0) },
    { label: t.contadoLabel, valor: formatPesos(caja.contadoEfectivo ?? 0) },
  ];

  return (
    <div>
      <p className="num text-sm text-cuadre-900/55">
        {t.aperturaLabel} {formatHora(caja.abiertaEn)} ·{' '}
        {t.cierreLabel} {caja.cerradaEn ? formatHora(caja.cerradaEn) : '—'} hs
      </p>

      {(caja.ventasTransferencia ?? 0) > 0 && (
        <p className="num mt-1 text-sm text-cuadre-900/45">
          📱 {t.ventasTransfLabel}: {formatPesos(caja.ventasTransferencia ?? 0)}
        </p>
      )}

      <dl className="mt-3 divide-y divide-cuadre/10">
        {filas.map((f) => (
          <div key={f.label} className="flex items-center justify-between py-3">
            <dt className="text-cuadre-900/65">{f.label}</dt>
            <dd className="num font-bold text-cuadre-900">{f.valor}</dd>
          </div>
        ))}
      </dl>

      <div className={`mt-2 flex items-center justify-between rounded-2xl px-4 py-4 ${est.chip}`}>
        <span className="font-bold">
          {t.diferenciaLabel} · {estadoCierreLabel[estado]}
        </span>
        <span className="num text-2xl font-extrabold">
          {difTexto(estado, caja.diferencia ?? 0)}
        </span>
      </div>
    </div>
  );
}
