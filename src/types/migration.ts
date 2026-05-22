export type ProviderKind = 'vmware' | 'ovirt' | 'openstack' | 'openshift';
export type ProviderStatus = 'ready' | 'error' | 'critical' | 'unknown';

export interface Provider {
  id: string;
  kind: ProviderKind;
  name: string;
  url: string;
  status: ProviderStatus;
  vmCount: number;
}

export interface VM {
  id: string;
  name: string;
  sourceProvider: string;
  cpu: number;
  memoryGB: number;
  diskGB: number;
  powerState: 'on' | 'off' | 'suspended';
  os: string;
}

export interface NetworkMapping {
  id: string;
  name: string;
  sourceNetwork: string;
  targetNetwork: string;
}

export interface StorageMapping {
  id: string;
  name: string;
  sourceStorage: string;
  targetStorage: string;
}

export type PlanStatus = 'draft' | 'ready' | 'running' | 'succeeded' | 'failed';

export interface MigrationStep {
  vmId: string;
  phase: 'pending' | 'precopy' | 'cutover' | 'completed' | 'failed';
  progressPercent: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  source: string;
  target: string;
  vms: string[];
  networkMap?: NetworkMapping;
  storageMap?: StorageMapping;
  status: PlanStatus;
  progress: number;
  createdAt: string;
  steps: MigrationStep[];
}