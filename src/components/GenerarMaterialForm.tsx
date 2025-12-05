'use client';

import { useState, useEffect, useRef } from 'react';
import { FirestoreService } from '@/services/firestore.service';
import { Preparacion, Ejercicio } from '@/types/preparacion';
import Link from 'next/link';

interface GenerarMaterialFormProps {
  preparacionId: string;
  temaNombre: string;
}

export default function GenerarMaterialForm({
  preparacionId,
  temaNombre,
}: GenerarMaterialFormProps) {
  const [preparacion, setPreparacion] = useState<Preparacion | null>(null);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [latex, setLatex] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Referencia para el formulario oculto de Overleaf
  const overleafFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    cargarPreparacion();
  }, [preparacionId]);

  // Efecto para intentar abrir Overleaf automáticamente cuando hay éxito
  useEffect(() => {
    if (success && latex && overleafFormRef.current) {
      // Intentamos abrirlo automáticamente
      // Nota: Los navegadores pueden bloquear esto si pasa mucho tiempo desde el click original
      // Por eso mostramos también el botón manual gigante.
      try {
        overleafFormRef.current.submit();
      } catch (e) {
        console.warn("Bloqueo de popup detectado, el usuario deberá dar clic manual.");
      }
    }
  }, [success, latex]);

  const cargarPreparacion = async () => {
    try {
      const prep = await FirestoreService.obtenerPreparacion(preparacionId);
      if (prep) {
        setPreparacion(prep);
      } else {
        setError('Preparación no encontrada');
      }
    } catch (err) {
      console.error('Error cargando preparación:', err);
      setError('Error al cargar la preparación');
    }
  };

  const handleGenerarMaterial = async () => {
    if (!preparacion || !preparacion.prediccion) {
      setError('No hay predicción disponible para esta preparación');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Paso 1: Obtener ejercicios EXTRAÍDOS del tema seleccionado
      setCurrentStep('Obteniendo ejercicios extraídos del material...');

      const temaSeleccionado = preparacion.prediccion.temas.find(
        t => t.nombre === temaNombre
      );

      if (!temaSeleccionado) {
        throw new Error(`No se encontró el tema "${temaNombre}" en la predicción`);
      }

      let ejerciciosExtraidos = temaSeleccionado.ejercicios || [];

      // Si no hay ejercicios extraídos del material, crear uno placeholder
      if (ejerciciosExtraidos.length === 0) {
        console.warn(`No se encontraron ejercicios en el material para "${temaNombre}". Generando placeholder.`);
        ejerciciosExtraidos = [
          {
            titulo: `Ejercicio de ${temaNombre}`,
            enunciado: `[EJERCICIO PENDIENTE]\n\nNo se encontraron ejercicios específicos para este tema en el material adjunto.\n\nPor favor, agrega ejercicios manualmente en Overleaf o sube material que contenga ejercicios explícitos.`,
            fuente: 'Generado automáticamente',
            dificultad: 'medio' as const,
            solucion: null
          }
        ];
      }
      setEjercicios(ejerciciosExtraidos);

      // Paso 2: Generar LaTeX con los ejercicios extraídos
      setCurrentStep('Generando documento LaTeX...');
      const responseLatex = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generarLatex',
          data: {
            ejercicios: ejerciciosExtraidos,
            tema: temaNombre,
            asignatura: preparacion.asignatura,
          },
        }),
      });

      if (!responseLatex.ok) {
        throw new Error('Error al generar código LaTeX');
      }

      const { data: latexCode } = await responseLatex.json();
      setLatex(latexCode);

      // Paso 3: Guardar en Firestore
      setCurrentStep('Guardando material...');
      const nuevoMaterial = {
        temaId: temaNombre.toLowerCase().replace(/\s+/g, '-'),
        temaNombre: temaNombre,
        ejercicios: ejerciciosExtraidos,
        latex: latexCode,
        createdAt: new Date(),
      };

      const materialesActuales = preparacion.materialesGenerados || [];
      await FirestoreService.actualizarPreparacion(preparacionId, {
        materialesGenerados: [...materialesActuales, nuevoMaterial],
      });

      setSuccess(true);
      setCurrentStep('¡Material listo! Abriendo Overleaf...');

    } catch (err) {
      console.error('Error generando material:', err);
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.'
      );
      setCurrentStep('');
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para abrir Overleaf manualmente
  const openOverleafManual = () => {
    if (overleafFormRef.current) {
      overleafFormRef.current.submit();
    }
  };

  if (!preparacion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 animate-pulse">Cargando preparación...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      
      {/* Formulario Oculto para Overleaf */}
      <form 
        ref={overleafFormRef} 
        action="https://www.overleaf.com/docs" 
        method="post" 
        target="_blank"
        className="hidden"
      >
        <textarea name="snip" readOnly value={latex} />
      </form>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Generar Material</h1>
          <p className="text-zinc-400">
            Genera un documento LaTeX con los ejercicios extraídos del material adjunto y ábrelo directamente en Overleaf para editar o descargar como PDF.
          </p>
        </div>

        <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-8 rounded-r">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-400 block text-xs uppercase tracking-wider font-semibold mb-1">Asignatura</span>
              <span className="text-zinc-200">{preparacion.asignatura}</span>
            </div>
            <div>
              <span className="text-blue-400 block text-xs uppercase tracking-wider font-semibold mb-1">Tema</span>
              <span className="text-zinc-200">{temaNombre}</span>
            </div>
            <div>
              <span className="text-blue-400 block text-xs uppercase tracking-wider font-semibold mb-1">Integración</span>
              <span className="text-zinc-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Overleaf API Ready
              </span>
            </div>
          </div>
        </div>

        {!success && (
          <div className="mb-8">
            <button
              onClick={handleGenerarMaterial}
              disabled={isGenerating}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/80"></div>
                  <span>{currentStep}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Compilar LaTeX y Abrir en Overleaf
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-8 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              ¡Material Listo!
            </h3>
            <p className="text-zinc-400 mb-6">
              Tu guía se ha generado. Si Overleaf no se abrió automáticamente, usa el botón de abajo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={openOverleafManual}
                className="flex items-center justify-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-bold shadow-lg shadow-green-900/40 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir en Overleaf
              </button>
              <Link
                href="/mis-preparaciones"
                className="flex items-center justify-center px-6 py-4 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors font-medium border border-zinc-700"
              >
                Volver a Mis Preparaciones
              </Link>
            </div>
          </div>
        )}

        {ejercicios.length > 0 && (
          <div className="border-t border-zinc-800 pt-8">
            <h3 className="text-xl font-bold text-zinc-100 mb-4">Vista Previa de Contenido</h3>
            <div className="space-y-4">
              {ejercicios.map((ej, idx) => (
                <div key={idx} className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-5">
                  <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                    <h4 className="text-zinc-200 font-medium">
                      <span className="text-zinc-500 mr-2">#{idx + 1}</span>
                      {ej.titulo}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wide ${
                        ej.dificultad === 'facil'
                          ? 'bg-green-900/30 text-green-400 border border-green-800'
                          : ej.dificultad === 'medio'
                          ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                          : 'bg-red-900/30 text-red-400 border border-red-800'
                      }`}
                    >
                      {ej.dificultad}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-sm whitespace-pre-wrap font-mono bg-zinc-900 p-4 rounded border border-zinc-800 mb-4">
                    {ej.enunciado}
                  </div>
                  {ej.solucion && (
                    <details className="group">
                      <summary className="cursor-pointer text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center gap-2 select-none">
                        <span className="group-open:rotate-90 transition-transform">▶</span> Ver solución
                      </summary>
                      <div className="mt-2 text-zinc-500 text-sm pl-4 border-l-2 border-blue-900/50">
                        {ej.solucion}
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {latex && (
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <details className="group">
              <summary className="cursor-pointer text-zinc-500 hover:text-zinc-400 text-xs font-medium select-none flex items-center gap-2">
                <span>⚡</span> Debug: Ver código LaTeX crudo
              </summary>
              <div className="mt-4 relative">
                <pre className="p-4 bg-black rounded-lg overflow-x-auto text-[10px] text-zinc-600 font-mono border border-zinc-900 max-h-40">
                  {latex}
                </pre>
                <button 
                  onClick={() => navigator.clipboard.writeText(latex)}
                  className="absolute top-2 right-2 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:bg-zinc-700"
                >
                  Copiar
                </button>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}