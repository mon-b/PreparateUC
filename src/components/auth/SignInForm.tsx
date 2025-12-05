'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignInForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);
      router.push('/mis-preparaciones');
    } catch (err: unknown) {
      console.error('Error signing in:', err);
      if (err instanceof Error) {
        if (err.message.includes('user-not-found')) {
          setError('Usuario no encontrado');
        } else if (err.message.includes('wrong-password')) {
          setError('Contraseña incorrecta');
        } else if (err.message.includes('invalid-email')) {
          setError('Correo electrónico inválido');
        } else if (err.message.includes('invalid-credential')) {
          setError('Credenciales inválidas');
        } else {
          setError(err.message || 'Error al iniciar sesión');
        }
      } else {
        setError('Error desconocido al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-lg space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-zinc-100">Iniciar Sesión</h2>
          <p className="text-zinc-400 mt-2">Accede a tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-500"
            placeholder="tu@correo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-500"
            placeholder="Tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>

        <p className="text-center text-sm text-zinc-400">
          ¿No tienes cuenta?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
