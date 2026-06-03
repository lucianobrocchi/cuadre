import { useState } from 'react';
import { catalogoInicial } from '../../data/catalogoInicial';
import { formatNumero, formatPesos, parsePesos } from '../../lib/format';
import { IconoCheck, IconoCerrar, IconoMas } from '../../components/Iconos';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingCopy } from './onboarding.copy';

export interface ProductoPropio {
  nombre: string;
  precio: number;
}

interface Props {
  catSel: Record<string, number>;
  setCatSel: (v: Record<string, number>) => void;
  propios: ProductoPropio[];
  setPropios: (v: ProductoPropio[]) => void;
  onContinuar: () => void;
  onAtras: () => void;
}

/** Input compacto de precio (para los renglones del catálogo). */
function PrecioMini({ valor, onCambiar }: { valor: number; onCambiar: (n: number) => void }) {
  return (
    <div className="relative w-24 shrink-0">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-cuadre-900/40">
        $
      </span>
      <input
        type="text"
        inputMode="numeric"
        aria-label="Precio"
        value={valor > 0 ? formatNumero(valor) : ''}
        onChange={(e) => onCambiar(parsePesos(e.target.value))}
        placeholder="0"
        className="num w-full rounded-xl border-2 border-cuadre/15 py-2 pl-5 pr-2 text-right font-semibold text-cuadre-900 outline-none focus:border-cuadre"
      />
    </div>
  );
}

export function PasoProductos({
  catSel,
  setCatSel,
  propios,
  setPropios,
  onContinuar,
  onAtras,
}: Props) {
  const c = onboardingCopy.productos;
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState(0);

  const total = Object.keys(catSel).length + propios.length;

  function toggle(nombre: string, precioDefault: number) {
    const copia = { ...catSel };
    if (nombre in copia) delete copia[nombre];
    else copia[nombre] = precioDefault;
    setCatSel(copia);
  }

  function setPrecio(nombre: string, precio: number) {
    setCatSel({ ...catSel, [nombre]: precio });
  }

  function agregarPropio() {
    if (!nuevoNombre.trim() || nuevoPrecio <= 0) return;
    setPropios([...propios, { nombre: nuevoNombre.trim(), precio: nuevoPrecio }]);
    setNuevoNombre('');
    setNuevoPrecio(0);
  }

  function quitarPropio(i: number) {
    setPropios(propios.filter((_, idx) => idx !== i));
  }

  return (
    <OnboardingLayout
      paso={2}
      onAtras={onAtras}
      footer={
        <button type="button" className="btn-primario" disabled={total === 0} onClick={onContinuar}>
          {c.button}
          {total > 0 && <span className="num opacity-80">({total})</span>}
        </button>
      }
    >
      <h1 className="text-2xl font-extrabold leading-tight text-cuadre-900">{c.title}</h1>
      <p className="mt-2 text-cuadre-900/60">{c.subtitle}</p>

      {/* Catálogo rápido */}
      <h2 className="mt-6 font-bold text-cuadre-900">{c.catalogoLabel}</h2>
      <p className="mb-3 text-sm text-cuadre-900/55">{c.catalogoHint}</p>
      <div className="flex flex-col gap-2">
        {catalogoInicial.map((item) => {
          const sel = item.nombre in catSel;
          return (
            <div
              key={item.nombre}
              className={`card flex items-center gap-2 p-2.5 transition ${
                sel ? 'ring-2 ring-cuadre' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(item.nombre, item.precio)}
                className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cuadre-50 text-2xl">
                  {item.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-cuadre-900">
                    {item.nombre}
                  </span>
                  {!sel && (
                    <span className="num block text-sm text-cuadre-900/40">
                      {formatPesos(item.precio)}
                    </span>
                  )}
                </span>
              </button>

              {sel && (
                <PrecioMini valor={catSel[item.nombre]} onCambiar={(n) => setPrecio(item.nombre, n)} />
              )}

              <button
                type="button"
                onClick={() => toggle(item.nombre, item.precio)}
                aria-label={sel ? `Quitar ${item.nombre}` : `Agregar ${item.nombre}`}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                  sel ? 'bg-cuadre text-white' : 'border-2 border-cuadre/20 text-transparent'
                }`}
              >
                <IconoCheck width={16} height={16} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Productos propios */}
      <h2 className="mt-7 font-bold text-cuadre-900">{c.propiosLabel}</h2>
      <p className="mb-3 text-sm text-cuadre-900/55">{c.propiosHint}</p>

      {propios.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {propios.map((p, i) => (
            <li key={i} className="card flex items-center gap-3 p-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cuadre-50 text-2xl">
                🛒
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-cuadre-900">
                {p.nombre}
              </span>
              <span className="num font-bold text-cuadre-900">{formatPesos(p.precio)}</span>
              <button
                type="button"
                onClick={() => quitarPropio(i)}
                aria-label={`Quitar ${p.nombre}`}
                className="rounded-full p-1.5 text-cuadre-900/40 transition active:bg-cuadre-50"
              >
                <IconoCerrar width={18} height={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="card flex items-center gap-2 p-2.5">
        <input
          type="text"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && agregarPropio()}
          placeholder="Nombre"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border-2 border-cuadre/15 px-3 py-2 font-semibold text-cuadre-900 outline-none focus:border-cuadre"
        />
        <PrecioMini valor={nuevoPrecio} onCambiar={setNuevoPrecio} />
        <button
          type="button"
          onClick={agregarPropio}
          disabled={!nuevoNombre.trim() || nuevoPrecio <= 0}
          aria-label="Agregar producto"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cuadre text-white transition active:scale-95 disabled:opacity-30"
        >
          <IconoMas width={22} height={22} strokeWidth={2.5} />
        </button>
      </div>
    </OnboardingLayout>
  );
}
