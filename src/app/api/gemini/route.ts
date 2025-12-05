import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GeminiPredictionRequest, PrediccionResponse } from '@/types/preparacion';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, userApiKey, userModel } = body;

    // Use user's API key if provided, otherwise fall back to server key
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key de Gemini no configurada. Por favor, configura tu API key en tu perfil.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use user's selected model if provided, otherwise default to gemini-2.0-flash
    const modelName = userModel || 'gemini-2.0-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log('Gemini API - Acción:', action);

    if (action === 'analizar') {
      const prediccion = await analizarYPredecir(model, data as GeminiPredictionRequest);
      return NextResponse.json({ success: true, data: prediccion });
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
  const prompt = construirPromptPrediccion(request);

  console.log('=== PROMPT ENVIADO A GEMINI ===');
  console.log(prompt.substring(0, 500) + '...');

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('=== RESPUESTA RAW DE GEMINI ===');
  console.log(text);

  const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
  const jsonMatch = jsonString.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error('No se pudo extraer JSON. Texto recibido:', text);
    throw new Error('No se pudo extraer JSON de la respuesta');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  console.log('=== JSON PARSEADO ===');
  console.log(JSON.stringify(parsed, null, 2));
  console.log('=== CANTIDAD DE TEMAS ===', parsed.temas?.length || 0);

  // Asegurarse de que cada tema tenga el campo ejercicios
  if (parsed.temas) {
    parsed.temas = parsed.temas.map((tema: any) => ({
      ...tema,
      ejercicios: tema.ejercicios || []
    }));

    parsed.temas.forEach((tema: any, idx: number) => {
      console.log(`Tema ${idx + 1}: ${tema.nombre} - ${tema.ejercicios?.length || 0} ejercicios`);
    });
  }

  return parsed;
}

async function generarLatexEjercicios(
  model: GenerativeModel,
  ejercicios: any[],
  tema: string,
  asignatura: string
): Promise<string> {
  const prompt = construirPromptLatex(ejercicios, tema, asignatura);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  
  text = text.replace(/```latex\n?|\n?```/g, '').trim();
  text = text.replace(/^```|```$/g, '').trim();
  
  return text;
}

// --- PROMPTS ---

