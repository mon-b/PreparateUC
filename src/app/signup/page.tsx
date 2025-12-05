import SignUpForm from '@/components/auth/SignUpForm';

export const metadata = {
  title: 'PreparateUC',
  description: 'Crea tu cuenta en PreparateUC',
};

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <SignUpForm />
    </main>
  );
}
