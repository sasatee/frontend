import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EnvelopeOpenIcon } from '@radix-ui/react-icons';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 p-4 dark:from-gray-900 dark:to-slate-800">
      <div
        className="absolute inset-0 bg-white/5 dark:bg-black/20"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative w-full max-w-[450px]">
        <div className="mb-6 text-center">
          <div className="flex justify-center">
            <div className="mb-4 rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <EnvelopeOpenIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Password Recovery
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter your email address below and we'll send you instructions to reset your password.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-950">
          <ForgotPasswordForm />

          <div className="mt-6 text-center">
            <Button
              variant="link"
              asChild
              className="text-sm text-gray-600 hover:text-primary dark:text-gray-400"
            >
              <Link to="/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
