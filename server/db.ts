import { JSONFileSync } from 'lowdb/node';
import { Low } from 'lowdb';
import type { Provider, VM, MigrationPlan, MigrationStep } from '../src/types/migration.js';

interface Database {
  providers: Provider[];
  vms: VM[];
  plans: MigrationPlan[];
}

const mockProviders: Provider[] = [
  { id: 'prov-vmware-prod', kind: 'vmware', name: 'vmware-prod', url: 'https://vcenter.prod.example.com', status: 'ready', vmCount: 142 },
  { id: 'prov-vmware-dev', kind: 'vmware', name: 'vmware-dev', url: 'https://vcenter.dev.example.com', status: 'ready', vmCount: 38 },
  { id: 'prov-ovirt-dc1', kind: 'ovirt', name: 'rhv-datacenter-1', url: 'https://rhvm.dc1.example.com', status: 'error', vmCount: 64 },
  { id: 'prov-openstack-west', kind: 'openstack', name: 'openstack-west', url: 'https://keystone.west.example.com:5000', status: 'ready', vmCount: 27 },
  { id: 'prov-ocp-target', kind: 'openshift', name: 'ocp-cluster-prod', url: 'https://api.ocp.prod.example.com:6443', status: 'ready', vmCount: 0 },
  { id: 'prov-ocp-staging', kind: 'openshift', name: 'ocp-cluster-staging', url: 'https://api.ocp.staging.example.com:6443', status: 'unknown', vmCount: 0 },
];

const mockVMs: VM[] = [
  { id: 'vm-001', name: 'web-server-prod-01', sourceProvider: 'prov-vmware-prod', cpu: 4, memoryGB: 8, diskGB: 100, powerState: 'on', os: 'RHEL 8.6' },
  { id: 'vm-002', name: 'web-server-prod-02', sourceProvider: 'prov-vmware-prod', cpu: 4, memoryGB: 8, diskGB: 100, powerState: 'on', os: 'RHEL 8.6' },
  { id: 'vm-003', name: 'db-replica-eu', sourceProvider: 'prov-vmware-prod', cpu: 8, memoryGB: 32, diskGB: 500, powerState: 'on', os: 'RHEL 9.1' },
  { id: 'vm-004', name: 'db-primary', sourceProvider: 'prov-vmware-prod', cpu: 16, memoryGB: 64, diskGB: 2000, powerState: 'on', os: 'RHEL 9.1' },
  { id: 'vm-005', name: 'legacy-auth-svc', sourceProvider: 'prov-vmware-prod', cpu: 2, memoryGB: 4, diskGB: 50, powerState: 'on', os: 'CentOS 7' },
  { id: 'vm-006', name: 'legacy-billing-svc', sourceProvider: 'prov-vmware-prod', cpu: 2, memoryGB: 4, diskGB: 80, powerState: 'suspended', os: 'CentOS 7' },
  { id: 'vm-007', name: 'k8s-worker-node-1', sourceProvider: 'prov-vmware-dev', cpu: 8, memoryGB: 16, diskGB: 200, powerState: 'on', os: 'RHEL CoreOS 4.13' },
  { id: 'vm-008', name: 'k8s-worker-node-2', sourceProvider: 'prov-vmware-dev', cpu: 8, memoryGB: 16, diskGB: 200, powerState: 'on', os: 'RHEL CoreOS 4.13' },
  { id: 'vm-009', name: 'ci-runner-large', sourceProvider: 'prov-vmware-dev', cpu: 4, memoryGB: 8, diskGB: 150, powerState: 'on', os: 'Ubuntu 22.04' },
  { id: 'vm-010', name: 'ci-runner-small', sourceProvider: 'prov-vmware-dev', cpu: 2, memoryGB: 4, diskGB: 50, powerState: 'on', os: 'Ubuntu 22.04' },
  { id: 'vm-011', name: 'monitoring-grafana', sourceProvider: 'prov-ovirt-dc1', cpu: 4, memoryGB: 8, diskGB: 100, powerState: 'on', os: 'RHEL 8.6' },
  { id: 'vm-012', name: 'monitoring-prometheus', sourceProvider: 'prov-ovirt-dc1', cpu: 4, memoryGB: 16, diskGB: 300, powerState: 'on', os: 'RHEL 8.6' },
  { id: 'vm-013', name: 'mail-relay', sourceProvider: 'prov-ovirt-dc1', cpu: 2, memoryGB: 4, diskGB: 50, powerState: 'on', os: 'RHEL 9.1' },
  { id: 'vm-014', name: 'vpn-gateway', sourceProvider: 'prov-ovirt-dc1', cpu: 2, memoryGB: 4, diskGB: 40, powerState: 'on', os: 'CentOS Stream 9' },
  { id: 'vm-015', name: 'nfs-storage-01', sourceProvider: 'prov-openstack-west', cpu: 4, memoryGB: 8, diskGB: 5000, powerState: 'on', os: 'RHEL 8.6' },
  { id: 'vm-016', name: 'api-gateway', sourceProvider: 'prov-openstack-west', cpu: 4, memoryGB: 8, diskGB: 80, powerState: 'on', os: 'RHEL 9.1' },
  { id: 'vm-017', name: 'cache-redis-01', sourceProvider: 'prov-openstack-west', cpu: 4, memoryGB: 16, diskGB: 100, powerState: 'on', os: 'Ubuntu 22.04' },
  { id: 'vm-018', name: 'cache-redis-02', sourceProvider: 'prov-openstack-west', cpu: 4, memoryGB: 16, diskGB: 100, powerState: 'on', os: 'Ubuntu 22.04' },
  { id: 'vm-019', name: 'batch-processor-01', sourceProvider: 'prov-vmware-prod', cpu: 8, memoryGB: 32, diskGB: 200, powerState: 'off', os: 'RHEL 9.1' },
  { id: 'vm-020', name: 'log-aggregator', sourceProvider: 'prov-vmware-prod', cpu: 4, memoryGB: 8, diskGB: 1000, powerState: 'on', os: 'RHEL 8.6' },
];

