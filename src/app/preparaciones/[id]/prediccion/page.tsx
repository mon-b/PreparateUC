'use client';

import { useEffect, useState, useRef } from 'react';
import { Brain, Loader2, Sparkles, TrendingUp, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import { Preparacion, Ejercicio } from '@/types/preparacion';
import Link from 'next/link';

export default function PredictionPage({
  params,
}: {
  params: { id: string };
}) {
  const [preparacion, setPreparacion] = useState<Preparacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingTema, setGeneratingTema] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latexCode, setLatexCode] = useState<string>('');
  const overleafFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchPreparacion();
  }, [params.id]);

  const fetchPreparacion = async () => {
    try {
      const data = await FirestoreService.obtenerPreparacion(params.id);
      setPreparacion(data);
    } catch (error) {
      console.error('Error al obtener preparación:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarMaterial = async (temaNombre: string) => {
    if (!preparacion || !preparacion.prediccion) {
      setError('No hay predicción disponible para esta preparación');
      return;
    }

    setGeneratingTema(temaNombre);
    setError(null);

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
        throw new Error('Error al generar LaTeX');
      }

      const { data: latexCodeData } = await responseLatex.json();
      setLatexCode(latexCodeData);

      // Paso 3: Guardar en Firestore
      setCurrentStep('Guardando material...');
      const nuevoMaterial = {
        temaId: temaNombre.toLowerCase().replace(/\s+/g, '-'),
        temaNombre: temaNombre,
        ejercicios: ejerciciosExtraidos,
        latex: latexCodeData,
        createdAt: new Date(),
      };

      const materialesActuales = preparacion.materialesGenerados || [];
      await FirestoreService.actualizarPreparacion(params.id, {
        materialesGenerados: [...materialesActuales, nuevoMaterial],
      });

      // Paso 4: Abrir en Overleaf
      setCurrentStep('¡Material listo! Abriendo Overleaf...');

      // Intentar abrir automáticamente
      setTimeout(() => {
        if (overleafFormRef.current) {
          overleafFormRef.current.submit();
        }
      }, 500);

      await fetchPreparacion();

      // Show success message
      setSuccessMessage(`Material para "${temaNombre}" generado exitosamente y abierto en Overleaf.`);

      setTimeout(() => {
        setGeneratingTema(null);
        setCurrentStep('');
        setSuccessMessage(null);
        setLatexCode('');
      }, 5000);
    } catch (err) {
      console.error('Error generando material:', err);
      setError(
        err instanceof Error ? err.message : 'Error desconocido al generar material'
      );
      setGeneratingTema(null);
      setCurrentStep('');
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'text-green-400';
    if (prob >= 60) return 'text-yellow-400';
    if (prob >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getProbabilityBg = (prob: number) => {
    if (prob >= 80) return 'bg-green-500/20 border-green-500/30';
    if (prob >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (prob >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!preparacion) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">No se pudo cargar la preparación</p>
      </div>
    );
  }

  const prediccion = preparacion.prediccion;
  const temas = prediccion?.temas || [];

  return (
    <div>
      {/* Formulario Oculto para Overleaf */}
      <form
        ref={overleafFormRef}
        action="https://www.overleaf.com/docs"
        method="post"
        target="_blank"
        className="hidden"
      >
        <textarea name="snip" readOnly value={latexCode} />
      </form>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">
            Predicción IA
          </h1>
        </div>
        <p className="text-zinc-400">
          Análisis predictivo de contenido basado en tus materiales del curso
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400">{successMessage}</p>
              <Link
                href={`/preparaciones/${params.id}/documentos`}
                className="inline-flex items-center gap-2 mt-2 text-sm text-green-300 hover:text-green-200 underline"
              >
                Ir a Documentos Generados
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Información de la preparación */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Información General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-zinc-500 mb-1">Preparación</p>
            <p className="text-white font-medium">{preparacion.titulo}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-1">Asignatura</p>
            <p className="text-white font-medium">{preparacion.asignatura}</p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 mb-1">Archivos Analizados</p>
            <p className="text-white font-medium">{preparacion.archivosUrls.length} documentos</p>
          </div>
        </div>
      </div>

      {/* Resumen de predicción */}
      {prediccion?.resumen && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Resumen del Análisis</h3>
              <p className="text-zinc-300 leading-relaxed">{prediccion.resumen}</p>
            </div>
          </div>
        </div>
      )}

      {/* Temas predichos */}
      {temas.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay predicciones disponibles
          </h3>
          <p className="text-zinc-400 mb-6">
            Asegúrate de haber generado una predicción al crear la preparación
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-zinc-400" />
            <h2 className="text-2xl font-bold text-white">
              Temas Predichos ({temas.length})
            </h2>
          </div>

          <div className="grid gap-6">
            {temas.map((tema, index) => {
              const yaGenerado = preparacion.materialesGenerados?.some(
                (m) => m.temaNombre === tema.nombre
              );

              return (
                <div
                  key={index}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {tema.nombre}
                        </h3>
                        <div className={`px-3 py-1 rounded-full border ${getProbabilityBg(tema.probabilidad)}`}>
                          <span className={`text-sm font-semibold ${getProbabilityColor(tema.probabilidad)}`}>
                            {tema.probabilidad}% probabilidad
                          </span>
                        </div>
                      </div>
                      <p className="text-zinc-400 mb-3">{tema.descripcion}</p>
                    </div>
                  </div>

                  {tema.fundamentacion && (
                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-zinc-300 mb-1">Fundamentación</p>
                      <p className="text-sm text-zinc-400">{tema.fundamentacion}</p>
                    </div>
                  )}

                  {tema.fuentes && tema.fuentes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-zinc-300 mb-2">Fuentes</p>
                      <div className="flex flex-wrap gap-2">
                        {tema.fuentes.map((fuente, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-zinc-800 text-zinc-400 rounded"
                          >
                            {fuente}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {yaGenerado ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">Material ya generado</span>
                        </div>
                        <Link
                          href={`/preparaciones/${params.id}/documentos`}
                          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">Ver Documento</span>
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerarMaterial(tema.nombre)}
                        disabled={generatingTema !== null}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                      >
                        {generatingTema === tema.nombre ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Generando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm">Generar Material</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {generatingTema === tema.nombre && currentStep && (
                    <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-sm text-blue-400">{currentStep}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
