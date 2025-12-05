import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latex } = body;

    if (!latex) {
      return NextResponse.json(
        { error: 'Se requiere el código LaTeX' },
        { status: 400 }
      );
    }

    // Usamos URLSearchParams para asegurar una codificación estándar del formulario
    const params = new URLSearchParams();
    params.append('text', latex);
    params.append('force', 'true'); // Forzar compilación ignorando errores menores

    // Llamamos al servicio de compilación
    const response = await fetch('https://latexonline.cc/compile', {
      method: 'POST',
      // No establecemos Content-Type manualmente para dejar que fetch lo maneje con URLSearchParams
      // o usamos explícitamente application/x-www-form-urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      // Intentar leer el error si es texto (logs de latex) o HTML (error de servidor)
      const errorText = await response.text();
      const isHtml = errorText.trim().startsWith('<');
      
      console.error('Error en servicio LaTeX externo:', response.status);
      
      // Si recibimos HTML (como el 502 Bad Gateway), es un error de infraestructura del servicio
      if (isHtml) {
        throw new Error('El servicio de compilación (latexonline) está saturado o no responde. Intenta de nuevo en unos segundos.');
      }
      
      // Si es texto, suele ser el log de error de LaTeX
      throw new Error(`Error de sintaxis LaTeX: ${errorText.substring(0, 200)}...`);
    }

    // Obtenemos el PDF como un buffer binario
    const pdfArrayBuffer = await response.arrayBuffer();

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfArrayBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error en /api/compile-pdf:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error interno al generar el PDF',
        details: error instanceof Error ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}