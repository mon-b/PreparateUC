'use client';

import CrearPreparacionForm from '@/components/CrearPreparacionForm';
import AuthGuard from '@/components/AuthGuard';

export default function CrearPreparacionPage() {
  return (
    <AuthGuard>
      <main className="min-h-screen bg-black">
        <CrearPreparacionForm />
      </main>
    </AuthGuard>
  );
}
