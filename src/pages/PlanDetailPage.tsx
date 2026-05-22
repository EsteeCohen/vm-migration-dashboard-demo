import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Button,
  Card,
  CardTitle,
  CardBody,
  Grid,
  GridItem,
  Progress,
  ProgressSize,
  Label,
  Flex,
  FlexItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Content,
  Divider,
  Skeleton,
  Alert,
  AlertActionLink,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@patternfly/react-table';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  PendingIcon,
  ClockIcon,
  DownloadIcon,
  RedoIcon,
} from '@patternfly/react-icons';
import { useMigrations } from '../hooks/useMigrations';
import { PlanStatusBadge } from '../components/StatusBadge';
import { t } from '../i18n';
import { exportPlanAsYaml, downloadYaml } from '../utils/yamlExport';
import type { MigrationStep } from '../types/migration';

function phaseIcon(phase: MigrationStep['phase']) {
  switch (phase) {
    case 'completed': return <CheckCircleIcon color="var(--pf-v6-global--success-color--100)" />;
    case 'failed': return <ExclamationCircleIcon color="var(--pf-v6-global--danger-color--100)" />;
    case 'cutover':
    case 'precopy': return <InProgressIcon color="var(--pf-v6-global--info-color--100)" />;
    default: return <PendingIcon color="var(--pf-v6-global--Color--200)" />;
  }
}

function phaseLabel(phase: MigrationStep['phase']) {
  return { pending: 'Pending', precopy: 'Pre-copy', cutover: 'Cutover', completed: 'Completed', failed: 'Failed' }[phase] ?? phase;
}

function generateLogLines(steps: MigrationStep[], vms: ReturnType<typeof useMigrations>['vms']): string[] {
  const lines: string[] = [];
  const now = Date.now();
  steps.forEach((step) => {
    const vm = vms.find((v) => v.id === step.vmId);
    const name = vm?.name ?? step.vmId;
    if (step.phase !== 'pending') {
      lines.push(`[${new Date(now - 3600000).toISOString()}] INFO  Starting migration for ${name}`);
      lines.push(`[${new Date(now - 3500000).toISOString()}] INFO  ${name}: disk transfer initiated (${vm?.diskGB ?? 0} GB)`);
    }
    if (step.phase === 'precopy' || step.phase === 'cutover' || step.phase === 'completed') {
      lines.push(`[${new Date(now - 2000000).toISOString()}] INFO  ${name}: pre-copy phase — ${step.progressPercent}% complete`);
    }
    if (step.phase === 'cutover' || step.phase === 'completed') {
      lines.push(`[${new Date(now - 600000).toISOString()}] INFO  ${name}: cutover initiated — pausing source VM`);
      lines.push(`[${new Date(now - 500000).toISOString()}] INFO  ${name}: final disk delta transferred`);
    }
    if (step.phase === 'completed') {
      lines.push(`[${new Date(now - 100000).toISOString()}] INFO  ${name}: VM created in target namespace`);
      lines.push(`[${new Date(now - 50000).toISOString()}] INFO  ${name}: migration completed successfully`);
    }
    if (step.phase === 'failed') {
      lines.push(`[${new Date(now - 100000).toISOString()}] ERROR ${name}: ${step.error ?? 'Unknown error occurred'}`);
      lines.push(`[${new Date(now - 50000).toISOString()}] ERROR ${name}: migration failed — rolling back`);
    }
  });
  return lines.sort();
}

