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
import { useAuth } from '../context/AuthContext';
import { ProviderStatusBadge } from '../components/StatusBadge';
import { apiClient } from '../api/client';
import { t } from '../i18n';
import type { Provider, ProviderKind, ProviderStatus } from '../types/migration';

const KIND_LABELS: Record<ProviderKind, string> = {
  vmware: 'VMware',
  ovirt: 'oVirt / RHV',
  openstack: 'OpenStack',
  openshift: 'OpenShift',
};

const BLANK_FORM = { name: '', kind: 'vmware' as ProviderKind, url: '' };

export function ProvidersPage() {
  const { providers, loading, addToast, addProvider, updateProvider, deleteProvider } = useMigrations();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [kindFilter,   setKindFilter]   = useState<ProviderKind[]>([]);
  const [statusFilter, setStatusFilter] = useState<ProviderStatus[]>([]);
  const [kindOpen,     setKindOpen]     = useState(false);
  const [statusOpen,   setStatusOpen]   = useState(false);

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm]       = useState(BLANK_FORM);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Provider | null>(null);
  const [editForm,   setEditForm]   = useState(BLANK_FORM);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);

  const [saving, setSaving] = useState(false);

  const filtered = providers.filter((p) => {
    if (kindFilter.length   > 0 && !kindFilter.includes(p.kind))     return false;
    if (statusFilter.length > 0 && !statusFilter.includes(p.status)) return false;
    return true;
  });

  const toggleKind   = (k: ProviderKind)   =>
    setKindFilter((prev)   => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]);
  const toggleStatus = (s: ProviderStatus) =>
    setStatusFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  // ── Add ────────────────────────────────────────────────────
  const handleAdd = async () => {
    setSaving(true);
    try {
      const created = await apiClient.createProvider(form);
      addProvider(created);
      addToast({ variant: 'success', title: t('provider.added'), body: form.name });
      setAddOpen(false);
      setForm(BLANK_FORM);
    } catch {
      addToast({ variant: 'danger', title: t('provider.addFailed') });
    } finally {
      setSaving(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────
  const openEdit = (p: Provider) => {
    setEditTarget(p);
    setEditForm({ name: p.name, kind: p.kind, url: p.url });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await apiClient.updateProvider(editTarget.id, editForm);
      updateProvider(updated);
      addToast({ variant: 'success', title: t('provider.updated'), body: updated.name });
      setEditTarget(null);
    } catch {
      addToast({ variant: 'danger', title: t('provider.updateFailed') });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await apiClient.deleteProvider(deleteTarget.id);
      deleteProvider(deleteTarget.id);
      addToast({ variant: 'success', title: t('provider.deleted'), body: deleteTarget.name });
      setDeleteTarget(null);
    } catch {
      addToast({ variant: 'danger', title: t('provider.deleteFailed') });
    } finally {
      setSaving(false);
    }
  };

  const rowActions = (p: Provider) => [
    {
      title: t('action.edit'),
      onClick: () => openEdit(p),
    },
    {
      title: t('action.delete'),
      onClick: () => setDeleteTarget(p),
      isDangerous: true,
      isDisabled: !isAdmin,
      tooltip: !isAdmin ? 'Admin access required' : undefined,
    },
  ];

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Title headingLevel="h1" size="xl">Providers</Title>
          </FlexItem>
          <FlexItem>
            <Button variant="primary" icon={<PlusCircleIcon />} onClick={() => setAddOpen(true)}>
              {t('action.addProvider')}
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection hasBodyWrapper={false}>
        <Toolbar clearAllFilters={() => { setKindFilter([]); setStatusFilter([]); }}>
          <ToolbarContent>
            <ToolbarItem><FilterIcon aria-hidden="true" /></ToolbarItem>
            <ToolbarFilter
              labels={kindFilter.map((k) => ({ key: k, node: KIND_LABELS[k] }))}
              deleteLabel={(_cat, label) => toggleKind(typeof label === 'string' ? label as ProviderKind : label.key as ProviderKind)}
              deleteLabelGroup={() => setKindFilter([])}
              categoryName="Type"
            >
              <Select isOpen={kindOpen} onOpenChange={setKindOpen} selected={kindFilter}
                onSelect={(_e, val) => toggleKind(val as ProviderKind)}
                toggle={(ref) => <MenuToggle ref={ref} onClick={() => setKindOpen(!kindOpen)} isExpanded={kindOpen}>Type</MenuToggle>}
              >
                <SelectList>
                  {(Object.keys(KIND_LABELS) as ProviderKind[]).map((k) => (
                    <SelectOption key={k} value={k} hasCheckbox isSelected={kindFilter.includes(k)}>{KIND_LABELS[k]}</SelectOption>
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
              <Select isOpen={statusOpen} onOpenChange={setStatusOpen} selected={statusFilter}
                onSelect={(_e, val) => toggleStatus(val as ProviderStatus)}
                toggle={(ref) => <MenuToggle ref={ref} onClick={() => setStatusOpen(!statusOpen)} isExpanded={statusOpen}>Status</MenuToggle>}
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
                  <Button variant="primary" onClick={() => setAddOpen(true)}>{t('action.addProvider')}</Button>
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
                  <Td dataLabel="Status"><ProviderStatusBadge status={prov.status} /></Td>
                  <Td isActionCell>
                    <ActionsColumn items={rowActions(prov)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </PageSection>

      {/* ── Add modal ──────────────────────────────────────────── */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} variant="medium" aria-labelledby="add-prov-title">
        <ModalHeader title={t('action.addProvider')} labelId="add-prov-title" />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="ap-name">
              <TextInput id="ap-name" isRequired value={form.name}
                onChange={(_e, v) => setForm((f) => ({ ...f, name: v }))} aria-label="Provider name" />
            </FormGroup>
            <FormGroup label="Type" isRequired fieldId="ap-kind">
              <FormSelect id="ap-kind" value={form.kind}
                onChange={(_e, v) => setForm((f) => ({ ...f, kind: v as ProviderKind }))} aria-label="Provider type">
                {(Object.entries(KIND_LABELS) as [ProviderKind, string][]).map(([k, label]) => (
                  <FormSelectOption key={k} value={k} label={label} />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup label="URL" isRequired fieldId="ap-url">
              <TextInput id="ap-url" isRequired type="url" value={form.url}
                onChange={(_e, v) => setForm((f) => ({ ...f, url: v }))}
                aria-label="Provider URL" placeholder="https://vcenter.example.com" />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleAdd} isLoading={saving} isDisabled={saving || !form.name || !form.url}>
            {t('action.addProvider')}
          </Button>
          <Button variant="link" onClick={() => setAddOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* ── Edit modal ─────────────────────────────────────────── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} variant="medium" aria-labelledby="edit-prov-title">
        <ModalHeader title={t('action.edit') + ': ' + editTarget?.name} labelId="edit-prov-title" />
        <ModalBody>
          <Form>
            <FormGroup label="Name" isRequired fieldId="ep-name">
              <TextInput id="ep-name" isRequired value={editForm.name}
                onChange={(_e, v) => setEditForm((f) => ({ ...f, name: v }))} aria-label="Provider name" />
            </FormGroup>
            <FormGroup label="Type" isRequired fieldId="ep-kind">
              <FormSelect id="ep-kind" value={editForm.kind}
                onChange={(_e, v) => setEditForm((f) => ({ ...f, kind: v as ProviderKind }))} aria-label="Provider type">
                {(Object.entries(KIND_LABELS) as [ProviderKind, string][]).map(([k, label]) => (
                  <FormSelectOption key={k} value={k} label={label} />
                ))}
              </FormSelect>
            </FormGroup>
            <FormGroup label="URL" isRequired fieldId="ep-url">
              <TextInput id="ep-url" isRequired type="url" value={editForm.url}
                onChange={(_e, v) => setEditForm((f) => ({ ...f, url: v }))}
                aria-label="Provider URL" />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleEdit} isLoading={saving} isDisabled={saving || !editForm.name || !editForm.url}>
            {t('action.save')}
          </Button>
          <Button variant="link" onClick={() => setEditTarget(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* ── Delete confirm ─────────────────────────────────────── */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} variant="small" aria-labelledby="del-prov-title">
        <ModalHeader title={t('action.confirmDelete')} labelId="del-prov-title" />
        <ModalBody>
          <p>
            {t('provider.deleteConfirm')} <strong>{deleteTarget?.name}</strong>?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleDelete} isLoading={saving} isDisabled={saving}>
            {t('action.delete')}
          </Button>
          <Button variant="link" onClick={() => setDeleteTarget(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
