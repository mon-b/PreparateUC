import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GeminiPredictionRequest, PrediccionResponse } from '@/types/preparacion';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key de Gemini no configurada' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Usamos el modelo 'gemini-2.5-flash' para máxima velocidad
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const body = await request.json();
    const { action, data } = body;

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
Eres un experto académico analizando material de estudio para predecir contenido de examen.

ASIGNATURA: ${request.asignatura}
CONTEXTO DEL PROFESOR: ${request.contextoProfesor}

MATERIAL A ANALIZAR:
${request.temarios.join('\n\n---DOCUMENTO---\n\n').substring(0, 20000)}

---

TU TAREA:

1. Identifica 3-5 temas principales del material
2. Asigna probabilidad (0-100) a cada tema
3. **CRÍTICO - EXTRACCIÓN DE EJERCICIOS**:

   Busca en el material TODO lo que parezca ser:
   - Ejercicios numerados (Ejercicio 1, Ejercicio 2, etc.)
   - Problemas propuestos
   - Preguntas de exámenes anteriores
   - Cualquier enunciado que pida resolver/calcular/demostrar/probar algo
   - Ejemplos con soluciones

   Para CADA tema identificado:
   - Copia TODOS los ejercicios relacionados EXACTAMENTE como aparecen
   - Incluye el número/título del ejercicio
   - Incluye el enunciado completo
   - Si hay solución, inclúyela
   - Si NO encuentras ejercicios para ese tema, deja "ejercicios": []

   NO inventes ejercicios nuevos, SOLO extrae los que YA EXISTEN en el material

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

FORMATO DE RESPUESTA:
- Responde SOLO con el JSON, sin texto adicional
- SIEMPRE incluye el campo "ejercicios" en cada tema (puede estar vacío [])
- Los valores de "dificultad" deben ser: "facil", "medio" o "dificil"
- El campo "solucion" puede ser null si no hay solución en el material

IMPORTANTE:
- Copia ejercicios TAL COMO APARECEN en el material
- NO inventes ejercicios nuevos
- Si un tema NO tiene ejercicios en el material, usa "ejercicios": []
- Busca TODOS los ejercicios posibles en el material
- Revisa CUIDADOSAMENTE el material para no omitir ejercicios
- Incluye ejercicios incluso si parecen incompletos
`;
}

function construirPromptLatex(ejercicios: any[], tema: string, asignatura: string): string {
  return `
Genera un documento LaTeX profesional para una guía de ejercicios.
Al ser para Overleaf, PUEDES usar paquetes estándar útiles (geometry, fancyhdr, amsmath, etc).

Asignatura: ${asignatura}
Tema: ${tema}

Ejercicios a incluir:
${JSON.stringify(ejercicios)}

Estructura sugerida:
\\documentclass[11pt, letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[spanish]{babel}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{geometry}
\\geometry{letterpaper, margin=1in}
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\usepackage{enumitem}

\\pagestyle{fancy}
\\lhead{${asignatura}}
\\rhead{PrepárateUC}

\\title{\\textbf{Guía de Ejercicios: ${tema}}}
\\author{Generado por IA - PrepárateUC}
\\date{\\today}

\\begin{document}
\\maketitle

\\section*{Instrucciones}
Resuelva los siguientes problemas. Se incluyen soluciones para su revisión.

\\section*{Problemas Propuestos}

% Iterar ejercicios aquí. 
% Usa un formato limpio, por ejemplo:
% \\subsection*{Ejercicio 1: [Título]}
% \\textbf{Dificultad:} [Nivel] \\\\
% [Enunciado]
% 
% \\vfill (o espacio vertical)

\\newpage
\\section*{Soluciones}
% Iterar soluciones aquí

\\end{document}

REGLAS:
1. Retorna SOLO el código LaTeX raw.
2. Asegúrate de escapar correctamente caracteres especiales como %.
`;
}