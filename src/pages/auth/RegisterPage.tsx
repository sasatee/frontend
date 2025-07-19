import { RegisterForm } from '@/components/auth/RegisterForm';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div
        className="absolute inset-0 bg-white/5 dark:bg-black/20"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative w-full max-w-[520px]">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create Account
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Join our platform and get started</p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-950">
          <RegisterForm />

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
