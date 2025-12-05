"use client";
import Logo from '@/components/Logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Library,
  Heart,
  PlusCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const SidebarItem = ({ icon: Icon, label, href, active = false }: any) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group
      ${active 
        ? 'bg-zinc-800 text-white font-medium' 
        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
      }`}
  >
    <Icon size={20} className={active ? 'text-blue-400' : 'group-hover:text-zinc-200'} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Obtener inicial del nombre o correo
  const avatarText = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  const displayName = user?.displayName || user?.email || 'Usuario';

  return (
    <aside className="w-64 fixed inset-y-0 left-0 border-r border-zinc-800 bg-black z-50 flex flex-col p-4 hidden md:flex">
      <div className="mb-8 px-4">
        <Logo />
      </div>
      <div className="space-y-1 flex-1">
        <div className="px-4 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Menu
        </div>
        <SidebarItem 
          icon={Compass} 
          label="Explorar" 
          href="/landing"
          active={pathname === '/landing'}
        />
        <SidebarItem 
          icon={Library} 
          label="Mis Preparaciones" 
          href="/mis-preparaciones"
          active={pathname === '/mis-preparaciones'}
        />
        <SidebarItem 
          icon={Heart} 
          label="Likes" 
          href="#"
          active={pathname === '/likes'}
        />
        <SidebarItem
            icon={Settings}
            label="Configuración"
            href="/profile"
            active={pathname === '/profile'}
        />
      </div>
      <div className="space-y-3 pt-6 border-t border-zinc-800">
        <Link href="/crear-preparacion" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 group">
          <PlusCircle size={20} className="group-hover:scale-110 transition-transform"/>
          <span>Nueva Preparación</span>
        </Link>
        <Link href="/" className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500 text-sm">
          <ArrowLeft size={16} /> Volver al Home
        </Link>
      </div>

      {/* Info usuario y cerrar sesión */}
      {user && (
        <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-blue-400">
            {avatarText}
          </div>
          <span className="text-sm text-zinc-300 font-medium text-center max-w-[140px] truncate">{displayName}</span>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm bg-zinc-900 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors border border-zinc-800 font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </aside>
  );
}
