import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Venta } from '../../db/types';
import { borrarVenta } from '../../db/ventas';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { IconoChevron } from '../../components/Iconos';
import { formatFechaLarga, formatHora } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { etiquetaMedio } from '../../lib/medios';
import { resumenDelDia } from './resumenDelDia';
import { resumenCopy as t } from './resumen.copy';
import { PanelAlertas, MetricaCard, BarraProyeccion } from '../../components/Alertas';
import { useProyeccionesYAlertas } from '../../hooks/useProyeccionesYAlertas';

interface Props {
  onAtras: () => void;
}

/** Texto corto con lo que se vendió en una venta. Ej: "Gaseosa ×2, Alfajor". */
function resumenItems(venta: Venta): string {
  return venta.items
    .map((it) => (it.cantidad > 1 ? `${it.nombre} ×${it.cantidad}` : it.nombre))
    .join(', ');
}

export function Resumen({ onAtras }: Props) {
  const resumen = useLiveQuery(() => resumenDelDia(), []);
  const [detalle, setDetalle] = useState<Venta | null>(null);
  const { proyeccion, alertas, dismissAlerta, loading } = useProyeccionesYAlertas();

  return (
    <>
      <Header titulo={t.headerTitulo} subtitulo={formatFechaLarga()} onAtras={onAtras} />

      <Pantalla>
        {/* Alertas inteligentes - LO PRIMERO QUE SE VE */}
        {!loading && alertas.length > 0 && (
          <PanelAlertas alertas={alertas} onDismiss={dismissAlerta} />
        )}

        {/* Hero: vendido hoy con proyección */}
        <div className="rounded-3xl bg-cuadre px-6 py-7 text-white shadow-card">
          <p className="font-medium text-white/70">{t.vendidoLabel}</p>
          <p className="num mt-1 text-5xl font-extrabold leading-none">
            {formatPesos(resumen?.totalVendido ?? 0)}
          </p>
          
          {/* Barra de proyección vs histórico */}
          {proyeccion.historicoPromedio > 0 && (
            <BarraProyeccion
              actual={proyeccion.vendidoAcumulado}
              proyectado={proyeccion.proyectadoTotal}
              historico={proyeccion.historicoPromedio}
            />
          )}
          
          {resumen && resumen.cantidadVentas === 0 && (
            <p className="mt-3 text-sm text-white/70">{t.sinVentas}</p>
          )}
          {resumen && resumen.cantidadVentas > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/10 px-3 py-2">
                <p className="text-xs text-white/60">💵 {t.efectivoLabel}</p>
                <p className="num text-lg font-bold">{formatPesos(resumen.totalEfectivo)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2">
                <p className="text-xs text-white/60">📱 {t.transferenciaLabel}</p>
                <p className="num text-lg font-bold">{formatPesos(resumen.totalTransferencia)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Métricas mejoradas con tendencias */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MetricaCard
            titulo={t.ventasLabel}
            valor={`${resumen?.cantidadVentas ?? 0}`}
            tendencia={proyeccion.estado === 'mejor' ? 'subiendo' : proyeccion.estado === 'peor' ? 'bajando' : 'neutral'}
            subtitulo={
              proyeccion.desvioPct !== 0
                ? `${proyeccion.desvioPct > 0 ? '+' : ''}${Math.round(proyeccion.desvioPct)}% vs promedio`
                : undefined
            }
          />
          <MetricaCard
            titulo={t.egresosLabel}
            valor={formatPesos(resumen?.totalEgresos ?? 0)}
          />
        </div>
        
        {/* Proyección del día completo */}
        {proyeccion.proyectadoTotal > 0 && proyeccion.horaActual >= 12 && (
          <div className="card mt-3 p-4">
            <p className="text-sm font-medium text-cuadre-900/55">Proyección diaria</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="num text-3xl font-extrabold text-cuadre-900">
                {formatPesos(proyeccion.proyectadoTotal)}
              </span>
              {proyeccion.desvioPct > 10 && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  🚀 +{Math.round(proyeccion.desvioPct)}%
                </span>
              )}
              {proyeccion.desvioPct < -10 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  📉 {Math.round(proyeccion.desvioPct)}%
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-cuadre-900/45">
              Basado en el ritmo actual y los últimos 14 días
            </p>
          </div>
        )}

        {/* Lo más vendido */}
        <div className="card mt-3 flex items-center gap-4 p-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cuadre-50 text-3xl"
            aria-hidden
          >
            {resumen?.productoTop?.emoji || '🏆'}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-cuadre-900/55">{t.topLabel}</p>
            {resumen?.productoTop ? (
              <>
                <p className="truncate text-xl font-bold text-cuadre-900">
                  {resumen.productoTop.nombre}
                </p>
                <p className="num text-sm text-cuadre-900/55">
                  {t.unidades(resumen.productoTop.cantidad)}
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold text-cuadre-900/50">{t.sinTop}</p>
            )}
          </div>
        </div>

        {/* Ventas de hoy, separadas */}
        {resumen && resumen.ventas.length > 0 && (
          <>
            <h2 className="mb-2 mt-6 font-bold text-cuadre-900">
              {t.ventasDeHoy} ({resumen.ventas.length})
            </h2>
            <ul className="flex flex-col gap-2">
              {resumen.ventas.map((v) => {
                const medio = etiquetaMedio(v.medioPago);
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setDetalle(v)}
                      className="card flex w-full items-center gap-3 p-3 text-left transition active:scale-[0.99]"
                    >
                      <span className="flex flex-col items-center" aria-hidden>
                        <span className="text-xl">{medio.emoji}</span>
                        <span className="num text-[11px] text-cuadre-900/45">
                          {formatHora(v.fecha)}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-cuadre-900">
                          {resumenItems(v)}
                        </p>
                        <p className="text-sm text-cuadre-900/50">
                          {t.itemsResumen(v.items.length)} · {medio.label}
                        </p>
                      </div>
                      <span className="num font-bold text-cuadre-900">{formatPesos(v.total)}</span>
                      <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Pantalla>

      <Sheet abierto={detalle !== null} onCerrar={() => setDetalle(null)} titulo={t.detalleTitulo}>
        {detalle && (
          <DetalleVenta
            venta={detalle}
            onAnular={async () => {
              if (detalle.id == null) return;
              if (!window.confirm(t.anularConfirm)) return;
              await borrarVenta(detalle.id);
              setDetalle(null);
            }}
          />
        )}
      </Sheet>
    </>
  );
}

function DetalleVenta({ venta, onAnular }: { venta: Venta; onAnular: () => void }) {
  const medio = etiquetaMedio(venta.medioPago);
  return (
    <div>
      <p className="num text-sm text-cuadre-900/55">
        {formatHora(venta.fecha)} hs · {medio.emoji} {medio.label}
      </p>

      <ul className="mt-3 divide-y divide-cuadre/10">
        {venta.items.map((it) => (
          <li key={it.productoId} className="flex items-center justify-between py-2.5">
            <span className="min-w-0 flex-1 truncate text-cuadre-900">
              <span className="num font-semibold">{it.cantidad}×</span> {it.nombre}
            </span>
            <span className="num font-semibold text-cuadre-900">
              {formatPesos(it.precio * it.cantidad)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex items-center justify-between border-t border-cuadre/10 pt-3">
        <span className="font-semibold text-cuadre-900/65">{t.totalLabel}</span>
        <span className="num text-2xl font-extrabold text-cuadre-900">
          {formatPesos(venta.total)}
        </span>
      </div>

      <button
        type="button"
        onClick={onAnular}
        className="mt-5 w-full rounded-2xl border-2 border-falta/30 py-3 text-center font-semibold text-falta transition active:bg-falta/5"
      >
        {t.anular}
      </button>
    </div>
  );
}
