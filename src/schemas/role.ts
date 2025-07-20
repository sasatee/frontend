// @ts-ignore
import * as z from 'zod';
import { validators, validationPatterns, createUniqueValidator } from './validation';

// Simple role schema for the API
export const roleSchema = z.object({
  roleName: validators
    .requiredString('Role name', 50)
    .regex(/^[a-zA-Z\s]+$/, 'Role name can only contain letters and spaces'),
});

// Simple role assignment schema (for AssignRoleDialog component)
export const assignRoleSchema = z.object({
  userId: validators.requiredString('User'),
  roleId: validators.requiredString('Role'),
});

// Export types
export type RoleFormValues = z.infer<typeof roleSchema>;
export type AssignRoleFormValues = z.infer<typeof assignRoleSchema>;
