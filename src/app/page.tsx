import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <main className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-8 max-w-4xl">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            PrepárateUC
          </h1>
          <p className="text-2xl text-zinc-100">
            Inteligencia Artificial para predecir qué entrará en tu próximo examen
          </p>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Sube tus temarios, pruebas pasadas y contexto del profesor. Nuestra IA analizará todo
            y generará predicciones de probabilidad por tema, junto con ejercicios ordenados por dificultad.
          </p>

          <div className="flex flex-col items-center gap-4 mt-12">
            {/* Botones Principales */}
            <div className="flex gap-6 justify-center">
              <Link
                href="/crear-preparacion"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30"
              >
                Crear Preparación
              </Link>
              <Link
                href="/landing"
                className="px-8 py-4 bg-zinc-900 text-blue-400 border-2 border-zinc-800 rounded-lg text-lg font-semibold hover:bg-zinc-800 transition-colors"
              >
                Ver Preparaciones
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg hover:border-zinc-700 transition-colors">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl text-zinc-100 font-semibold mb-2">Sube tus Materiales</h3>
              <p className="text-zinc-400">
                Temarios, pruebas pasadas, apuntes y todo lo que el profesor haya mencionado.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg hover:border-zinc-700 transition-colors">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">IA Analiza</h3>
              <p className="text-zinc-400">
                Gemini AI procesa todo y genera predicciones de probabilidad por categoría y tema.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg hover:border-zinc-700 transition-colors">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Ejercicios Compilados</h3>
              <p className="text-zinc-400">
                Recibe un documento LaTeX con ejercicios ordenados por dificultad para practicar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}