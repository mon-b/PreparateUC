'use client';

import CrearPreparacionForm from '@/components/CrearPreparacionForm';
import AuthGuard from '@/components/AuthGuard';

export default function CrearPreparacionPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CrearPreparacionForm />
      </main>
    </AuthGuard>
  );
}
