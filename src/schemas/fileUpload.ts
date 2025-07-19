import * as z from 'zod';
import { validators } from './validation';

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
  PROFILE_PHOTO: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  ATTACHMENT: 15 * 1024 * 1024, // 15MB
  BULK_IMPORT: 20 * 1024 * 1024, // 20MB
};

// Allowed file types by category
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  IMPORT_FILES: [
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

// Potentially dangerous file extensions that should be blocked
export const BLOCKED_FILE_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.msi',
  '.vbs',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
  '.cgi',
  '.py',
  '.sh',
  '.dll',
  '.jar',
];

// Check if a file has a dangerous extension
const hasDangerousExtension = (filename: string): boolean => {
  const lowercaseFilename = filename.toLowerCase();
  return BLOCKED_FILE_EXTENSIONS.some((ext) => lowercaseFilename.endsWith(ext));
};

// Validate image dimensions
const validateImageDimensions = async (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img.width <= maxWidth && img.height <= maxHeight);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
};

// File upload schema for profile photos
export const profilePhotoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= FILE_SIZE_LIMITS.PROFILE_PHOTO, {
      message: `Profile photo must be less than ${FILE_SIZE_LIMITS.PROFILE_PHOTO / (1024 * 1024)}MB`,
    })
    .refine((file) => ALLOWED_FILE_TYPES.IMAGES.includes(file.type), {
      message: `Profile photo must be one of the following types: ${ALLOWED_FILE_TYPES.IMAGES.join(', ')}`,
    })
    .refine((file) => !hasDangerousExtension(file.name), {
      message: 'File type not allowed for security reasons',
    })
    .refine(async (file) => await validateImageDimensions(file, 1200, 1200), {
      message: 'Profile photo dimensions cannot exceed 1200x1200 pixels',
    }),
  cropData: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
});

// File upload schema for document attachments
export const documentUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= FILE_SIZE_LIMITS.DOCUMENT, {
      message: `Document must be less than ${FILE_SIZE_LIMITS.DOCUMENT / (1024 * 1024)}MB`,
    })
    .refine(
      (file) => [...ALLOWED_FILE_TYPES.DOCUMENTS, ...ALLOWED_FILE_TYPES.IMAGES].includes(file.type),
      {
        message: `Document must be one of the allowed document or image types`,
      }
    )
    .refine((file) => !hasDangerousExtension(file.name), {
      message: 'File type not allowed for security reasons',
    }),
  documentType: z.enum([
    'ID Card',
    'Passport',
    'Driver License',
    'Certificate',
    'Contract',
    'Medical Record',
    'Other',
  ]),
  description: validators.optionalString('Description', 200),
  expiryDate: validators.optionalDate().refine(
    (date) => {
      if (!date) return true;
      return new Date(date) > new Date();
    },
    {
      message: 'Expiry date must be in the future',
    }
  ),
  isConfidential: z.boolean().default(false),
  documentNumber: z.string().optional(),
  issueDate: validators.optionalDate(),
  issuingAuthority: z.string().optional(),
});

// File upload schema for bulk imports
export const bulkImportUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= FILE_SIZE_LIMITS.BULK_IMPORT, {
      message: `Import file must be less than ${FILE_SIZE_LIMITS.BULK_IMPORT / (1024 * 1024)}MB`,
    })
    .refine((file) => ALLOWED_FILE_TYPES.IMPORT_FILES.includes(file.type), {
      message: `Import file must be one of the following types: ${ALLOWED_FILE_TYPES.IMPORT_FILES.join(', ')}`,
    })
    .refine((file) => !hasDangerousExtension(file.name), {
      message: 'File type not allowed for security reasons',
    }),
  importType: z.enum(['Employees', 'Attendance', 'Leave', 'Payroll', 'Deductions', 'Allowances']),
  skipFirstRow: z.boolean().default(true),
  updateExisting: z.boolean().default(false),
  dateFormat: z.enum(['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY']).default('YYYY-MM-DD'),
  validateOnly: z.boolean().default(false),
  mappingConfig: z.record(z.string()).optional(),
});

// File upload schema for general attachments
export const attachmentUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= FILE_SIZE_LIMITS.ATTACHMENT, {
      message: `Attachment must be less than ${FILE_SIZE_LIMITS.ATTACHMENT / (1024 * 1024)}MB`,
    })
    .refine(
      (file) => [...ALLOWED_FILE_TYPES.DOCUMENTS, ...ALLOWED_FILE_TYPES.IMAGES].includes(file.type),
      {
        message: `Attachment must be one of the allowed document or image types`,
      }
    )
    .refine((file) => !hasDangerousExtension(file.name), {
      message: 'File type not allowed for security reasons',
    }),
  title: validators.requiredString('Title', 100),
  description: validators.optionalString('Description', 500),
  category: z.enum(['Leave Request', 'Attendance', 'Employee Document', 'Payroll', 'Other']),
  relatedEntityId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  expiryDate: validators.optionalDate(),
  visibility: z.enum(['Public', 'Private', 'Restricted']).default('Private'),
  allowedUserIds: z.array(z.string()).optional(),
});

// Multiple file upload schema
export const multipleFileUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, 'At least one file is required')
    .max(10, 'Maximum 10 files allowed')
    .refine((files) => files.every((file) => file.size <= FILE_SIZE_LIMITS.ATTACHMENT), {
      message: `Each file must be less than ${FILE_SIZE_LIMITS.ATTACHMENT / (1024 * 1024)}MB`,
    })
    .refine(
      (files) =>
        files.every((file) =>
          [...ALLOWED_FILE_TYPES.DOCUMENTS, ...ALLOWED_FILE_TYPES.IMAGES].includes(file.type)
        ),
      {
        message: `All files must be of allowed document or image types`,
      }
    )
    .refine((files) => files.every((file) => !hasDangerousExtension(file.name)), {
      message: 'One or more files have types that are not allowed for security reasons',
    }),
  category: z.enum(['Leave Request', 'Attendance', 'Employee Document', 'Payroll', 'Other']),
  description: validators.optionalString('Description', 500),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['Public', 'Private', 'Restricted']).default('Private'),
});

// Export types
export type ProfilePhotoUploadFormValues = z.infer<typeof profilePhotoUploadSchema>;
export type DocumentUploadFormValues = z.infer<typeof documentUploadSchema>;
export type BulkImportUploadFormValues = z.infer<typeof bulkImportUploadSchema>;
export type AttachmentUploadFormValues = z.infer<typeof attachmentUploadSchema>;
export type MultipleFileUploadFormValues = z.infer<typeof multipleFileUploadSchema>;
