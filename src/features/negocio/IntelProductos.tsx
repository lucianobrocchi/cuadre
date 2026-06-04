import { useState } from 'react';
import { formatPesos } from '../../lib/format';
import type { InteligenciaProductos, ProductoStat } from '../../lib/negocio';
import { negocioCopy as t } from './negocio.copy';

type TabProd = 'vendidos' | 'rentables' | 'alertas';

const MAX = 6;

export function IntelProductos({ intel }: { intel: InteligenciaProductos }) {
  const [tab, setTab] = useState<TabProd>('vendidos');
  const alertas = intel.pierdenPlata.length + intel.sinMovimiento.length;

  return (
    <div className="card overflow-hidden">
      <div className="flex border-b border-cuadre/8">
        <TabBtn activo={tab === 'vendidos'} onClick={() => setTab('vendidos')}>
          {t.tabMasVendidos}
        </TabBtn>
        <TabBtn activo={tab === 'rentables'} onClick={() => setTab('rentables')}>
          {t.tabMasRentables}
        </TabBtn>
        <TabBtn activo={tab === 'alertas'} onClick={() => setTab('alertas')} badge={alertas}>
          {t.tabAlertas}
        </TabBtn>
      </div>

      <div className="p-3">
        {tab === 'vendidos' && <ListaStats stats={intel.topUnidades} modo="unidades" />}
        {tab === 'rentables' && <ListaStats stats={intel.topGanancia} modo="ganancia" />}
        {tab === 'alertas' && <Alertas intel={intel} />}
      </div>
    </div>
  );
}

function TabBtn({
  activo,
  onClick,
  children,
  badge,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 py-2.5 text-sm font-bold transition ${
        activo ? 'text-cuadre' : 'text-cuadre-900/40'
      }`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="ml-1 rounded-full bg-falta px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      {activo && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-cuadre" />}
    </button>
  );
}

function ListaStats({ stats, modo }: { stats: ProductoStat[]; modo: 'unidades' | 'ganancia' }) {
  if (stats.length === 0) {
    return <p className="py-6 text-center text-sm text-cuadre-900/45">{t.sinVentasSub}</p>;
  }
  return (
    <ol className="flex flex-col gap-1">
      {stats.slice(0, MAX).map((s, i) => (
        <li key={s.productoId} className="flex items-center gap-3 py-1.5">
          <span className="w-5 shrink-0 text-center text-sm font-bold text-cuadre-900/30">
            {i + 1}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cuadre-50 text-lg" aria-hidden>
            {s.emoji ?? '🛒'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-cuadre-900">{s.nombre}</span>
            <span className="num block text-xs text-cuadre-900/45">
              {t.unidades(s.unidades)} · {formatPesos(s.vendido)}
            </span>
          </span>
          {modo === 'ganancia' && s.ganancia != null && (
            <span className="num shrink-0 font-extrabold text-cuadra">+{formatPesos(s.ganancia)}</span>
          )}
          {modo === 'unidades' && (
            <span className="num shrink-0 font-extrabold text-cuadre-900">{s.unidades}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

function Alertas({ intel }: { intel: InteligenciaProductos }) {
  const { pierdenPlata, sinMovimiento } = intel;
  if (pierdenPlata.length === 0 && sinMovimiento.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <span className="text-3xl" aria-hidden>
          ✅
        </span>
        <p className="mt-2 font-semibold text-cuadre-900">{t.todoOk}</p>
        <p className="mt-0.5 text-sm text-cuadre-900/55">{t.todoOkSub}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {pierdenPlata.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden>🔻</span>
            <h4 className="font-bold text-falta">{t.pierdenPlataTitulo}</h4>
          </div>
          <p className="mb-2 text-xs text-cuadre-900/55">{t.pierdenPlataSub}</p>
          <ul className="flex flex-col gap-1">
            {pierdenPlata.slice(0, MAX).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-xl bg-falta/5 px-3 py-2">
                <span className="min-w-0 truncate text-sm font-semibold text-cuadre-900">
                  {p.emoji ?? '🛒'} {p.nombre}
                </span>
                <span className="num shrink-0 text-xs text-falta">
                  {formatPesos(p.precio)} ≤ {formatPesos(p.costo ?? 0)}
                </span>
              </li>
            ))}
          </ul>
          {pierdenPlata.length > MAX && (
            <p className="mt-1 text-xs text-cuadre-900/45">{t.verMas(pierdenPlata.length - MAX)}</p>
          )}
        </div>
      )}

      {sinMovimiento.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden>💤</span>
            <h4 className="font-bold text-cuadre-900">{t.sinMovimientoTitulo}</h4>
          </div>
          <p className="mb-2 text-xs text-cuadre-900/55">{t.sinMovimientoSub}</p>
          <div className="flex flex-wrap gap-1.5">
            {sinMovimiento.slice(0, 12).map((p) => (
              <span key={p.id} className="rounded-full bg-cuadre-50 px-2.5 py-1 text-xs font-medium text-cuadre-900/70">
                {p.emoji ?? '🛒'} {p.nombre}
              </span>
            ))}
            {sinMovimiento.length > 12 && (
              <span className="rounded-full px-2.5 py-1 text-xs text-cuadre-900/45">
                {t.verMas(sinMovimiento.length - 12)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
