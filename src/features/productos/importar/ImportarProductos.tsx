import { useRef, useState } from 'react';
import { asegurarCategorias } from '../../../db/categorias';
import { agregarProductos } from '../../../db/productos';
import { Header } from '../../../components/Header';
import { Pantalla } from '../../../components/Pantalla';
import { IconoCheck, IconoChevron } from '../../../components/Iconos';
import { parseExcel } from './parseExcel';
import { parseFoto } from './parseFoto';
import { PreviewImportacion } from './PreviewImportacion';
import type { FilaImportada, FuenteImport } from './tipos';
import { importarCopy as t } from './importar.copy';

type Paso = 'fuente' | 'cargando' | 'preview' | 'guardando' | 'listo' | 'error';

export function ImportarProductos({ onAtras }: { onAtras: () => void }) {
  const [paso, setPaso] = useState<Paso>('fuente');
  const [filas, setFilas] = useState<FilaImportada[]>([]);
  const [cargandoMsg, setCargandoMsg] = useState('');
  const [error, setError] = useState('');
  const [importados, setImportados] = useState(0);
  const excelRef = useRef<HTMLInputElement>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  async function manejarArchivo(file: File, fuente: FuenteImport) {
    setCargandoMsg(fuente === 'foto' ? t.analizando : t.leyendoExcel);
    setPaso('cargando');
    try {
      const res = fuente === 'foto' ? await parseFoto(file) : await parseExcel(file);
      if (res.length === 0) {
        setError(t.errorVacio);
        setPaso('error');
        return;
      }
      setFilas(res);
      setPaso('preview');
    } catch {
      setError(t.errorArchivo);
      setPaso('error');
    }
  }

  async function importar() {
    setPaso('guardando');
    const incluidas = filas.filter((f) => f.incluir && f.nombre.trim());
    const nombresCat = incluidas
      .map((f) => f.categoria?.trim())
      .filter((c): c is string => !!c);
    const mapaCat = await asegurarCategorias(nombresCat);

    await agregarProductos(
      incluidas.map((f) => ({
        nombre: f.nombre.trim(),
        precio: f.precio,
        categoriaUuid: f.categoria
          ? mapaCat.get(f.categoria.trim().toLowerCase())
          : undefined,
        codigoBarras: f.codigoBarras,
      })),
    );
    setImportados(incluidas.length);
    setPaso('listo');
  }

  const headerAtras = paso === 'fuente' || paso === 'preview' || paso === 'error' ? onAtras : undefined;

  return (
    <>
      <Header titulo={t.headerTitulo} onAtras={headerAtras} />

      {/* Inputs ocultos */}
      <input
        ref={excelRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) manejarArchivo(f, 'excel');
          e.target.value = '';
        }}
      />
      <input
        ref={fotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) manejarArchivo(f, 'foto');
          e.target.value = '';
        }}
      />

      <Pantalla>
        {paso === 'fuente' && (
          <>
            <h2 className="mb-4 text-lg font-bold text-cuadre-900">{t.fuenteTitulo}</h2>
            <div className="flex flex-col gap-3">
              <FuenteCard
                emoji="📄"
                titulo={t.excelTitulo}
                sub={t.excelSub}
                hint={t.excelUpload}
                onClick={() => excelRef.current?.click()}
              />
              <FuenteCard
                emoji="📷"
                titulo={t.fotoTitulo}
                sub={t.fotoSub}
                hint={t.fotoUpload}
                badge={t.fotoBadge}
                onClick={() => fotoRef.current?.click()}
              />
            </div>
          </>
        )}

        {paso === 'cargando' && <Cargando mensaje={cargandoMsg} />}

        {paso === 'preview' && (
          <PreviewImportacion
            filas={filas}
            setFilas={setFilas}
            onImportar={importar}
            importando={false}
          />
        )}

        {paso === 'guardando' && <Cargando mensaje={t.importando} />}

        {paso === 'listo' && (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-cuadra text-white">
              <IconoCheck width={44} height={44} strokeWidth={2.5} />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-cuadre-900">{t.listoTitulo}</h2>
            <p className="mt-1 text-cuadre-900/60">{t.listoSub(importados)}</p>
            <button type="button" onClick={onAtras} className="btn-primario mt-7 w-auto px-8">
              {t.volver}
            </button>
          </div>
        )}

        {paso === 'error' && (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="text-5xl" aria-hidden>
              😕
            </span>
            <p className="mt-4 max-w-xs text-cuadre-900/70">{error}</p>
            <button
              type="button"
              onClick={() => setPaso('fuente')}
              className="btn-primario mt-6 w-auto px-8"
            >
              {t.reintentar}
            </button>
          </div>
        )}
      </Pantalla>
    </>
  );
}

function FuenteCard({
  emoji,
  titulo,
  sub,
  hint,
  badge,
  onClick,
}: {
  emoji: string;
  titulo: string;
  sub: string;
  hint: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex items-center gap-4 p-4 text-left transition active:scale-[0.99]"
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cuadre-50 text-3xl"
        aria-hidden
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-bold text-cuadre-900">{titulo}</span>
          {badge && (
            <span className="rounded-full bg-cuadre px-2 py-0.5 text-[11px] font-bold text-white">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-cuadre-900/55">{sub}</span>
        <span className="mt-1 block text-xs font-semibold text-cuadre">{hint}</span>
      </span>
      <IconoChevron width={20} height={20} className="shrink-0 text-cuadre-900/25" />
    </button>
  );
}

function Cargando({ mensaje }: { mensaje: string }) {
  return (
    <div className="mt-20 flex flex-col items-center text-center">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-cuadre/15 border-t-cuadre" />
      <p className="mt-5 font-semibold text-cuadre-900/70">{mensaje}</p>
    </div>
  );
}
