import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GeminiPredictionRequest, PrediccionResponse } from '@/types/preparacion';

export async function POST(request: NextRequest) {
  try {
    // Verificar que la API key esté disponible
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY no está configurada');
      return NextResponse.json(
        {
          success: false,
          error: 'API key de Gemini no configurada en el servidor',
        },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const body = await request.json();
    const { action, data } = body;

    console.log('Gemini API - Acción:', action);

    if (action === 'analizar') {
      const prediccion = await analizarYPredecir(model, data as GeminiPredictionRequest);
      return NextResponse.json({ success: true, data: prediccion });
    }

    if (action === 'generarEjercicios') {
      const ejercicios = await generarEjerciciosPorTema(
        model,
        data.tema,
        data.asignatura,
        data.contexto
      );
      return NextResponse.json({ success: true, data: ejercicios });
    }

    if (action === 'generarLatex') {
      const latex = await generarLatexEjercicios(
        model,
        data.ejercicios,
        data.tema,
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

    // Mostrar más detalles del error
    const errorMessage = error instanceof Error
      ? `${error.message}\n${error.stack}`
      : 'Error desconocido';

    console.error('Error completo:', errorMessage);

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
  model: GenerativeModel,
  request: GeminiPredictionRequest
): Promise<PrediccionResponse> {
  try {
    console.log('Analizando con Gemini...');
    console.log('Request:', JSON.stringify(request, null, 2));

    const prompt = construirPromptPrediccion(request);
    console.log('Prompt construido, llamando a Gemini...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Respuesta recibida de Gemini');
    console.log('Texto:', text.substring(0, 500) + '...');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No se encontró JSON en la respuesta');
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
    }

    const prediccion: PrediccionResponse = JSON.parse(jsonMatch[0]);
    console.log('JSON parseado correctamente');
    return prediccion;
  } catch (error) {
    console.error('Error en analizarYPredecir:', error);
    throw error;
  }
}

interface EjerciciosResponse {
  ejercicios: Array<{
    titulo: string;
    enunciado: string;
    fuente: string;
    dificultad: string;
    solucion?: string;
  }>;
}

async function generarEjerciciosPorTema(
  model: GenerativeModel,
  tema: string,
  asignatura: string,
  contexto: string
): Promise<EjerciciosResponse> {
  try {
    console.log('Generando ejercicios para tema:', tema);
    const prompt = construirPromptEjercicios(tema, asignatura, contexto);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error en generarEjerciciosPorTema:', error);
    throw error;
  }
}

async function generarLatexEjercicios(
  model: GenerativeModel,
  ejercicios: Array<{
    titulo: string;
    enunciado: string;
    dificultad: string;
    fuente: string;
  }>,
  tema: string,
  asignatura: string
): Promise<string> {
  try {
    console.log('Generando LaTeX...');
    const prompt = construirPromptLatex(ejercicios, tema, asignatura);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error en generarLatexEjercicios:', error);
    throw error;
  }
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
Analiza toda la información proporcionada y genera ÚNICAMENTE una predicción de temas con probabilidades.

**IMPORTANTE:**
- NO generes ejercicios todavía
- Solo identifica temas y calcula probabilidades
- Fundamenta cada probabilidad con evidencia de las pruebas pasadas

**Formato de respuesta (SOLO JSON, sin texto adicional):**

{
  "resumen": "Resumen breve del análisis general de las pruebas pasadas y qué esperar",
  "temas": [
    {
      "nombre": "Nombre exacto del tema (ej: Autómatas Apiladores)",
      "probabilidad": 85,
      "descripcion": "Descripción breve del tema",
      "fundamentacion": "Por qué es probable que entre este tema basado en las pruebas pasadas",
      "fuentes": ["Examen 2020 - Pregunta 3", "Examen 2022 - Pregunta 1"]
    }
  ]
}

**Criterios para calcular probabilidad:**
1. Frecuencia del tema en pruebas pasadas (40%)
2. Contexto del profesor (30%)
3. Importancia del tema en el temario (20%)
4. Tendencia histórica (10%)

Genera el JSON ahora (sin markdown, solo el JSON puro):
`;
}

function construirPromptEjercicios(
  tema: string,
  asignatura: string,
  contexto: string
): string {
  return `
Eres un experto en ${asignatura} y en creación de ejercicios académicos.

**Tema específico:** ${tema}

**Contexto adicional:** ${contexto}

**Tarea:**
Genera ejercicios ÚNICAMENTE sobre el tema "${tema}" para practicar.

**Requisitos:**
- Genera entre 8-12 ejercicios
- Ordénalos por dificultad (fácil, medio, difícil)
- Incluye ejercicios variados que cubran diferentes aspectos del tema
- Cada ejercicio debe ser completo y auto-contenido
- Incluye la solución o hint para cada ejercicio

**Formato de respuesta (SOLO JSON, sin texto adicional):**

{
  "ejercicios": [
    {
      "titulo": "Título descriptivo del ejercicio",
      "enunciado": "Enunciado completo con todos los datos necesarios",
      "fuente": "Original / Basado en...",
      "dificultad": "facil",
      "solucion": "Solución completa o hint"
    }
  ]
}

Genera el JSON ahora (sin markdown, solo el JSON puro):
`;
}

function construirPromptLatex(
  ejercicios: Array<{ titulo: string; enunciado: string; dificultad: string; fuente: string }>,
  tema: string,
  asignatura: string
): string {
  return `
Eres un experto en LaTeX y composición de documentos académicos.

**Tarea:**
Genera un documento LaTeX usando la plantilla proporcionada para ejercicios de "${tema}" en ${asignatura}.

**Plantilla Base a usar:**
\\documentclass[12pt]{article}
\\usepackage[paperwidth=21cm, top=2cm, bottom=2cm]{geometry}
\\usepackage{fullpage}
\\usepackage{graphicx}
\\usepackage{amssymb}
\\usepackage{amsmath}
\\usepackage[none]{hyphenat}
\\usepackage{parskip}
\\usepackage[utf8]{inputenc}
\\usepackage{fancyhdr}
\\usepackage[most]{tcolorbox}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{listings}
\\usepackage{tikz}
\\usepackage{booktabs}
\\usepackage[spanish, shorthands=off]{babel}
\\usepackage{amsthm}
\\usepackage{enumerate}
\\usetikzlibrary{automata, positioning, arrows}
\\setlength{\\parskip}{0.8em}
\\geometry{
    top=2.5cm, bottom=2.5cm, left=2.5cm, right=2.5cm,
    headheight=15pt, headsep=10pt,
}
\\newcommand{\\sigla}{${asignatura}}
\\newcommand{\\nombre}{PrepárateUC}
\\renewcommand{\\thesection}{}
\\renewcommand{\\thesubsection}{}
\\pagestyle{fancy}
\\fancyhf{}
\\rhead{{Ejercicios ${tema}}}
\\lhead{{\\sigla}}
\\cfoot{\\thepage}
\\newtheorem{theorem}{Teorema}
\\newtheorem{lemma}[theorem]{Lema}
\\hypersetup{
colorlinks=true, linkcolor=black, filecolor=magenta, urlcolor=cyan,
pdftitle={\\sigla - Ejercicios ${tema}},
pdfauthor={\\nombre},
pdfsubject={Ejercicios Recopilados},
pdfcreator={LaTeX}, pdfproducer={pdfLaTeX}
}
\\titleformat{\\section}{\\normalfont\\LARGE\\bfseries\\color{black}\\centering}{\\thesection}{1em}{}[]
\\titleformat{\\subsection}{\\normalfont\\large\\bfseries\\color{black!70!black}}{\\thesubsection}{1em}{}[]

**Ejercicios a incluir (ordenados por dificultad):**
${ejercicios.map((ej, idx) => `
Ejercicio ${idx + 1}: ${ej.titulo} (Dificultad: ${ej.dificultad})
Fuente: ${ej.fuente}
Enunciado: ${ej.enunciado}
`).join('\n')}

**Instrucciones:**
1. Usa la plantilla exactamente como está
2. En el \\begin{document}, agrega cada ejercicio con este formato:
   \\textbf{Ejercicio X: Título}

   [Fuente: ...]

   Enunciado del ejercicio con fórmulas LaTeX apropiadas

   \\vspace{0.5cm}
   \\rule{\\textwidth}{0.4pt}
   \\vspace{0.5cm}

3. Ordena los ejercicios: primero fáciles, luego medios, luego difíciles
4. Usa notación matemática LaTeX apropiada ($...$, \\[...\\], etc.)
5. Termina con \\end{document}

Genera SOLO el código LaTeX completo (sin explicaciones, sin markdown):
`;
}
