import { LeaveType } from '@/types/leaveType';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';

export const getColumns = (
  onEdit: (leaveType: LeaveType) => void,
  onDelete: (leaveType: LeaveType) => void
): ColumnDef<LeaveType>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'defaultDays',
    header: 'Default Days',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue('defaultDays')}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const leaveType = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(leaveType)}
            aria-label={`Edit leave type ${leaveType.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(leaveType)}
            aria-label={`Delete leave type ${leaveType.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
