import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { listarProductos } from '../../db/productos';
import { listarCategorias } from '../../db/categorias';
import { ventasEntre } from '../../db/ventas';
import { movimientosEntre } from '../../db/movimientos';
import { cajaActiva, resumenDeCaja, type ResumenCaja } from '../../db/cajas';
import type { CajaSesion, Producto } from '../../db/types';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { finDelDia, inicioDelDia } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { formatPct, resumenCatalogo } from '../../lib/rentabilidad';
import { resumenInventario, type ResumenInventario } from '../../lib/stock';
import {
  comparar,
  indexarProductos,
  inteligenciaProductos,
  movsEnRango,
  resumenPlata,
  serieDiaria,
  ventasEnRango,
  ventasPorHora,
  type Comparativa,
  type ResumenPlata,
} from '../../lib/negocio';
import { GraficoBarras } from './GraficoBarras';
import { IntelProductos } from './IntelProductos';
import { CatalogoMargenes } from './CatalogoMargenes';
import { negocioCopy as t } from './negocio.copy';

const MS_DIA = 24 * 60 * 60 * 1000;

type Periodo = 'hoy' | 'semana' | 'mes';

interface Rangos {
  desde: number;
  hasta: number;
  desdePrev: number;
  hastaPrev: number;
  vsLabel: string;
}

function rangosDe(periodo: Periodo): Rangos {
  if (periodo === 'hoy') {
    const desde = inicioDelDia();
    const hasta = finDelDia();
    return { desde, hasta, desdePrev: desde - MS_DIA, hastaPrev: hasta - MS_DIA, vsLabel: t.vsAyer };
  }
  const dias = periodo === 'semana' ? 7 : 30;
  const desde = inicioDelDia(Date.now() - (dias - 1) * MS_DIA);
  const hasta = finDelDia();
  return {
    desde,
    hasta,
    desdePrev: desde - dias * MS_DIA,
    hastaPrev: desde - 1,
    vsLabel: periodo === 'semana' ? t.vsSemana : t.vsMes,
  };
}

