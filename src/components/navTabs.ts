import {
  IconoCaja,
  IconoGanancia,
  IconoHistorial,
  IconoProductos,
  IconoVender,
} from './Iconos';

export type Tab = 'vender' | 'negocio' | 'caja' | 'productos' | 'historial';

export const TABS: { id: Tab; label: string; Icono: typeof IconoVender }[] = [
  { id: 'vender', label: 'Vender', Icono: IconoVender },
  { id: 'negocio', label: 'Negocio', Icono: IconoGanancia },
  { id: 'caja', label: 'Caja', Icono: IconoCaja },
  { id: 'productos', label: 'Productos', Icono: IconoProductos },
  { id: 'historial', label: 'Historial', Icono: IconoHistorial },
];
