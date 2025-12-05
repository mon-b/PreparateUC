"use client";

import React, { useState } from 'react';
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

// --- DATOS MOCK (Ejemplos visuales) ---
const MOCK_PREPARATIONS = [
  {
    id: 1,
    title: "Cálculo I: Examen Final",
    author: "Sofía M.",
    course: "MAT1610",
    likes: 342,
    color: "from-blue-600 to-indigo-900",
    tags: ["Integrales", "Derivadas"],
    date: "Hace 2 días"
  },
  {
    id: 2,
    title: "Progra Avanzada: Tarea 2",
    author: "Juan P.",
    course: "IIC2233",
    likes: 128,
    color: "from-emerald-600 to-teal-900",
    tags: ["OOP", "Python"],
    date: "Hace 5 horas"
  },
  {
    id: 3,
    title: "Química General: Lab 3",
    author: "Andrea R.",
    course: "QIM100",
    likes: 89,
    color: "from-orange-600 to-red-900",
    tags: ["Estequiometría"],
    date: "Hace 1 sem"
  },
  {
    id: 4,
    title: "Ética: Resumen Solemne",
    author: "Carlos D.",
    course: "FIL188",
    likes: 450,
    color: "from-purple-600 to-pink-900",
    tags: ["Aristóteles", "Kant"],
    date: "Ayer"
  },
  {
    id: 5,
    title: "Física I: Guía Resuelta",
    author: "Matias F.",
    course: "FIS1513",
    likes: 210,
    color: "from-cyan-600 to-blue-900",
    tags: ["Cinemática"],
    date: "Hace 3 días"
  },
];

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
const PrepCard = ({ data }: { data: typeof MOCK_PREPARATIONS[0] }) => (
  <div className="group relative break-inside-avoid mb-6 cursor-pointer">
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 transition-transform duration-300 group-hover:-translate-y-1">
      {/* Header con gradiente */}
      <div className={`h-48 w-full bg-gradient-to-br ${data.color} p-4 flex flex-col justify-between`}>
        <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <span className="bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs text-white border border-white/10">
             {data.course}
           </span>
           <button className="bg-black/40 backdrop-blur-md p-1.5 rounded-full hover:bg-white/20 transition-colors text-white">
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
);

export default function SoraLanding() {
  const [activeTab, setActiveTab] = useState('explorar');

  return (
    // Forzamos bg-black para asegurar tema oscuro
    <div className="flex min-h-screen bg-black text-zinc-300 font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 fixed inset-y-0 left-0 border-r border-zinc-800 bg-black z-50 flex flex-col p-4 hidden md:flex">
        <div className="mb-8 px-4 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
            P
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Preparate<span className="text-blue-500">UC</span>
          </h1>
        </div>

        <div className="space-y-1 flex-1">
          <div className="px-4 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Menu
          </div>
          <SidebarItem 
            icon={Compass} 
            label="Explorar" 
            active={activeTab === 'explorar'} 
            onClick={() => setActiveTab('explorar')}
          />
          <SidebarItem 
            icon={Library} 
            label="Mis Preparaciones" 
            active={activeTab === 'mis_preparaciones'}
            onClick={() => setActiveTab('mis_preparaciones')}
          />
          <SidebarItem 
            icon={Heart} 
            label="Likes" 
            active={activeTab === 'likes'}
            onClick={() => setActiveTab('likes')}
          />
        </div>

        <div className="space-y-3 pt-6 border-t border-zinc-800">
           <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 group">
            <PlusCircle size={20} className="group-hover:scale-110 transition-transform"/>
            <span>Nueva Preparación</span>
          </button>
          
          <Link href="/" className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-500 text-sm">
             <ArrowLeft size={16} /> Volver al Home
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 min-h-screen relative bg-black">
        
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Tarjeta Promocional Grande */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 flex flex-col justify-center items-center text-center col-span-1 sm:col-span-2 lg:col-span-2 min-h-[250px] border border-blue-500/30 shadow-2xl shadow-blue-900/20 group">
                {/* Ruido de fondo simulado con CSS si la imagen falla */}
                <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-black"></div> 
                <div className="relative z-10 max-w-md">
                  <h3 className="text-2xl font-bold text-white mb-2">¿Tienes material de estudio?</h3>
                  <p className="text-blue-100 mb-6 text-sm">Sube tus apuntes y ayuda a Gemini a crear mejores planificaciones.</p>
                  <button className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 mx-auto text-sm">
                    <PlusCircle size={18} />
                    Crear Preparación
                  </button>
                </div>
            </div>

            {/* Mapeo de tarjetas */}
            {MOCK_PREPARATIONS.map((prep) => (
              <PrepCard key={prep.id} data={prep} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}