import { useState } from 'react';
import { Header } from '../../components/Header';
import { Pantalla } from '../../components/Pantalla';
import { VentasSemana } from './VentasSemana';
import { CajasCerradas } from './CajasCerradas';
import { historialCopy as t } from './historial.copy';

type Vista = 'ventas' | 'cajas';

export function Historial() {
  const [vista, setVista] = useState<Vista>('ventas');

  return (
    <>
      <Header
        titulo={t.headerTitulo}
        subtitulo={vista === 'ventas' ? t.ventasSubtitulo : t.cajasSubtitulo}
      />

      <Pantalla>
        <div className="mb-4 flex gap-2">
          <Tab activo={vista === 'ventas'} onClick={() => setVista('ventas')}>
            {t.tabVentas}
          </Tab>
          <Tab activo={vista === 'cajas'} onClick={() => setVista('cajas')}>
            {t.tabCajas}
          </Tab>
        </div>

        {vista === 'ventas' ? <VentasSemana /> : <CajasCerradas />}
      </Pantalla>
    </>
  );
}

function Tab({
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
