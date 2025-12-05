"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserSettingsService } from "@/services/userSettings.service";
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
  Cpu,
} from "lucide-react";

const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Rápido)' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Avanzado)' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Ultra rápido)' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Rápido)' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (Ultra rápido)' },
];

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
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Sincronizar estado local con usuario cuando cargue
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const settings = await UserSettingsService.getUserSettings(user.uid);
      if (settings) {
        setApiToken(settings.geminiApiKey || "");
        setGeminiModel(settings.geminiModel || "gemini-2.0-flash");
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

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

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await UserSettingsService.saveUserSettings({
        userId: user.uid,
        geminiApiKey: apiToken,
        geminiModel: geminiModel,
      });

      setSaveMessage("Configuración guardada exitosamente");
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage("Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
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

          {/* TARJETA 2: Configuración de Gemini AI */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
            <SectionHeader
              icon={Key}
              title="Configuración de Gemini AI"
              description="Configura tu API Key y modelo preferido para generar predicciones."
            />

            <div className="max-w-xl ml-0 md:ml-16 space-y-6">
              {/* API Key */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase mb-2 block">
                  API Key de Gemini
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Ingresa tu API Key de Gemini"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-800 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 rounded-lg pl-4 pr-12 py-3 text-zinc-200 transition-all outline-none font-mono text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Key size={16} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-zinc-500 flex items-center gap-2">
                  <ShieldAlert size={12} className="text-yellow-600" />
                  Obtén tu API key desde{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase mb-2 block">
                  Modelo de Gemini
                </label>
                <div className="relative">
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-lg pl-4 pr-12 py-3 text-zinc-200 transition-all outline-none appearance-none"
                  >
                    {GEMINI_MODELS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Cpu size={16} />
                  </div>
                </div>
                <div className="mt-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <p className="text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300">Recomendación:</span>
                    <br />
                    • <strong>Flash Lite:</strong> Más rápido, menos preciso
                    <br />
                    • <strong>Flash:</strong> Balance entre velocidad y calidad
                    <br />
                    • <strong>Pro:</strong> Mejor calidad, más lento y costoso
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar Configuración de IA
                  </>
                )}
              </button>

              {/* Success/Error Message */}
              {saveMessage && (
                <div className={`p-3 rounded-lg ${saveMessage.includes("Error") ? "bg-red-900/20 border border-red-500/50 text-red-400" : "bg-green-900/20 border border-green-500/50 text-green-400"}`}>
                  <p className="text-sm">{saveMessage}</p>
                </div>
              )}
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
