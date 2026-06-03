import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  borrarMovimiento,
  movimientosDeCaja,
  registrarMovimiento,
  totalesDeMovimientos,
} from '../../db/movimientos';
import type { CajaSesion, CategoriaMovimiento, TipoMovimiento } from '../../db/types';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { Sheet } from '../../components/Sheet';
import { InputPlata } from '../../components/InputPlata';
import { IconoBasura } from '../../components/Iconos';
import { formatHora } from '../../lib/fecha';
import { formatPesos } from '../../lib/format';
import { cajaCopy as t, categoriasPorTipo, etiquetaCategoriaMov } from './caja.copy';

interface Props {
  caja: CajaSesion;
  onAtras: () => void;
}

export function Movimientos({ caja, onAtras }: Props) {
  const movs = useLiveQuery(() => movimientosDeCaja(caja.uuid), [caja.uuid], []);
  const [form, setForm] = useState<TipoMovimiento | null>(null);

  const { ingresos, egresos } = totalesDeMovimientos(movs);

  async function guardar(datos: {
    monto: number;
    categoria: CategoriaMovimiento;
    nota?: string;
  }) {
    if (!form) return;
    await registrarMovimiento({ cajaUuid: caja.uuid, tipo: form, ...datos });
    setForm(null);
  }

  async function borrar(id: number) {
    if (!window.confirm(t.borrarConfirm)) return;
    await borrarMovimiento(id);
  }

  return (
    <>
      <Header titulo={t.movimientosTitulo} subtitulo={t.movHeaderSub} onAtras={onAtras} />

      <Pantalla>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setForm('egreso')}
            className="btn-primario flex-col gap-0.5 py-3"
          >
            <span className="text-lg">↘️ {t.anotarEgreso}</span>
          </button>
          <button
            type="button"
            onClick={() => setForm('ingreso')}
            className="btn-secundario flex-col gap-0.5 py-3"
          >
            <span className="text-lg">↗️ {t.anotarIngreso}</span>
          </button>
        </div>

        {movs.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="card p-3">
              <p className="text-sm font-medium text-cuadre-900/55">{t.totalIngresos}</p>
              <p className="num text-xl font-extrabold text-cuadra">+{formatPesos(ingresos)}</p>
            </div>
            <div className="card p-3">
              <p className="text-sm font-medium text-cuadre-900/55">{t.totalEgresos}</p>
              <p className="num text-xl font-extrabold text-cuadre-900">−{formatPesos(egresos)}</p>
            </div>
          </div>
        )}

        {movs.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              💸
            </span>
            <h2 className="mt-4 text-xl font-bold text-cuadre-900">{t.movVacioTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{t.movVacioSub}</p>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {movs.map((m) => {
              const cat = etiquetaCategoriaMov(m.categoria);
              const esIngreso = m.tipo === 'ingreso';
              return (
                <li key={m.id} className="card flex items-center gap-3 p-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cuadre-50 text-2xl"
                    aria-hidden
                  >
                    {cat.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-cuadre-900">
                      {cat.label}
                      {m.nota && (
                        <span className="font-normal text-cuadre-900/55"> · {m.nota}</span>
                      )}
                    </p>
                    <p className="num text-sm text-cuadre-900/45">{formatHora(m.fecha)} hs</p>
                  </div>
                  <span
                    className={`num font-bold ${esIngreso ? 'text-cuadra' : 'text-cuadre-900'}`}
                  >
                    {esIngreso ? '+' : '−'}
                    {formatPesos(m.monto)}
                  </span>
                  <button
                    type="button"
                    aria-label="Borrar movimiento"
                    onClick={() => m.id != null && borrar(m.id)}
                    className="-mr-1 rounded-full p-2 text-cuadre-900/30 transition active:bg-cuadre-50 active:text-falta"
                  >
                    <IconoBasura width={20} height={20} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Pantalla>

      <Sheet
        abierto={form !== null}
        onCerrar={() => setForm(null)}
        titulo={form === 'ingreso' ? t.formIngresoTitulo : t.formEgresoTitulo}
      >
        {form && <MovimientoForm tipo={form} onGuardar={guardar} />}
      </Sheet>
    </>
  );
}

function MovimientoForm({
  tipo,
  onGuardar,
}: {
  tipo: TipoMovimiento;
  onGuardar: (d: { monto: number; categoria: CategoriaMovimiento; nota?: string }) => void;
}) {
  const cats = categoriasPorTipo[tipo];
  const [monto, setMonto] = useState(0);
  const [categoria, setCategoria] = useState<CategoriaMovimiento>(cats[0].id);
  const [nota, setNota] = useState('');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label htmlFor="mov-monto" className="mb-2 block font-semibold text-cuadre-900">
          {t.montoLabel}
        </label>
        <InputPlata id="mov-monto" valor={monto} onCambiar={setMonto} placeholder="0" autoFocus />
      </div>

      <div>
        <span className="mb-2 block font-semibold text-cuadre-900">{t.categoriaLabel}</span>
        <div className="grid grid-cols-2 gap-2">
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoria(c.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold transition ${
                categoria === c.id
                  ? 'bg-cuadre text-white shadow-card'
                  : 'bg-cuadre-50 text-cuadre-900 active:bg-cuadre-100'
              }`}
            >
              <span className="text-xl" aria-hidden>
                {c.emoji}
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="mov-nota" className="mb-2 block font-semibold text-cuadre-900">
          {t.notaLabel}
        </label>
        <input
          id="mov-nota"
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder={t.notaPlaceholder}
          autoComplete="off"
          className="input-grande text-lg"
        />
      </div>

      <button
        type="button"
        disabled={monto <= 0}
        onClick={() => onGuardar({ monto, categoria, nota: nota.trim() || undefined })}
        className="btn-primario"
      >
        {t.guardar}
      </button>
    </div>
  );
}
