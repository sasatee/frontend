import { Badge } from '@/components/ui/badge';
import { parseTime } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
  status?: string;
  checkInTime?: string | null;
  expectedTime?: string;
}

export function AttendanceStatusBadge({
  status,
  checkInTime,
  expectedTime = '09:00',
}: AttendanceStatusBadgeProps) {
  // If status is provided, use it
  if (status) {
    switch (status) {
      case 'Present':
        return <Badge variant="default">Present</Badge>;
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'HalfDay':
        return <Badge variant="warning">Half Day</Badge>;
      case 'OnLeave':
        return <Badge variant="secondary">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  // Fall back to check-in time logic if status is not provided
  // If no check-in time, show "Not Started"
  if (!checkInTime) {
    return <Badge variant="secondary">Not Started</Badge>;
  }

  const checkIn = parseTime(checkInTime);
  const expected = parseTime(expectedTime);

  // If either time is invalid, show "Invalid"
  if (!checkIn || !expected) {
    return <Badge variant="destructive">Invalid</Badge>;
  }

  const isLate = checkIn > expected;

  return <Badge variant={isLate ? 'destructive' : 'default'}>{isLate ? 'Late' : 'On Time'}</Badge>;
}
