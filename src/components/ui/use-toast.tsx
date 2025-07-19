import * as React from 'react';
import { useEffect, useState } from 'react';

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';
import { ToastIcon } from '@/components/ui/toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: string;
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, duration: number = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId));
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

function toast({ ...props }: Toast) {
  const id = genId();

  // Determine variant based on toast type if not explicitly set
  if (!props.variant) {
    if (
      props.title?.toString().toLowerCase().includes('error') ||
      props.description?.toString().toLowerCase().includes('error')
    ) {
      props.variant = 'destructive';
    } else if (
      props.title?.toString().toLowerCase().includes('success') ||
      props.description?.toString().toLowerCase().includes('success')
    ) {
      props.variant = 'success';
    } else if (
      props.title?.toString().toLowerCase().includes('warning') ||
      props.description?.toString().toLowerCase().includes('warning')
    ) {
      props.variant = 'warning';
    } else if (
      props.title?.toString().toLowerCase().includes('info') ||
      props.description?.toString().toLowerCase().includes('info')
    ) {
      props.variant = 'info';
    }
  }

  // Add icon to description if variant is set
  if (props.variant && props.variant !== 'default') {
    const icon = <ToastIcon variant={props.variant} />;
    const description = props.description ? (
      <div className="flex items-start gap-2">
        {icon}
        <div>{props.description}</div>
      </div>
    ) : undefined;

    props.description = description;
  }

  const update = (props: ToasterToast) =>
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = useState<State>(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    success: (props: Omit<ToasterToast, 'id' | 'variant'>) =>
      toast({ ...props, variant: 'success' }),
    error: (props: Omit<ToasterToast, 'id' | 'variant'>) =>
      toast({ ...props, variant: 'destructive' }),
    warning: (props: Omit<ToasterToast, 'id' | 'variant'>) =>
      toast({ ...props, variant: 'warning' }),
    info: (props: Omit<ToasterToast, 'id' | 'variant'>) => toast({ ...props, variant: 'info' }),
  };
}

export { useToast, toast };
