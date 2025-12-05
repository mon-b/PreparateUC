'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { FirestoreService } from '@/services/firestore.service';
import { Preparacion } from '@/types/preparacion';
import AuthGuard from '@/components/AuthGuard';
import { Loader2, User, BookOpen, Calendar, MoreHorizontal, PlusCircle, FileText } from 'lucide-react';

// Helper function to get random color gradient
const getRandomColor = () => {
  const colors = [
    "from-blue-600 to-indigo-900",
    "from-emerald-600 to-teal-900",
    "from-orange-600 to-red-900",
    "from-purple-600 to-pink-900",
    "from-cyan-600 to-blue-900",
    "from-rose-600 to-red-900",
    "from-violet-600 to-purple-900",
    "from-amber-600 to-orange-900",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Helper function to format date
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `Hace ${Math.floor(diffDays / 7)} sem`;
};

// Prep Card Component
interface PrepCardProps {
  prep: Preparacion;
}

const PrepCard = ({ prep }: PrepCardProps) => {
  const color = getRandomColor();
  const tags = (prep.prediccion?.temas || []).slice(0, 2).map(t => t.nombre);

  return (
    <Link href={`/preparaciones/${prep.id}`}>
      <div className="group relative break-inside-avoid mb-6 cursor-pointer">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-transform duration-300 group-hover:-translate-y-1">
          {/* Header con gradiente */}
          <div className={`h-48 w-full bg-gradient-to-br ${color} p-4 flex flex-col justify-between`}>
            <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs text-white border border-white/10">
                {prep.asignatura}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Add options menu here
                }}
                className="bg-black/40 backdrop-blur-md p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-4">
            <h3 className="text-zinc-100 font-semibold text-lg leading-tight mb-1 group-hover:text-blue-400 transition-colors">
              {prep.titulo}
            </h3>

            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
              <Calendar size={12} />
              <span>{getRelativeTime(prep.createdAt)}</span>
              <span>•</span>
              <span>Examen: {new Date(prep.fechaExamen).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] border border-zinc-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-zinc-800 pt-3 mt-2">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <FileText size={16} />
                <span className="text-xs font-medium">{prep.archivosUrls.length} archivo(s)</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 transition-colors">
                <BookOpen size={16} />
                <span className="text-xs">{prep.prediccion?.temas?.length || 0} tema(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

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
      setError('Error al cargar tus preparaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadPreparaciones}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Mis Preparaciones
            </h2>
            <p className="text-zinc-500">
              {preparaciones.length} {preparaciones.length === 1 ? 'preparación' : 'preparaciones'}
            </p>
          </div>
          <Link
            href="/crear-preparacion"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <PlusCircle size={20} />
            <span>Nueva Preparación</span>
          </Link>
        </div>

        {preparaciones.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-zinc-100 mb-2">
              No tienes preparaciones aún
            </h3>
            <p className="text-zinc-400 mb-6">
              Crea tu primera preparación para empezar
            </p>
            <Link
              href="/crear-preparacion"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusCircle size={20} />
              <span>Crear Preparación</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {preparaciones.map((prep) => (
              <PrepCard key={prep.id} prep={prep} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MisPreparacionesPage() {
  return (
    <AuthGuard>
      <MisPreparacionesContent />
    </AuthGuard>
  );
}
