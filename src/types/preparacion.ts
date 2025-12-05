export interface Preparacion {
  id?: string;
  titulo: string;
  descripcion: string;
  asignatura: string;
  contextoProfesor: string;
  archivosUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  prediccion?: PrediccionResponse;
  materialesGenerados?: MaterialGenerado[];
  documentosExtra?: DocumentoExtra[];
  forumPosts?: ForumPost[];
  likes?: string[]; // Array of user IDs who liked this preparation
}

export interface DocumentoExtra {
  nombre: string;
  url: string;
  tipo: string;
  size: number;
  uploadedAt: Date;
}

export interface ForumPost {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  contenido: string;
  createdAt: Date;
  updatedAt: Date;
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
  ejercicios: Ejercicio[];  // Ejercicios EXTRAÍDOS del material, no generados
}

export interface MaterialGenerado {
  temaId: string;
  temaNombre: string;
  ejercicios: Ejercicio[];
  latex?: string;
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
}

export interface FormData {
  titulo: string;
  descripcion: string;
  asignatura: string;
  contextoProfesor: string;
  archivos: File[];
}

export interface UserSettings {
  userId: string;
  geminiApiKey?: string;
  geminiModel?: string;
  createdAt: Date;
  updatedAt: Date;
}
