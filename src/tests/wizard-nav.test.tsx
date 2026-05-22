import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PlanNewPage } from '../pages/PlanNewPage';
import type { Provider, VM } from '../types/migration';

const mockProviders: Provider[] = [
  { id: 'src1', kind: 'vmware', name: 'vmware-prod', url: 'https://vc.example.com', status: 'ready', vmCount: 2 },
  { id: 'tgt1', kind: 'openshift', name: 'ocp-prod', url: 'https://api.ocp.example.com', status: 'ready', vmCount: 0 },
];

const mockVMs: VM[] = [
  { id: 'vm1', name: 'web-01', sourceProvider: 'src1', cpu: 4, memoryGB: 8, diskGB: 100, powerState: 'on', os: 'RHEL 8' },
  { id: 'vm2', name: 'db-01', sourceProvider: 'src1', cpu: 8, memoryGB: 32, diskGB: 500, powerState: 'on', os: 'RHEL 9' },
];

vi.mock('../hooks/useMigrations', () => ({
  useMigrations: () => ({
    providers: mockProviders,
    vms: mockVMs,
    plans: [],
    loading: false,
    toasts: [],
    addPlan: vi.fn(),
    addToast: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/plans/new']}>
      <PlanNewPage />
    </MemoryRouter>
  );
}

describe('PlanNewPage wizard navigation', () => {
  it('renders step 1 (General) by default', () => {
    renderWizard();
    expect(screen.getByLabelText(/plan name/i)).toBeInTheDocument();
  });

  it('Next button is disabled on step 1 when name is empty', () => {
    renderWizard();
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });

  it('Next button stays disabled without source and target', async () => {
    renderWizard();
    const nameInput = screen.getByLabelText(/plan name/i);
    fireEvent.change(nameInput, { target: { value: 'my-plan' } });
    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();
  });

  it('wizard renders all 5 step nav items', () => {
    renderWizard();
    expect(screen.getAllByText('General').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Select VMs').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Network mapping').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Storage mapping').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Review & create').length).toBeGreaterThan(0);
  });
});