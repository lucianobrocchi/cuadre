// Gráfico de barras minimalista en SVG. Sin dependencias: se estira al ancho
// del contenedor. Las barras "destacadas" usan el verde Cuadre fuerte.

export interface BarraDato {
  valor: number;
  etiqueta?: string;
  destacado?: boolean;
}

interface Props {
  datos: BarraDato[];
  /** Alto del área de barras en px. */
  alto?: number;
  /** Etiqueta accesible del gráfico. */
  titulo?: string;
}

const VERDE = '#0F3D2E';
const VERDE_SUAVE = '#D2E4DC';

export function GraficoBarras({ datos, alto = 120, titulo }: Props) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  const n = datos.length;
  // viewBox en unidades arbitrarias; el SVG se estira al contenedor.
  const gap = 0.35;
  const anchoBarra = 1;
  const anchoTotal = n * anchoBarra + (n - 1) * gap;
  const altoVB = 100;

  return (
    <svg
      role="img"
      aria-label={titulo}
      viewBox={`0 0 ${anchoTotal} ${altoVB}`}
      preserveAspectRatio="none"
      width="100%"
      height={alto}
      className="overflow-visible"
    >
      {datos.map((d, i) => {
        const h = (d.valor / max) * altoVB;
        const x = i * (anchoBarra + gap);
        const y = altoVB - h;
        return (
          <rect
            key={i}
            x={x}
            y={Math.min(y, altoVB - 1.5)}
            width={anchoBarra}
            height={Math.max(1.5, h)}
            rx={0.4}
            fill={d.destacado ? VERDE : VERDE_SUAVE}
          />
        );
      })}
    </svg>
  );
}
