'use client';

import { useState } from 'react';
import { StorageService } from '@/services/storage.service';
import { GeminiService } from '@/services/gemini.service';
import { FirestoreService } from '@/services/firestore.service';
import { FormData, GeminiPredictionRequest, PrediccionResponse } from '@/types/preparacion';
import TablaPrediccion from './TablaPrediccion';

interface FileUploadProgress {
  [key: number]: number;
}

export default function CrearPreparacionForm() {
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    asignatura: '',
    fechaExamen: '',
    contextoProfesor: '',
    archivos: [],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [preparacionId, setPreparacionId] = useState<string | null>(null);
  const [prediccion, setPrediccion] = useState<PrediccionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setFormData((prev) => ({
        ...prev,
        archivos: files,
      }));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      setCurrentStep('Subiendo archivos a Firebase Storage...');
      const uploadedUrls = await StorageService.uploadMultipleFiles(
        formData.archivos,
        'preparaciones',
        (fileIndex, progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileIndex]: progress,
          }));
        }
      );

      setCurrentStep('Extrayendo texto de los archivos...');
      const textosExtraidos = await Promise.all(
        uploadedUrls.map((url, index) =>
          GeminiService.extraerTextoDeArchivo(url, formData.archivos[index].name)
        )
      );

      setCurrentStep('Analizando contenido con Gemini AI...');
      const geminiRequest: GeminiPredictionRequest = {
        contextoProfesor: formData.contextoProfesor,
        temarios: textosExtraidos,
        pruebasPasadas: textosExtraidos,
        asignatura: formData.asignatura,
        fechaExamen: formData.fechaExamen,
      };

      const prediccionResult = await GeminiService.analizarYPredecir(geminiRequest);
      setPrediccion(prediccionResult);

      setCurrentStep('Guardando predicción en Firestore...');
      const preparacionData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        asignatura: formData.asignatura,
        fechaExamen: new Date(formData.fechaExamen),
        contextoProfesor: formData.contextoProfesor,
        archivosUrls: uploadedUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'temp-user-id',
        prediccion: prediccionResult,
        materialesGenerados: [],
      };

      const docId = await FirestoreService.crearPreparacion(preparacionData);
      setPreparacionId(docId);

      setCurrentStep('¡Predicción generada exitosamente!');
    } catch (err) {
      console.error('Error creating preparacion:', err);
      setError(
        err instanceof Error ? err.message : 'Error desconocido al crear la preparación'
      );
      setCurrentStep('');
    } finally {
      setIsProcessing(false);
      setUploadProgress({});
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      asignatura: '',
      fechaExamen: '',
      contextoProfesor: '',
      archivos: [],
    });
    setSelectedFiles([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Crear Nueva Preparación</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium mb-2">
            Título de la Preparación
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Preparación Cálculo 1 - Parcial 2"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium mb-2">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descripción breve de la preparación..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="asignatura" className="block text-sm font-medium mb-2">
              Asignatura
            </label>
            <input
              type="text"
              id="asignatura"
              name="asignatura"
              value={formData.asignatura}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Cálculo 1, Física 2..."
            />
          </div>

          <div>
            <label htmlFor="fechaExamen" className="block text-sm font-medium mb-2">
              Fecha del Examen
            </label>
            <input
              type="date"
              id="fechaExamen"
              name="fechaExamen"
              value={formData.fechaExamen}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contextoProfesor" className="block text-sm font-medium mb-2">
            Contexto del Profesor
          </label>
          <textarea
            id="contextoProfesor"
            name="contextoProfesor"
            value={formData.contextoProfesor}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: El profesor mencionó que entrará sí o sí derivadas parciales y también hizo énfasis en el teorema de Green..."
          />
        </div>

        <div>
          <label htmlFor="archivos" className="block text-sm font-medium mb-2">
            Archivos (Temarios, Pruebas Pasadas, Apuntes)
          </label>
          <input
            type="file"
            id="archivos"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.txt,.doc,.docx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            Formatos aceptados: PDF, TXT, DOC, DOCX
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3">Archivos seleccionados:</h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700"></div>
              <div>
                <p className="font-medium text-blue-900">{currentStep}</p>
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(uploadProgress).map(([fileIndex, progress]) => (
                      <div key={fileIndex} className="text-sm text-blue-700">
                        Archivo {parseInt(fileIndex) + 1}: {progress}%
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {preparacionId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              ¡Preparación creada exitosamente!
            </p>
            <p className="text-green-700 text-sm mt-1">ID: {preparacionId}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={resetForm}
            disabled={isProcessing}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isProcessing || selectedFiles.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Procesando...' : 'Crear Preparación'}
          </button>
        </div>
      </form>

      {prediccion && preparacionId && !isProcessing && (
        <div className="mt-8">
          <TablaPrediccion temas={prediccion.temas} preparacionId={preparacionId} />
        </div>
      )}
    </div>
  );
}
