import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon, LockClosedIcon } from '@radix-ui/react-icons';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-orange-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div
          className="absolute inset-0 bg-white/5 dark:bg-black/20"
          style={{
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative w-full max-w-[450px]">
          <div className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-950">
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                Invalid Reset Link
              </h1>
              <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                The link you clicked might be broken, expired, or you may have already used it to
                reset your password.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button onClick={() => navigate('/forgot-password')} className="w-full">
                Request New Reset Link
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4 dark:from-gray-900 dark:to-gray-800">
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
            <div className="mb-4 rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
              <LockClosedIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create a new strong password for your account
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-xl dark:bg-gray-950">
          <ResetPasswordForm email={email} token={token} />
        </div>
      </div>
    </div>
  );
}
