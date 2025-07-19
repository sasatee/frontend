import React, { useState, useEffect, forwardRef } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

// Mask types
type MaskType = 'phone' | 'currency' | 'date' | 'time' | 'custom';

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: MaskType | string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string, maskedValue: string) => void;
  placeholder?: string;
  className?: string;
  maskPlaceholder?: string;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    { mask, value = '', onChange, onValueChange, className, maskPlaceholder = '_', ...props },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<string>(value);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

    // Apply predefined masks
    const getMaskPattern = (maskType: MaskType | string): string => {
      switch (maskType) {
        case 'phone':
          return '+1 (999) 999-9999';
        case 'currency':
          return '999,999.99';
        case 'date':
          return '9999-99-99';
        case 'time':
          return '99:99';
        default:
          return maskType; // Custom mask
      }
    };

    const maskPattern = getMaskPattern(mask);

    // Format value according to mask
    const formatValue = (value: string): string => {
      if (!value) return '';

      let result = '';
      let valueIndex = 0;

      for (let i = 0; i < maskPattern.length && valueIndex < value.length; i++) {
        const maskChar = maskPattern[i];

        if (maskChar === '9') {
          // Only allow digits
          if (/\d/.test(value[valueIndex])) {
            result += value[valueIndex];
            valueIndex++;
          } else {
            // Skip non-digit characters in the input
            valueIndex++;
            i--;
          }
        } else if (maskChar === 'a') {
          // Only allow letters
          if (/[a-zA-Z]/.test(value[valueIndex])) {
            result += value[valueIndex];
            valueIndex++;
          } else {
            // Skip non-letter characters in the input
            valueIndex++;
            i--;
          }
        } else if (maskChar === '*') {
          // Allow any character
          result += value[valueIndex];
          valueIndex++;
        } else {
          // Add mask character to result
          result += maskChar;

          // If the next character in value matches the mask character, skip it
          if (value[valueIndex] === maskChar) {
            valueIndex++;
          }
        }
      }

      return result;
    };

    // Extract raw value (without mask characters)
    const extractRawValue = (maskedValue: string): string => {
      if (!maskedValue) return '';

      let result = '';
      let maskIndex = 0;

      for (let i = 0; i < maskedValue.length; i++) {
        const char = maskedValue[i];
        const maskChar = maskPattern[maskIndex] || '';

        if (maskChar === '9' || maskChar === 'a' || maskChar === '*') {
          result += char;
        }

        maskIndex++;
      }

      return result;
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const formattedValue = formatValue(newValue);

      // Save cursor position before React updates the input
      const input = e.target;
      setCursorPosition(input.selectionStart);

      setInputValue(formattedValue);

      // Call original onChange handler
      if (onChange) {
        e.target.value = formattedValue;
        onChange(e);
      }

      // Call onValueChange with both raw and masked values
      if (onValueChange) {
        onValueChange(extractRawValue(formattedValue), formattedValue);
      }
    };

    // Update input value when value prop changes
    useEffect(() => {
      if (value !== undefined) {
        setInputValue(formatValue(value));
      }
    }, [value]);

    // Restore cursor position after React updates the input
    useEffect(() => {
      if (cursorPosition !== null) {
        const input = ref as React.RefObject<HTMLInputElement>;
        if (input && input.current) {
          input.current.setSelectionRange(cursorPosition, cursorPosition);
        }
        setCursorPosition(null);
      }
    }, [inputValue, cursorPosition, ref]);

    return (
      <Input
        ref={ref}
        type="text"
        value={inputValue}
        onChange={handleChange}
        className={cn(className)}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };
