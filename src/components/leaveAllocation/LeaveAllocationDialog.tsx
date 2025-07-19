import React from 'react';
import LeaveAllocationForm from './LeaveAllocationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { LeaveAllocationPayload } from '../../types/leaveAllocation';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LeaveAllocationPayload) => Promise<void>;
  initialValues?: Partial<LeaveAllocationPayload>;
}

const LeaveAllocationDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onSubmit,
  initialValues,
}) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Leave Allocation</DialogTitle>
          <DialogDescription>Enter the details for the new leave allocation.</DialogDescription>
        </DialogHeader>
        <LeaveAllocationForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LeaveAllocationDialog;
