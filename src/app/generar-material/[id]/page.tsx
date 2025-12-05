import GenerarMaterialForm from '@/components/GenerarMaterialForm';

export const metadata = {
  title: 'Generar Material - PrepárateUC',
  description: 'Genera ejercicios para un tema específico',
};

export default function GenerarMaterialPage({ params, searchParams }: {
  params: { id: string };
  searchParams: { tema?: string };
}) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <GenerarMaterialForm
        preparacionId={params.id}
        temaNombre={searchParams.tema || ''}
      />
    </main>
  );
}
