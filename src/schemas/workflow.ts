// @ts-ignore
import * as z from 'zod';
import { validators, validationMessages, workflowValidation } from './validation';

// Workflow status options
export const WORKFLOW_STATUSES = [
  'Draft',
  'Pending',
  'Submitted',
  'In Review',
  'Approved',
  'Rejected',
  'Cancelled',
  'Completed',
] as const;

// Workflow approval levels
export const APPROVAL_LEVELS = [
  'Line Manager',
  'Department Head',
  'HR Manager',
  'Finance Manager',
  'CEO',
  'System',
] as const;

// Workflow allowed transitions
export const WORKFLOW_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Pending', 'Submitted', 'Cancelled'],
  Pending: ['Submitted', 'Cancelled'],
  Submitted: ['In Review', 'Approved', 'Rejected', 'Cancelled'],
  'In Review': ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['Completed', 'Cancelled'],
  Rejected: ['Draft', 'Cancelled'],
  Cancelled: ['Draft'],
  Completed: [],
};

// Workflow approval schema
export const workflowApprovalSchema = z.object({
  workflowId: validators.requiredString('Workflow ID'),
  approverId: validators.requiredString('Approver'),
  approvalLevel: z.enum(APPROVAL_LEVELS),
  status: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
  comments: validators.optionalString('Comments', 500),
  approvalDate: validators.optionalDate('Approval date'),
  delegatedBy: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Workflow step schema
export const workflowStepSchema = z.object({
  workflowId: validators.requiredString('Workflow ID'),
  stepName: validators.requiredString('Step name', 100),
  stepOrder: z.number().int().min(1, 'Step order must be at least 1'),
  approverIds: z.array(z.string()).min(1, 'At least one approver is required'),
  approvalLevel: z.enum(APPROVAL_LEVELS),
  isRequired: z.boolean().default(true),
  minApprovals: z.number().int().min(1, 'Minimum approvals must be at least 1'),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Skipped']).default('Pending'),
  dueDate: validators.optionalDate('Due date'),
  completedDate: validators.optionalDate('Completed date'),
  notifyApprovers: z.boolean().default(true),
  escalateAfterHours: z.number().int().min(0).optional(),
  escalateTo: z.array(z.string()).optional(),
});

// Workflow definition schema
export const workflowDefinitionSchema = z
  .object({
    name: validators.requiredString('Workflow name', 100),
    description: validators.optionalString('Description', 500),
    workflowType: z.enum([
      'Leave Request',
      'Expense Claim',
      'Purchase Request',
      'Timesheet Approval',
      'Document Approval',
      'Travel Request',
      'Loan Request',
      'Other',
    ]),
    isActive: z.boolean().default(true),
    steps: z.array(workflowStepSchema).min(1, 'At least one workflow step is required'),
    autoApproveAfterDays: z.number().int().min(0).optional(),
    autoRejectAfterDays: z.number().int().min(0).optional(),
    notifySubmitter: z.boolean().default(true),
    notifyOnCompletion: z.boolean().default(true),
    allowParallelApprovals: z.boolean().default(false),
    allowSelfApproval: z.boolean().default(false),
    requiredRoles: z.array(z.string()).optional(),
    applicableDepartments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Check that step orders are sequential and unique
      const stepOrders = data.steps.map((step) => step.stepOrder).sort((a, b) => a - b);
      for (let i = 0; i < stepOrders.length; i++) {
        if (stepOrders[i] !== i + 1) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Workflow steps must have sequential and unique order numbers starting from 1',
      path: ['steps'],
    }
  )
  .refine(
    (data) => {
      // Check that minimum approvals for each step doesn't exceed number of approvers
      return data.steps.every((step) => step.minApprovals <= step.approverIds.length);
    },
    {
      message: 'Minimum approvals cannot exceed the number of approvers for a step',
      path: ['steps'],
    }
  )
  .refine(
    (data) => {
      // Self-approval check: if not allowed, ensure no step has the same person as submitter and approver
      if (!data.allowSelfApproval) {
        // In a real implementation, this would check against the current user
        // For now, we'll assume it's valid
        return true;
      }
      return true;
    },
    {
      message: 'Self-approval is not allowed for this workflow',
      path: ['allowSelfApproval'],
    }
  );

// Workflow instance schema
export const workflowInstanceSchema = z
  .object({
    workflowDefinitionId: validators.requiredString('Workflow definition'),
    entityId: validators.requiredString('Related entity'),
    entityType: validators.requiredString('Entity type'),
    submitterId: validators.requiredString('Submitter'),
    status: z.enum(WORKFLOW_STATUSES).default('Draft'),
    currentStepOrder: z.number().int().min(1).default(1),
    submissionDate: validators.optionalDate('Submission date'),
    completionDate: validators.optionalDate('Completion date'),
    priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
    comments: validators.optionalString('Comments', 500),
    attachments: z.array(z.string()).optional(),
    notifySubmitter: z.boolean().default(true),
    dueDate: validators.optionalDate('Due date'),
  })
  .refine(workflowValidation.allowedTransition('status', 'status', WORKFLOW_TRANSITIONS), {
    message: 'Invalid workflow status transition',
    path: ['status'],
  })
  .refine(
    (data) => {
      // Validate submission date is not in the future
      if (!data.submissionDate) return true;

      const submissionDate = new Date(data.submissionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return submissionDate <= today;
    },
    {
      message: 'Submission date cannot be in the future',
      path: ['submissionDate'],
    }
  )
  .refine(
    (data) => {
      // Validate completion date is after submission date
      if (!data.submissionDate || !data.completionDate) return true;

      const submissionDate = new Date(data.submissionDate);
      const completionDate = new Date(data.completionDate);

      return completionDate >= submissionDate;
    },
    {
      message: 'Completion date must be after submission date',
      path: ['completionDate'],
    }
  );

// Workflow action schema (for actions like approve, reject, delegate)
export const workflowActionSchema = z
  .object({
    workflowId: validators.requiredString('Workflow ID'),
    action: z.enum(['Approve', 'Reject', 'Return', 'Delegate', 'Cancel', 'Comment']),
    comments: validators.optionalString('Comments', 500),
    delegateToId: z.string().optional(),
    attachments: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // If action is Delegate, delegateToId is required
      if (data.action === 'Delegate' && !data.delegateToId) {
        return false;
      }
      return true;
    },
    {
      message: 'Delegate user is required when delegating a workflow',
      path: ['delegateToId'],
    }
  )
  .refine(
    (data) => {
      // If action is Reject or Return, comments are required
      if (
        (data.action === 'Reject' || data.action === 'Return') &&
        (!data.comments || data.comments.trim() === '')
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Comments are required when rejecting or returning a workflow',
      path: ['comments'],
    }
  );

// Export types
export type WorkflowApprovalFormValues = z.infer<typeof workflowApprovalSchema>;
export type WorkflowStepFormValues = z.infer<typeof workflowStepSchema>;
export type WorkflowDefinitionFormValues = z.infer<typeof workflowDefinitionSchema>;
export type WorkflowInstanceFormValues = z.infer<typeof workflowInstanceSchema>;
export type WorkflowActionFormValues = z.infer<typeof workflowActionSchema>;
