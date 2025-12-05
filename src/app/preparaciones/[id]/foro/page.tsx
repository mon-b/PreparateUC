'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Send, Loader2, User, Wifi, WifiOff } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import { Preparacion, ForumPost } from '@/types/preparacion';
import { useAuth } from '@/hooks/useAuth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ForoPage({
  params,
}: {
  params: { id: string };
}) {
  const [preparacion, setPreparacion] = useState<Preparacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nuevoPost, setNuevoPost] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Set up real-time listener
    const docRef = doc(db, 'preparaciones', params.id);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Convert forumPosts dates
          const forumPosts = data.forumPosts?.map((post: any) => ({
            ...post,
            createdAt: post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt,
            updatedAt: post.updatedAt?.toDate ? post.updatedAt.toDate() : post.updatedAt,
          })) || [];

          // Convert materialesGenerados dates
          const materialesGenerados = data.materialesGenerados?.map((material: any) => ({
            ...material,
            createdAt: material.createdAt?.toDate ? material.createdAt.toDate() : material.createdAt,
          })) || [];

          // Convert documentosExtra dates
          const documentosExtra = data.documentosExtra?.map((doc: any) => ({
            ...doc,
            uploadedAt: doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt,
          })) || [];

          setPreparacion({
            id: docSnap.id,
            ...data,
            fechaExamen: data.fechaExamen.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            forumPosts,
            materialesGenerados,
            documentosExtra,
          } as Preparacion);

          setIsConnected(true);
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error en listener real-time:', error);
        setIsConnected(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [params.id]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPost.trim() || !user || !preparacion) return;

    setSubmitting(true);
    try {
      const post: ForumPost = {
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuario',
        contenido: nuevoPost,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const postsActualizados = [...(preparacion.forumPosts || []), post];

      await FirestoreService.actualizarPreparacion(params.id, {
        forumPosts: postsActualizados,
      });

      setNuevoPost('');
      // No need to fetch - real-time listener will update automatically
    } catch (error) {
      console.error('Error al crear post:', error);
      // Don't show alert, just log the error - the real-time listener will update if it actually worked
    } finally {
      setSubmitting(false);
    }
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

  const forumPosts = preparacion.forumPosts || [];
  const sortedPosts = [...forumPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">
                Foro de Discusión
              </h1>
            </div>
            <p className="text-zinc-400">
              Comparte ideas, preguntas y discute con otros sobre esta preparación
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">En vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">Desconectado</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Post Form */}
      {user ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm text-zinc-500">
            <MessageSquare className="w-4 h-4" />
            <span>Participando como {user.displayName || user.email}</span>
          </div>
          <form onSubmit={handleSubmitPost}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user.displayName?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={nuevoPost}
                  onChange={(e) => setNuevoPost(e.target.value)}
                  placeholder="¿Qué estás pensando?"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  disabled={submitting}
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={!nuevoPost.trim() || submitting}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publicar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 text-center">
          <p className="text-zinc-400">
            Inicia sesión para participar en el foro
          </p>
        </div>
      )}

      {/* Posts List */}
      {sortedPosts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay publicaciones aún
          </h3>
          <p className="text-zinc-400">
            Sé el primero en iniciar una conversación
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post, index) => {
            const avatarText =
              post.userName?.charAt(0).toUpperCase() || 'U';
            const isCurrentUser = user && post.userId === user.uid;

            return (
              <div
                key={`${post.userId}-${index}`}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                    {avatarText}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">
                        {post.userName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs font-normal text-zinc-500">
                            (Tú)
                          </span>
                        )}
                      </h3>
                      <span className="text-sm text-zinc-500">
                        {new Date(post.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-300 whitespace-pre-wrap">
                      {post.contenido}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
