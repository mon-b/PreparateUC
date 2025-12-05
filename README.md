# PrepárateUC 🎓

> Plataforma de preparación de exámenes con IA desarrollada durante el Hackathon del Grupo Open Source UC

PrepárateUC es una aplicación web que utiliza Inteligencia Artificial (Google Gemini) para ayudar a estudiantes a prepararse para sus exámenes. Sube tus temarios, exámenes pasados y material de estudio, y la IA analizará todo para generar predicciones de contenido por tema y compilar ejercicios personalizados en formato LaTeX.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribuir](#-contribuir)
- [Arquitectura](#-arquitectura)
- [Créditos](#-créditos)

## ✨ Características

### Funcionalidades Principales

- **📤 Carga de Material**: Sube archivos de temarios, exámenes pasados y apuntes
- **🤖 Análisis con IA**: Google Gemini analiza el material y extrae temas principales
- **📊 Predicción de Contenido**: Probabilidades por tema basadas en el material proporcionado
- **📝 Extracción de Ejercicios**: La IA identifica y extrae ejercicios del material
- **📄 Generación de LaTeX**: Documentos profesionales en LaTeX con ejercicios organizados por dificultad
- **🔗 Integración con Overleaf**: Abre los documentos generados directamente en Overleaf
- **💾 Almacenamiento en la Nube**: Firebase Storage para archivos y Firestore para datos
- **🔐 Autenticación**: Sistema de usuarios con Firebase Auth
- **💬 Foro en Tiempo Real**: Discute con otros sobre preparaciones (real-time con Firestore)
- **📁 Documentos Extra**: Sube material adicional para cada preparación
- **❤️ Sistema de Likes**: Dale like a las preparaciones de la comunidad
- **⚙️ Configuración Personal**: Cada usuario puede configurar su propia API key de Gemini y modelo preferido

### Características Técnicas

- **Modo Oscuro**: Interfaz moderna con diseño dark mode
- **Responsive**: Funciona en desktop, tablet y móvil
- **Real-time Updates**: Actualizaciones en vivo usando Firestore listeners
- **Optimistic UI**: Actualizaciones optimistas para mejor UX
- **Type-Safe**: TypeScript en todo el proyecto

## 🛠 Tecnologías

### Frontend
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Lucide React** - Iconos

### Backend & Servicios
- **Firebase**
  - Authentication (autenticación de usuarios)
  - Firestore (base de datos NoSQL en tiempo real)
  - Storage (almacenamiento de archivos)
- **Google Gemini API** - Modelos de IA para análisis y generación

### Herramientas
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS

## 🚀 Instalación

### Requisitos Previos

- Node.js 18+
- npm, yarn, pnpm o bun
- Cuenta de Firebase
- API Key de Google Gemini

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/preparateuc.git
cd preparateuc
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Gemini API (opcional - los usuarios pueden usar su propia key)
GEMINI_API_KEY=tu_gemini_api_key
```

4. **Configurar Firebase**

- Ve a [Firebase Console](https://console.firebase.google.com/)
- Crea un nuevo proyecto
- Habilita Authentication (Email/Password)
- Crea una base de datos Firestore
- Crea un bucket de Storage
- Copia las credenciales al archivo `.env.local`

5. **Obtener API Key de Gemini**

- Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
- Genera una API key
- Agrégala al `.env.local` (opcional, los usuarios pueden usar sus propias keys)

6. **Ejecutar el proyecto**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## ⚙️ Configuración

### Configuración de Usuario

Cada usuario puede configurar:

1. **API Key de Gemini**: En `/profile`, los usuarios pueden agregar su propia API key
2. **Modelo de IA**: Seleccionar entre:
   - `gemini-2.5-flash` - Rápido
   - `gemini-2.5-pro` - Avanzado (mejor calidad)
   - `gemini-2.5-flash-lite` - Ultra rápido
   - `gemini-2.0-flash` - Rápido (default)
   - `gemini-2.0-flash-lite` - Ultra rápido

### Reglas de Firestore

Asegúrate de configurar las reglas de seguridad en Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /preparaciones/{prepId} {
      allow read: if true; // Todos pueden leer
      allow write: if request.auth != null; // Solo usuarios autenticados pueden escribir
    }

    match /userSettings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Reglas de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /preparaciones/{prepId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 💡 Uso

### Crear una Preparación

1. Ve a **Crear Preparación** en el menú
2. Completa el formulario:
   - Título de la preparación
   - Descripción
   - Asignatura
   - Contexto del profesor (opcional)
3. Sube tus archivos (temarios, exámenes pasados, apuntes)
4. Haz clic en **Generar Predicción**
5. Espera mientras la IA analiza el material
6. Revisa los temas y probabilidades generados

### Generar Materiales de Estudio

1. Abre una preparación desde **Mis Preparaciones**
2. Ve a la sección **Predicción**
3. Para cada tema, haz clic en **Generar Material**
4. La IA generará un documento LaTeX con ejercicios
5. El documento se abrirá automáticamente en Overleaf
6. Descarga el LaTeX desde la sección **Documentos Generados**

### Explorar la Comunidad

1. Ve a **Ver Preparaciones** en la página principal
2. Explora preparaciones de otros estudiantes
3. Dale like a las que te gusten
4. Haz clic para ver el contenido (solo lectura si no eres el dueño)

### Foro de Discusión

1. Abre cualquier preparación
2. Ve a la sección **Foro**
3. Escribe comentarios y discute con otros
4. Las actualizaciones son en tiempo real

## 📁 Estructura del Proyecto

```
preparateuc/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── api/               # API Routes
│   │   │   └── gemini/        # Endpoint de Gemini AI
│   │   ├── crear-preparacion/ # Formulario de creación
│   │   ├── landing/           # Explorar preparaciones
│   │   ├── mis-preparaciones/ # Preparaciones del usuario
│   │   ├── preparaciones/     # Vistas de preparación individual
│   │   │   └── [id]/
│   │   │       ├── prediccion/    # Vista de predicción
│   │   │       ├── documentos/    # Materiales generados
│   │   │       ├── extras/        # Documentos extra
│   │   │       └── foro/          # Foro de discusión
│   │   ├── profile/           # Configuración de usuario
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes de React
│   │   ├── AuthGuard.tsx      # Protección de rutas
│   │   ├── CrearPreparacionForm.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── hooks/                 # Custom hooks
│   │   └── useAuth.tsx        # Hook de autenticación
│   ├── services/              # Capa de servicios
│   │   ├── firestore.service.ts    # Operaciones de Firestore
│   │   ├── storage.service.ts      # Operaciones de Storage
│   │   ├── gemini.service.ts       # Cliente de Gemini
│   │   └── userSettings.service.ts # Configuración de usuario
│   ├── types/                 # Definiciones de TypeScript
│   │   └── preparacion.ts
│   └── lib/                   # Utilidades
│       └── firebase.ts        # Inicialización de Firebase
├── lib/                       # Configuración externa
│   └── firebase.ts
├── public/                    # Archivos estáticos
├── .env.local                 # Variables de entorno (no commitear)
├── CLAUDE.md                  # Instrucciones para Claude Code
├── next.config.ts             # Configuración de Next.js
├── tailwind.config.ts         # Configuración de Tailwind
├── tsconfig.json              # Configuración de TypeScript
└── package.json               # Dependencias
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este proyecto fue desarrollado durante un hackathon del Grupo Open Source UC y está abierto a la colaboración.

### Cómo Contribuir

1. **Fork el repositorio**
2. **Crea una rama para tu feature**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Commitea tus cambios**
   ```bash
   git commit -m "feat: agregar nueva funcionalidad"
   ```
4. **Push a tu rama**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. **Abre un Pull Request**

### Convenciones de Código

- **TypeScript**: Todo el código debe estar tipado
- **ESLint**: Asegúrate de que tu código pase el linter
- **Commits**: Usa conventional commits (feat:, fix:, docs:, etc.)
- **Componentes**: Usa 'use client' solo cuando sea necesario
- **Estilos**: Usa Tailwind CSS siguiendo el patrón dark mode existente

### Ideas para Contribuir

- [ ] Soporte para más formatos de archivo (PDF, DOCX)
- [ ] Compilación de LaTeX a PDF en el servidor
- [ ] Exportar predicciones a diferentes formatos
- [ ] Mejoras en el algoritmo de extracción de ejercicios
- [ ] Sistema de notificaciones
- [ ] Integración con más LLMs (Claude, GPT-4)
- [ ] Modo de estudio con flashcards
- [ ] Estadísticas de estudio
- [ ] Compartir preparaciones públicamente
- [ ] Tags y categorías para preparaciones

## 🏗 Arquitectura

### Flujo de Datos

1. **Creación de Preparación**:
   ```
   Usuario → Formulario → Storage (archivos) → Gemini (análisis) → Firestore (datos)
   ```

2. **Generación de Materiales**:
   ```
   Usuario → Selecciona tema → Gemini (genera LaTeX) → Firestore (guarda) → Overleaf (abre)
   ```

3. **Real-time Updates**:
   ```
   Firestore onChange → onSnapshot listener → React state → UI update
   ```

### Servicios

#### FirestoreService
- `crearPreparacion()` - Crear nueva preparación
- `actualizarPreparacion()` - Actualizar preparación existente
- `obtenerPreparacion()` - Obtener por ID
- `obtenerPreparacionesPorUsuario()` - Obtener por usuario
- `obtenerTodasPreparaciones()` - Obtener todas (para explorar)
- `toggleLike()` - Toggle like en preparación

#### StorageService
- `uploadFile()` - Subir archivo individual
- `uploadMultipleFiles()` - Subir múltiples archivos

#### GeminiService
- `analizarYPredecir()` - Analizar material y generar predicción
- `extraerTextoDeArchivo()` - Extraer texto de archivo

#### UserSettingsService
- `getUserSettings()` - Obtener configuración de usuario
- `saveUserSettings()` - Guardar configuración de usuario

### Prompts de Gemini

El proyecto incluye prompts cuidadosamente diseñados para:
- **Anti-alucinación**: Instrucciones estrictas para no inventar contenido
- **Extracción precisa**: Solo usar información del material proporcionado
- **Formato LaTeX profesional**: Plantilla específica para documentos académicos

## 📝 Notas Importantes

### Limitaciones Conocidas

- Actualmente solo soporta archivos `.txt` para extracción de texto
- Los PDFs se muestran como `[Archivo: nombre.pdf]` sin extracción de contenido
- La compilación de LaTeX a PDF está pendiente de implementación
- El sistema de búsqueda aún no está implementado

### Seguridad

- Las API keys de usuario se guardan en Firestore (considera cifrarlas en producción)
- Los archivos subidos son públicos en Storage (considera reglas más estrictas)
- La autenticación es solo por email/password (considera agregar OAuth)

## 👥 Créditos

Desarrollado durante la **Hackscate** de **Open Source UC** por:
- @mon-b, @EstebanKiito, @estardacs

**Tecnologías Clave**:
- Next.js & React
- Firebase
- Google Gemini AI
- Tailwind CSS


---

**Desarrollado con ❤️ para la comunidad UC**

¿Preguntas o sugerencias? Abre un issue o contacta al equipo.
