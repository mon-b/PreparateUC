import { redirect } from 'next/navigation';

export default function PreparacionDefaultPage({ params }: { params: { id: string } }) {
  redirect(`/preparaciones/${params.id}/prediccion`);
}
