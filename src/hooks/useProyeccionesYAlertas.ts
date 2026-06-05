// Hook personalizado para obtener proyecciones y alertas en tiempo real.

import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { ventasDeHoy, ventasEntre } from '../db/ventas';
import { listarProductos } from '../db/productos';
import { listarCuentas } from '../db/fiados';
import { calcularProyeccion, type ProyeccionDia } from '../lib/proyecciones';
import { generarAlertas, type Alerta } from '../lib/alertas';
import { MS_DIA } from '../lib/fecha';

/** Últimos días para cargar histórico de proyecciones. */
const DIAS_HISTORICO = 14;

export function useProyeccionesYAlertas() {
  // Ventas de hoy
  const ventasHoy = useLiveQuery(() => ventasDeHoy(), [], []);
  
  // Productos
  const productos = useLiveQuery(() => listarProductos(), [], []);
  
  // Fiados (cuentas)
  const cuentas = useLiveQuery(() => listarCuentas(), [], []);
  
  // Histórico de ventas (últimos 14 días)
  const ventasHistoricas = useLiveQuery(
    () => {
      const desde = Date.now() - DIAS_HISTORICO * MS_DIA;
      return ventasEntre(desde, Date.now());
    },
    [],
    []
  );
  
  // Calcular proyección
  const proyeccion: ProyeccionDia = ventasHoy && ventasHistoricas
    ? calcularProyeccion(ventasHoy, ventasHistoricas)
    : {
        horaActual: new Date().getHours(),
        vendidoAcumulado: 0,
        proyectadoTotal: 0,
        historicoPromedio: 0,
        desvioPct: 0,
        estado: 'igual',
      };
  
  // Fiados vencidos (más de 7 días sin pagar)
  const fiadosVencidos = cuentas?.filter(c => {
    const diasSinPagar = (Date.now() - c.fecha) / MS_DIA;
    return c.tipo === 'cargo' && diasSinPagar > 7;
  }) || [];
  
  // Generar alertas
  const alertas: Alerta[] = productos && ventasHoy && ventasHistoricas
    ? generarAlertas(productos, ventasHoy, ventasHistoricas, fiadosVencidos, proyeccion)
    : [];
  
  // Estado para dismiss de alertas (temporal, se resetea al recargar)
  const [alertasDismissed, setAlertasDismissed] = useState<Set<string>>(new Set());
  
  const dismissAlerta = (id: string) => {
    setAlertasDismissed(prev => new Set(prev).add(id));
  };
  
  const alertasActivas = alertas.filter(a => !alertasDismissed.has(a.id));
  
  return {
    proyeccion,
    alertas: alertasActivas,
    dismissAlerta,
    fiadosVencidos,
    loading: !ventasHoy || !productos,
  };
}
