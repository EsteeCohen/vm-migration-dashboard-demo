export type VmStatus = 'Pending' | 'Running' | 'Completed' | 'Failed';

export interface VM {
  id: string;
  name: string;
  provider: 'VMware' | 'RHV' | 'OpenStack';
  status: VmStatus;
  progress: number;
  lastUpdated: string;
}

export const mockVms: VM[] = [
  { id: 'vm-01', name: 'web-server-prod', provider: 'VMware', status: 'Completed', progress: 100, lastUpdated: '2026-05-18T10:00:00Z' },
  { id: 'vm-02', name: 'db-replica-eu', provider: 'RHV', status: 'Running', progress: 65, lastUpdated: '2026-05-18T10:05:00Z' },
  { id: 'vm-03', name: 'legacy-auth-svc', provider: 'VMware', status: 'Failed', progress: 32, lastUpdated: '2026-05-18T09:15:00Z' },
  { id: 'vm-04', name: 'k8s-worker-node1', provider: 'OpenStack', status: 'Running', progress: 88, lastUpdated: '2026-05-18T10:10:00Z' },
  { id: 'vm-05', name: 'ci-runner-large', provider: 'VMware', status: 'Pending', progress: 0, lastUpdated: '2026-05-18T10:12:00Z' },
];