function construirPromptPrediccion(request: GeminiPredictionRequest): string {
  return `
=== REGLAS OBLIGATORIAS - LECTURA REQUERIDA ===

PROHIBIDO ABSOLUTAMENTE:
❌ Inventar temas que no están EXPLÍCITAMENTE mencionados en el material
❌ Generar ejercicios que no existen en el material
❌ Agregar contenido de tu conocimiento general
❌ Hacer suposiciones sobre lo que "debería" estar en el examen
❌ Incluir temas solo porque son comunes en la asignatura

PERMITIDO ÚNICAMENTE:
✅ Identificar temas que APARECEN TEXTUALMENTE en el material
✅ Copiar ejercicios que EXISTEN en el material
✅ Analizar patrones basados SOLO en el material proporcionado
✅ Dejar arrays vacíos si no hay ejercicios para un tema

=== CONTEXTO ===
ASIGNATURA: ${request.asignatura}
CONTEXTO DEL PROFESOR: ${request.contextoProfesor}

=== MATERIAL COMPLETO A ANALIZAR ===
${request.temarios.join('\n\n═══ SIGUIENTE DOCUMENTO ═══\n\n').substring(0, 25000)}

=== FIN DEL MATERIAL ===

=== TU TAREA (PASO A PASO) ===

PASO 1: LEE TODO EL MATERIAL
- Lee el material completo de principio a fin
- Identifica SOLO los temas que están EXPLÍCITAMENTE mencionados
- Busca títulos, secciones, capítulos, conceptos principales
- NO agregues temas de tu conocimiento general

PASO 2: EXTRAE LOS TEMAS (3-5 MÁXIMO)
Para cada tema, pregúntate:
- ¿Este tema aparece TEXTUALMENTE en el material? (SI/NO)
- Si NO, descártalo inmediatamente
- ¿Cuántas veces aparece mencionado?
- ¿En qué documentos aparece?
- ¿Qué proporción del material cubre?

PASO 3: CALCULA PROBABILIDADES BASADAS EN:
- Frecuencia de aparición en el material (principal factor)
- Énfasis en exámenes anteriores (si están en el material)
- Contexto del profesor (si menciona preferencias específicas)
- NO uses tu conocimiento general de la asignatura

PASO 4: EXTRAE EJERCICIOS EXISTENTES
Busca en el material:
- Líneas que empiecen con "Ejercicio", "Problem", "Pregunta"
- Enunciados con verbos como: "Calcule", "Demuestre", "Resuelva", "Determine"
- Problemas numerados (1., 2., a), b), etc.)
- Preguntas de exámenes anteriores

CRÍTICO: Si un ejercicio existe en el material, COPIA el texto EXACTO.
NO reformules, NO mejores, NO inventes similares.

PASO 5: VERIFICA TU RESPUESTA
Antes de responder, verifica:
- ¿Cada tema que incluí aparece LITERALMENTE en el material? ✓/✗
- ¿Cada ejercicio que incluí está COPIADO del material? ✓/✗
- ¿He inventado algo? Si es SÍ, elimínalo inmediatamente

=== EJEMPLO DE ANÁLISIS CORRECTO ===

Material recibido:
"Capítulo 3: Matrices. Una matriz es un arreglo rectangular...
Ejercicio 1: Calcular el determinante de [[1,2],[3,4]]
Capítulo 4: Vectores en R3..."

Análisis CORRECTO:
{
  "resumen": "El material cubre matrices y vectores en R3 según los capítulos proporcionados",
  "temas": [
    {
      "nombre": "Matrices",
      "probabilidad": 60,
      "descripcion": "Arreglos rectangulares y operaciones con matrices",
      "fundamentacion": "Aparece como Capítulo 3 en el material, incluye 1 ejercicio",
      "fuentes": ["Material proporcionado - Capítulo 3"],
      "ejercicios": [{
        "titulo": "Ejercicio 1",
        "enunciado": "Calcular el determinante de [[1,2],[3,4]]",
        "fuente": "Material proporcionado",
        "dificultad": "medio",
        "solucion": null
      }]
    },
    {
      "nombre": "Vectores en R3",
      "probabilidad": 40,
      "descripcion": "Vectores en espacio tridimensional",
      "fundamentacion": "Mencionado en Capítulo 4 del material",
      "fuentes": ["Material proporcionado - Capítulo 4"],
      "ejercicios": []
    }
  ]
}

Análisis INCORRECTO (NO HAGAS ESTO):
{
  "temas": [
    {"nombre": "Espacios Vectoriales"}, // ❌ No está en el material
    {"nombre": "Transformaciones Lineales"}, // ❌ No está en el material
    // ❌ Inventando ejercicios que no existen
  ]
}

=== FORMATO DE RESPUESTA ===

EJEMPLO DE SALIDA ESPERADA:

{
  "resumen": "El material cubre principalmente álgebra lineal y cálculo diferencial...",
  "temas": [
    {
      "nombre": "Matrices y Determinantes",
      "probabilidad": 85,
      "descripcion": "Operaciones con matrices, cálculo de determinantes",
      "fundamentacion": "Aparece en 3 de 4 exámenes anteriores",
      "fuentes": ["Prueba 2022", "Prueba 2023"],
      "ejercicios": [
        {
          "titulo": "Ejercicio 1",
          "enunciado": "Calcular el determinante de la matriz A = [[1,2],[3,4]]",
          "fuente": "Prueba 2022",
          "dificultad": "medio",
          "solucion": null
        }
      ]
    },
    {
      "nombre": "Derivadas Parciales",
      "probabilidad": 70,
      "descripcion": "Cálculo de derivadas parciales de funciones multivariables",
      "fundamentacion": "Tema recurrente según el contexto del profesor",
      "fuentes": ["Temario", "Prueba 2023"],
      "ejercicios": []
    }
  ]
}

FORMATO DE RESPUESTA REQUERIDO:
{
  "resumen": "Resumen basado SOLO en el material proporcionado",
  "temas": [
    {
      "nombre": "Nombre del tema COMO APARECE en el material",
      "probabilidad": número entre 0-100,
      "descripcion": "Descripción basada SOLO en el material",
      "fundamentacion": "Cita EXACTA de dónde aparece en el material",
      "fuentes": ["Lista de documentos donde aparece"],
      "ejercicios": [/* Array de ejercicios COPIADOS del material, o [] si no hay */]
    }
  ]
}

=== CHECKLIST FINAL (VERIFICA ANTES DE RESPONDER) ===

Para CADA tema en tu respuesta, verifica:
□ ¿El nombre del tema aparece TEXTUALMENTE en el material? (Busca en el texto arriba)
□ ¿La descripción está basada en información del material, NO en tu conocimiento?
□ ¿La fundamentación cita evidencia ESPECÍFICA del material?
□ ¿Los ejercicios están COPIADOS palabra por palabra del material?

Si respondiste NO a cualquiera, ELIMINA ese tema o corrige la información.

ADVERTENCIA FINAL:
- Responde ÚNICAMENTE con JSON válido
- NO agregues texto antes o después del JSON
- NO incluyas explicaciones adicionales
- Si inventas algo que no está en el material, consideraré tu respuesta como INCORRECTA
- Es mejor tener pocos temas correctos que muchos temas inventados

Ahora, analiza el material y responde con JSON:
`;
}

function construirPromptLatex(ejercicios: any[], tema: string, asignatura: string): string {
  return `
**INSTRUCCIONES CRÍTICAS:**
1. Genera ÚNICAMENTE código LaTeX válido
2. NO inventes ejercicios - usa SOLO los ejercicios proporcionados
3. NO agregues contenido adicional - mantente estrictamente en el material dado
4. NO generes ejemplos ficticios
5. Si no hay ejercicios, genera un documento que indique que no se encontraron ejercicios

Asignatura: ${asignatura}
Tema: ${tema}

Ejercicios a incluir:
${JSON.stringify(ejercicios, null, 2)}

**PLANTILLA LaTeX OBLIGATORIA:**
Debes usar EXACTAMENTE esta estructura de documento LaTeX:

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

\\begin{document}

\\section{Ejercicios de ${tema}}

**IMPORTANTE:**
- Organiza los ejercicios por dificultad (subsections: "Dificultad: Fácil", "Dificultad: Media", "Dificultad: Difícil")
- Para cada ejercicio, usa este formato:

\\textbf{Ejercicio X: [Título del ejercicio]}

[Fuente: [fuente del ejercicio]]

[Enunciado del ejercicio]

\\vspace{0.5cm}
\\rule{\\textwidth}{0.4pt}
\\vspace{0.5cm}

\\end{document}

REGLAS ESTRICTAS:
1. Retorna SOLO el código LaTeX completo y válido
2. USA EXACTAMENTE la plantilla proporcionada
3. NO inventes ejercicios - usa únicamente los proporcionados
4. Escapa correctamente los caracteres especiales LaTeX
5. Mantén el formato de separación entre ejercicios con las líneas horizontales
6. Si no hay ejercicios, indica claramente en el documento que no se encontraron
`;
}