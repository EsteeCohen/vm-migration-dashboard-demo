const strings: Record<string, string> = {
  'nav.dashboard': 'Dashboard',
  'nav.providers': 'Providers',
  'nav.plans': 'Migration Plans',
  'dashboard.title': 'Dashboard',
  'dashboard.totalPlans': 'Total Plans',
  'dashboard.running': 'Running',
  'dashboard.completed': 'Completed',
  'dashboard.failed': 'Failed',
  'plan.create.title': 'Create Migration Plan',
  'plan.status.draft': 'Draft',
  'plan.status.ready': 'Ready',
  'plan.status.running': 'Running',
  'plan.status.succeeded': 'Succeeded',
  'plan.status.failed': 'Failed',
  'provider.status.ready': 'Ready',
  'provider.status.error': 'Error',
  'provider.status.critical': 'Critical',
  'provider.status.unknown': 'Unknown',
  'action.startMigration': 'Start Migration',
  'action.createPlan': 'Create Plan',
  'action.addProvider': 'Add Provider',
  'emptyState.noPlans': 'No migration plans yet',
  'emptyState.noProviders': 'No providers configured',
  'emptyState.noPlansBody': 'Create your first migration plan to get started.',
  'emptyState.noProvidersBody': 'Add a source and target provider to begin migrating VMs.',
};

export function t(key: string): string {
  return strings[key] ?? key;
}