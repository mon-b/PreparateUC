'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-xl bg-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              PrepárateUC
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  href="/crear-preparacion"
                  className="text-zinc-400 hover:text-blue-400 transition-colors"
                >
                  Crear Preparación
                </Link>
                <Link
                  href="/mis-preparaciones"
                  className="text-zinc-400 hover:text-blue-400 transition-colors"
                >
                  Mis Preparaciones
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-zinc-400">
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm bg-zinc-900 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-zinc-400 hover:text-blue-400 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
