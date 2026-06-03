import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { actualizarConfig, obtenerConfig, reiniciarTodo } from '../../db/config';
import { cargarDatosDemo } from '../../db/demo';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { InputPlata } from '../../components/InputPlata';
import { IconoCheck, IconoChevron, IconoProductos } from '../../components/Iconos';
import { ajustesCopy as t } from './ajustes.copy';

interface Props {
  onAtras: () => void;
  onEditarProductos: () => void;
}

export function Ajustes({ onAtras, onEditarProductos }: Props) {
  const config = useLiveQuery(() => obtenerConfig());
  const [nombre, setNombre] = useState<string | null>(null);
  const [fondo, setFondo] = useState<number | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [demo, setDemo] = useState<'idle' | 'cargando' | 'listo'>('idle');

  const nombreVal = nombre ?? config?.nombreKiosco ?? '';
  const fondoVal = fondo ?? config?.fondoInicial ?? 0;

  const hayCambios =
    config != null &&
    ((nombre !== null && nombre.trim() !== config.nombreKiosco) ||
      (fondo !== null && fondo !== config.fondoInicial));

  async function guardar() {
    await actualizarConfig({ nombreKiosco: nombreVal.trim(), fondoInicial: fondoVal });
    setNombre(null);
    setFondo(null);
    setGuardado(true);
    window.setTimeout(() => setGuardado(false), 1500);
  }

  async function reset() {
    if (!window.confirm(t.resetConfirm)) return;
    await reiniciarTodo();
    // App vuelve sola al onboarding (observa la config).
  }

  async function cargarDemo() {
    if (demo === 'cargando') return;
    if (!window.confirm(t.demoConfirm)) return;
    setDemo('cargando');
    await cargarDatosDemo();
    setDemo('listo');
    window.setTimeout(() => setDemo('idle'), 2500);
  }

  return (
    <>
      <Header titulo={t.headerTitulo} onAtras={onAtras} />

      <Pantalla conNav={false}>
        {/* Tu kiosco */}
        <section className="card p-5">
          <h2 className="font-bold text-cuadre-900">{t.kioscoTitulo}</h2>
          <label htmlFor="aj-nombre" className="mb-2 mt-3 block font-semibold text-cuadre-900">
            {t.nombreLabel}
          </label>
          <input
            id="aj-nombre"
            type="text"
            value={nombreVal}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={t.nombrePlaceholder}
            autoComplete="off"
            className="input-grande text-xl"
          />
        </section>

        {/* Caja */}
        <section className="card mt-3 p-5">
          <h2 className="font-bold text-cuadre-900">{t.cajaTitulo}</h2>
          <label htmlFor="aj-fondo" className="mb-1 mt-3 block font-semibold text-cuadre-900">
            {t.fondoLabel}
          </label>
          <p className="mb-2 text-sm text-cuadre-900/55">{t.fondoHint}</p>
          <InputPlata id="aj-fondo" valor={fondoVal} onCambiar={setFondo} placeholder="0" />
        </section>

        <button
          type="button"
          onClick={guardar}
          disabled={!hayCambios}
          className="btn-primario mt-4"
        >
          {guardado ? (
            <>
              <IconoCheck width={20} height={20} strokeWidth={2.5} />
              {t.guardado}
            </>
          ) : (
            t.guardar
          )}
        </button>

        {/* Productos */}
        <h2 className="mb-2 mt-7 px-1 font-bold text-cuadre-900">{t.productosTitulo}</h2>
        <button
          type="button"
          onClick={onEditarProductos}
          className="card flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cuadre-50 text-cuadre">
            <IconoProductos width={24} height={24} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-cuadre-900">{t.productosRow}</span>
            <span className="block text-sm text-cuadre-900/55">{t.productosHint}</span>
          </span>
          <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
        </button>

        {/* Datos de ejemplo */}
        <h2 className="mb-2 mt-7 px-1 font-bold text-cuadre-900">{t.demoTitulo}</h2>
        <button
          type="button"
          onClick={cargarDemo}
          disabled={demo === 'cargando'}
          className="card flex w-full items-center gap-4 p-4 text-left transition active:scale-[0.99] disabled:opacity-60"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cuadre-50 text-2xl">
            🧪
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-cuadre-900">
              {demo === 'cargando' ? t.demoCargando : demo === 'listo' ? t.demoListo : t.demo}
            </span>
            <span className="block text-sm text-cuadre-900/55">{t.demoHint}</span>
          </span>
          {demo === 'listo' ? (
            <IconoCheck width={20} height={20} strokeWidth={2.5} className="shrink-0 text-cuadra" />
          ) : (
            <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
          )}
        </button>

        {/* Zona de reinicio */}
        <h2 className="mb-2 mt-7 px-1 font-bold text-cuadre-900">{t.zonaTitulo}</h2>
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-2xl border-2 border-falta/25 bg-white p-4 text-left transition active:bg-falta/5"
        >
          <span className="block font-semibold text-falta">{t.reset}</span>
          <span className="block text-sm text-cuadre-900/55">{t.resetHint}</span>
        </button>

        <p className="mt-8 pb-2 text-center text-sm text-cuadre-900/35">{t.version}</p>
      </Pantalla>
    </>
  );
}
