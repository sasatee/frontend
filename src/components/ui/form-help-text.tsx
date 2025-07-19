import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormHelpTextProps {
  text: string;
  className?: string;
  inline?: boolean;
  icon?: boolean;
  id?: string;
}

export function FormHelpText({
  text,
  className,
  inline = false,
  icon = true,
  id,
}: FormHelpTextProps) {
  if (icon) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center text-muted-foreground hover:text-foreground focus:outline-none',
                inline ? 'ml-1' : '',
                className
              )}
              onClick={(e) => e.preventDefault()}
              aria-label="Help information"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <p
      id={id}
      className={cn(
        'mt-1 text-xs text-muted-foreground',
        inline ? 'ml-1 inline-block' : '',
        className
      )}
    >
      {text}
    </p>
  );
}
