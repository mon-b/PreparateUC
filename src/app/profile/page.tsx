"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Settings,
  Key,
  LogOut,
  Trash2,
  Save,
  Edit2,
  ShieldAlert,
  ArrowLeft,
  Compass,
  Library,
  Heart,
  PlusCircle,
  Loader2,
} from "lucide-react";

// --- COMPONENTES UI (Reutilizados para consistencia) ---

const SidebarItem = ({ icon: Icon, label, href, active = false }: any) => (
  <Link
    href={href || "#"}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group
      ${
        active
          ? "bg-zinc-800 text-white font-medium"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
      }`}
  >
    <Icon
      size={20}
      className={active ? "text-blue-400" : "group-hover:text-zinc-200"}
    />
    <span className="text-sm">{label}</span>
  </Link>
);

const SectionHeader = ({ icon: Icon, title, description }: any) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-800">
      <Icon size={24} className="text-blue-400" />
    </div>
    <div>
      <h3 className="text-lg font-medium text-zinc-100">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Estados locales para la UI
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar estado local con usuario cuando cargue
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Aquí iría la lógica real de actualización en Firebase
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (confirm("¿Estás seguro? Esta acción no se puede deshacer.")) {
      // Lógica de borrado
      alert("Función de borrado pendiente de implementar");
    }
  };

  // --- ESTADO DE CARGA / NO AUTH ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-zinc-300">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-500" size={32} />
          <p>Cargando perfil o no autenticado...</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-zinc-500 hover:text-white underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 md:ml-64 min-h-screen bg-black p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
          {/* Header de Página */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/landing"
              className="md:hidden p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-lg"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Configuración de Perfil
              </h1>
              <p className="text-zinc-500">
                Gestiona tus datos personales y preferencias de IA.
              </p>
            </div>
          </div>

          {/* TARJETA 1: Información Personal */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <SectionHeader
              icon={User}
              title="Información Personal"
              description="Tus datos de identificación en la plataforma."
            />

            <div className="space-y-6 max-w-xl ml-0 md:ml-16">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase">
                  Nombre Visible
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    className={`flex-1 bg-black/50 border ${
                      isEditing
                        ? "border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                        : "border-zinc-800"
                    } rounded-lg px-4 py-2.5 text-zinc-200 transition-all outline-none`}
                  />
                  {isEditing ? (
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border border-zinc-700"
                    >
                      <Edit2 size={16} />
                      Editar
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-zinc-950/30 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-500 cursor-not-allowed select-none"
                />
                <p className="text-xs text-zinc-600">
                  El correo electrónico no se puede cambiar.
                </p>
              </div>
            </div>
          </section>

          {/* TARJETA 2: Token de IA */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <SectionHeader
              icon={Key}
              title="Token de Gemini AI"
              description="Ingresa tu API Key personal para generar planificaciones sin límites."
            />

            <div className="max-w-xl ml-0 md:ml-16">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Pegar API Key aquí (sk-...)"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full bg-black/50 border border-zinc-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-lg pl-4 pr-12 py-3 text-zinc-200 transition-all outline-none font-mono text-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                  <Key size={16} />
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500 flex items-center gap-2">
                <ShieldAlert size={12} className="text-yellow-600" />
                Tu token se guarda de forma local y nunca se comparte.
              </p>
            </div>
          </section>

          {/* TARJETA 3: Zona de Peligro */}
          <section className="bg-red-950/10 border border-red-900/20 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-900/20 rounded-lg border border-red-900/30">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-500">
                  Zona de Peligro
                </h3>
                <p className="text-sm text-red-400/60">
                  Acciones irreversibles para tu cuenta.
                </p>
              </div>
            </div>

            <div className="ml-0 md:ml-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-950/20 rounded-xl border border-red-900/20">
              <div>
                <h4 className="text-zinc-200 font-medium text-sm">
                  Eliminar Cuenta
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Se borrarán todas tus planificaciones y datos.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/20 hover:border-transparent rounded-lg text-sm font-medium transition-all"
              >
                Eliminar definitivamente
              </button>
            </div>
          </section>
        </div>
      </main>
  );
}