export function Negocio() {
  const [periodo, setPeriodo] = useState<Periodo>('hoy');

  const productos = useLiveQuery(() => listarProductos(), [], []);
  const categorias = useLiveQuery(() => listarCategorias(), [], []);

  // Ventana amplia (60 días) para cubrir 30d + su período previo y la serie.
  const ventana = useMemo(() => inicioDelDia(Date.now() - 59 * MS_DIA), []);
  const ventas = useLiveQuery(() => ventasEntre(ventana, finDelDia()), [ventana], []);
  const movimientos = useLiveQuery(() => movimientosEntre(ventana, finDelDia()), [ventana], []);

  // Caja en vivo (reactiva a ventas/movimientos porque resumenDeCaja las lee).
  const cajaViva = useLiveQuery(async () => {
    const c = await cajaActiva();
    if (!c) return null;
    return { caja: c, resumen: await resumenDeCaja(c) };
  }, [], undefined);

  const prodById = useMemo(() => indexarProductos(productos), [productos]);
  const rangos = useMemo(() => rangosDe(periodo), [periodo]);

  const actual = useMemo(
    () =>
      resumenPlata(
        ventasEnRango(ventas, rangos.desde, rangos.hasta),
        movsEnRango(movimientos, rangos.desde, rangos.hasta),
        prodById,
      ),
    [ventas, movimientos, rangos, prodById],
  );
  const previo = useMemo(
    () => resumenPlata(ventasEnRango(ventas, rangos.desdePrev, rangos.hastaPrev), [], prodById),
    [ventas, rangos, prodById],
  );
  const serie = useMemo(() => serieDiaria(ventas, prodById, 30), [ventas, prodById]);
  const horas = useMemo(
    () => ventasPorHora(ventasEnRango(ventas, inicioDelDia(Date.now() - 29 * MS_DIA), finDelDia())),
    [ventas],
  );
  const intel = useMemo(
    () => inteligenciaProductos(ventasEnRango(ventas, rangos.desde, rangos.hasta), productos),
    [ventas, rangos, productos],
  );
  const catalogo = useMemo(() => resumenCatalogo(productos, categorias), [productos, categorias]);
  const inventario = useMemo(() => resumenInventario(productos), [productos]);

  const sinCosto = useMemo(
    () => productos.filter((p) => p.precio > 0 && p.costo == null).length,
    [productos],
  );

  const cmpVendido = comparar(actual.vendido, previo.vendido);
  const insights = construirInsights(actual, cmpVendido, intel, horas, sinCosto);

  return (
    <>
      <Header titulo={t.headerTitulo} subtitulo={t.headerSubtitulo} />
      <Pantalla>
        {/* Caja en vivo */}
        <CajaAhora data={cajaViva} />

        {/* Período */}
        <div className="mb-3 mt-4 flex gap-2">
          <ChipPeriodo activo={periodo === 'hoy'} onClick={() => setPeriodo('hoy')}>
            {t.periodoHoy}
          </ChipPeriodo>
          <ChipPeriodo activo={periodo === 'semana'} onClick={() => setPeriodo('semana')}>
            {t.periodoSemana}
          </ChipPeriodo>
          <ChipPeriodo activo={periodo === 'mes'} onClick={() => setPeriodo('mes')}>
            {t.periodoMes}
          </ChipPeriodo>
        </div>

        {/* Hero del período */}
        <Hero resumen={actual} cmp={cmpVendido} vsLabel={rangos.vsLabel} />

        {/* KPIs */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Kpi label={t.kpiTicket} valor={formatPesos(actual.ticket)} />
          <Kpi label={t.kpiVentas} valor={String(actual.cantidad)} />
          <Kpi label={t.kpiEfectivo} valor={formatPesos(actual.efectivo)} emoji="💵" />
          <Kpi label={t.kpiTransferencia} valor={formatPesos(actual.transferencia)} emoji="📱" />
        </div>

        {/* Flujo de efectivo */}
        {(actual.ingresos > 0 || actual.egresos > 0) && (
          <Flujo resumen={actual} />
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <section className="mt-5">
            <ul className="flex flex-col gap-2">
              {insights.map((ins, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 rounded-2xl p-3 text-sm ${tono(ins.tono)}`}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {ins.emoji}
                  </span>
                  <span className="font-medium">{ins.texto}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Tendencia 30 días */}
        {actual && serie.some((p) => p.vendido > 0) && (
          <Seccion titulo={t.tendenciaTitulo} sub={t.tendenciaSub}>
            <div className="card p-4">
              <GraficoBarras
                datos={serie.map((p) => ({
                  valor: p.vendido,
                  destacado: p.fecha === inicioDelDia(),
                }))}
                titulo={t.tendenciaSub}
              />
              <div className="mt-2 flex justify-between text-xs text-cuadre-900/45">
                <span>hace 30 días</span>
                <span>hoy</span>
              </div>
            </div>
          </Seccion>
        )}

        {/* Mejores horas */}
        {horas.some((h) => h.vendido > 0) && (
          <Seccion titulo={t.horasTitulo} sub={t.horasSub}>
            <div className="card p-4">
              <GraficoBarras
                datos={horasVisibles(horas).map((h) => ({
                  valor: h.vendido,
                  destacado: h.vendido === Math.max(...horas.map((x) => x.vendido)),
                }))}
                alto={90}
                titulo={t.horasTitulo}
              />
              <div className="mt-2 flex justify-between text-xs text-cuadre-900/45">
                <span>8 h</span>
                <span>14 h</span>
                <span>22 h</span>
              </div>
            </div>
          </Seccion>
        )}

        {/* Inteligencia de productos */}
        <Seccion titulo={t.productosTitulo}>
          <IntelProductos intel={intel} />
        </Seccion>

        {/* Inventario */}
        <Seccion titulo={t.inventarioTitulo} sub={t.inventarioSub}>
          <Inventario inv={inventario} />
        </Seccion>

        {/* Margen del catálogo (ex Ganancia) */}
        <Seccion titulo={t.catalogoTitulo} sub={t.catalogoSub}>
          <CatalogoMargenes catalogo={catalogo} />
        </Seccion>
      </Pantalla>
    </>
  );
}

// ---- Sub-componentes ----

function CajaAhora({
  data,
}: {
  data: { caja: CajaSesion; resumen: ResumenCaja } | null | undefined;
}) {
  if (data === undefined) return null; // cargando
  if (data === null) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-cuadre/15 p-5 text-center">
        <p className="font-semibold text-cuadre-900">{t.cajaSinAbrir}</p>
        <p className="mt-0.5 text-sm text-cuadre-900/55">{t.cajaSinAbrirSub}</p>
      </div>
    );
  }
  const { resumen } = data;
  const vendidoTurno = resumen.ventasEfectivo + resumen.ventasTransferencia;
  return (
    <div className="rounded-3xl bg-cuadre px-6 py-6 text-white shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-medium text-white/70">{t.cajaAhoraTitulo}</p>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">● en vivo</span>
      </div>
      <p className="num mt-1 text-5xl font-extrabold leading-none">{formatPesos(resumen.esperado)}</p>
      <p className="mt-1 text-sm text-white/60">{t.cajaAhoraSub}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/10 px-3 py-2">
          <p className="text-xs text-white/60">{t.cajaVendidoTurno}</p>
          <p className="num text-lg font-bold">{formatPesos(vendidoTurno)}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2">
          <p className="text-xs text-white/60">{t.kpiVentas}</p>
          <p className="num text-lg font-bold">{resumen.cantidadVentas}</p>
        </div>
      </div>
    </div>
  );
}

function Hero({ resumen, cmp, vsLabel }: { resumen: ResumenPlata; cmp: Comparativa; vsLabel: string }) {
  if (resumen.vendido === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-3xl" aria-hidden>
          🧮
        </p>
        <p className="mt-2 font-semibold text-cuadre-900">{t.sinVentasTitulo}</p>
        <p className="mt-0.5 text-sm text-cuadre-900/55">{t.sinVentasSub}</p>
      </div>
    );
  }
  const conGanancia = resumen.margenPct !== null;
  const positivo = resumen.ganancia >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-cuadre-900/55">
          {conGanancia ? t.gananciaLabel : t.vendidoLabel}
        </p>
        <DeltaChip cmp={cmp} vsLabel={vsLabel} />
      </div>
      <p
        className={`num mt-0.5 text-4xl font-extrabold ${
          conGanancia ? (positivo ? 'text-cuadra' : 'text-falta') : 'text-cuadre-900'
        }`}
      >
        {formatPesos(conGanancia ? resumen.ganancia : resumen.vendido)}
      </p>
      {conGanancia ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniDato label={t.kpiVendido} valor={formatPesos(resumen.vendido)} />
          <MiniDato label="Costo" valor={formatPesos(resumen.costo)} />
          <MiniDato label="Margen" valor={resumen.margenPct != null ? formatPct(resumen.margenPct) : '—'} />
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-sobra/10 p-3 text-sm text-cuadre-900/65">{t.faltanCostos}</div>
      )}
    </div>
  );
}

function DeltaChip({ cmp, vsLabel }: { cmp: Comparativa; vsLabel: string }) {
  if (cmp.deltaPct === null) {
    return <span className="text-xs text-cuadre-900/40">{t.sinComparacion}</span>;
  }
  const sube = cmp.deltaPct >= 0;
  const pct = `${sube ? '+' : '−'}${Math.abs(Math.round(cmp.deltaPct * 100))}%`;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
        sube ? 'bg-cuadra/10 text-cuadra' : 'bg-falta/10 text-falta'
      }`}
    >
      {sube ? '▲' : '▼'} {pct} <span className="font-medium opacity-70">{vsLabel}</span>
    </span>
  );
}

function Inventario({ inv }: { inv: ResumenInventario }) {
  if (inv.rastreados === 0) {
    return (
      <div className="card flex flex-col items-center p-6 text-center">
        <span className="text-4xl" aria-hidden>
          📦
        </span>
        <h3 className="mt-3 font-bold text-cuadre-900">{t.invSinDatosTitulo}</h3>
        <p className="mt-1 text-sm text-cuadre-900/55">{t.invSinDatosSub}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="card p-5">
        <p className="text-sm font-semibold text-cuadre-900/55">{t.invValorCosto}</p>
        <p className="num text-3xl font-extrabold text-cuadre-900">{formatPesos(inv.valorCosto)}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniDato label={t.invValorVenta} valor={formatPesos(inv.valorVenta)} />
          <MiniDato label="En mano" valor={t.invUnidades(inv.unidades)} />
        </div>
      </div>

      {inv.sinStock.length === 0 && inv.bajoStock.length === 0 ? (
        <p className="rounded-2xl bg-cuadra/8 p-3 text-center text-sm font-medium text-cuadre-900">
          {t.invTodoOk}
        </p>
      ) : (
        <>
          {inv.sinStock.length > 0 && (
            <ListaStock titulo={t.invSinStock} emoji="🔴" productos={inv.sinStock} tono="falta" />
          )}
          {inv.bajoStock.length > 0 && (
            <ListaStock titulo={t.invBajoStock} emoji="🟠" productos={inv.bajoStock} tono="sobra" />
          )}
        </>
      )}
    </div>
  );
}

function ListaStock({
  titulo,
  emoji,
  productos,
  tono,
}: {
  titulo: string;
  emoji: string;
  productos: Producto[];
  tono: 'falta' | 'sobra';
}) {
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden>{emoji}</span>
        <h4 className={`font-bold ${tono === 'falta' ? 'text-falta' : 'text-sobra'}`}>{titulo}</h4>
      </div>
      <ul className="flex flex-col gap-1">
        {productos.slice(0, 8).map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-semibold text-cuadre-900">
              {p.emoji ?? '🛒'} {p.nombre}
            </span>
            <span className={`num shrink-0 font-bold ${tono === 'falta' ? 'text-falta' : 'text-sobra'}`}>
              {tono === 'falta' ? '0' : t.invQuedan(p.stock ?? 0)}
            </span>
          </li>
        ))}
      </ul>
      {productos.length > 8 && (
        <p className="mt-1 text-xs text-cuadre-900/45">{t.verMas(productos.length - 8)}</p>
      )}
    </div>
  );
}

function Flujo({ resumen }: { resumen: ResumenPlata }) {
  const neto = resumen.ingresos - resumen.egresos;
  return (
    <div className="card mt-3 p-4">
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-cuadre-900/45">
        {t.flujoTitulo}
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-cuadra/5 py-2">
          <p className="text-xs text-cuadre-900/50">{t.kpiIngresos}</p>
          <p className="num font-bold text-cuadra">+{formatPesos(resumen.ingresos)}</p>
        </div>
        <div className="rounded-xl bg-falta/5 py-2">
          <p className="text-xs text-cuadre-900/50">{t.kpiEgresos}</p>
          <p className="num font-bold text-falta">−{formatPesos(resumen.egresos)}</p>
        </div>
        <div className="rounded-xl bg-cuadre-50 py-2">
          <p className="text-xs text-cuadre-900/50">{t.flujoNeto}</p>
          <p className={`num font-bold ${neto >= 0 ? 'text-cuadra' : 'text-falta'}`}>
            {neto >= 0 ? '+' : '−'}
            {formatPesos(Math.abs(neto))}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChipPeriodo({
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

function Kpi({ label, valor, emoji }: { label: string; valor: string; emoji?: string }) {
  return (
    <div className="card p-4">
      <p className="text-sm font-medium text-cuadre-900/55">
        {emoji && <span className="mr-1">{emoji}</span>}
        {label}
      </p>
      <p className="num mt-1 text-2xl font-extrabold text-cuadre-900">{valor}</p>
    </div>
  );
}

function MiniDato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-xl bg-cuadre-50/60 px-2.5 py-2">
      <p className="text-xs font-medium text-cuadre-900/50">{label}</p>
      <p className="num text-sm font-bold text-cuadre-900">{valor}</p>
    </div>
  );
}

function Seccion({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-bold uppercase tracking-wide text-cuadre-900/45">{titulo}</h2>
      {sub && <p className="mb-2 text-sm text-cuadre-900/55">{sub}</p>}
      {!sub && <div className="mb-2" />}
      {children}
    </section>
  );
}

// ---- Helpers de presentación ----

/** Mostramos las horas de actividad típica de un kiosco (8–23). */
function horasVisibles(horas: { hora: number; vendido: number; cantidad: number }[]) {
  return horas.filter((h) => h.hora >= 8 && h.hora <= 23);
}

function tono(t: 'bueno' | 'ojo' | 'neutro'): string {
  if (t === 'bueno') return 'bg-cuadra/8 text-cuadre-900';
  if (t === 'ojo') return 'bg-sobra/10 text-cuadre-900';
  return 'bg-cuadre-50 text-cuadre-900';
}

interface Insight {
  emoji: string;
  texto: string;
  tono: 'bueno' | 'ojo' | 'neutro';
}

function construirInsights(
  actual: ResumenPlata,
  cmp: Comparativa,
  intel: ReturnType<typeof inteligenciaProductos>,
  horas: { hora: number; vendido: number; cantidad: number }[],
  sinCosto: number,
): Insight[] {
  const out: Insight[] = [];

  if (cmp.deltaPct !== null && actual.vendido > 0) {
    const pct = `${Math.abs(Math.round(cmp.deltaPct * 100))}%`;
    if (cmp.deltaPct >= 0.05) out.push({ emoji: '📈', texto: t.insightSubiste(pct), tono: 'bueno' });
    else if (cmp.deltaPct <= -0.05) out.push({ emoji: '📉', texto: t.insightBajaste(pct), tono: 'ojo' });
  }

  const estrella = intel.topGanancia[0];
  if (estrella && estrella.ganancia && estrella.ganancia > 0) {
    out.push({
      emoji: '⭐',
      texto: t.insightEstrella(estrella.nombre, formatPesos(estrella.ganancia)),
      tono: 'neutro',
    });
  }

  if (intel.pierdenPlata.length > 0) {
    out.push({ emoji: '🔻', texto: t.insightPierden(intel.pierdenPlata.length), tono: 'ojo' });
  }

  if (sinCosto > 0) {
    out.push({ emoji: '🏷️', texto: t.insightSinCosto(sinCosto), tono: 'ojo' });
  }

  const pico = horas.reduce((mejor, h) => (h.vendido > mejor.vendido ? h : mejor), horas[0]);
  if (pico && pico.vendido > 0) {
    out.push({ emoji: '⏰', texto: t.insightHoraPico(t.franjaHora(pico.hora)), tono: 'neutro' });
  }

  return out.slice(0, 4);
}
