import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Card,
  CardTitle,
  CardBody,
  Grid,
  GridItem,
  Skeleton,
  Flex,
  FlexItem,
  Progress,
  ProgressSize,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Button,
  Divider,
  Content,
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
  MigrationIcon,
  ServerIcon,
  VirtualMachineIcon,
  NetworkIcon,
} from '@patternfly/react-icons';
import { ChartDonut, ChartArea, ChartAxis, ChartGroup, ChartThemeColor } from '@patternfly/react-charts/victory';
import { useMigrations } from '../hooks/useMigrations';
import { PlanStatusBadge, ProviderStatusBadge } from '../components/StatusBadge';
import { t } from '../i18n';
import type { PlanStatus } from '../types/migration';

function StatCard({ title, value, loading, color }: {
  title: string; value: number; loading: boolean; color?: string;
}) {
  return (
    <Card isFullHeight>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        {loading ? (
          <Skeleton width="60px" height="48px" />
        ) : (
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color }}>{value}</span>
        )}
      </CardBody>
    </Card>
  );
}

const providerKindIcon: Record<string, React.ReactNode> = {
  vmware: <VirtualMachineIcon />,
  ovirt: <ServerIcon />,
  openstack: <NetworkIcon />,
  openshift: <MigrationIcon />,
};

const STATUS_COLORS: Record<PlanStatus, string> = {
  running: 'var(--pf-v6-global--info-color--100)',
  succeeded: 'var(--pf-v6-global--success-color--100)',
  failed: 'var(--pf-v6-global--danger-color--100)',
  ready: 'var(--pf-v6-global--active-color--100)',
  draft: 'var(--pf-v6-global--Color--200)',
};

