// @ts-ignore
import * as z from 'zod';
import { validators, validationPatterns, validationMessages } from './validation';

// Login form schema
export const loginSchema = z.object({
  email: validators.email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});



// Password reset request schema
export const forgotPasswordSchema = z.object({
  email: validators.email(),
});

// Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: validators.password('New password', true), // Use stronger password validation
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: validationMessages.passwordMismatch,
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// Password reset schema (using token)
export const resetPasswordSchema = z
  .object({
    password: validators.password('Password', true), // Use stronger password validation
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: validationMessages.passwordMismatch,
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