export function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plans, vms, providers, loading, updateSteps, addToast } = useMigrations();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const plan = plans.find((p) => p.id === id);

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => () => stopInterval(), []);

  const handleStart = () => {
    if (!plan) return;
    if (plan.status !== 'ready' && plan.status !== 'draft') return;

    const initialSteps: MigrationStep[] = plan.vms.map((vmId) => ({
      vmId,
      phase: 'precopy' as const,
      progressPercent: 0,
      startedAt: new Date().toISOString(),
    }));
    updateSteps(plan.id, initialSteps, 0, 'running');
    addToast({ variant: 'info', title: 'Migration started', body: `"${plan.name}" is now running.` });

    let elapsed = 0;
    intervalRef.current = setInterval(() => {
      elapsed += 3;
      const updatedSteps: MigrationStep[] = plan.vms.map((vmId, idx) => {
        const offset = idx * 15;
        const progress = Math.min(100, elapsed - offset);
        let phase: MigrationStep['phase'] = 'precopy';
        if (progress <= 0) phase = 'pending';
        else if (progress < 60) phase = 'precopy';
        else if (progress < 90) phase = 'cutover';
        else if (progress >= 100) phase = 'completed';
        else phase = 'cutover';
        return {
          vmId,
          phase,
          progressPercent: Math.max(0, progress),
          startedAt: new Date().toISOString(),
          ...(phase === 'completed' ? { completedAt: new Date().toISOString() } : {}),
        };
      });
      const avgProgress = Math.round(updatedSteps.reduce((sum, s) => sum + s.progressPercent, 0) / updatedSteps.length);
      const allDone = updatedSteps.every((s) => s.phase === 'completed');
      updateSteps(plan.id, updatedSteps, avgProgress, allDone ? 'succeeded' : 'running');
      if (allDone) {
        stopInterval();
        addToast({ variant: 'success', title: 'Migration completed', body: `"${plan.name}" succeeded.` });
      }
    }, 500);
  };

  if (loading) {
    return (
      <PageSection hasBodyWrapper={false}>
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
          <Skeleton height="48px" width="300px" />
          <Skeleton height="200px" />
          <Skeleton height="300px" />
        </Flex>
      </PageSection>
    );
  }

  if (!plan) {
    return (
      <PageSection hasBodyWrapper={false}>
        <EmptyState>
          <EmptyStateBody>Migration plan not found.</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant="primary" onClick={() => navigate('/plans')}>
                Back to Plans
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    );
  }

  const source = providers.find((p) => p.id === plan.source);
  const target = providers.find((p) => p.id === plan.target);
  const planVMs = vms.filter((v) => plan.vms.includes(v.id));
  const logLines = generateLogLines(plan.steps, vms);
  const canStart = plan.status === 'ready' || plan.status === 'draft';
  const failedStep = plan.steps.find((s) => s.phase === 'failed');

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} flexWrap={{ default: 'wrap' }}>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
            <FlexItem>
              <Button variant="link" isInline onClick={() => navigate('/plans')} aria-label="Back to plans">
                ← Plans
              </Button>
            </FlexItem>
            <FlexItem>
              <Title headingLevel="h1" size="xl">{plan.name}</Title>
            </FlexItem>
            <FlexItem>
              <PlanStatusBadge status={plan.status} />
            </FlexItem>
          </Flex>
          <Flex gap={{ default: 'gapSm' }}>
            <FlexItem>
              <Button
                variant="secondary"
                icon={<DownloadIcon />}
                onClick={() => {
                  const yaml = exportPlanAsYaml(plan, providers, vms);
                  downloadYaml(`${plan.name}.yaml`, yaml);
                }}
                aria-label="Export plan as Kubernetes YAML"
              >
                Export YAML
              </Button>
            </FlexItem>
            <FlexItem>
              {canStart && (
                <Button variant="primary" onClick={handleStart} aria-label={t('action.startMigration')}>
                  {t('action.startMigration')}
                </Button>
              )}
              {plan.status === 'running' && (
                <Button variant="secondary" isDisabled aria-label="Migration in progress">
                  Running…
                </Button>
              )}
            </FlexItem>
          </Flex>
        </Flex>
        {plan.description && (
          <Content component="p" style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)' }}>
            {plan.description}
          </Content>
        )}
      </PageSection>

      {plan.status === 'failed' && failedStep && (
        <PageSection hasBodyWrapper={false}>
          <Alert
            variant="danger"
            isInline
            title="Migration failed"
            actionLinks={
              <>
                <AlertActionLink
                  onClick={() => {
                    const resetSteps = plan.steps.map((s) => ({
                      ...s,
                      phase: 'pending' as const,
                      progressPercent: 0,
                      error: undefined,
                    }));
                    updateSteps(plan.id, resetSteps, 0, 'ready');
                    addToast({ variant: 'info', title: 'Plan reset', body: 'The plan is ready to start again.' });
                  }}
                >
                  <RedoIcon aria-hidden="true" /> Retry migration
                </AlertActionLink>
                <AlertActionLink onClick={() => navigate('/plans/new')}>
                  Create new plan
                </AlertActionLink>
              </>
            }
          >
            <strong>Error:</strong> {failedStep.error}
            <br />
            <Content component="small" style={{ color: 'inherit', opacity: 0.8 }}>
              This typically happens when the source disk is locked by another process. Stop any snapshots or backups on the source VM and retry.
            </Content>
          </Alert>
        </PageSection>
      )}

      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>
          <GridItem md={8}>
            <Card>
              <CardTitle>Per-VM Migration Progress</CardTitle>
              <CardBody>
                <Table aria-label="Per-VM migration progress" variant="compact">
                  <caption>Progress for each virtual machine in this plan</caption>
                  <Thead>
                    <Tr>
                      <Th scope="col">VM</Th>
                      <Th scope="col">OS</Th>
                      <Th scope="col">Phase</Th>
                      <Th scope="col">Progress</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {plan.steps.map((step) => {
                      const vm = planVMs.find((v) => v.id === step.vmId);
                      return (
                        <Tr key={step.vmId}>
                          <Td dataLabel="VM">
                            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                              <FlexItem>{phaseIcon(step.phase)}</FlexItem>
                              <FlexItem>{vm?.name ?? step.vmId}</FlexItem>
                            </Flex>
                          </Td>
                          <Td dataLabel="OS">{vm?.os ?? '—'}</Td>
                          <Td dataLabel="Phase">
                            <Label
                              color={
                                step.phase === 'completed' ? 'green' :
                                step.phase === 'failed' ? 'red' :
                                step.phase === 'pending' ? 'grey' : 'blue'
                              }
                            >
                              {phaseLabel(step.phase)}
                            </Label>
                          </Td>
                          <Td dataLabel="Progress">
                            {step.phase === 'pending' ? (
                              <span style={{ color: 'var(--pf-v6-global--Color--200)' }}>Waiting…</span>
                            ) : (
                              <Progress
                                value={step.progressPercent}
                                size={ProgressSize.sm}
                                aria-label={`${vm?.name ?? step.vmId} progress`}
                                measureLocation="none"
                              />
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={4}>
            <Card isFullHeight>
              <CardTitle>Plan Details</CardTitle>
              <CardBody>
                <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                  <Flex>
                    <FlexItem style={{ minWidth: '90px', color: 'var(--pf-v6-global--Color--200)' }}>Source</FlexItem>
                    <FlexItem>{source?.name ?? plan.source}</FlexItem>
                  </Flex>
                  <Divider />
                  <Flex>
                    <FlexItem style={{ minWidth: '90px', color: 'var(--pf-v6-global--Color--200)' }}>Target</FlexItem>
                    <FlexItem>{target?.name ?? plan.target}</FlexItem>
                  </Flex>
                  <Divider />
                  <Flex>
                    <FlexItem style={{ minWidth: '90px', color: 'var(--pf-v6-global--Color--200)' }}>VMs</FlexItem>
                    <FlexItem>{plan.vms.length}</FlexItem>
                  </Flex>
                  <Divider />
                  <Flex>
                    <FlexItem style={{ minWidth: '90px', color: 'var(--pf-v6-global--Color--200)' }}>Created</FlexItem>
                    <FlexItem>{new Date(plan.createdAt).toLocaleString()}</FlexItem>
                  </Flex>
                  {plan.networkMap && (
                    <>
                      <Divider />
                      <Flex>
                        <FlexItem style={{ minWidth: '90px', color: 'var(--pf-v6-global--Color--200)' }}>Network</FlexItem>
                        <FlexItem style={{ fontSize: '0.85rem' }}>
                          {plan.networkMap.sourceNetwork} → {plan.networkMap.targetNetwork}
                        </FlexItem>
                      </Flex>
                    </>
                  )}
                  {plan.storageMap && (
                    <>
                      <Divider />
                      <Flex>
                        <FlexItem style={{ minWidth: '90px', color: 'var(--pf-v6-global--Color--200)' }}>Storage</FlexItem>
                        <FlexItem style={{ fontSize: '0.85rem' }}>
                          {plan.storageMap.sourceStorage} → {plan.storageMap.targetStorage}
                        </FlexItem>
                      </Flex>
                    </>
                  )}
                  <Divider />
                  <div>
                    <div style={{ marginBottom: '0.5rem', color: 'var(--pf-v6-global--Color--200)' }}>Overall progress</div>
                    <Progress
                      value={plan.progress}
                      aria-label="Overall plan progress"
                    />
                  </div>
                </Flex>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem span={12}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                  <ClockIcon aria-hidden="true" />
                  <span>Migration Log</span>
                </Flex>
              </CardTitle>
              <CardBody>
                {logLines.length === 0 ? (
                  <Content component="p" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                    No log events yet. Start the migration to begin.
                  </Content>
                ) : (
                  <CodeBlock>
                    <CodeBlockCode id="migration-log">
                      {logLines.join('\n')}
                    </CodeBlockCode>
                  </CodeBlock>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
}