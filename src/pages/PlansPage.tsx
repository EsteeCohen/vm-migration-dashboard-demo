import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageSection,
  Title,
  Button,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarFilter,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  Skeleton,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Flex,
  FlexItem,
  Progress,
  ProgressSize,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ActionsColumn,
} from '@patternfly/react-table';
import type { ThProps } from '@patternfly/react-table';
import { FilterIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMigrations } from '../hooks/useMigrations';
import { PlanStatusBadge } from '../components/StatusBadge';
import { t } from '../i18n';
import { exportPlanAsYaml, downloadYaml } from '../utils/yamlExport';
import type { PlanStatus, MigrationPlan } from '../types/migration';
import type { ToolbarLabel, ToolbarLabelGroup } from '@patternfly/react-core';

type SortField = 'name' | 'createdAt' | 'status' | 'progress';
type SortDir = 'asc' | 'desc';

const SORT_FIELDS: SortField[] = ['name', 'createdAt', 'status', 'progress'];
const STATUS_ORDER: Record<PlanStatus, number> = { running: 0, failed: 1, ready: 2, draft: 3, succeeded: 4 };

function sortPlans(plans: MigrationPlan[], field: SortField, dir: SortDir): MigrationPlan[] {
  return [...plans].sort((a, b) => {
    let cmp = 0;
    if (field === 'name') cmp = a.name.localeCompare(b.name);
    else if (field === 'createdAt') cmp = a.createdAt.localeCompare(b.createdAt);
    else if (field === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (field === 'progress') cmp = a.progress - b.progress;
    return dir === 'asc' ? cmp : -cmp;
  });
}

export function PlansPage() {
  const navigate = useNavigate();
  const { plans, providers, loading } = useMigrations();
  const [statusFilter, setStatusFilter] = useState<PlanStatus[]>([]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const filtered = plans.filter((p) => statusFilter.length === 0 || statusFilter.includes(p.status));
  const sorted = sortPlans(filtered, sortField, sortDir);

  const toggleStatus = (status: PlanStatus) =>
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));

  const sortProps = (field: SortField): Pick<ThProps, 'sort'> => ({
    sort: {
      sortBy: {
        index: SORT_FIELDS.indexOf(field),
        direction: sortField === field ? sortDir : undefined,
      },
      onSort: (_e, _idx, dir) => { setSortField(field); setSortDir(dir as SortDir); },
      columnIndex: SORT_FIELDS.indexOf(field),
    },
  });

  const providerName = (id: string) => providers.find((p) => p.id === id)?.name ?? id;

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="xl">{t('nav.plans')}</Title>
          </FlexItem>
          <FlexItem>
            <Button
              variant="primary"
              icon={<PlusCircleIcon />}
              onClick={() => navigate('/plans/new')}
              aria-label={t('action.createPlan')}
            >
              {t('action.createPlan')}
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Toolbar clearAllFilters={() => setStatusFilter([])}>
          <ToolbarContent>
            <ToolbarItem>
              <FilterIcon aria-hidden="true" />
            </ToolbarItem>
            <ToolbarFilter
              labels={statusFilter.map((s) => ({ key: s, node: s }))}
              deleteLabel={(_cat: string | ToolbarLabelGroup, label: ToolbarLabel | string) =>
                toggleStatus(typeof label === 'string' ? label as PlanStatus : label.key as PlanStatus)
              }
              deleteLabelGroup={() => setStatusFilter([])}
              categoryName="Status"
            >
              <Select
                isOpen={statusOpen}
                onOpenChange={setStatusOpen}
                selected={statusFilter}
                onSelect={(_e, val) => toggleStatus(val as PlanStatus)}
                toggle={(ref) => (
                  <MenuToggle ref={ref} onClick={() => setStatusOpen(!statusOpen)} isExpanded={statusOpen}>
                    Status
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {(['draft', 'ready', 'running', 'succeeded', 'failed'] as PlanStatus[]).map((s) => (
                    <SelectOption key={s} value={s} hasCheckbox isSelected={statusFilter.includes(s)}>
                      <PlanStatusBadge status={s} />
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarFilter>
          </ToolbarContent>
        </Toolbar>

        {loading ? (
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height="48px" />)}
          </Flex>
        ) : sorted.length === 0 ? (
          <EmptyState>
            <EmptyStateBody>
              {plans.length === 0 ? t('emptyState.noPlansBody') : 'No plans match the current filters.'}
            </EmptyStateBody>
            {plans.length === 0 && (
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button variant="primary" onClick={() => navigate('/plans/new')}>
                    {t('action.createPlan')}
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            )}
          </EmptyState>
        ) : (
          <Table aria-label="Migration plans table">
            <caption>Migration plans — click a row to view details</caption>
            <Thead>
              <Tr>
                <Th scope="col" {...sortProps('name')}>Name</Th>
                <Th scope="col">Source</Th>
                <Th scope="col">Target</Th>
                <Th scope="col">VMs</Th>
                <Th scope="col" {...sortProps('status')}>Status</Th>
                <Th scope="col" {...sortProps('progress')}>Progress</Th>
                <Th scope="col" {...sortProps('createdAt')}>Created</Th>
                <Th scope="col" screenReaderText="Actions" />
              </Tr>
            </Thead>
            <Tbody>
              {sorted.map((plan) => (
                <Tr
                  key={plan.id}
                  style={{ cursor: 'pointer' }}
                  onRowClick={() => navigate(`/plans/${plan.id}`)}
                >
                  <Td dataLabel="Name">
                    <Button variant="link" isInline onClick={() => navigate(`/plans/${plan.id}`)}>
                      {plan.name}
                    </Button>
                  </Td>
                  <Td dataLabel="Source">{providerName(plan.source)}</Td>
                  <Td dataLabel="Target">{providerName(plan.target)}</Td>
                  <Td dataLabel="VMs">{plan.vms.length}</Td>
                  <Td dataLabel="Status"><PlanStatusBadge status={plan.status} /></Td>
                  <Td dataLabel="Progress">
                    <Progress
                      value={plan.progress}
                      size={ProgressSize.sm}
                      aria-label={`${plan.name} progress`}
                      measureLocation="none"
                    />
                  </Td>
                  <Td dataLabel="Created">
                    {new Date(plan.createdAt).toLocaleDateString()}
                  </Td>
                  <Td isActionCell onClick={(e) => e.stopPropagation()}>
                    <ActionsColumn
                      items={[
                        {
                          title: 'View details',
                          onClick: () => navigate(`/plans/${plan.id}`),
                        },
                        {
                          title: 'Export YAML',
                          onClick: () => {
                            const yaml = exportPlanAsYaml(plan, providers, vms);
                            downloadYaml(`${plan.name}.yaml`, yaml);
                          },
                        },
                      ]}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </PageSection>
    </>
  );
}