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
  ejerciciosLatex?: string;
}

export interface PrediccionResponse {
  categorias: Categoria[];
  resumen: string;
}

export interface Categoria {
  nombre: string;
  probabilidad: number;
  descripcion: string;
  ejercicios: Ejercicio[];
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
