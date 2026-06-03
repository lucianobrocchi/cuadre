import { useMemo, useState } from 'react';
import type { Producto } from '../../db/types';
import { actualizarConfig } from '../../db/config';
import { agregarProductos } from '../../db/productos';
import { catalogoInicial } from '../../data/catalogoInicial';
import { PasoBienvenida } from './PasoBienvenida';
import { PasoProductos, type ProductoPropio } from './PasoProductos';
import { PasoVenta } from './PasoVenta';
import { PasoCierre } from './PasoCierre';

/** Arma la lista de productos elegidos con id sintético (para la práctica). */
function armarProductos(
  catSel: Record<string, number>,
  propios: ProductoPropio[],
): Producto[] {
  const items: Producto[] = [];
  let id = 1;
  for (const item of catalogoInicial) {
    if (item.nombre in catSel) {
      items.push({ id: id++, nombre: item.nombre, precio: catSel[item.nombre], emoji: item.emoji });
    }
  }
  for (const p of propios) {
    items.push({ id: id++, nombre: p.nombre, precio: p.precio });
  }
  return items;
}

export function Onboarding() {
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState('');
  const [catSel, setCatSel] = useState<Record<string, number>>({});
  const [propios, setPropios] = useState<ProductoPropio[]>([]);
  const [vendido, setVendido] = useState(0);

  const productosElegidos = useMemo(() => armarProductos(catSel, propios), [catSel, propios]);

  async function finalizar() {
    // Guardamos el catálogo real, el nombre y marcamos el onboarding como hecho.
    await agregarProductos(
      productosElegidos.map(({ nombre: n, precio, emoji }) => ({ nombre: n, precio, emoji })),
    );
    await actualizarConfig({ nombreKiosco: nombre.trim(), onboardingCompletado: true });
    // App re-renderiza solo: observa la config con useLiveQuery.
  }

  switch (paso) {
    case 1:
      return (
        <PasoBienvenida nombre={nombre} onNombre={setNombre} onContinuar={() => setPaso(2)} />
      );
    case 2:
      return (
        <PasoProductos
          catSel={catSel}
          setCatSel={setCatSel}
          propios={propios}
          setPropios={setPropios}
          onContinuar={() => setPaso(3)}
          onAtras={() => setPaso(1)}
        />
      );
    case 3:
      return (
        <PasoVenta
          productos={productosElegidos}
          vendido={vendido}
          onCobrar={(total) => setVendido((v) => v + total)}
          onContinuar={() => setPaso(4)}
          onAtras={() => setPaso(2)}
        />
      );
    case 4:
      return <PasoCierre vendido={vendido} onTerminar={finalizar} onAtras={() => setPaso(3)} />;
    default:
      return null;
  }
}
