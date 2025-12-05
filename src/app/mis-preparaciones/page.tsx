'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { FirestoreService } from '@/services/firestore.service';
import { Preparacion } from '@/types/preparacion';
import AuthGuard from '@/components/AuthGuard';

function MisPreparacionesContent() {
  const { user } = useAuth();
  const [preparaciones, setPreparaciones] = useState<Preparacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPreparaciones();
    }
  }, [user]);

  const loadPreparaciones = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await FirestoreService.obtenerPreparacionesPorUsuario(user.uid);
      setPreparaciones(data);
    } catch (err) {
      console.error('Error loading preparaciones:', err);
      setError('Error al cargar las preparaciones');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Mis Preparaciones</h1>
        <Link
          href="/crear-preparacion"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-900/30"
        >
          + Nueva Preparación
        </Link>
      </div>

      {preparaciones.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
            No tienes preparaciones aún
          </h2>
          <p className="text-zinc-400 mb-6">
            Crea tu primera preparación para comenzar a estudiar con IA
          </p>
          <Link
            href="/crear-preparacion"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-900/30"
          >
            Crear Preparación
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {preparaciones.map((prep) => (
            <div
              key={prep.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg p-6 hover:border-zinc-700 transition-all"
            >
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                {prep.titulo}
              </h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <span className="font-medium text-zinc-300">Asignatura:</span> {prep.asignatura}
                </p>
                <p>
                  <span className="font-medium text-zinc-300">Fecha del examen:</span>{' '}
                  {formatDate(prep.fechaExamen)}
                </p>
                <p>
                  <span className="font-medium text-zinc-300">Creado:</span>{' '}
                  {formatDate(prep.createdAt)}
                </p>
              </div>
              <p className="text-sm text-zinc-300 mt-4 line-clamp-2">
                {prep.descripcion}
              </p>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="text-xs text-zinc-500">
                  {prep.archivosUrls.length} archivo(s) · {prep.prediccion?.categorias.length || 0} categoría(s)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MisPreparacionesPage() {
  return (
    <main className="min-h-screen bg-black">
      <AuthGuard>
        <MisPreparacionesContent />
      </AuthGuard>
    </main>
  );
}
