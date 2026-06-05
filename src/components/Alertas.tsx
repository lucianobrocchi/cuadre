// Componentes UI para mostrar alertas inteligentes en el dashboard.

import type { Alerta } from '../../lib/alertas';

interface Props {
  alertas: Alerta[];
  onDismiss?: (id: string) => void;
}

export function PanelAlertas({ alertas, onDismiss }: Props) {
  if (alertas.length === 0) return null;

  return (
    <div className="mb-4 space-y-2">
      {alertas.slice(0, 3).map((alerta) => (
        <div
          key={alerta.id}
          className={`flex items-start gap-3 rounded-2xl p-3 ${
            alerta.prioridad === 'alta'
              ? 'bg-red-50 border border-red-200'
              : alerta.prioridad === 'media'
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <span className="text-xl" aria-hidden>
            {getIconoAlerta(alerta.tipo)}
          </span>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold ${
              alerta.prioridad === 'alta'
                ? 'text-red-900'
                : alerta.prioridad === 'media'
                ? 'text-amber-900'
                : 'text-blue-900'
            }`}>
              {alerta.titulo}
            </p>
            <p className={`text-sm ${
              alerta.prioridad === 'alta'
                ? 'text-red-700'
                : alerta.prioridad === 'media'
                ? 'text-amber-700'
                : 'text-blue-700'
            }`}>
              {alerta.mensaje}
            </p>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(alerta.id)}
              className="text-xs font-medium text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      {alertas.length > 3 && (
        <p className="text-center text-sm font-medium text-cuadre-900/55">
          +{alertas.length - 3} alertas más
        </p>
      )}
    </div>
  );
}

function getIconoAlerta(tipo: Alerta['tipo']): string {
  switch (tipo) {
    case 'stock_agotado':
      return '🚨';
    case 'stock_bajo':
      return '⚠️';
    case 'venta_baja':
      return '📉';
    case 'venta_alta':
      return '🚀';
    case 'fiado_vencido':
      return '💰';
    case 'producto_sin_costo':
      return '🏷️';
    case 'caja_abierta':
      return '📦';
    default:
      return 'ℹ️';
  }
}

/** Tarjeta compacta para mostrar una métrica clave con indicador de tendencia. */
export function MetricaCard({
  titulo,
  valor,
  subtitulo,
  tendencia,
}: {
  titulo: string;
  valor: string;
  subtitulo?: string;
  tendencia?: 'subiendo' | 'bajando' | 'neutral';
}) {
  return (
    <div className="card p-4">
      <p className="text-sm font-medium text-cuadre-900/55">{titulo}</p>
      <p className="num mt-1 text-3xl font-extrabold text-cuadre-900">{valor}</p>
      {subtitulo && (
        <div className="mt-2 flex items-center gap-1">
          {tendencia === 'subiendo' && <span className="text-green-600">↑</span>}
          {tendencia === 'bajando' && <span className="text-red-600">↓</span>}
          {tendencia === 'neutral' && <span className="text-gray-400">→</span>}
          <span className="text-xs text-cuadre-900/45">{subtitulo}</span>
        </div>
      )}
    </div>
  );
}

/** Barra de progreso visual para proyecciones. */
export function BarraProyeccion({
  actual,
  proyectado,
  historico,
}: {
  actual: number;
  proyectado: number;
  historico: number;
}) {
  const pctActual = historico > 0 ? Math.min((actual / historico) * 100, 100) : 0;
  const pctProyectado = historico > 0 ? Math.min((proyectado / historico) * 100, 150) : 0;

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-cuadre-900/55">
        <span>Hoy</span>
        <span>Promedio histórico</span>
      </div>
      <div className="relative mt-1 h-3 w-full rounded-full bg-gray-200">
        {/* Línea del promedio histórico */}
        <div
          className="absolute top-0 h-full w-0.5 bg-gray-400"
          style={{ left: `${Math.min(pctActual, 100)}%` }}
        />
        {/* Barra actual */}
        <div
          className="absolute left-0 h-full rounded-full bg-cuadre transition-all"
          style={{ width: `${pctActual}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs">
        <span className="font-semibold text-cuadre-900">
          {Math.round(pctActual)}% del promedio
        </span>
        {proyectado > historico && (
          <span className="text-green-600">
            Proyectado: +{Math.round(((proyectado - historico) / historico) * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}
