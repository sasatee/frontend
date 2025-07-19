import * as React from 'react';

interface AccessibilityContextType {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, assertive?: boolean) => void;
  /**
   * Set focus to a specific element by ID
   */
  focusById: (id: string) => void;
  /**
   * Set focus to a specific element by ref
   */
  focusByRef: (ref: React.RefObject<HTMLElement>) => void;
  /**
   * Return focus to the previously focused element
   */
  returnFocus: () => void;
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined);

export interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [announcements, setAnnouncements] = React.useState<
    Array<{ id: number; message: string; assertive: boolean }>
  >([]);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);
  const announcementTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const announcementIdRef = React.useRef(0);

  const announce = React.useCallback((message: string, assertive = false) => {
    const id = announcementIdRef.current++;
    setAnnouncements((prev) => [...prev, { id, message, assertive }]);

    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }, 3000);
  }, []);

  const focusById = React.useCallback((id: string) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    const element = document.getElementById(id);
    if (element) {
      element.focus();
    }
  }, []);

  const focusByRef = React.useCallback((ref: React.RefObject<HTMLElement>) => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  const returnFocus = React.useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  const value = React.useMemo(
    () => ({
      announce,
      focusById,
      focusByRef,
      returnFocus,
    }),
    [announce, focusById, focusByRef, returnFocus]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {announcements.map(({ id, message, assertive }) => (
        <div
          key={id}
          role={assertive ? 'alert' : 'status'}
          aria-live={assertive ? 'assertive' : 'polite'}
          className="sr-only"
        >
          {message}
        </div>
      ))}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