const areaData = [
  { x: 'Mon', y: 12 },
  { x: 'Tue', y: 28 },
  { x: 'Wed', y: 19 },
  { x: 'Thu', y: 45 },
  { x: 'Fri', y: 33 },
  { x: 'Sat', y: 8 },
  { x: 'Sun', y: 51 },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { plans, providers, loading } = useMigrations();

  const counts: Record<PlanStatus, number> = { draft: 0, ready: 0, running: 0, succeeded: 0, failed: 0 };
  plans.forEach((p) => counts[p.status]++);

  const recentPlans = [...plans]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const donutData = [
    { x: 'Running', y: counts.running },
    { x: 'Completed', y: counts.succeeded },
    { x: 'Failed', y: counts.failed },
    { x: 'Ready', y: counts.ready },
    { x: 'Draft', y: counts.draft },
  ].filter((d) => d.y > 0);

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1" size="xl">{t('dashboard.title')}</Title>
      </PageSection>

      {/* Summary cards */}
      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter sm={12} md={6} lg={3}>
          <GridItem>
            <StatCard title={t('dashboard.totalPlans')} value={plans.length} loading={loading} />
          </GridItem>
          <GridItem>
            <StatCard title={t('dashboard.running')} value={counts.running} loading={loading} color={STATUS_COLORS.running} />
          </GridItem>
          <GridItem>
            <StatCard title={t('dashboard.completed')} value={counts.succeeded} loading={loading} color={STATUS_COLORS.succeeded} />
          </GridItem>
          <GridItem>
            <StatCard title={t('dashboard.failed')} value={counts.failed} loading={loading} color={STATUS_COLORS.failed} />
          </GridItem>
        </Grid>
      </PageSection>

      {/* Charts row */}
      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>
          <GridItem md={5}>
            <Card isFullHeight>
              <CardTitle>Plan Status Breakdown</CardTitle>
              <CardBody>
                {loading ? (
                  <Skeleton height="220px" />
                ) : plans.length === 0 ? (
                  <EmptyState>
                    <EmptyStateBody>No plans to display.</EmptyStateBody>
                  </EmptyState>
                ) : (
                  <div style={{ height: 220 }}>
                    <ChartDonut
                      data={donutData}
                      title={String(plans.length)}
                      subTitle="total plans"
                      height={220}
                      width={400}
                      themeColor={ChartThemeColor.multiOrdered}
                      legendData={donutData.map((d) => ({ name: `${d.x}: ${d.y}` }))}
                      legendOrientation="vertical"
                      legendPosition="right"
                      padding={{ bottom: 20, left: 20, right: 140, top: 20 }}
                      ariaTitle="Plan status breakdown donut chart"
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={7}>
            <Card isFullHeight>
              <CardTitle>Migration Activity — Last 7 Days (GB transferred)</CardTitle>
              <CardBody>
                {loading ? (
                  <Skeleton height="220px" />
                ) : (
                  <div style={{ height: 220 }}>
                    <ChartGroup height={220} width={520} padding={{ bottom: 40, left: 50, right: 20, top: 10 }}>
                      <ChartAxis />
                      <ChartAxis dependentAxis showGrid />
                      <ChartArea
                        data={areaData}
                        style={{ data: { fill: 'var(--pf-v6-global--info-color--100)', fillOpacity: 0.2, stroke: 'var(--pf-v6-global--info-color--100)' } }}
                        ariaTitle="Migration activity area chart"
                      />
                    </ChartGroup>
                  </div>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>

      {/* Recent migrations + providers */}
      <PageSection hasBodyWrapper={false}>
        <Grid hasGutter>
          <GridItem md={8}>
            <Card isFullHeight>
              <CardTitle>Recent Migrations</CardTitle>
              <CardBody>
                {loading ? (
                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
                    {[1, 2, 3].map((i) => <Skeleton key={i} height="40px" />)}
                  </Flex>
                ) : recentPlans.length === 0 ? (
                  <EmptyState>
                    <EmptyStateBody>{t('emptyState.noPlansBody')}</EmptyStateBody>
                    <EmptyStateFooter>
                      <EmptyStateActions>
                        <Button variant="primary" onClick={() => navigate('/plans/new')}>
                          {t('action.createPlan')}
                        </Button>
                      </EmptyStateActions>
                    </EmptyStateFooter>
                  </EmptyState>
                ) : (
                  <Table aria-label="Recent migration plans" variant="compact">
                    <caption>Recent migration plans sorted by creation date</caption>
                    <Thead>
                      <Tr>
                        <Th scope="col">Plan</Th>
                        <Th scope="col">Status</Th>
                        <Th scope="col">Progress</Th>
                        <Th scope="col">VMs</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentPlans.map((plan) => (
                        <Tr key={plan.id} style={{ cursor: 'pointer' }} onRowClick={() => navigate(`/plans/${plan.id}`)}>
                          <Td dataLabel="Plan">
                            <Button variant="link" isInline onClick={() => navigate(`/plans/${plan.id}`)}>
                              {plan.name}
                            </Button>
                          </Td>
                          <Td dataLabel="Status"><PlanStatusBadge status={plan.status} /></Td>
                          <Td dataLabel="Progress">
                            <Progress
                              value={plan.progress}
                              size={ProgressSize.sm}
                              aria-label={`${plan.name} progress`}
                              measureLocation="none"
                            />
                          </Td>
                          <Td dataLabel="VMs">{plan.vms.length}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={4}>
            <Card isFullHeight>
              <CardTitle>Providers at a Glance</CardTitle>
              <CardBody>
                {loading ? (
                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} height="56px" />)}
                  </Flex>
                ) : providers.length === 0 ? (
                  <EmptyState>
                    <EmptyStateBody>{t('emptyState.noProvidersBody')}</EmptyStateBody>
                    <EmptyStateFooter>
                      <EmptyStateActions>
                        <Button variant="primary" onClick={() => navigate('/providers')}>
                          {t('action.addProvider')}
                        </Button>
                      </EmptyStateActions>
                    </EmptyStateFooter>
                  </EmptyState>
                ) : (
                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                    {providers.map((prov, idx) => (
                      <React.Fragment key={prov.id}>
                        {idx > 0 && <Divider />}
                        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }} style={{ padding: '0.25rem 0' }}>
                          <FlexItem>
                            <span aria-hidden="true">{providerKindIcon[prov.kind] ?? <ServerIcon />}</span>
                          </FlexItem>
                          <FlexItem grow={{ default: 'grow' }}>
                            <Content component="p" style={{ fontWeight: 600, marginBottom: 0 }}>{prov.name}</Content>
                            <Content component="small" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                              {prov.kind} · {prov.vmCount} VMs
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <ProviderStatusBadge status={prov.status} />
                          </FlexItem>
                        </Flex>
                      </React.Fragment>
                    ))}
                  </Flex>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </>
  );
}