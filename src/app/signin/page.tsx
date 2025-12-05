import SignInForm from '@/components/auth/SignInForm';

export const metadata = {
  title: 'Iniciar Sesión - PrepárateUC',
  description: 'Accede a tu cuenta de PrepárateUC',
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <SignInForm />
    </main>
  );
}
