export interface Preparacion {
  id?: string;
  titulo: string;
  descripcion: string;
  asignatura: string;
  fechaExamen: Date;
  contextoProfesor: string;
  archivosUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  prediccion?: PrediccionResponse;
  materialesGenerados?: MaterialGenerado[];
}

export interface PrediccionResponse {
  resumen: string;
  temas: TemaPrediccion[];
}

export interface TemaPrediccion {
  nombre: string;
  probabilidad: number;
  descripcion: string;
  fundamentacion: string;
  fuentes: string[];
}

export interface MaterialGenerado {
  temaId: string;
  temaNombre: string;
  ejercicios: Ejercicio[];
  latex?: string;
  pdfUrl?: string;
  createdAt: Date;
}

export interface Ejercicio {
  titulo: string;
  enunciado: string;
  fuente: string;
  dificultad: 'facil' | 'medio' | 'dificil';
  solucion?: string;
}

export interface GeminiPredictionRequest {
  contextoProfesor: string;
  temarios: string[];
  pruebasPasadas: string[];
  asignatura: string;
  fechaExamen: string;
}

export interface FormData {
  titulo: string;
  descripcion: string;
  asignatura: string;
  fechaExamen: string;
  contextoProfesor: string;
  archivos: File[];
}
