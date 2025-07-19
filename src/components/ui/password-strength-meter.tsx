import * as React from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, className }) => {
  // Calculate password strength
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Complexity checks
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[0-9]/.test(password)) strength += 1; // Numbers
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1; // Special characters

    // Cap at 5 for UI purposes
    return Math.min(strength, 5);
  };

  const strength = getPasswordStrength(password);

  // Get color based on strength
  const getColor = (strength: number): string => {
    if (strength === 0) return 'bg-muted';
    if (strength === 1) return 'bg-destructive';
    if (strength === 2) return 'bg-destructive/80';
    if (strength === 3) return 'bg-warning';
    if (strength === 4) return 'bg-success/80';
    return 'bg-success';
  };

  // Get label based on strength
  const getLabel = (strength: number): string => {
    if (strength === 0) return 'No Password';
    if (strength === 1) return 'Very Weak';
    if (strength === 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex h-2 items-center gap-1">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={cn(
              'h-full flex-1 rounded-full transition-all',
              index <= strength ? getColor(strength) : 'bg-muted'
            )}
          />
        ))}
      </div>
      {password && (
        <p className="text-xs text-muted-foreground">
          Password strength: <span className="font-medium">{getLabel(strength)}</span>
        </p>
      )}
    </div>
  );
};

export { PasswordStrengthMeter };
