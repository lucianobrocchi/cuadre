import { useState, type Dispatch, type SetStateAction } from 'react';
import { catalogoOnboarding } from '../../data/catalogoInicial';
import { formatNumero, formatPesos, parsePesos } from '../../lib/format';
import { IconoCheck, IconoCerrar, IconoMas } from '../../components/Iconos';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingCopy } from './onboarding.copy';

export interface ProductoPropio {
  nombre: string;
  precio: number;
}

/** Un producto elegido del catálogo en el onboarding. */
export interface Elegido {
  nombre: string;
  precio: number;
  costo?: number;
  categoria: string;
  emoji: string;
}

interface Props {
  seleccion: Map<string, Elegido>;
  setSeleccion: Dispatch<SetStateAction<Map<string, Elegido>>>;
  propios: ProductoPropio[];
  setPropios: (v: ProductoPropio[]) => void;
  onContinuar: () => void;
  onAtras: () => void;
}

export function PasoProductos({
  seleccion,
  setSeleccion,
  propios,
  setPropios,
  onContinuar,
  onAtras,
}: Props) {
  const c = onboardingCopy.productos;
  const [catIdx, setCatIdx] = useState(0);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState(0);

  const cat = catalogoOnboarding[catIdx];
  const total = seleccion.size + propios.length;

  function toggle(item: { nombre: string; precio: number; emoji: string }, categoria: string) {
    const key = item.nombre.toLowerCase();
    setSeleccion((prev) => {
      const m = new Map(prev);
      if (m.has(key)) m.delete(key);
      else
        m.set(key, {
          nombre: item.nombre,
          precio: item.precio,
          costo: undefined,
          categoria,
          emoji: item.emoji,
        });
      return m;
    });
  }

  function setCampo(nombre: string, campo: 'precio' | 'costo', valor: number) {
    const key = nombre.toLowerCase();
    setSeleccion((prev) => {
      const actual = prev.get(key);
      if (!actual) return prev;
      const m = new Map(prev);
      m.set(key, { ...actual, [campo]: campo === 'costo' ? (valor > 0 ? valor : undefined) : valor });
      return m;
    });
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

      {/* Chips de categorías */}
      <div className="-mx-5 mt-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {catalogoOnboarding.map((cc, i) => {
          const activo = i === catIdx;
          const elegidosCat = [...seleccion.values()].filter((e) => e.categoria === cc.categoria).length;
          return (
            <button
              key={cc.categoria}
              type="button"
              onClick={() => setCatIdx(i)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activo ? 'bg-cuadre text-white shadow-card' : 'bg-white text-cuadre-900/70 active:bg-cuadre-50'
              }`}
            >
              {cc.emoji} {cc.categoria}
              {elegidosCat > 0 && (
                <span className={activo ? 'text-white/80' : 'text-cuadre'}> ·{elegidosCat}</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-sm text-cuadre-900/55">{c.catalogoHint}</p>
      <div className="flex flex-col gap-2">
        {cat.items.map((item) => (
          <ItemFila
            key={item.nombre}
            item={item}
            elegido={seleccion.get(item.nombre.toLowerCase())}
            onToggle={() => toggle(item, cat.categoria)}
            onPrecio={(n) => setCampo(item.nombre, 'precio', n)}
            onCosto={(n) => setCampo(item.nombre, 'costo', n)}
          />
        ))}
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
              <span className="min-w-0 flex-1 truncate font-semibold text-cuadre-900">{p.nombre}</span>
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
        <MiniMoneda label={onboardingCopy.productos.precioLbl} valor={nuevoPrecio} onCambiar={setNuevoPrecio} />
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

function ItemFila({
  item,
  elegido,
  onToggle,
  onPrecio,
  onCosto,
}: {
  item: { nombre: string; precio: number; emoji: string };
  elegido?: Elegido;
  onToggle: () => void;
  onPrecio: (n: number) => void;
  onCosto: (n: number) => void;
}) {
  const c = onboardingCopy.productos;
  const sel = !!elegido;
  return (
    <div className={`card p-2.5 transition ${sel ? 'ring-2 ring-cuadre' : ''}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 py-1 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cuadre-50 text-2xl">
            {item.emoji}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-cuadre-900">{item.nombre}</span>
            {!sel && (
              <span className="num block text-sm text-cuadre-900/40">{formatPesos(item.precio)}</span>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={sel ? `Quitar ${item.nombre}` : `Agregar ${item.nombre}`}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
            sel ? 'bg-cuadre text-white' : 'border-2 border-cuadre/20 text-transparent'
          }`}
        >
          <IconoCheck width={16} height={16} strokeWidth={3} />
        </button>
      </div>

      {sel && elegido && (
        <div className="mt-2 flex flex-wrap items-end gap-2 pl-[3.25rem]">
          <MiniMoneda label={c.precioLbl} valor={elegido.precio} onCambiar={onPrecio} />
          <MiniMoneda label={c.costoLbl} valor={elegido.costo ?? 0} onCambiar={onCosto} />
          {elegido.costo != null &&
            elegido.costo > 0 &&
            elegido.precio > 0 &&
            elegido.costo < elegido.precio && (
              <span className="pb-2 text-sm font-semibold text-cuadra">
                +{Math.round(((elegido.precio - elegido.costo) / elegido.precio) * 100)}%
              </span>
            )}
        </div>
      )}
    </div>
  );
}

function MiniMoneda({
  label,
  valor,
  onCambiar,
}: {
  label: string;
  valor: number;
  onCambiar: (n: number) => void;
}) {
  return (
    <label className="block w-24">
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
          className="num w-full rounded-xl border-2 border-cuadre/15 py-2 pl-5 pr-2 text-right font-semibold text-cuadre-900 outline-none focus:border-cuadre"
        />
      </span>
    </label>
  );
}
