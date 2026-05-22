import type { Provider, VM, MigrationPlan } from '../types/migration';

const API = '/api';

export const apiClient = {
  async getProviders(): Promise<Provider[]> {
    return fetch(`${API}/providers`).then(r => r.json());
  },

  async getVMs(): Promise<VM[]> {
    return fetch(`${API}/vms`).then(r => r.json());
  },

  async getPlans(): Promise<MigrationPlan[]> {
    return fetch(`${API}/plans`).then(r => r.json());
  },

  async getPlan(id: string): Promise<MigrationPlan> {
    return fetch(`${API}/plans/${id}`).then(r => r.json());
  },

  async createPlan(plan: Omit<MigrationPlan, 'id' | 'createdAt'>): Promise<MigrationPlan> {
    const res = await fetch(`${API}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error('Failed to create plan');
    return res.json();
  },

  async updatePlan(id: string, updates: Partial<MigrationPlan>): Promise<MigrationPlan> {
    const res = await fetch(`${API}/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update plan');
    return res.json();
  },

  subscribeToPlanEvents(planId: string, onUpdate: (data: any) => void, onError?: (error: Error) => void): () => void {
    const eventSource = new EventSource(`${API}/plans/${planId}/events`);
    eventSource.onmessage = (e) => {
      try {
        onUpdate(JSON.parse(e.data));
      } catch (err) {
        onError?.(err as Error);
      }
    };
    eventSource.onerror = () => {
      eventSource.close();
      onError?.(new Error('SSE connection closed'));
    };
    return () => eventSource.close();
  },
};
