'use client';

import { TemaPrediccion } from '@/types/preparacion';
import Link from 'next/link';

interface TablaPrediccionProps {
  temas: TemaPrediccion[];
  preparacionId: string;
}

export default function TablaPrediccion({ temas, preparacionId }: TablaPrediccionProps) {
  const temasOrdenados = [...temas].sort((a, b) => b.probabilidad - a.probabilidad);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Predicción de Temas</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tema
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Probabilidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fundamentación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fuentes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {temasOrdenados.map((tema, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{tema.nombre}</div>
                  <div className="text-sm text-gray-500">{tema.descripcion}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div
                        className={`h-2.5 rounded-full ${
                          tema.probabilidad >= 70
                            ? 'bg-green-600'
                            : tema.probabilidad >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${tema.probabilidad}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {tema.probabilidad}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700">{tema.fundamentacion}</p>
                </td>
                <td className="px-6 py-4">
                  <ul className="text-xs text-gray-600 space-y-1">
                    {tema.fuentes.map((fuente, idx) => (
                      <li key={idx}>• {fuente}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/generar-material/${preparacionId}?tema=${encodeURIComponent(tema.nombre)}`}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Generar Ejercicios
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <Link
          href="/"
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Volver al Inicio
        </Link>
        <Link
          href="/mis-preparaciones"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Ver Mis Preparaciones
        </Link>
      </div>
    </div>
  );
}
