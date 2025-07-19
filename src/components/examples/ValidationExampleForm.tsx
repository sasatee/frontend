import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, User, Phone, Calendar, Lock, DollarSign } from 'lucide-react';

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
import { EnhancedFormField } from '@/components/ui/enhanced-form-field';
import { FloatingInput } from '@/components/ui/floating-input';
import { PasswordInput } from '@/components/ui/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { validationPatterns } from '@/schemas/validation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter';

// Example schema with all validation features
const exampleSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .regex(
        validationPatterns.namePattern,
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      ),

    email: z.string().min(1, 'Email is required').email('Invalid email format'),

    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(validationPatterns.phonePattern, 'Please enter a valid phone number'),

    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .regex(validationPatterns.datePattern, 'Please enter a valid date in YYYY-MM-DD format'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        validationPatterns.strongPasswordPattern,
        'Password must contain uppercase, lowercase, number, and special character'
      ),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    amount: z
      .string()
      .min(1, 'Amount is required')
      .regex(validationPatterns.currencyPattern, 'Please enter a valid amount'),

    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      const dob = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 18;
    },
    {
      message: 'You must be at least 18 years old',
      path: ['dateOfBirth'],
    }
  );

type ExampleFormValues = z.infer<typeof exampleSchema>;

export function ValidationExampleForm() {
  const [formStyle, setFormStyle] = React.useState<'standard' | 'enhanced'>('standard');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<ExampleFormValues | null>(null);

  const form = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      password: '',
      confirmPassword: '',
      amount: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: ExampleFormValues) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setFormData(data);
    setIsSubmitting(false);
  };

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Form Validation Example</CardTitle>
        <CardDescription>
          Example form with validation using Zod and React Hook Form
        </CardDescription>
        <Tabs value={formStyle} onValueChange={(v) => setFormStyle(v as 'standard' | 'enhanced')}>
          <TabsList>
            <TabsTrigger value="standard">Standard Form</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced Form</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="standard" className="mt-0 space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input placeholder="YYYY-MM-DD" {...field} />
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
                      <PasswordInput showStrengthMeter {...field} />
                    </FormControl>
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
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Accept terms and conditions</FormLabel>
                      <FormDescription>
                        You agree to our Terms of Service and Privacy Policy.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="enhanced" className="mt-0 space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <EnhancedFormField
                    label="Full Name"
                    error={form.formState.errors.fullName?.message}
                    icon={<User className="h-4 w-4" />}
                    required
                  >
                    <FloatingInput placeholder="John Doe" {...field} />
                  </EnhancedFormField>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <EnhancedFormField
                    label="Email"
                    error={form.formState.errors.email?.message}
                    icon={<Mail className="h-4 w-4" />}
                    required
                  >
                    <FloatingInput type="email" placeholder="john@example.com" {...field} />
                  </EnhancedFormField>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <EnhancedFormField
                    label="Phone Number"
                    error={form.formState.errors.phone?.message}
                    icon={<Phone className="h-4 w-4" />}
                    required
                  >
                    <FloatingInput placeholder="+1234567890" {...field} />
                  </EnhancedFormField>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <EnhancedFormField
                    label="Date of Birth"
                    error={form.formState.errors.dateOfBirth?.message}
                    icon={<Calendar className="h-4 w-4" />}
                    required
                    description="You must be at least 18 years old"
                  >
                    <FloatingInput placeholder="YYYY-MM-DD" {...field} />
                  </EnhancedFormField>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <EnhancedFormField
                    label="Password"
                    error={form.formState.errors.password?.message}
                    icon={<Lock className="h-4 w-4" />}
                    required
                  >
                    <FloatingInput type="password" placeholder="••••••••" {...field} />
                  </EnhancedFormField>
                )}
              />

              <div className="pl-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => <PasswordStrengthMeter password={field.value} />}
                />
              </div>

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <EnhancedFormField
                    label="Confirm Password"
                    error={form.formState.errors.confirmPassword?.message}
                    icon={<Lock className="h-4 w-4" />}
                    required
                  >
                    <FloatingInput type="password" placeholder="••••••••" {...field} />
                  </EnhancedFormField>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <EnhancedFormField
                    label="Amount"
                    error={form.formState.errors.amount?.message}
                    icon={<DollarSign className="h-4 w-4" />}
                    required
                  >
                    <FloatingInput placeholder="0.00" {...field} />
                  </EnhancedFormField>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pl-3">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Accept terms and conditions</FormLabel>
                      <FormDescription>
                        You agree to our Terms of Service and Privacy Policy.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
      {formData && (
        <CardFooter className="flex flex-col items-start border-t p-4">
          <h3 className="text-lg font-semibold">Submitted Data:</h3>
          <pre className="mt-2 w-full overflow-auto rounded-md bg-muted p-4 text-sm">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </CardFooter>
      )}
    </Card>
  );
}
