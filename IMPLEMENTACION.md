# Implementación Vista "Crear Preparación" - PrepárateUC

## Resumen

Se ha implementado exitosamente la vista "Crear Preparación" para PrepárateUC, una aplicación que utiliza IA (Gemini) para predecir qué temas entrarán en un examen y generar ejercicios compilados en LaTeX.

## Estructura del Proyecto

```
PreparateUC/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── gemini/
│   │   │       └── route.ts          # API route para llamadas a Gemini AI
│   │   ├── crear-preparacion/
│   │   │   └── page.tsx              # Página principal de creación
│   │   ├── layout.tsx                # Layout global actualizado
│   │   └── page.tsx                  # Página de inicio actualizada
│   ├── components/
│   │   └── CrearPreparacionForm.tsx  # Formulario principal (componente cliente)
│   ├── services/
│   │   ├── storage.service.ts        # Servicio para Firebase Storage
│   │   ├── firestore.service.ts      # Servicio para Firestore
│   │   └── gemini.service.ts         # Servicio para llamadas a Gemini API
│   └── types/
│       └── preparacion.ts            # Tipos TypeScript
└── lib/
    └── firebase.ts                   # Configuración Firebase (SDK modular)
```

## Características Implementadas

### 1. Formulario de Creación de Preparación

**Campos:**
- Título de la preparación
- Descripción
- Asignatura
- Fecha del examen
- Contexto del profesor (qué mencionó que entrará)
- Subida múltiple de archivos (temarios, pruebas pasadas, apuntes)

**Características:**
- Validación de formulario
- Preview de archivos seleccionados
- Opción para eliminar archivos antes de subir
- Indicadores de progreso durante la subida
- Estados de procesamiento con mensajes informativos
- Manejo de errores

### 2. Integración con Firebase

**Firebase Storage:**
- Subida de múltiples archivos
- Seguimiento de progreso individual por archivo
- URLs públicas para acceso a los archivos

**Firestore:**
- Colección `preparaciones` con los siguientes campos:
  - `titulo`, `descripcion`, `asignatura`
  - `fechaExamen` (Timestamp)
  - `contextoProfesor`
  - `archivosUrls` (array de URLs)
  - `createdAt`, `updatedAt` (Timestamp)
  - `userId` (actualmente temporal)
  - `prediccion` (objeto con categorías y ejercicios)
  - `ejerciciosLatex` (string con código LaTeX)

### 3. Análisis con Gemini AI

**Primera llamada - Análisis y Predicción:**
- Procesa el contexto del profesor
- Analiza temarios y pruebas pasadas
- Genera JSON estructurado con:
  - Resumen del análisis
  - Categorías identificadas
  - Probabilidad (0-100%) por categoría
  - Ejercicios por categoría (3-5 por categoría)
  - Cada ejercicio incluye:
    - Título
    - Enunciado completo
    - Fuente
    - Dificultad (fácil/medio/difícil)
    - Solución (opcional)

**Segunda llamada - Generación de LaTeX:**
- Genera documento LaTeX completo
- Estructura profesional con:
  - Título y subtítulo
  - Secciones por categoría (ordenadas por probabilidad)
  - Ejercicios ordenados por dificultad
  - Formato limpio y listo para compilar

### 4. Flujo Completo

1. Usuario completa el formulario y sube archivos
2. Archivos se suben a Firebase Storage
3. Se extrae texto de los archivos (actualmente solo TXT)
4. Se envía todo a Gemini para análisis
5. Gemini retorna predicciones con ejercicios
6. Se genera LaTeX con los ejercicios compilados
7. Todo se guarda en Firestore
8. Usuario recibe confirmación con ID de la preparación

## Tecnologías Utilizadas

- **Next.js 14** (App Router)
- **React 18** (componentes cliente y servidor)
- **TypeScript** (tipado estricto)
- **Tailwind CSS** (estilos)
- **Firebase v12** (SDK modular):
  - Firestore (base de datos)
  - Storage (archivos)
  - Auth (para futuro)
- **Google Generative AI** (Gemini Pro)

## API Routes

### POST /api/gemini

**Acciones disponibles:**

1. **Analizar** (`action: "analizar"`)
   - Input: `GeminiPredictionRequest`
   - Output: `PrediccionResponse`

2. **Generar LaTeX** (`action: "generarLatex"`)
   - Input: `{ prediccion, asignatura }`
   - Output: `string` (código LaTeX)

## Tipos TypeScript

Ver archivo completo en `src/types/preparacion.ts`:

- `Preparacion`: Estructura principal de una preparación
- `PrediccionResponse`: Respuesta de Gemini con categorías
- `Categoria`: Categoría con probabilidad y ejercicios
- `Ejercicio`: Ejercicio individual con fuente y dificultad
- `GeminiPredictionRequest`: Request para Gemini
- `FormData`: Datos del formulario

## Configuración Requerida

### Variables de Entorno (.env.local)

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Gemini AI
GEMINI_API_KEY=...
```

## Próximos Pasos Recomendados

1. **Autenticación de Usuarios:**
   - Implementar Firebase Auth
   - Reemplazar `userId: 'temp-user-id'` con usuario real

2. **Extracción de Texto Avanzada:**
   - Soporte para PDFs (usar PDF.js o similar)
   - Soporte para DOCX
   - OCR para imágenes

3. **Vista "Mis Preparaciones":**
   - Lista de preparaciones del usuario
   - Visualización de predicciones
   - Descarga de LaTeX compilado a PDF

4. **Mejoras de UI/UX:**
   - Drag & drop para archivos
   - Vista previa de PDFs
   - Visualización gráfica de probabilidades
   - Editor de LaTeX integrado

5. **Optimizaciones:**
   - Procesamiento en background (Firebase Functions)
   - Cache de análisis similares
   - Compresión de archivos

6. **Features Adicionales:**
   - Compartir preparaciones con compañeros
   - Colaboración en tiempo real
   - Sistema de calificaciones/feedback
   - Estadísticas de precisión de predicciones

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start
```

## Testing

Para probar la funcionalidad:

1. Navega a `http://localhost:3000`
2. Click en "Crear Preparación"
3. Completa el formulario con datos de prueba
4. Sube archivos de prueba (TXT recomendado)
5. Observa el progreso de subida y procesamiento
6. Verifica que se cree la preparación en Firestore

## Notas Técnicas

- El componente `CrearPreparacionForm` es un componente cliente (`'use client'`)
- Las llamadas a Gemini se hacen a través de un API route del servidor
- Los archivos se suben directamente desde el cliente a Firebase Storage
- Se usa SDK modular de Firebase (no sintaxis antigua)
- TypeScript está configurado en modo estricto
- El build genera páginas estáticas donde es posible

---

**Desarrollado para PrepárateUC**
*Versión: 1.0.0*
*Fecha: Diciembre 2025*
