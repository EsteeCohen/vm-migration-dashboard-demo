import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlanStatusBadge, ProviderStatusBadge } from '../components/StatusBadge';

describe('PlanStatusBadge', () => {
  it('renders succeeded label in green', () => {
    render(<PlanStatusBadge status="succeeded" />);
    expect(screen.getByText('Succeeded')).toBeInTheDocument();
  });

  it('renders failed label', () => {
    render(<PlanStatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders running label', () => {
    render(<PlanStatusBadge status="running" />);
    expect(screen.getByText('Running')).toBeInTheDocument();
  });

  it('renders draft label', () => {
    render(<PlanStatusBadge status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders ready label', () => {
    render(<PlanStatusBadge status="ready" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });
});

describe('ProviderStatusBadge', () => {
  it('renders ready status', () => {
    render(<ProviderStatusBadge status="ready" />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('renders error status', () => {
    render(<ProviderStatusBadge status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders unknown status', () => {
    render(<ProviderStatusBadge status="unknown" />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});