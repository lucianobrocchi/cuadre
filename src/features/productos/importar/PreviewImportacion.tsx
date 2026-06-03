import type { Dispatch, SetStateAction } from 'react';
import { IconoCheck } from '../../../components/Iconos';
import { formatNumero, parsePesos } from '../../../lib/format';
import type { FilaImportada } from './tipos';
import { importarCopy as t } from './importar.copy';

interface Props {
  filas: FilaImportada[];
  setFilas: Dispatch<SetStateAction<FilaImportada[]>>;
  onImportar: () => void;
  importando: boolean;
}

export function PreviewImportacion({ filas, setFilas, onImportar, importando }: Props) {
  const incluidos = filas.filter((f) => f.incluir).length;
  const todosTildados = incluidos === filas.length && filas.length > 0;

  function patch(i: number, cambios: Partial<FilaImportada>) {
    setFilas((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...cambios } : f)));
  }

  function toggleTodos() {
    const nuevo = !todosTildados;
    setFilas((prev) => prev.map((f) => ({ ...f, incluir: nuevo })));
  }

  return (
    <div className="pb-28">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-cuadre-900">{t.previewTitulo(incluidos)}</h2>
          <p className="text-sm text-cuadre-900/55">{t.previewSub}</p>
        </div>
        <button
          type="button"
          onClick={toggleTodos}
          className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-cuadre"
        >
          <Check on={todosTildados} />
          {t.todos}
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {filas.map((f, i) => (
          <li
            key={i}
            className={`card p-3 transition ${f.incluir ? '' : 'opacity-50'}`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={f.incluir ? 'Quitar' : 'Incluir'}
                onClick={() => patch(i, { incluir: !f.incluir })}
              >
                <Check on={f.incluir} />
              </button>
              <input
                type="text"
                value={f.nombre}
                onChange={(e) => patch(i, { nombre: e.target.value })}
                placeholder={t.phNombre}
                className="min-w-0 flex-1 rounded-lg border border-transparent bg-cuadre-50/60 px-2 py-1.5 font-semibold text-cuadre-900 outline-none focus:border-cuadre/30"
              />
            </div>
            <div className="mt-2 flex items-end gap-2 pl-9">
              <CampoMoneda
                label={t.lblPrecio}
                valor={f.precio}
                onCambiar={(n) => patch(i, { precio: n })}
              />
              <CampoMoneda
                label={t.lblCosto}
                valor={f.costo ?? 0}
                onCambiar={(n) => patch(i, { costo: n > 0 ? n : undefined })}
              />
            </div>
            <div className="mt-2 pl-9">
              <input
                type="text"
                value={f.categoria ?? ''}
                onChange={(e) => patch(i, { categoria: e.target.value || undefined })}
                placeholder={t.phCategoria}
                className="w-full rounded-lg border border-transparent bg-cuadre-50/60 px-2 py-1.5 text-sm text-cuadre-900 outline-none focus:border-cuadre/30"
              />
            </div>
          </li>
        ))}
      </ul>

      <div
        className="fixed inset-x-0 z-30 border-t border-cuadre/10 bg-white/95 p-3 backdrop-blur"
        style={{ bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={onImportar}
            disabled={incluidos === 0 || importando}
            className="btn-primario"
          >
            {importando ? t.importando : incluidos === 0 ? t.sinSeleccion : t.importarBtn(incluidos)}
          </button>
        </div>
      </div>
    </div>
  );
}

function CampoMoneda({
  label,
  valor,
  onCambiar,
}: {
  label: string;
  valor: number;
  onCambiar: (n: number) => void;
}) {
  return (
    <label className="min-w-0 flex-1">
      <span className="mb-0.5 block text-[11px] font-medium text-cuadre-900/45">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-cuadre-900/40">
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          aria-label={label}
          value={valor > 0 ? formatNumero(valor) : ''}
          onChange={(e) => onCambiar(parsePesos(e.target.value))}
          placeholder="0"
          className="num w-full rounded-lg border border-transparent bg-cuadre-50/60 py-1.5 pl-5 pr-2 text-right font-semibold text-cuadre-900 outline-none focus:border-cuadre/30"
        />
      </span>
    </label>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
        on ? 'border-cuadre bg-cuadre text-white' : 'border-cuadre/25 text-transparent'
      }`}
    >
      <IconoCheck width={14} height={14} strokeWidth={3} />
    </span>
  );
}
