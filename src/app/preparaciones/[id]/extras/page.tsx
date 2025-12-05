'use client';

import { useEffect, useState } from 'react';
import { Upload, File, Trash2, Download, Calendar, Loader2, FileText, Wifi, WifiOff, Lock } from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import { StorageService } from '@/services/storage.service';
import { Preparacion, DocumentoExtra } from '@/types/preparacion';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function DocumentosExtraPage({
  params,
}: {
  params: { id: string };
}) {
  const [preparacion, setPreparacion] = useState<Preparacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

          // Convert documentosExtra dates
          const documentosExtra = data.documentosExtra?.map((doc: any) => ({
            ...doc,
            uploadedAt: doc.uploadedAt?.toDate ? doc.uploadedAt.toDate() : doc.uploadedAt,
          })) || [];

          // Convert materialesGenerados dates
          const materialesGenerados = data.materialesGenerados?.map((material: any) => ({
            ...material,
            createdAt: material.createdAt?.toDate ? material.createdAt.toDate() : material.createdAt,
          })) || [];

          // Convert forumPosts dates
          const forumPosts = data.forumPosts?.map((post: any) => ({
            ...post,
            createdAt: post.createdAt?.toDate ? post.createdAt.toDate() : post.createdAt,
            updatedAt: post.updatedAt?.toDate ? post.updatedAt.toDate() : post.updatedAt,
          })) || [];

          setPreparacion({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
            documentosExtra,
            materialesGenerados,
            forumPosts,
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !preparacion) return;

    // Check ownership
    if (!user || preparacion.userId !== user.uid) {
      alert('No tienes permiso para subir archivos a esta preparación');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const file = files[0];
      const path = `preparaciones/${params.id}/extras/${Date.now()}_${file.name}`;

      const url = await StorageService.uploadFile(file, path, (progress) => {
        setUploadProgress(progress);
      });

      const nuevoDocumento: DocumentoExtra = {
        nombre: file.name,
        url,
        tipo: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };

      const documentosActualizados = [
        ...(preparacion.documentosExtra || []),
        nuevoDocumento,
      ];

      await FirestoreService.actualizarPreparacion(params.id, {
        documentosExtra: documentosActualizados,
      });

      // No need to fetch - real-time listener will update automatically
    } catch (error) {
      console.error('Error al subir archivo:', error);
      alert('Error al subir el archivo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (index: number) => {
    if (!preparacion || !preparacion.documentosExtra) return;

    // Check ownership
    if (!user || preparacion.userId !== user.uid) {
      alert('No tienes permiso para eliminar archivos de esta preparación');
      return;
    }

    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar este documento?'
    );
    if (!confirmDelete) return;

    try {
      const documentosActualizados = preparacion.documentosExtra.filter(
        (_, i) => i !== index
      );

      await FirestoreService.actualizarPreparacion(params.id, {
        documentosExtra: documentosActualizados,
      });

      // No need to fetch - real-time listener will update automatically
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      alert('Error al eliminar el documento. Inténtalo de nuevo.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  const documentosExtra = preparacion.documentosExtra || [];
  const isOwner = user && preparacion.userId === user.uid;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">
                Documentos Extra
              </h1>
              {!isOwner && (
                <div className="flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg">
                  <Lock className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-500">Solo lectura</span>
                </div>
              )}
            </div>
            <p className="text-zinc-400">
              {isOwner
                ? 'Sube documentos adicionales para tener todo organizado en un solo lugar'
                : 'Documentos adicionales de esta preparación (solo el propietario puede subir archivos)'}
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

      {/* Upload Area */}
      {isOwner && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              uploading
                ? 'border-zinc-700 bg-zinc-800/50 cursor-not-allowed'
                : 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500'
            }`}
          >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
              <p className="text-sm text-zinc-400">Subiendo archivo...</p>
              <div className="w-64 h-2 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-blue-400 mb-4" />
              <p className="text-sm font-medium text-zinc-300 mb-2">
                Haz clic para subir un archivo
              </p>
              <p className="text-xs text-zinc-500">
                PDF, DOC, DOCX, TXT o cualquier otro formato
              </p>
            </>
          )}
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
        </div>
      )}

      {/* Documents List */}
      {documentosExtra.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-zinc-700" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No hay documentos extra
          </h3>
          <p className="text-zinc-400">
            Sube tus apuntes, resúmenes o cualquier material adicional
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documentosExtra.map((doc, index) => (
            <div
              key={`${doc.url}-${index}`}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <File className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {doc.nombre}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(doc.uploadedAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteDocument(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
