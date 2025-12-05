'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import { Preparacion } from '@/types/preparacion';

export default function DocumentosGeneradosPage({
  params,
}: {
  params: { id: string };
}) {
  const [preparacion, setPreparacion] = useState<Preparacion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchPreparacion();

    // Auto-refresh every 5 seconds to catch newly generated materials
    const intervalId = setInterval(fetchPreparacion, 5000);

    return () => clearInterval(intervalId);
  }, [params.id]);

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

  const materialesGenerados = preparacion.materialesGenerados || [];

  console.log('=== DEBUG Documentos ===');
  console.log('Preparacion completa:', preparacion);
  console.log('materialesGenerados:', materialesGenerados);
  console.log('Length:', materialesGenerados.length);

  // Sort by creation date, newest first
  const sortedMateriales = [...materialesGenerados].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">
            Documentos Generados
          </h1>
        </div>
        <p className="text-zinc-400">
          Documentos de ejercicios y materiales generados por IA ({materialesGenerados.length} {materialesGenerados.length === 1 ? 'documento' : 'documentos'})
        </p>
      </div>

      {sortedMateriales.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay documentos generados
          </h3>
          <p className="text-zinc-400 mb-6">
            Genera materiales desde la sección de Predicción para verlos aquí
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedMateriales.map((material, index) => (
            <div
              key={`${material.temaId}-${index}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {material.temaNombre}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(material.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">
                      Ejercicios incluidos
                    </p>
                    <p className="text-xs text-zinc-500">
                      {material.ejercicios.length} ejercicios
                    </p>
                  </div>
                </div>

                {material.latex && (
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        Código LaTeX
                      </p>
                      <p className="text-xs text-zinc-500">
                        Disponible para compilar
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const blob = new Blob([material.latex!], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${material.temaNombre.replace(/\s+/g, '_')}.tex`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Descargar .tex</span>
                    </button>
                  </div>
                )}

                {material.pdfUrl && (
                  <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        Documento PDF
                      </p>
                      <p className="text-xs text-zinc-500">
                        PDF compilado
                      </p>
                    </div>
                    <a
                      href={material.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Ver PDF</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
