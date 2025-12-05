import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiPredictionRequest, PrediccionResponse } from '@/types/preparacion';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'analizar') {
      const prediccion = await analizarYPredecir(data as GeminiPredictionRequest);
      return NextResponse.json({ success: true, data: prediccion });
    }

    if (action === 'generarLatex') {
      const latex = await generarLatexEjercicios(
        data.prediccion,
        data.asignatura
      );
      return NextResponse.json({ success: true, data: latex });
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

async function analizarYPredecir(
  request: GeminiPredictionRequest
): Promise<PrediccionResponse> {
  const prompt = construirPromptPrediccion(request);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
  }

  const prediccion: PrediccionResponse = JSON.parse(jsonMatch[0]);
  return prediccion;
}

async function generarLatexEjercicios(
  prediccion: PrediccionResponse,
  asignatura: string
): Promise<string> {
  const prompt = construirPromptLatex(prediccion, asignatura);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

function construirPromptPrediccion(request: GeminiPredictionRequest): string {
  return `
Eres un experto en análisis de contenido académico y predicción de exámenes universitarios.

**Contexto:**
- Asignatura: ${request.asignatura}
- Fecha del examen: ${request.fechaExamen}
- Contexto del profesor: ${request.contextoProfesor}

**Temarios proporcionados:**
${request.temarios.join('\n\n---\n\n')}

**Pruebas pasadas:**
${request.pruebasPasadas.join('\n\n---\n\n')}

**Tarea:**
Analiza toda la información proporcionada y genera un JSON con las siguientes características:

1. Identifica las categorías/temas principales que podrían aparecer en el examen
2. Para cada categoría, asigna una probabilidad (0-100) de que aparezca en el examen
3. Para cada categoría, genera 3-5 ejercicios representativos ordenados por dificultad (fácil, medio, difícil)
4. Cada ejercicio debe tener:
   - título: nombre descriptivo del ejercicio
   - enunciado: el ejercicio completo con todos sus datos
   - fuente: de dónde viene (temario, prueba X año Y, similar a...)
   - dificultad: "facil", "medio" o "dificil"
   - solucion: (opcional) solución o hint del ejercicio

**Formato de respuesta (SOLO JSON, sin texto adicional):**

{
  "resumen": "Resumen breve del análisis y qué esperar en el examen",
  "categorias": [
    {
      "nombre": "Nombre de la categoría",
      "probabilidad": 85,
      "descripcion": "Por qué es probable que entre este tema",
      "ejercicios": [
        {
          "titulo": "Título del ejercicio",
          "enunciado": "Enunciado completo del ejercicio...",
          "fuente": "Prueba 2022, Pregunta 3",
          "dificultad": "facil",
          "solucion": "Solución o hint..."
        }
      ]
    }
  ]
}

Genera el JSON ahora:
`;
}

function construirPromptLatex(
  prediccion: PrediccionResponse,
  asignatura: string
): string {
  const categoriasText = prediccion.categorias
    .map((cat) => {
      const ejerciciosText = cat.ejercicios
        .map((ej) => `- ${ej.titulo} (${ej.dificultad}): ${ej.enunciado}`)
        .join('\n');
      return `**${cat.nombre}** (${cat.probabilidad}% probabilidad):\n${ejerciciosText}`;
    })
    .join('\n\n');

  return `
Eres un experto en LaTeX y composición de documentos académicos.

**Tarea:**
Genera un documento LaTeX completo para un compilado de ejercicios de la asignatura "${asignatura}".

**Estructura del documento:**
1. Título: "Compilado de Ejercicios - ${asignatura}"
2. Subtítulo: "Preparación para examen"
3. Sección por cada categoría (ordenada por probabilidad descendente)
4. Dentro de cada sección, ejercicios ordenados por dificultad: fácil → medio → difícil
5. Cada ejercicio debe tener:
   - Número de ejercicio
   - Título
   - Enunciado
   - Fuente (en letra pequeña)
   - Espacio para solución

**Categorías y ejercicios:**
${categoriasText}

**Requisitos del LaTeX:**
- Usa el paquete 'amsmath' para fórmulas matemáticas
- Usa 'enumitem' para listas
- Diseño limpio y profesional
- Márgenes razonables
- Fuente clara y legible

Genera el código LaTeX completo ahora (solo el código, sin explicaciones):
`;
}
