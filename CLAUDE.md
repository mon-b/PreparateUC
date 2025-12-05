# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PrepárateUC is a Next.js application that uses AI (Google Gemini) to predict exam content based on course materials. Students upload syllabus files, past exams, and professor context, and the AI analyzes everything to generate probability predictions by topic and compile practice exercises ordered by difficulty in LaTeX format.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/generative-ai`)
- **Backend Services**: Firebase (Firestore, Storage, Auth)
- **Fonts**: Geist Sans and Geist Mono (local fonts)

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Environment Variables

The application requires these environment variables in `.env.local`:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Gemini API (server-side only)
GEMINI_API_KEY=
```

## Architecture

### Directory Structure

- `/src/app/` - Next.js App Router pages and API routes
  - `/api/gemini/route.ts` - Server-side Gemini API endpoint
  - `/crear-preparacion/` - Create preparation page
  - `page.tsx` - Landing page
  - `layout.tsx` - Root layout with metadata
- `/src/components/` - React components (all client components use `'use client'`)
- `/src/services/` - Service layer for external integrations
- `/src/types/` - TypeScript type definitions
- `/lib/` - Firebase initialization (note: not in `/src/lib/`)

### Service Layer

The application uses a service-oriented architecture with three main services:

1. **FirestoreService** (`src/services/firestore.service.ts`)
   - Handles all Firestore database operations
   - Methods: `crearPreparacion()`, `actualizarPreparacion()`, `obtenerPreparacion()`, `obtenerPreparacionesPorUsuario()`
   - Automatically converts Firebase Timestamps to/from JavaScript Dates

2. **StorageService** (`src/services/storage.service.ts`)
   - Manages file uploads to Firebase Storage
   - Methods: `uploadFile()`, `uploadMultipleFiles()`
   - Provides progress callbacks for upload tracking
   - Files are stored with timestamp prefixes to avoid naming conflicts

3. **GeminiService** (`src/services/gemini.service.ts`)
   - Client-side service that calls the `/api/gemini` API route
   - Methods: `analizarYPredecir()`, `generarLatexEjercicios()`, `extraerTextoDeArchivo()`
   - Currently only supports `.txt` file text extraction; other formats return placeholder text

### API Routes

**POST /api/gemini** - Single endpoint with action-based routing:
- Action: `'analizar'` - Analyzes uploaded materials and generates predictions
- Action: `'generarLatex'` - Generates LaTeX document with exercises
- Both use the `gemini-pro` model
- Responses are parsed from Gemini's text output (expects JSON for predictions, raw LaTeX for exercises)

### Key Data Flow

1. User fills form in `CrearPreparacionForm` component
2. Files are uploaded to Firebase Storage via `StorageService`
3. Text is extracted from uploaded files (currently only `.txt` fully supported)
4. Data is sent to `/api/gemini` for AI analysis
5. Gemini returns predictions with categories, probabilities, and exercises
6. Gemini generates a LaTeX document with compiled exercises
7. Everything is saved to Firestore via `FirestoreService`
8. User receives preparation ID upon success

### Type System

Core types in `src/types/preparacion.ts`:

- `Preparacion` - Main entity stored in Firestore
- `PrediccionResponse` - AI prediction output with categories
- `Categoria` - Topic category with probability and exercises
- `Ejercicio` - Individual exercise with difficulty level
- `GeminiPredictionRequest` - Input for AI analysis
- `FormData` - Form state (note: different from Preparacion)

## Important Notes

### Firebase Initialization

- Firebase is initialized in `/lib/firebase.ts` (NOT `/src/lib/`)
- Path alias `@/lib/firebase` maps to `./lib/firebase.ts`
- The app uses singleton pattern to prevent multiple Firebase initializations
- Exports: `auth`, `db`, `storage`

### Gemini API Prompts

Two main prompts are constructed in `/src/app/api/gemini/route.ts`:

1. **construirPromptPrediccion()** - Analyzes materials and returns structured JSON with categories, probabilities, and exercises
2. **construirPromptLatex()** - Generates a complete LaTeX document with exercises ordered by difficulty

The prediction prompt explicitly requests JSON-only output and provides a detailed schema. Response parsing extracts JSON using regex matching.

### Client vs Server Components

- Most components are client components (`'use client'` directive) due to form state and interactivity
- API routes in `/src/app/api/` run server-side only and can access `GEMINI_API_KEY` securely
- Services in `/src/services/` are designed for client-side use (except they call server API routes)

### File Upload Limitations

- Currently supports `.pdf`, `.txt`, `.doc`, `.docx` file types (in form validation)
- Text extraction only fully implemented for `.txt` files
- Other file types return placeholder text `[Archivo: filename]`
- This is a known limitation that may need expansion

### Authentication

- Auth is imported from Firebase but not yet fully implemented
- Current code uses placeholder `userId: 'temp-user-id'` in preparacion creation
- The `FirestoreService.obtenerPreparacionesPorUsuario()` method exists but requires real auth

## Common Workflows

### Adding a New Service Method

1. Add method to appropriate service class in `/src/services/`
2. If it needs Gemini, add action to `/src/app/api/gemini/route.ts`
3. Update types in `/src/types/preparacion.ts` if needed
4. Call service method from component

### Modifying Gemini Prompts

Edit the `construirPromptPrediccion()` or `construirPromptLatex()` functions in `/src/app/api/gemini/route.ts`. Be careful with JSON schema changes as they affect the response parsing logic.

### Adding File Type Support

1. Update accepted file types in `CrearPreparacionForm` file input
2. Implement text extraction logic in `GeminiService.extraerTextoDeArchivo()`
3. May require additional packages for parsing (e.g., `pdf-parse`, `mammoth` for DOCX)
