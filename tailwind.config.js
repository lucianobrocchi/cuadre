/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verde Cuadre y su escala de apoyo.
        cuadre: {
          DEFAULT: '#0F3D2E',
          50: '#EAF2EE',
          100: '#D2E4DC',
          600: '#0F3D2E',
          700: '#0C3325',
          800: '#0A2A20',
          900: '#071E16',
        },
        // Estados del cierre.
        cuadra: '#0F9D58',
        falta: '#E2483B',
        sobra: '#F08C2E',
      },
      fontFamily: {
        // Cabinet Grotesk para títulos, Inter para el cuerpo.
        display: ['"Cabinet Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(7, 30, 22, 0.08), 0 1px 2px rgba(7, 30, 22, 0.04)',
        sheet: '0 -8px 30px rgba(7, 30, 22, 0.12)',
      },
    },
  },
  plugins: [],
};
