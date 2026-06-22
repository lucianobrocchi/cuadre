import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { obtenerConfig } from './db/config';
import { BottomNav } from './components/BottomNav';
import { SideNav } from './components/SideNav';
import type { Tab } from './components/navTabs';
import { Logo } from './components/Logo';
import { Onboarding } from './features/onboarding/Onboarding';
import { PuntoDeVenta } from './features/pos/PuntoDeVenta';
import { Caja } from './features/caja/Caja';
import { Productos } from './features/productos/Productos';
import { Negocio } from './features/negocio/Negocio';
import { Historial } from './features/historial/Historial';
import { Ajustes } from './features/ajustes/Ajustes';

export default function App() {
  const config = useLiveQuery(() => obtenerConfig());

  // Cargando la config (un instante, ya viene seedeada desde main.tsx).
  if (config === undefined) return <Splash />;

  if (!config.onboardingCompletado) return <Onboarding />;

  return <AppShell nombreKiosco={config.nombreKiosco} fondoInicial={config.fondoInicial} />;
}

function AppShell({
  nombreKiosco,
  fondoInicial,
}: {
  nombreKiosco: string;
  fondoInicial: number;
}) {
  const [tab, setTab] = useState<Tab>('vender');
  const [ajustes, setAjustes] = useState(false);

  function irA(t: Tab) {
    setAjustes(false);
    setTab(t);
  }

  return (
    <>
      <div className="min-h-full lg:pl-60">
        {ajustes ? (
          <Ajustes
            onAtras={() => setAjustes(false)}
            onEditarProductos={() => {
              setAjustes(false);
              setTab('productos');
            }}
          />
        ) : (
          <>
            {tab === 'vender' && (
              <PuntoDeVenta
                nombreKiosco={nombreKiosco}
                fondoInicial={fondoInicial}
                onIrAProductos={() => setTab('productos')}
                onIrACaja={() => setTab('caja')}
                onAbrirAjustes={() => setAjustes(true)}
              />
            )}
            {tab === 'negocio' && <Negocio />}
            {tab === 'caja' && <Caja fondoInicial={fondoInicial} />}
            {tab === 'productos' && <Productos />}
            {tab === 'historial' && <Historial />}

            <BottomNav activa={tab} onCambiar={setTab} />
          </>
        )}
      </div>

      <SideNav activa={tab} onCambiar={irA} onAjustes={() => setAjustes(true)} enAjustes={ajustes} />
    </>
  );
}

function Splash() {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#F3F6F4]">
      <div className="animate-pop">
        <Logo />
      </div>
    </div>
  );
}
