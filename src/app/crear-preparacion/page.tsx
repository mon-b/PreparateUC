import CrearPreparacionForm from '@/components/CrearPreparacionForm';

export const metadata = {
  title: 'Crear Preparación - PrepárateUC',
  description: 'Crea una nueva preparación para tu examen con análisis de IA',
};

export default function CrearPreparacionPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <CrearPreparacionForm />
    </main>
  );
}
