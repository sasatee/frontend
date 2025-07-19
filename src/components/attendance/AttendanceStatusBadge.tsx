import { Badge } from '@/components/ui/badge';
import { calculateAttendanceStatus, getStatusBadgeVariant } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
  checkInTime?: string | null;
  checkOutTime?: string | null;
  expectedTime?: string;
}

export function AttendanceStatusBadge({
  checkInTime,
  checkOutTime,
  expectedTime = '09:00',
}: AttendanceStatusBadgeProps) {
  // Calculate status based on check-in/check-out times
  const status = calculateAttendanceStatus(
    checkInTime || '',
    checkOutTime || '',
    expectedTime
  );

  const variant = getStatusBadgeVariant(status);

  return <Badge variant={variant}>{status}</Badge>;
}
