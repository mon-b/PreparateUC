"use client";
import Logo from '@/components/Logo';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Compass,
  Heart,
  PlusCircle,
  Library,
  User,
  LogIn,
  MoreHorizontal,
  BookOpen,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { FirestoreService } from '@/services/firestore.service';
import { Preparacion } from '@/types/preparacion';

// Helper function to get random color gradient
const getRandomColor = () => {
  const colors = [
    "from-blue-600 to-indigo-900",
    "from-emerald-600 to-teal-900",
    "from-orange-600 to-red-900",
    "from-purple-600 to-pink-900",
    "from-cyan-600 to-blue-900",
    "from-rose-600 to-red-900",
    "from-violet-600 to-purple-900",
    "from-amber-600 to-orange-900",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Helper function to format date
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return `Hace ${Math.floor(diffDays / 7)} sem`;
};

// Componente para items del Sidebar
const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group
      ${active 
        ? 'bg-zinc-800 text-white font-medium' 
        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
      }`}
  >
    <Icon size={20} className={active ? 'text-blue-400' : 'group-hover:text-zinc-200'} />
    <span className="text-sm">{label}</span>
  </button>
);

// Componente para las tarjetas
interface PrepCardData {
  id: string;
  title: string;
  author: string;
  course: string;
  likes: number;
  color: string;
  tags: string[];
  date: string;
}

const PrepCard = ({ data }: { data: PrepCardData }) => (
  <Link href={`/preparaciones/${data.id}`}>
    <div className="group relative break-inside-avoid mb-6 cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-transform duration-300 group-hover:-translate-y-1">
        {/* Header con gradiente */}
        <div className={`h-48 w-full bg-gradient-to-br ${data.color} p-4 flex flex-col justify-between`}>
          <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs text-white border border-white/10">
               {data.course}
             </span>
             <button
               onClick={(e) => {
                 e.preventDefault();
                 // Add options menu here
               }}
               className="bg-black/40 backdrop-blur-md p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
             >
               <MoreHorizontal size={16} />
             </button>
          </div>
        </div>
        {/* Contenido */}
        <div className="p-4">
          <h3 className="text-zinc-100 font-semibold text-lg leading-tight mb-1 group-hover:text-blue-400 transition-colors">
            {data.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
            <User size={12} />
            <span>{data.author}</span>
            <span>•</span>
            <span>{data.date}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] border border-zinc-700">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-zinc-800 pt-3 mt-2">
            <div className="flex items-center gap-1.5 text-zinc-400 hover:text-pink-500 transition-colors">
              <Heart size={16} />
              <span className="text-xs font-medium">{data.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400 hover:text-blue-400 transition-colors">
              <BookOpen size={16} />
              <span className="text-xs">Ver plan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default function SoraLanding() {
  const [activeTab, setActiveTab] = useState('explorar');
  const [preparations, setPreparations] = useState<PrepCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreparations();
  }, []);

  const loadPreparations = async () => {
    try {
      setLoading(true);
      const preps = await FirestoreService.obtenerTodasPreparaciones();

      // Map Firestore data to card format
      const mappedPreps: PrepCardData[] = preps.map((prep) => ({
        id: prep.id || '',
        title: prep.titulo,
        author: prep.userId.substring(0, 8) + '...', // Show partial user ID or could fetch user name
        course: prep.asignatura,
        likes: Math.floor(Math.random() * 500), // Random likes for now
        color: getRandomColor(),
        tags: (prep.prediccion?.temas || []).slice(0, 2).map(t => t.nombre),
        date: getRelativeTime(prep.createdAt),
      }));

      setPreparations(mappedPreps);
    } catch (error) {
      console.error('Error loading preparations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Forzamos bg-black para asegurar tema oscuro
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-blue-500/30">
      {/* MAIN CONTENT */}
      <main className="min-h-screen relative bg-black">
        
        {/* Header Superior */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar ramos, pruebas o apuntes..." 
              className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-zinc-600 text-sm"
            />
          </div>
        </header>

        {/* Grid de contenido */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Explorar</h2>
              <p className="text-zinc-500">Descubre planificaciones generadas por la comunidad UC.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Tarjeta Promocional Grande */}
              <Link href="/crear-preparacion" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 flex flex-col justify-center items-center text-center col-span-1 sm:col-span-2 lg:col-span-2 min-h-[250px] border border-blue-500/30 shadow-2xl shadow-blue-900/20 group hover:shadow-blue-900/40 transition-shadow cursor-pointer">
                  {/* Ruido de fondo simulado con CSS si la imagen falla */}
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-black"></div>
                  <div className="relative z-10 max-w-md">
                    <h3 className="text-2xl font-bold text-white mb-2">¿Tienes material de estudio?</h3>
                    <p className="text-blue-100 mb-6 text-sm">Sube tus apuntes y ayuda a Gemini a crear mejores planificaciones.</p>
                    <div className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 mx-auto text-sm w-fit">
                      <PlusCircle size={18} />
                      Crear Preparación
                    </div>
                  </div>
              </Link>

              {/* Mapeo de tarjetas reales */}
              {preparations.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-2xl font-semibold text-zinc-100 mb-2">
                    No hay preparaciones aún
                  </h3>
                  <p className="text-zinc-400">
                    Sé el primero en crear una preparación
                  </p>
                </div>
              ) : (
                preparations.map((prep) => (
                  <PrepCard key={prep.id} data={prep} />
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}