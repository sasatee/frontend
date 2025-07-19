import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { roleService, Role } from '@/services/roleService';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormValues } from '@/schemas/auth';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';
import { useFormNavProtection } from '@/hooks/useFormNavProtection';
import { AlertCircle, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useUniqueEmailValidation } from '@/hooks/useUniqueEmailValidation';
import { useFormThrottle } from '@/hooks/useFormThrottle';
import { handleFormSubmissionError } from '@/lib/error-handler';

// Extended form values to include roles and terms agreement
interface ExtendedRegisterFormValues extends RegisterFormValues {
  roles?: string[];
}

export function RegisterForm() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Initialize form with extended type
  const form = useForm<ExtendedRegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      roles: [],
    },
    mode: 'onChange', // Enable validation on change
  });

  // Set up email uniqueness validation
  const {
    isValidating: isValidatingEmail,
    isUnique: isEmailUnique,
    error: emailError,
  } = useUniqueEmailValidation({
    initialValue: form.getValues('email'),
    delay: 800,
  });

  // Watch email field changes and update the validation hook
  const email = form.watch('email');
  useEffect(() => {
    if (email) {
      // This will trigger the validation in the hook
      form.trigger('email');
    }
  }, [email, form]);

  // Set up form submission throttling
  const { isThrottled, throttleSubmit } = useFormThrottle({
    throttleTime: 3000, // 3 seconds between submissions
  });

  // Enable form navigation protection
  const { safeNavigate } = useFormNavProtection(form);

  // Get current password value for strength meter
  const password = form.watch('password');

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const rolesData = await roleService.getRoles();
        setRoles(rolesData);

        // If there are roles available, pre-select the first one by name
        if (rolesData.length > 0) {
          form.setValue('roles', [rolesData[0].name]);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch roles. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [form]);

  // Apply email validation results to form
  useEffect(() => {
    if (emailError && email) {
      form.setError('email', {
        type: 'manual',
        message: emailError,
      });
    } else if (isEmailUnique === false && email) {
      form.setError('email', {
        type: 'manual',
        message: 'This email is already registered',
      });
    } else if (isEmailUnique === true && email) {
      form.clearErrors('email');
    }
  }, [isEmailUnique, emailError, email, form]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: ExtendedRegisterFormValues) => {
    // Check if email is unique before submitting
    if (isEmailUnique === false) {
      form.setError('email', {
        type: 'manual',
        message: 'This email is already registered',
      });
      return;
    }

    // Apply throttling to prevent rapid submissions
    const throttledSubmit = throttleSubmit(async (formData: ExtendedRegisterFormValues) => {
      setIsLoading(true);
      setRegisterError(null);

      try {
        await authService.register({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          roles: formData.roles || [],
        });

        toast({
          title: 'Success',
          description: 'Registration successful! Please login.',
        });
        safeNavigate('/login');
      } catch (error: any) {
        handleFormSubmissionError(error, form.setError, setRegisterError, 'registration');
      } finally {
        setIsLoading(false);
      }
    });

    try {
      await throttledSubmit(data);
    } catch (error) {
      // Throttling error is handled by the throttleSubmit function
      console.log('Submission throttled');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {registerError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{registerError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                    className={isValidatingEmail ? 'pr-10' : ''}
                  />
                  {isValidatingEmail && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isValidatingEmail && isEmailUnique === true && email && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {!isValidatingEmail && isEmailUnique === false && email && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <PasswordStrengthMeter password={password} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleConfirmPasswordVisibility}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showConfirmPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the{' '}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    type="button"
                    onClick={() => window.open('/terms', '_blank')}
                  >
                    Terms of Service
                  </Button>{' '}
                  and{' '}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    type="button"
                    onClick={() => window.open('/privacy', '_blank')}
                  >
                    Privacy Policy
                  </Button>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || isThrottled || isValidatingEmail}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : isThrottled ? (
            'Please wait...'
          ) : (
            'Register'
          )}
        </Button>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={() => safeNavigate('/login')}
            type="button"
          >
            Log in
          </Button>
        </div>
      </form>
    </Form>
  );
}
