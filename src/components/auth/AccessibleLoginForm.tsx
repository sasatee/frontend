import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  AccessibleFormRoot,
  AccessibleFormField,
  AccessibleFormActions,
} from '@/components/ui/accessible-form';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AccessibleLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { announce } = useAccessibility();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      announce('Form has validation errors. Please correct them before submitting.', true);
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      announce('Login successful. Redirecting to dashboard.', false);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      announce(`Login failed. ${errorMessage}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccessibleFormRoot
      onSubmit={handleSubmit}
      ariaLabel="Login Form"
      ariaDescription="Enter your credentials to access your account"
      className="w-full max-w-md space-y-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AccessibleFormField label="Email Address" error={formErrors.email} required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isLoading}
        />
      </AccessibleFormField>

      <AccessibleFormField
        label="Password"
        error={formErrors.password}
        required
        description="Your password must be at least 8 characters"
      >
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isLoading}
        />
      </AccessibleFormField>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 font-normal"
          onClick={() => navigate('/forgot-password')}
        >
          Forgot password?
        </Button>
      </div>

      <AccessibleFormActions>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {isLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </AccessibleFormActions>
    </AccessibleFormRoot>
  );
}
