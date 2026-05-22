import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PlansPage } from '../pages/PlansPage';
import type { MigrationPlan, Provider } from '../types/migration';

const mockPlans: MigrationPlan[] = [
  {
    id: 'p1', name: 'running-plan', description: '', source: 'src1', target: 'tgt1',
    vms: ['vm1'], status: 'running', progress: 50, createdAt: '2025-05-20T00:00:00Z',
    steps: [{ vmId: 'vm1', phase: 'precopy', progressPercent: 50 }],
  },
  {
    id: 'p2', name: 'succeeded-plan', description: '', source: 'src1', target: 'tgt1',
    vms: ['vm2'], status: 'succeeded', progress: 100, createdAt: '2025-05-19T00:00:00Z',
    steps: [{ vmId: 'vm2', phase: 'completed', progressPercent: 100 }],
  },
  {
    id: 'p3', name: 'failed-plan', description: '', source: 'src1', target: 'tgt1',
    vms: ['vm3'], status: 'failed', progress: 30, createdAt: '2025-05-18T00:00:00Z',
    steps: [{ vmId: 'vm3', phase: 'failed', progressPercent: 30, error: 'disk locked' }],
  },
];

const mockProviders: Provider[] = [
  { id: 'src1', kind: 'vmware', name: 'vmware-prod', url: 'https://vc.example.com', status: 'ready', vmCount: 10 },
  { id: 'tgt1', kind: 'openshift', name: 'ocp-prod', url: 'https://api.ocp.example.com', status: 'ready', vmCount: 0 },
];

vi.mock('../hooks/useMigrations', () => ({
  useMigrations: () => ({
    plans: mockPlans,
    providers: mockProviders,
    vms: [],
    loading: false,
    toasts: [],
    addToast: vi.fn(),
  }),
}));

function renderPlansPage() {
  return render(
    <MemoryRouter initialEntries={['/plans']}>
      <PlansPage />
    </MemoryRouter>
  );
}

describe('PlansPage filtering', () => {
  it('shows all plans by default', () => {
    renderPlansPage();
    expect(screen.getByText('running-plan')).toBeInTheDocument();
    expect(screen.getByText('succeeded-plan')).toBeInTheDocument();
    expect(screen.getByText('failed-plan')).toBeInTheDocument();
  });

  it('shows the correct plan count', () => {
    renderPlansPage();
    const rows = screen.getAllByRole('row');
    // header row + 3 data rows
    expect(rows.length).toBe(4);
  });

  it('displays status badges for each plan', () => {
    renderPlansPage();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Succeeded')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows Create Plan button', () => {
    renderPlansPage();
    expect(screen.getByRole('button', { name: /create plan/i })).toBeInTheDocument();
  });
});