const mockPlans: MigrationPlan[] = [
  {
    id: 'plan-001', name: 'web-tier-migration', description: 'Migrate production web servers to OpenShift cluster',
    source: 'prov-vmware-prod', target: 'prov-ocp-target', vms: ['vm-001', 'vm-002'],
    networkMap: { id: 'nm-001', name: 'prod-network-map', sourceNetwork: 'VM Network', targetNetwork: 'pod-network' },
    storageMap: { id: 'sm-001', name: 'prod-storage-map', sourceStorage: 'datastore-ssd', targetStorage: 'ocs-storagecluster-ceph-rbd' },
    status: 'succeeded', progress: 100, createdAt: '2025-05-10T09:00:00Z',
    steps: [
      { vmId: 'vm-001', phase: 'completed', progressPercent: 100, startedAt: '2025-05-10T09:05:00Z', completedAt: '2025-05-10T11:32:00Z' },
      { vmId: 'vm-002', phase: 'completed', progressPercent: 100, startedAt: '2025-05-10T09:05:00Z', completedAt: '2025-05-10T11:45:00Z' },
    ],
  },
  {
    id: 'plan-002', name: 'db-cluster-migration', description: 'Live migration of primary and replica database servers',
    source: 'prov-vmware-prod', target: 'prov-ocp-target', vms: ['vm-003', 'vm-004'],
    networkMap: { id: 'nm-001', name: 'prod-network-map', sourceNetwork: 'VM Network', targetNetwork: 'pod-network' },
    storageMap: { id: 'sm-001', name: 'prod-storage-map', sourceStorage: 'datastore-ssd', targetStorage: 'ocs-storagecluster-ceph-rbd' },
    status: 'running', progress: 62, createdAt: '2025-05-20T14:00:00Z',
    steps: [
      { vmId: 'vm-003', phase: 'cutover', progressPercent: 80, startedAt: '2025-05-20T14:10:00Z' },
      { vmId: 'vm-004', phase: 'precopy', progressPercent: 45, startedAt: '2025-05-20T14:10:00Z' },
    ],
  },
  {
    id: 'plan-003', name: 'legacy-services-migration', description: 'Migrate legacy CentOS 7 services before EOL',
    source: 'prov-vmware-prod', target: 'prov-ocp-target', vms: ['vm-005', 'vm-006'],
    networkMap: { id: 'nm-001', name: 'prod-network-map', sourceNetwork: 'VM Network', targetNetwork: 'pod-network' },
    storageMap: { id: 'sm-001', name: 'prod-storage-map', sourceStorage: 'datastore-ssd', targetStorage: 'ocs-storagecluster-ceph-rbd' },
    status: 'failed', progress: 32, createdAt: '2025-05-15T10:00:00Z',
    steps: [
      { vmId: 'vm-005', phase: 'failed', progressPercent: 32, error: 'Disk conversion failed: source disk is locked by another process', startedAt: '2025-05-15T10:05:00Z' },
      { vmId: 'vm-006', phase: 'pending', progressPercent: 0 },
    ],
  },
  {
    id: 'plan-004', name: 'dev-k8s-workers', description: 'Move dev Kubernetes worker nodes to OCP staging',
    source: 'prov-vmware-dev', target: 'prov-ocp-staging', vms: ['vm-007', 'vm-008'],
    networkMap: { id: 'nm-002', name: 'dev-network-map', sourceNetwork: 'Dev Network', targetNetwork: 'pod-network' },
    storageMap: { id: 'sm-002', name: 'dev-storage-map', sourceStorage: 'datastore-hdd', targetStorage: 'ocs-storagecluster-ceph-rbd' },
    status: 'ready', progress: 0, createdAt: '2025-05-21T08:00:00Z',
    steps: [
      { vmId: 'vm-007', phase: 'pending', progressPercent: 0 },
      { vmId: 'vm-008', phase: 'pending', progressPercent: 0 },
    ],
  },
  {
    id: 'plan-005', name: 'monitoring-stack', description: 'Relocate monitoring infrastructure from oVirt to OCP',
    source: 'prov-ovirt-dc1', target: 'prov-ocp-target', vms: ['vm-011', 'vm-012'],
    networkMap: { id: 'nm-003', name: 'ovirt-network-map', sourceNetwork: 'ovirtmgmt', targetNetwork: 'pod-network' },
    storageMap: { id: 'sm-003', name: 'ovirt-storage-map', sourceStorage: 'data', targetStorage: 'ocs-storagecluster-ceph-rbd' },
    status: 'draft', progress: 0, createdAt: '2025-05-22T07:30:00Z',
    steps: [
      { vmId: 'vm-011', phase: 'pending', progressPercent: 0 },
      { vmId: 'vm-012', phase: 'pending', progressPercent: 0 },
    ],
  },
  {
    id: 'plan-006', name: 'ci-runners-migration', description: 'Migrate CI/CD runners to reduce infrastructure costs',
    source: 'prov-vmware-dev', target: 'prov-ocp-staging', vms: ['vm-009', 'vm-010'],
    networkMap: { id: 'nm-002', name: 'dev-network-map', sourceNetwork: 'Dev Network', targetNetwork: 'pod-network' },
    storageMap: { id: 'sm-002', name: 'dev-storage-map', sourceStorage: 'datastore-hdd', targetStorage: 'ocs-storagecluster-ceph-rbd' },
    status: 'running', progress: 77, createdAt: '2025-05-21T16:00:00Z',
    steps: [
      { vmId: 'vm-009', phase: 'cutover', progressPercent: 90, startedAt: '2025-05-21T16:05:00Z' },
      { vmId: 'vm-010', phase: 'cutover', progressPercent: 64, startedAt: '2025-05-21T16:05:00Z' },
    ],
  },
  {
    id: 'plan-007', name: 'cache-layer-migration', description: 'Move Redis cache cluster from OpenStack to OCP',
    source: 'prov-openstack-west', target: 'prov-ocp-target', vms: ['vm-017', 'vm-018'],
    status: 'draft', progress: 0, createdAt: '2025-05-22T11:00:00Z',
    steps: [
      { vmId: 'vm-017', phase: 'pending', progressPercent: 0 },
      { vmId: 'vm-018', phase: 'pending', progressPercent: 0 },
    ],
  },
];

let db: Low<Database>;

export async function initDb() {
  const adapter = new JSONFileSync<Database>('.db/db.json');
  db = new Low<Database>(adapter, { providers: mockProviders, vms: mockVMs, plans: mockPlans });
  await db.read();
  if (!db.data.providers || db.data.providers.length === 0) {
    db.data.providers = mockProviders;
    db.data.vms = mockVMs;
    db.data.plans = mockPlans;
    await db.write();
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export async function updatePlan(planId: string, updates: Partial<MigrationPlan>) {
  const db = getDb();
  const plan = db.data.plans.find((p) => p.id === planId);
  if (!plan) throw new Error(`Plan ${planId} not found`);
  Object.assign(plan, updates);
  await db.write();
  return plan;
}
