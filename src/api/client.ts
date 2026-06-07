import type { Provider, VM, MigrationPlan, User } from '../types/migration';

const API = '/api';

const token = () => {
  try { return localStorage.getItem('auth_token'); } catch { return null; }
};

const authHeaders = (): Record<string, string> => {
  const t = token();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const json = (res: Response) => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const apiClient = {
  // ── Auth ──────────────────────────────────────────────────
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async me(): Promise<User> {
    return fetch(`${API}/auth/me`, { headers: authHeaders() }).then(json);
  },

  async logout(): Promise<void> {
    await fetch(`${API}/auth/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
  },

  async register(displayName: string, username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(err.error ?? 'Registration failed');
    }
    return res.json();
  },

  async googleAuth(credential: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) throw new Error('Google authentication failed');
    return res.json();
  },

  // ── Providers ─────────────────────────────────────────────
  async getProviders(): Promise<Provider[]> {
    return fetch(`${API}/providers`).then(json);
  },

  async createProvider(data: { name: string; kind: Provider['kind']; url: string }): Promise<Provider> {
    const res = await fetch(`${API}/providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create provider');
    return res.json();
  },

  async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider> {
    const res = await fetch(`${API}/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update provider');
    return res.json();
  },

  async deleteProvider(id: string): Promise<void> {
    const res = await fetch(`${API}/providers/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete provider');
  },

  // ── VMs ───────────────────────────────────────────────────
  async getVMs(): Promise<VM[]> {
    return fetch(`${API}/vms`).then(json);
  },

  // ── Plans ─────────────────────────────────────────────────
  async getPlans(): Promise<MigrationPlan[]> {
    return fetch(`${API}/plans`).then(json);
  },

  async getPlan(id: string): Promise<MigrationPlan> {
    return fetch(`${API}/plans/${id}`).then(json);
  },

  async createPlan(plan: Omit<MigrationPlan, 'id' | 'createdAt'>): Promise<MigrationPlan> {
    const res = await fetch(`${API}/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(plan),
    });
    if (!res.ok) throw new Error('Failed to create plan');
    return res.json();
  },

  async updatePlan(id: string, updates: Partial<MigrationPlan>): Promise<MigrationPlan> {
    const res = await fetch(`${API}/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update plan');
    return res.json();
  },

  subscribeToPlanEvents(
    planId: string,
    onUpdate: (data: unknown) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const eventSource = new EventSource(`${API}/plans/${planId}/events`);
    eventSource.onmessage = (e) => {
      try { onUpdate(JSON.parse(e.data)); }
      catch (err) { onError?.(err as Error); }
    };
    eventSource.onerror = () => {
      eventSource.close();
      onError?.(new Error('SSE connection closed'));
    };
    return () => eventSource.close();
  },
};
