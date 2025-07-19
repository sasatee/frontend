import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, type InputProps } from './input';

export interface FloatingInputProps extends Omit<InputProps, 'className'> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  inputClassName?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ value, onChange, onBlur, className, inputClassName, ...props }, ref) => {
    const [isFilled, setIsFilled] = React.useState(!!value);

    React.useEffect(() => {
      setIsFilled(!!value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsFilled(!!e.target.value);
      onChange?.(e);
    };

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        data-filled={isFilled}
        className={cn('h-auto bg-transparent px-0 py-0', inputClassName)}
        {...props}
      />
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export { FloatingInput };
