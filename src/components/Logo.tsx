import { IconoCheck } from './Iconos';

/** Marca Cuadre: pastilla verde con check + wordmark. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cuadre text-white">
        <IconoCheck width={18} height={18} strokeWidth={3} />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-cuadre">
        Cuadre
      </span>
    </div>
  );
}
