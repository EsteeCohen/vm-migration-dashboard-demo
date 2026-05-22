import type { MigrationPlan, Provider, VM } from '../types/migration';

const MTV_NAMESPACE = 'openshift-mtv';
const MTV_API = 'forklift.konveyor.io/v1beta1';

const PROVIDER_TYPE: Record<string, string> = {
  vmware: 'vsphere',
  ovirt: 'ovirt',
  openstack: 'openstack',
  openshift: 'openshift',
};

function yamlDoc(obj: Record<string, unknown>): string {
  return serializeYaml(obj, 0);
}

function serializeYaml(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);

  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (value.includes('\n') || value.includes(':') || value.includes('#') || value === '') {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return '\n' + value
      .map((item) => `${pad}- ${serializeYaml(item, indent + 1).trimStart()}`)
      .join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined
    );
    if (entries.length === 0) return '{}';
    return '\n' + entries
      .map(([k, v]) => {
        const rendered = serializeYaml(v, indent + 1);
        if (rendered.startsWith('\n')) {
          return `${pad}${k}:${rendered}`;
        }
        return `${pad}${k}: ${rendered}`;
      })
      .join('\n');
  }
  return String(value);
}

function providerCRD(provider: Provider): string {
  return yamlDoc({
    apiVersion: MTV_API,
    kind: 'Provider',
    metadata: {
      name: provider.name,
      namespace: MTV_NAMESPACE,
      labels: { 'app.kubernetes.io/part-of': 'forklift' },
    },
    spec: {
      type: PROVIDER_TYPE[provider.kind] ?? provider.kind,
      url: provider.url,
      secret: {
        name: `${provider.name}-credentials`,
        namespace: MTV_NAMESPACE,
      },
    },
  });
}

function networkMapCRD(plan: MigrationPlan, source: Provider, target: Provider): string {
  if (!plan.networkMap) return '';
  return yamlDoc({
    apiVersion: MTV_API,
    kind: 'NetworkMap',
    metadata: {
      name: plan.networkMap.name,
      namespace: MTV_NAMESPACE,
    },
    spec: {
      map: [
        {
          source: { name: plan.networkMap.sourceNetwork },
          destination: { type: 'pod', name: plan.networkMap.targetNetwork },
        },
      ],
      provider: {
        source: { name: source.name, namespace: MTV_NAMESPACE },
        destination: { name: target.name, namespace: MTV_NAMESPACE },
      },
    },
  });
}

function storageMapCRD(plan: MigrationPlan, source: Provider, target: Provider): string {
  if (!plan.storageMap) return '';
  return yamlDoc({
    apiVersion: MTV_API,
    kind: 'StorageMap',
    metadata: {
      name: plan.storageMap.name,
      namespace: MTV_NAMESPACE,
    },
    spec: {
      map: [
        {
          source: { name: plan.storageMap.sourceStorage },
          destination: { storageClass: plan.storageMap.targetStorage },
        },
      ],
      provider: {
        source: { name: source.name, namespace: MTV_NAMESPACE },
        destination: { name: target.name, namespace: MTV_NAMESPACE },
      },
    },
  });
}

function planCRD(plan: MigrationPlan, source: Provider, target: Provider, vms: VM[]): string {
  return yamlDoc({
    apiVersion: MTV_API,
    kind: 'Plan',
    metadata: {
      name: plan.name,
      namespace: MTV_NAMESPACE,
      annotations: plan.description
        ? { 'forklift.konveyor.io/description': plan.description }
        : undefined,
    },
    spec: {
      description: plan.description || undefined,
      provider: {
        source: { name: source.name, namespace: MTV_NAMESPACE },
        destination: { name: target.name, namespace: MTV_NAMESPACE },
      },
      targetNamespace: 'migrated-vms',
      networkMap: plan.networkMap
        ? { name: plan.networkMap.name, namespace: MTV_NAMESPACE }
        : undefined,
      storageMap: plan.storageMap
        ? { name: plan.storageMap.name, namespace: MTV_NAMESPACE }
        : undefined,
      vms: vms.map((vm) => ({ id: vm.id, name: vm.name })),
    },
  });
}

function migrationCRD(plan: MigrationPlan): string {
  return yamlDoc({
    apiVersion: MTV_API,
    kind: 'Migration',
    metadata: {
      name: `${plan.name}-migration`,
      namespace: MTV_NAMESPACE,
    },
    spec: {
      plan: {
        name: plan.name,
        namespace: MTV_NAMESPACE,
      },
    },
  });
}

export function exportPlanAsYaml(
  plan: MigrationPlan,
  providers: Provider[],
  vms: VM[]
): string {
  const source = providers.find((p) => p.id === plan.source);
  const target = providers.find((p) => p.id === plan.target);
  if (!source || !target) return '# Error: provider not found';

  const planVMs = vms.filter((v) => plan.vms.includes(v.id));

  const docs = [
    `# Migration Toolkit for Virtualization — generated by Migration Toolkit Demo`,
    `# Apply with: kubectl apply -f ${plan.name}.yaml`,
    `# Real MTV docs: https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization`,
    '',
    providerCRD(source),
    '---',
    providerCRD(target),
  ];

  if (plan.networkMap) {
    docs.push('---', networkMapCRD(plan, source, target));
  }
  if (plan.storageMap) {
    docs.push('---', storageMapCRD(plan, source, target));
  }

  docs.push('---', planCRD(plan, source, target, planVMs));
  docs.push('---', migrationCRD(plan));

  return docs.join('\n');
}

export function downloadYaml(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/x-yaml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}