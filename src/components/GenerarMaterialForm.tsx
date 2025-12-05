'use client';

import { useState, useEffect } from 'react';
import { FirestoreService } from '@/services/firestore.service';
import { StorageService } from '@/services/storage.service';
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
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarPreparacion();
  }, [preparacionId]);

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
    if (!preparacion) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Paso 1: Generar ejercicios con Gemini
      setCurrentStep('Generando ejercicios con Gemini AI...');
      const responseEjercicios = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generarEjercicios',
          data: {
            tema: temaNombre,
            asignatura: preparacion.asignatura,
            contexto: preparacion.contextoProfesor,
          },
        }),
      });

      if (!responseEjercicios.ok) {
        throw new Error('Error al generar ejercicios');
      }

      const { data: ejerciciosData } = await responseEjercicios.json();
      setEjercicios(ejerciciosData.ejercicios);

      // Paso 2: Generar LaTeX
      setCurrentStep('Generando documento LaTeX...');
      const responseLatex = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generarLatex',
          data: {
            ejercicios: ejerciciosData.ejercicios,
            tema: temaNombre,
            asignatura: preparacion.asignatura,
          },
        }),
      });

      if (!responseLatex.ok) {
        throw new Error('Error al generar LaTeX');
      }

      const { data: latexCode } = await responseLatex.json();
      setLatex(latexCode);

      // Paso 3: Compilar LaTeX a PDF
      setCurrentStep('Compilando LaTeX a PDF...');
      const pdfBlob = await compilarLatexAPDF(latexCode);

      // Paso 4: Subir PDF a Firebase Storage
      setCurrentStep('Subiendo PDF a Firebase Storage...');
      const pdfFile = new File([pdfBlob], `${temaNombre}_${Date.now()}.pdf`, {
        type: 'application/pdf',
      });
      const pdfUrlResult = await StorageService.uploadFile(
        pdfFile,
        `preparaciones/${preparacionId}/materiales`
      );
      setPdfUrl(pdfUrlResult);

      // Paso 5: Actualizar Firestore
      setCurrentStep('Guardando material generado...');
      const nuevoMaterial = {
        temaId: temaNombre.toLowerCase().replace(/\s+/g, '-'),
        temaNombre: temaNombre,
        ejercicios: ejerciciosData.ejercicios,
        latex: latexCode,
        pdfUrl: pdfUrlResult,
        createdAt: new Date(),
      };

      const materialesActuales = preparacion.materialesGenerados || [];
      await FirestoreService.actualizarPreparacion(preparacionId, {
        materialesGenerados: [...materialesActuales, nuevoMaterial],
      });

      setCurrentStep('¡Material generado exitosamente!');
    } catch (err) {
      console.error('Error generando material:', err);
      setError(
        err instanceof Error ? err.message : 'Error desconocido al generar material'
      );
      setCurrentStep('');
    } finally {
      setIsGenerating(false);
    }
  };

  const compilarLatexAPDF = async (latexCode: string): Promise<Blob> => {
    try {
      // Usar LaTeX.Online API
      const response = await fetch('https://latexonline.cc/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `text=${encodeURIComponent(latexCode)}`,
      });

      if (!response.ok) {
        throw new Error('Error compilando LaTeX');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error en compilarLatexAPDF:', error);
      throw new Error('No se pudo compilar el documento LaTeX a PDF');
    }
  };

  if (!preparacion) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando preparación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Generar Material de Estudio</h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>Preparación:</strong> {preparacion.titulo}
          </p>
          <p className="text-sm text-blue-700">
            <strong>Asignatura:</strong> {preparacion.asignatura}
          </p>
          <p className="text-sm text-blue-700">
            <strong>Tema seleccionado:</strong> {temaNombre}
          </p>
        </div>

        {!pdfUrl && (
          <div className="mb-6">
            <button
              onClick={handleGenerarMaterial}
              disabled={isGenerating}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {isGenerating ? 'Generando...' : 'Generar Ejercicios y PDF'}
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
              <p className="font-medium text-blue-900">{currentStep}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {ejercicios.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Ejercicios Generados</h2>
            <div className="space-y-4">
              {ejercicios.map((ej, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {idx + 1}. {ej.titulo}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ej.dificultad === 'facil'
                          ? 'bg-green-100 text-green-800'
                          : ej.dificultad === 'medio'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ej.dificultad}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Fuente: {ej.fuente}</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{ej.enunciado}</p>
                  {ej.solucion && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-blue-600 font-medium">
                        Ver solución
                      </summary>
                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                        {ej.solucion}
                      </p>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pdfUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              ¡Material generado exitosamente!
            </h3>
            <div className="space-y-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-semibold"
              >
                Descargar PDF
              </a>
              <Link
                href={`/crear-preparacion`}
                className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-semibold"
              >
                Generar más material
              </Link>
              <Link
                href="/"
                className="block w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-center font-semibold"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        )}

        {latex && (
          <details className="mt-6">
            <summary className="cursor-pointer text-blue-600 font-medium">
              Ver código LaTeX
            </summary>
            <pre className="mt-3 p-4 bg-gray-100 rounded-lg overflow-x-auto text-sm">
              {latex}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
