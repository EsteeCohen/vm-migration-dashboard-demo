import {
  PageSection,
  Title,
  Card,
  CardTitle,
  CardBody,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  Content,
  Alert,
  Label,
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { useMigrations } from '../hooks/useMigrations';
import { t } from '../i18n';

interface KubeVirtVM {
  name: string;
  status: 'Running' | 'Stopped' | 'Pending';
  cpu: number;
  memory: string;
  phase: string;
}

interface KubernetesPod {
  name: string;
  status: 'Running' | 'Pending' | 'Failed';
  restarts: number;
  uptime: string;
}

export function ClusterPage() {
  const { plans, vms } = useMigrations();

  const migratedVMs = plans
    .filter((p) => p.status === 'succeeded')
    .flatMap((p) => p.vms)
    .reduce((acc, vmId) => {
      if (!acc.includes(vmId)) acc.push(vmId);
      return acc;
    }, [] as string[]);

  const vmDetails = vms
    .filter((v) => migratedVMs.includes(v.id))
    .map((v) => ({
      name: v.name,
      status: v.powerState === 'on' ? ('Running' as const) : ('Stopped' as const),
      cpu: v.cpu,
      memory: `${v.memoryGB} GB`,
      phase: 'Running',
    }));

  const kubeVirtVMs: KubeVirtVM[] = vmDetails;

  const kubernetesPods: KubernetesPod[] = [
    { name: 'etcd-0', status: 'Running', restarts: 0, uptime: '45 days' },
    { name: 'kube-apiserver-master-0', status: 'Running', restarts: 2, uptime: '32 days' },
    { name: 'kube-controller-master-0', status: 'Running', restarts: 1, uptime: '32 days' },
    { name: 'kube-scheduler-master-0', status: 'Running', restarts: 0, uptime: '32 days' },
    { name: 'dns-default', status: 'Running', restarts: 0, uptime: '45 days' },
  ];

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="xl">{t('nav.cluster') || 'KubeVirt Cluster'}</Title>
        <Content component="p" style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)' }}>
          View migrated VMs as KubeVirt VirtualMachine objects and Kubernetes native pods running side-by-side.
        </Content>
      </PageSection>

      {kubeVirtVMs.length === 0 && (
        <PageSection hasBodyWrapper={false}>
          <Alert variant="info" isInline title="No migrated VMs yet">
            Complete a migration plan to see KubeVirt VMs running in the cluster.
          </Alert>
        </PageSection>
      )}

      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>
          <GridItem md={6}>
            <Card>
              <CardTitle>KubeVirt Virtual Machines</CardTitle>
              <CardBody>
                {kubeVirtVMs.length === 0 ? (
                  <Content component="p" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                    No VMs migrated yet. KubeVirt allows traditional VMs to run alongside containers.
                  </Content>
                ) : (
                  <Table aria-label="KubeVirt VMs table" variant="compact">
                    <caption>Migrated VMs running as KubeVirt VirtualMachine objects</caption>
                    <Thead>
                      <Tr>
                        <Th scope="col">VM Name</Th>
                        <Th scope="col">Status</Th>
                        <Th scope="col">CPU</Th>
                        <Th scope="col">Memory</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {kubeVirtVMs.map((vm) => (
                        <Tr key={vm.name}>
                          <Td dataLabel="VM Name">{vm.name}</Td>
                          <Td dataLabel="Status">
                            <Label color={vm.status === 'Running' ? 'green' : 'grey'}>
                              {vm.status}
                            </Label>
                          </Td>
                          <Td dataLabel="CPU">{vm.cpu}</Td>
                          <Td dataLabel="Memory">{vm.memory}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={6}>
            <Card isFullHeight>
              <CardTitle>Kubernetes Control Plane Pods</CardTitle>
              <CardBody>
                <Table aria-label="Kubernetes pods table" variant="compact">
                  <caption>Native Kubernetes pods running in the cluster</caption>
                  <Thead>
                    <Tr>
                      <Th scope="col">Pod Name</Th>
                      <Th scope="col">Status</Th>
                      <Th scope="col">Uptime</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {kubernetesPods.map((pod) => (
                      <Tr key={pod.name}>
                        <Td dataLabel="Pod Name">{pod.name}</Td>
                        <Td dataLabel="Status">
                          <Label
                            color={
                              pod.status === 'Running'
                                ? 'green'
                                : pod.status === 'Pending'
                                  ? 'orange'
                                  : 'red'
                            }
                          >
                            {pod.status}
                          </Label>
                        </Td>
                        <Td dataLabel="Uptime">{pod.uptime}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <Card>
              <CardTitle>About This View</CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <strong>KubeVirt</strong> is an open-source project (part of Red Hat's virtualization strategy)
                    that allows you to run VMs natively in Kubernetes using the KubeVirt operator.
                  </FlexItem>
                  <FlexItem>
                    <strong>What you see here:</strong> Migrated VMs run as KubeVirt VirtualMachine objects in the
                    same cluster as your Kubernetes workloads, enabling hybrid VM + container deployments.
                  </FlexItem>
                  <FlexItem>
                    <strong>In production:</strong> You'd see real KubeVirt VirtualMachine CRDs from kubectl, live pod
                    metrics, and integrated management between VMs and containers.
                  </FlexItem>
                  <FlexItem>
                    <a href="https://github.com/kubevirt/kubevirt" target="_blank" rel="noopener noreferrer">
                      Learn more about KubeVirt →
                    </a>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
}
