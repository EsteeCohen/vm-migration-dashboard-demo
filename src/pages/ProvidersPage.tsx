import { useState } from 'react';
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  TextInput,
  FormSelect,
  FormSelectOption,
  Flex,
  FlexItem,
  Content,
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
import { FilterIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useMigrations } from '../hooks/useMigrations';
import { ProviderStatusBadge } from '../components/StatusBadge';
import { t } from '../i18n';
import type { ProviderKind, ProviderStatus } from '../types/migration';

const KIND_LABELS: Record<ProviderKind, string> = {
  vmware: 'VMware',
  ovirt: 'oVirt / RHV',
  openstack: 'OpenStack',
  openshift: 'OpenShift',
};

export function ProvidersPage() {
  const { providers, loading, addToast } = useMigrations();
  const [kindFilter, setKindFilter] = useState<ProviderKind[]>([]);
  const [statusFilter, setStatusFilter] = useState<ProviderStatus[]>([]);
  const [kindOpen, setKindOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', kind: 'vmware' as ProviderKind, url: '' });

  const filtered = providers.filter((p) => {
    if (kindFilter.length > 0 && !kindFilter.includes(p.kind)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(p.status)) return false;
    return true;
  });

  const toggleKind = (kind: ProviderKind) =>
    setKindFilter((prev) => (prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]));

  const toggleStatus = (status: ProviderStatus) =>
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));

  const handleAddProvider = () => {
    setIsModalOpen(false);
    addToast({ variant: 'success', title: 'Provider added', body: `${newProvider.name} has been added successfully.` });
    setNewProvider({ name: '', kind: 'vmware', url: '' });
  };

  const rowActions = (providerName: string) => [
    { title: 'Edit', onClick: () => addToast({ variant: 'info', title: 'Edit provider', body: `Editing ${providerName}` }) },
    { title: 'Remove', onClick: () => addToast({ variant: 'warning', title: 'Remove provider', body: `Removing ${providerName}` }), isDangerous: true },
  ];

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="xl">Providers</Title>
          </FlexItem>
          <FlexItem>
            <Button
              variant="primary"
              icon={<PlusCircleIcon />}
              onClick={() => setIsModalOpen(true)}
              aria-label={t('action.addProvider')}
            >
              {t('action.addProvider')}
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Toolbar clearAllFilters={() => { setKindFilter([]); setStatusFilter([]); }}>
          <ToolbarContent>
            <ToolbarItem>
              <FilterIcon aria-hidden="true" />
            </ToolbarItem>
            <ToolbarFilter
              labels={kindFilter.map((k) => ({ key: k, node: KIND_LABELS[k] }))}
              deleteLabel={(_cat, label) => toggleKind(typeof label === 'string' ? label as ProviderKind : label.key as ProviderKind)}
              deleteLabelGroup={() => setKindFilter([])}
              categoryName="Type"
            >
              <Select
                isOpen={kindOpen}
                onOpenChange={setKindOpen}
                selected={kindFilter}
                onSelect={(_e, val) => toggleKind(val as ProviderKind)}
                toggle={(ref) => (
                  <MenuToggle ref={ref} onClick={() => setKindOpen(!kindOpen)} isExpanded={kindOpen}>
                    Type
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {(Object.keys(KIND_LABELS) as ProviderKind[]).map((k) => (
                    <SelectOption key={k} value={k} hasCheckbox isSelected={kindFilter.includes(k)}>
                      {KIND_LABELS[k]}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarFilter>
            <ToolbarFilter
              labels={statusFilter.map((s) => ({ key: s, node: s }))}
              deleteLabel={(_cat, label) => toggleStatus(typeof label === 'string' ? label as ProviderStatus : label.key as ProviderStatus)}
              deleteLabelGroup={() => setStatusFilter([])}
              categoryName="Status"
            >
              <Select
                isOpen={statusOpen}
                onOpenChange={setStatusOpen}
                selected={statusFilter}
                onSelect={(_e, val) => toggleStatus(val as ProviderStatus)}
                toggle={(ref) => (
                  <MenuToggle ref={ref} onClick={() => setStatusOpen(!statusOpen)} isExpanded={statusOpen}>
                    Status
                  </MenuToggle>
                )}
              >
                <SelectList>
                  {(['ready', 'error', 'critical', 'unknown'] as ProviderStatus[]).map((s) => (
                    <SelectOption key={s} value={s} hasCheckbox isSelected={statusFilter.includes(s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
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
        ) : filtered.length === 0 ? (
          <EmptyState>
            <EmptyStateBody>
              {providers.length === 0 ? t('emptyState.noProvidersBody') : 'No providers match the current filters.'}
            </EmptyStateBody>
            {providers.length === 0 && (
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    {t('action.addProvider')}
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            )}
          </EmptyState>
        ) : (
          <Table aria-label="Providers table">
            <caption>Virtualization providers available for migration</caption>
            <Thead>
              <Tr>
                <Th scope="col">Name</Th>
                <Th scope="col">Type</Th>
                <Th scope="col">URL</Th>
                <Th scope="col">VMs</Th>
                <Th scope="col">Status</Th>
                <Th scope="col" screenReaderText="Actions" />
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((prov) => (
                <Tr key={prov.id}>
                  <Td dataLabel="Name">
                    <Content component="p" style={{ fontWeight: 600, margin: 0 }}>{prov.name}</Content>
                  </Td>
                  <Td dataLabel="Type">{KIND_LABELS[prov.kind]}</Td>
                  <Td dataLabel="URL">
                    <Content component="small" style={{ fontFamily: 'monospace', color: 'var(--pf-v6-global--Color--200)' }}>
                      {prov.url}
                    </Content>
                  </Td>
                  <Td dataLabel="VMs">{prov.vmCount}</Td>
                  <Td dataLabel="Status">
                    <ProviderStatusBadge status={prov.status} />
                  </Td>
                  <Td isActionCell>
                    <ActionsColumn items={rowActions(prov.name)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </PageSection>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variant="medium"
        aria-labelledby="add-provider-modal-title"
      >
        <ModalHeader title="Add Provider" labelId="add-provider-modal-title" />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="prov-name">
              <TextInput
                id="prov-name"
                isRequired
                value={newProvider.name}
                onChange={(_e, val) => setNewProvider((p) => ({ ...p, name: val }))}
                aria-label="Provider name"
              />
            </FormGroup>
            <FormGroup label="Type" isRequired fieldId="prov-kind">
              <FormSelect
                id="prov-kind"
                value={newProvider.kind}
                onChange={(_e, val) => setNewProvider((p) => ({ ...p, kind: val as ProviderKind }))}
                aria-label="Provider type"
              >
                {(Object.entries(KIND_LABELS) as [ProviderKind, string][]).map(([k, label]) => (
                  <FormSelectOption key={k} value={k} label={label} />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup label="URL" isRequired fieldId="prov-url">
              <TextInput
                id="prov-url"
                isRequired
                type="url"
                value={newProvider.url}
                onChange={(_e, val) => setNewProvider((p) => ({ ...p, url: val }))}
                aria-label="Provider URL"
                placeholder="https://vcenter.example.com"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={handleAddProvider}
            isDisabled={!newProvider.name || !newProvider.url}
          >
            Add Provider
          </Button>
          <Button variant="link" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}