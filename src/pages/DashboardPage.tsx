import React, { useState, useEffect } from 'react';
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

function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('pf-v6-theme-dark'));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('pf-v6-theme-dark'))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}
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
  { x: 1, y: 12 },
  { x: 2, y: 28 },
  { x: 3, y: 19 },
  { x: 4, y: 45 },
  { x: 5, y: 33 },
  { x: 6, y: 8 },
  { x: 7, y: 51 },
];
const areaDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DashboardPage() {
  const navigate = useNavigate();
  const { plans, providers, loading } = useMigrations();
  const isDark = useIsDark();
  const chartTextColor  = isDark ? '#e0e0e0' : '#3c3f42';
  const chartAxisColor  = isDark ? '#6a6e73' : '#8a8d90';
  const chartGridColor  = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const areaFillColor   = isDark ? '#73bcf7' : '#0066cc';
  const axisStyle = {
    tickLabels: { fill: chartTextColor, fontSize: 11 },
    axis: { stroke: chartAxisColor },
  };

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
              <CardTitle>{t('dashboard.statusBreakdown')}</CardTitle>
              <CardBody>
                {loading ? (
                  <Skeleton height="290px" />
                ) : plans.length === 0 ? (
                  <EmptyState>
                    <EmptyStateBody>No plans to display.</EmptyStateBody>
                  </EmptyState>
                ) : (
                  /* dir=ltr prevents RTL from mirroring the Victory SVG */
                  <div dir="ltr" style={{ height: 290, overflow: 'hidden' }}>
                    <ChartDonut
                      data={donutData}
                      title={String(plans.length)}
                      subTitle={t('dashboard.totalPlansShort')}
                      height={290}
                      width={340}
                      themeColor={ChartThemeColor.multiOrdered}
                      legendData={donutData.map((d) => ({ name: `${d.x}: ${d.y}` }))}
                      legendOrientation="horizontal"
                      legendPosition="bottom"
                      padding={{ bottom: 100, left: 20, right: 20, top: 20 }}
                      ariaTitle="Plan status breakdown donut chart"
                      style={{ labels: { fill: chartTextColor } }}
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          </GridItem>

          <GridItem md={7}>
            <Card isFullHeight>
              <CardTitle>{t('dashboard.activityTitle')}</CardTitle>
              <CardBody>
                {loading ? (
                  <Skeleton height="290px" />
                ) : (
                  /* dir=ltr prevents RTL from mirroring the Victory SVG */
                  <div dir="ltr" style={{ height: 290 }}>
                    <ChartGroup
                      height={290}
                      width={520}
                      padding={{ bottom: 50, left: 55, right: 20, top: 20 }}
                    >
                      <ChartAxis
                        tickValues={[1, 2, 3, 4, 5, 6, 7]}
                        tickFormat={areaDayLabels}
                        style={axisStyle}
                      />
                      <ChartAxis
                        dependentAxis
                        showGrid
                        style={{
                          ...axisStyle,
                          grid: { stroke: chartGridColor },
                        }}
                      />
                      <ChartArea
                        data={areaData}
                        style={{
                          data: {
                            fill: areaFillColor,
                            fillOpacity: 0.25,
                            stroke: areaFillColor,
                            strokeWidth: 2,
                          },
                        }}
                        aria-label="Migration activity area chart"
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