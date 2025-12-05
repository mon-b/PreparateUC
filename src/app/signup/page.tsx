import SignUpForm from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'Registrarse - PrepárateUC',
  description: 'Crea tu cuenta en PrepárateUC',
};

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <SignUpForm />
    </main>
  );
}
