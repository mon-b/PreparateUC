import SignInForm from '@/components/auth/SignInForm';

export const metadata = {
  title: 'PreparateUC',
  description: 'Accede a tu cuenta de PrepárateUC',
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <SignInForm />
    </main>
  );
}
