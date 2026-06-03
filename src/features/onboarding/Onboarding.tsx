import { useMemo, useState } from 'react';
import type { Producto } from '../../db/types';
import { actualizarConfig } from '../../db/config';
import { asegurarCategorias } from '../../db/categorias';
import { agregarProductos } from '../../db/productos';
import { PasoBienvenida } from './PasoBienvenida';
import { PasoProductos, type Elegido, type ProductoPropio } from './PasoProductos';
import { PasoVenta } from './PasoVenta';
import { PasoCierre } from './PasoCierre';

export function Onboarding() {
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState('');
  const [seleccion, setSeleccion] = useState<Map<string, Elegido>>(new Map());
  const [propios, setPropios] = useState<ProductoPropio[]>([]);
  const [vendido, setVendido] = useState(0);

  // Lista con id sintético para la venta de práctica (no toca la base todavía).
  const productosElegidos = useMemo<Producto[]>(() => {
    const items: Producto[] = [];
    let id = 1;
    for (const e of seleccion.values()) {
      items.push({ id: id++, nombre: e.nombre, precio: e.precio, costo: e.costo, emoji: e.emoji });
    }
    for (const p of propios) items.push({ id: id++, nombre: p.nombre, precio: p.precio });
    return items;
  }, [seleccion, propios]);

  async function finalizar() {
    const elegidos = [...seleccion.values()];
    // Creamos las categorías reales y mapeamos nombre→uuid.
    const mapaCat = await asegurarCategorias(elegidos.map((e) => e.categoria));
    await agregarProductos([
      ...elegidos.map((e) => ({
        nombre: e.nombre,
        precio: e.precio,
        costo: e.costo,
        emoji: e.emoji,
        categoriaUuid: mapaCat.get(e.categoria.toLowerCase()),
      })),
      ...propios.map((p) => ({ nombre: p.nombre, precio: p.precio })),
    ]);
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
          seleccion={seleccion}
          setSeleccion={setSeleccion}
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
