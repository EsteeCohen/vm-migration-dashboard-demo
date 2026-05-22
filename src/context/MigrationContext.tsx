import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { Provider, VM, MigrationPlan, MigrationStep } from '../types/migration';
import { apiClient } from '../api/client';

interface State {
  providers: Provider[];
  vms: VM[];
  plans: MigrationPlan[];
  loading: boolean;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  variant: 'success' | 'danger' | 'info' | 'warning';
  title: string;
  body?: string;
}

type Action =
  | { type: 'LOAD_SUCCESS'; providers: Provider[]; vms: VM[]; plans: MigrationPlan[] }
  | { type: 'ADD_PLAN'; plan: MigrationPlan }
  | { type: 'UPDATE_PLAN'; plan: MigrationPlan }
  | { type: 'UPDATE_STEPS'; planId: string; steps: MigrationStep[]; progress: number; status: MigrationPlan['status'] }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { ...state, loading: false, providers: action.providers, vms: action.vms, plans: action.plans };
    case 'ADD_PLAN':
      return { ...state, plans: [action.plan, ...state.plans] };
    case 'UPDATE_PLAN':
      return { ...state, plans: state.plans.map(p => p.id === action.plan.id ? action.plan : p) };
    case 'UPDATE_STEPS':
      return {
        ...state,
        plans: state.plans.map(p =>
          p.id === action.planId
            ? { ...p, steps: action.steps, progress: action.progress, status: action.status }
            : p
        ),
      };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    default:
      return state;
  }
}

interface ContextValue {
  providers: Provider[];
  vms: VM[];
  plans: MigrationPlan[];
  loading: boolean;
  toasts: Toast[];
  addPlan: (plan: MigrationPlan) => void;
  updatePlan: (plan: MigrationPlan) => void;
  updateSteps: (planId: string, steps: MigrationStep[], progress: number, status: MigrationPlan['status']) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const MigrationContext = createContext<ContextValue | null>(null);

export function MigrationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    providers: [],
    vms: [],
    plans: [],
    loading: true,
    toasts: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [providers, vms, plans] = await Promise.all([
          apiClient.getProviders(),
          apiClient.getVMs(),
          apiClient.getPlans(),
        ]);
        dispatch({ type: 'LOAD_SUCCESS', providers, vms, plans });
      } catch (error) {
        console.error('Failed to load data:', error);
        dispatch({ type: 'ADD_TOAST', toast: { id: `toast-${Date.now()}`, variant: 'danger', title: 'Failed to load data' } });
      }
    })();
  }, []);

  const value: ContextValue = {
    ...state,
    addPlan: (plan) => dispatch({ type: 'ADD_PLAN', plan }),
    updatePlan: (plan) => dispatch({ type: 'UPDATE_PLAN', plan }),
    updateSteps: (planId, steps, progress, status) =>
      dispatch({ type: 'UPDATE_STEPS', planId, steps, progress, status }),
    addToast: (toast) =>
      dispatch({ type: 'ADD_TOAST', toast: { ...toast, id: `toast-${Date.now()}` } }),
    removeToast: (id) => dispatch({ type: 'REMOVE_TOAST', id }),
  };

  return <MigrationContext.Provider value={value}>{children}</MigrationContext.Provider>;
}

export function useMigrations() {
  const ctx = useContext(MigrationContext);
  if (!ctx) throw new Error('useMigrations must be used within MigrationProvider');
  return ctx;
}