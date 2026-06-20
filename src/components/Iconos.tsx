// Íconos SVG inline (sin dependencias). Heredan el color con currentColor.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;
type FillIconProps = IconProps & { filled?: boolean };

// Atributos base comunes; los props del caller los pueden sobreescribir.
const svgBase = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

// --- Íconos de la barra inferior (soportan estado "filled") ---

export function IconoVender({ filled, ...props }: FillIconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M3 9l1.6-4.5A1 1 0 015.5 4h13a1 1 0 01.95.68L21 9" />
      <path
        d="M4 9h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M9 13h6" stroke={filled ? '#fff' : 'currentColor'} />
    </svg>
  );
}

export function IconoCaja({ filled, ...props }: FillIconProps) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="3" y="6" width="18" height="14" rx="2" fill={filled ? 'currentColor' : 'none'} />
      <path d="M3 10.5h18" stroke={filled ? '#fff' : 'currentColor'} />
      <path d="M8 6V4h8v2" />
    </svg>
  );
}

export function IconoProductos({ filled, ...props }: FillIconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path
        d="M12 3.5l8 4.5v8l-8 4.5-8-4.5v-8l8-4.5z"
        fill={filled ? 'currentColor' : 'none'}
      />
      <path d="M4 8l8 4.5L20 8" stroke={filled ? '#fff' : 'currentColor'} />
      <path d="M12 12.5V21" stroke={filled ? '#fff' : 'currentColor'} />
    </svg>
  );
}

export function IconoHistorial({ filled, ...props }: FillIconProps) {
  return (
    <svg {...svgBase} {...props}>
      <circle cx="12" cy="12" r="9" fill={filled ? 'currentColor' : 'none'} />
      <path d="M12 7.5v5l3 2" stroke={filled ? '#fff' : 'currentColor'} />
    </svg>
  );
}

export function IconoGanancia({ filled, ...props }: FillIconProps) {
  return (
    <svg {...svgBase} {...props}>
      <rect x="4" y="13" width="4" height="7" rx="1" fill={filled ? 'currentColor' : 'none'} />
      <rect x="10" y="9" width="4" height="11" rx="1" fill={filled ? 'currentColor' : 'none'} />
      <rect x="16" y="5" width="4" height="15" rx="1" fill={filled ? 'currentColor' : 'none'} />
    </svg>
  );
}

// --- Íconos genéricos ---

export function IconoAtras(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconoChevron(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconoMas(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoBuscar(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconoMenos(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconoBasura(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

export function IconoCheck(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconoCerrar(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function IconoFlechaAbajo(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

export function IconoAjustes(props: IconProps) {
  return (
    <svg {...svgBase} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
