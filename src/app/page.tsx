import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-8 max-w-4xl">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PrepárateUC
          </h1>
          <p className="text-2xl text-gray-700">
            Inteligencia Artificial para predecir qué entrará en tu próximo examen
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sube tus temarios, pruebas pasadas y contexto del profesor. Nuestra IA analizará todo
            y generará predicciones de probabilidad por tema, junto con ejercicios ordenados por dificultad.
          </p>

          <div className="flex gap-6 justify-center mt-12">
            <Link
              href="/crear-preparacion"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Crear Preparación
            </Link>
            <Link
              href="/mis-preparaciones"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Mis Preparaciones
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl text-gray-700 font-semibold mb-2">Sube tus Materiales</h3>
              <p className="text-gray-600">
                Temarios, pruebas pasadas, apuntes y todo lo que el profesor haya mencionado.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">IA Analiza</h3>
              <p className="text-gray-600">
                Gemini AI procesa todo y genera predicciones de probabilidad por categoría y tema.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Ejercicios Compilados</h3>
              <p className="text-gray-600">
                Recibe un documento LaTeX con ejercicios ordenados por dificultad para practicar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
