import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { listarCajas } from '../../db/cajas';
import { ventasEntre } from '../../db/ventas';
import type { CajaSesion, EstadoCierre, Venta } from '../../db/types';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { IconoChevron } from '../../components/Iconos';
import { formatDiaRelativo, formatFecha, formatHora, rangoUltimosDias } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { etiquetaMedio } from '../../lib/medios';
import { agruparVentasPorDia, type VentasDia } from '../../lib/ventasHistorial';
import {
  estadoCierreEstilo,
  estadoCierreLabel,
  historialCopy as t,
} from './historial.copy';

type Vista = 'cajas' | 'ventas';

/** "+$1.000" / "−$500" / "$0" según el estado. */
function difTexto(estado: EstadoCierre, diferencia: number): string {
  if (estado === 'cuadra') return formatPesos(0);
  const signo = diferencia > 0 ? '+' : '−';
  return `${signo}${formatPesos(Math.abs(diferencia))}`;
}

export function Historial() {
  const [vista, setVista] = useState<Vista>('cajas');

  return (
    <>
      <Header
        titulo={t.headerTitulo}
        subtitulo={vista === 'cajas' ? t.headerSubtituloCajas : t.headerSubtituloVentas}
      />

      <Pantalla>
        <div className="mb-3 flex gap-2">
          <ChipVista activo={vista === 'cajas'} onClick={() => setVista('cajas')}>
            {t.vistaCajas}
          </ChipVista>
          <ChipVista activo={vista === 'ventas'} onClick={() => setVista('ventas')}>
            {t.vistaVentas}
          </ChipVista>
        </div>

        {vista === 'cajas' ? <VistaCajas /> : <VistaVentas />}
      </Pantalla>
    </>
  );
}

function ChipVista({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
        activo ? 'bg-cuadre text-white shadow-card' : 'bg-white text-cuadre-900/55 active:bg-cuadre-50'
      }`}
    >
      {children}
    </button>
  );
}

// ---- Vista: cajas cerradas ----

function VistaCajas() {
  const cajas = useLiveQuery(() => listarCajas(), [], []);
  const cerradas = cajas.filter((c) => c.estado === 'cerrada');
  const [detalle, setDetalle] = useState<CajaSesion | null>(null);

  if (cerradas.length === 0) {
    return <Vacio emoji="📋" titulo={t.vacioTitulo} sub={t.vacioSub} />;
  }

  return (
    <>
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

// ---- Vista: ventas de la semana ----

function VistaVentas() {
  const [desde, hasta] = rangoUltimosDias(7);
  const ventas = useLiveQuery(() => ventasEntre(desde, hasta), [desde, hasta], []);
  const [dia, setDia] = useState<VentasDia | null>(null);

  const resumen = agruparVentasPorDia(ventas);

  if (resumen.dias.length === 0) {
    return <Vacio emoji="🧾" titulo={t.ventasVacioTitulo} sub={t.ventasVacioSub} />;
  }

  return (
    <>
      {/* Resumen de la semana */}
      <div className="card mb-3 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-cuadre-900/55">{t.semanaTitulo}</p>
          <p className="text-sm font-semibold text-cuadre-900/45">
            {t.semanaTickets(resumen.cantidad)}
          </p>
        </div>
        <p className="num mt-0.5 text-3xl font-extrabold text-cuadre-900">
          {formatPesos(resumen.total)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MiniDato label={t.efectivoLabel} valor={formatPesos(resumen.efectivo)} />
          <MiniDato label={t.transferenciaLabel} valor={formatPesos(resumen.transferencia)} />
        </div>
      </div>

      {/* Día por día */}
      <ul className="flex flex-col gap-2">
        {resumen.dias.map((d) => (
          <li key={d.dia}>
            <button
              type="button"
              onClick={() => setDia(d)}
              className="card flex w-full items-center gap-3 p-4 text-left transition active:scale-[0.99]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-cuadre-900">{formatDiaRelativo(d.dia)}</p>
                <p className="num text-sm text-cuadre-900/45">{t.semanaTickets(d.cantidad)}</p>
              </div>
              <span className="num shrink-0 font-extrabold text-cuadre-900">
                {formatPesos(d.total)}
              </span>
              <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
            </button>
          </li>
        ))}
      </ul>

      <Sheet
        abierto={dia !== null}
        onCerrar={() => setDia(null)}
        titulo={dia ? formatDiaRelativo(dia.dia) : t.diaDetalleTitulo}
      >
        {dia && <DetalleDia dia={dia} />}
      </Sheet>
    </>
  );
}

function DetalleDia({ dia }: { dia: VentasDia }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-cuadre-900/55">{t.semanaTickets(dia.cantidad)}</p>
        <p className="num text-lg font-extrabold text-cuadre-900">{formatPesos(dia.total)}</p>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {dia.ventas.map((v) => (
          <FilaVenta key={v.id} venta={v} />
        ))}
      </ul>
    </div>
  );
}

function FilaVenta({ venta }: { venta: Venta }) {
  const [abierto, setAbierto] = useState(false);
  const medio = etiquetaMedio(venta.medioPago);
  const items = venta.items.reduce((acc, it) => acc + it.cantidad, 0);

  return (
    <li className="overflow-hidden rounded-2xl bg-cuadre-50/50">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="text-lg" aria-hidden>
          {medio.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="num block text-sm font-semibold text-cuadre-900">
            {t.ventaHora(formatHora(venta.fecha))}
          </span>
          <span className="block text-xs text-cuadre-900/45">{t.ventaItems(items)}</span>
        </span>
        <span className="num shrink-0 font-bold text-cuadre-900">{formatPesos(venta.total)}</span>
        <IconoChevron
          width={16}
          height={16}
          className={`shrink-0 text-cuadre-900/25 transition-transform ${abierto ? 'rotate-90' : ''}`}
        />
      </button>
      {abierto && (
        <ul className="divide-y divide-cuadre/5 border-t border-cuadre/5 px-3">
          {venta.items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 py-2 text-sm">
              <span className="num w-8 shrink-0 text-cuadre-900/45">{t.unidades(it.cantidad)}</span>
              <span className="min-w-0 flex-1 truncate text-cuadre-900/80">{it.nombre}</span>
              <span className="num shrink-0 font-semibold text-cuadre-900">
                {formatPesos(it.precio * it.cantidad)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// ---- Compartido ----

function MiniDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl bg-cuadre-50/60 px-3 py-2">
      <p className="text-xs font-medium text-cuadre-900/50">{label}</p>
      <p className="num font-bold text-cuadre-900">{valor}</p>
    </div>
  );
}

function Vacio({ emoji, titulo, sub }: { emoji: string; titulo: string; sub: string }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <h2 className="mt-4 text-xl font-bold text-cuadre-900">{titulo}</h2>
      <p className="mt-1 text-cuadre-900/60">{sub}</p>
    </div>
  );
}
