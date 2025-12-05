import {
  GeminiPredictionRequest,
  PrediccionResponse,
} from '@/types/preparacion';

export class GeminiService {
  static async analizarYPredecir(
    request: GeminiPredictionRequest,
    userApiKey?: string,
    userModel?: string
  ): Promise<PrediccionResponse> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analizar',
          data: request,
          userApiKey,
          userModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al analizar con Gemini');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      return result.data;
    } catch (error) {
      console.error('Error en analizarYPredecir:', error);
      throw error;
    }
  }

  static async generarLatexEjercicios(
    prediccion: PrediccionResponse,
    asignatura: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generarLatex',
          data: { prediccion, asignatura },
        }),
      });

      if (!response.ok) {
        throw new Error('Error al generar LaTeX');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      return result.data;
    } catch (error) {
      console.error('Error en generarLatexEjercicios:', error);
      throw error;
    }
  }

  static async extraerTextoDeArchivo(
    fileUrl: string,
    fileName: string
  ): Promise<string> {
    try {
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (extension === 'txt') {
        const response = await fetch(fileUrl);
        return await response.text();
      }

      return `[Archivo: ${fileName}]`;
    } catch (error) {
      console.error('Error extrayendo texto:', error);
      return `[Error procesando: ${fileName}]`;
    }
  }
}
