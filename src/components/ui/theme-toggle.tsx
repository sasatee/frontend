import * as React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { useTheme } from './theme-provider';
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from './tooltip';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <TooltipProvider>
      <TooltipRoot delayDuration={0}>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setTheme('light')}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                  {theme === 'light' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto h-4 w-4"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('dark')}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                  {theme === 'dark' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto h-4 w-4"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme('system')}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Laptop className="h-4 w-4" />
                  <span>System</span>
                  {theme === 'system' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto h-4 w-4"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Change theme</p>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
