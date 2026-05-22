import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageSection,
  Wizard,
  WizardStep,
  WizardFooter,
  useWizardContext,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  Select,
  SelectList,
  SelectOption,
  MenuToggle,
  Alert,
  Title,
  DescriptionList,
  DescriptionListGroup,
  DescriptionListTerm,
  DescriptionListDescription,
  Checkbox,
  SearchInput,
  Grid,
  GridItem,
  Label,
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
} from '@patternfly/react-table';
import { useMigrations } from '../hooks/useMigrations';
import type { MigrationPlan, MigrationStep, NetworkMapping, StorageMapping, ProviderKind } from '../types/migration';
import { t } from '../i18n';

const KIND_LABELS: Record<ProviderKind, string> = {
  vmware: 'VMware',
  ovirt: 'oVirt / RHV',
  openstack: 'OpenStack',
  openshift: 'OpenShift',
};

interface WizardState {
  name: string;
  description: string;
  source: string;
  target: string;
  selectedVMs: string[];
  networkMap: { sourceNetwork: string; targetNetwork: string };
  storageMap: { sourceStorage: string; targetStorage: string };
}

const INITIAL_STATE: WizardState = {
  name: '',
  description: '',
  source: '',
  target: '',
  selectedVMs: [],
  networkMap: { sourceNetwork: '', targetNetwork: '' },
  storageMap: { sourceStorage: '', targetStorage: '' },
};

function StepGeneral({
  state,
  onChange,
  providers,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  providers: ReturnType<typeof useMigrations>['providers'];
}) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  const sourceProviders = providers.filter((p) => p.kind !== 'openshift');
  const targetProviders = providers.filter((p) => p.kind === 'openshift');

  return (
    <Form>
      <FormGroup label="Plan name" isRequired fieldId="plan-name">
        <TextInput
          id="plan-name"
          isRequired
          value={state.name}
          onChange={(_e, val) => onChange({ name: val })}
          aria-label="Plan name"
          placeholder="e.g. web-tier-migration"
        />
      </FormGroup>
      <FormGroup label="Description" fieldId="plan-desc">
        <TextArea
          id="plan-desc"
          value={state.description}
          onChange={(_e, val) => onChange({ description: val })}
          aria-label="Plan description"
          rows={3}
        />
      </FormGroup>
      <FormGroup label="Source provider" isRequired fieldId="plan-source">
        <Select
          isOpen={sourceOpen}
          onOpenChange={setSourceOpen}
          selected={state.source}
          onSelect={(_e, val) => { onChange({ source: val as string, selectedVMs: [] }); setSourceOpen(false); }}
          toggle={(ref) => (
            <MenuToggle ref={ref} onClick={() => setSourceOpen(!sourceOpen)} isExpanded={sourceOpen} style={{ width: '100%' }}>
              {state.source ? providers.find((p) => p.id === state.source)?.name ?? state.source : 'Select source provider'}
            </MenuToggle>
          )}
        >
          <SelectList>
            {sourceProviders.map((p) => (
              <SelectOption key={p.id} value={p.id} description={KIND_LABELS[p.kind]}>
                {p.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </FormGroup>
      <FormGroup label="Target provider" isRequired fieldId="plan-target">
        <Select
          isOpen={targetOpen}
          onOpenChange={setTargetOpen}
          selected={state.target}
          onSelect={(_e, val) => { onChange({ target: val as string }); setTargetOpen(false); }}
          toggle={(ref) => (
            <MenuToggle ref={ref} onClick={() => setTargetOpen(!targetOpen)} isExpanded={targetOpen} style={{ width: '100%' }}>
              {state.target ? providers.find((p) => p.id === state.target)?.name ?? state.target : 'Select target provider'}
            </MenuToggle>
          )}
        >
          <SelectList>
            {targetProviders.map((p) => (
              <SelectOption key={p.id} value={p.id} description={KIND_LABELS[p.kind]}>
                {p.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </FormGroup>
    </Form>
  );
}

function StepSelectVMs({
  state,
  onChange,
  vms,
}: {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  vms: ReturnType<typeof useMigrations>['vms'];
}) {
  const [search, setSearch] = useState('');
  const sourceVMs = vms.filter((v) => v.sourceProvider === state.source);
  const filtered = sourceVMs.filter(
    (v) => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.os.toLowerCase().includes(search.toLowerCase())
  );
  const allSelected = filtered.length > 0 && filtered.every((v) => state.selectedVMs.includes(v.id));

  const toggle = (id: string) =>
    onChange({
      selectedVMs: state.selectedVMs.includes(id)
        ? state.selectedVMs.filter((i) => i !== id)
        : [...state.selectedVMs, id],
    });

  const toggleAll = () =>
    onChange({
      selectedVMs: allSelected
        ? state.selectedVMs.filter((id) => !filtered.map((v) => v.id).includes(id))
        : [...new Set([...state.selectedVMs, ...filtered.map((v) => v.id)])],
    });

  return (
    <>
      <SearchInput
        placeholder="Filter VMs by name or OS"
        value={search}
        onChange={(_e, val) => setSearch(val)}
        onClear={() => setSearch('')}
        aria-label="Filter VMs"
        style={{ marginBottom: '1rem', maxWidth: '400px' }}
      />
      {filtered.length === 0 ? (
        <Alert variant="info" isInline title="No VMs found" style={{ marginTop: '1rem' }}>
          {sourceVMs.length === 0
            ? 'No VMs available for the selected source provider.'
            : 'No VMs match the search filter.'}
        </Alert>
      ) : (
        <Table aria-label="VM selection table" variant="compact">
          <caption>Select VMs to include in this migration plan</caption>
          <Thead>
            <Tr>
              <Th scope="col">
                <Checkbox
                  id="select-all-vms"
                  aria-label="Select all VMs"
                  isChecked={allSelected}
                  onChange={toggleAll}
                />
              </Th>
              <Th scope="col">Name</Th>
              <Th scope="col">OS</Th>
              <Th scope="col">CPU</Th>
              <Th scope="col">Memory (GB)</Th>
              <Th scope="col">Disk (GB)</Th>
              <Th scope="col">Power</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map((vm) => (
              <Tr key={vm.id} onRowClick={() => toggle(vm.id)} style={{ cursor: 'pointer' }}>
                <Td dataLabel="Select">
                  <Checkbox
                    id={`vm-${vm.id}`}
                    aria-label={`Select ${vm.name}`}
                    isChecked={state.selectedVMs.includes(vm.id)}
                    onChange={() => toggle(vm.id)}
                  />
                </Td>
                <Td dataLabel="Name">{vm.name}</Td>
                <Td dataLabel="OS">{vm.os}</Td>
                <Td dataLabel="CPU">{vm.cpu}</Td>
                <Td dataLabel="Memory (GB)">{vm.memoryGB}</Td>
                <Td dataLabel="Disk (GB)">{vm.diskGB}</Td>
                <Td dataLabel="Power">
                  <Label
                    color={vm.powerState === 'on' ? 'green' : vm.powerState === 'suspended' ? 'orange' : 'grey'}
                  >
                    {vm.powerState}
                  </Label>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {state.selectedVMs.length > 0 && (
        <Content component="small" style={{ marginTop: '0.75rem' }}>
          {state.selectedVMs.length} VM{state.selectedVMs.length !== 1 ? 's' : ''} selected
        </Content>
      )}
    </>
  );
}

const SAMPLE_NETWORKS = ['VM Network', 'Dev Network', 'Management Network', 'ovirtmgmt', 'Storage Network'];
const TARGET_NETWORKS = ['pod-network', 'multus-macvlan', 'sriov-network'];
const SAMPLE_STORAGE = ['datastore-ssd', 'datastore-hdd', 'data', 'iso', 'nfs-share'];
const TARGET_STORAGE = ['ocs-storagecluster-ceph-rbd', 'ocs-storagecluster-cephfs', 'hostpath-provisioner'];

function MappingRow({
  sourceLabel,
  targetLabel,
  sources,
  targets,
  sourceVal,
  targetVal,
  onSourceChange,
  onTargetChange,
}: {
  sourceLabel: string;
  targetLabel: string;
  sources: string[];
  targets: string[];
  sourceVal: string;
  targetVal: string;
  onSourceChange: (v: string) => void;
  onTargetChange: (v: string) => void;
}) {
  const [srcOpen, setSrcOpen] = useState(false);
  const [tgtOpen, setTgtOpen] = useState(false);
  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <Select
          isOpen={srcOpen}
          onOpenChange={setSrcOpen}
          selected={sourceVal}
          onSelect={(_e, v) => { onSourceChange(v as string); setSrcOpen(false); }}
          toggle={(ref) => (
            <MenuToggle ref={ref} onClick={() => setSrcOpen(!srcOpen)} isExpanded={srcOpen} style={{ width: '100%' }}>
              {sourceVal || `Select ${sourceLabel}`}
            </MenuToggle>
          )}
        >
          <SelectList>
            {sources.map((s) => <SelectOption key={s} value={s}>{s}</SelectOption>)}
          </SelectList>
        </Select>
      </GridItem>
      <GridItem span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span aria-hidden="true">→</span>
      </GridItem>
      <GridItem span={5}>
        <Select
          isOpen={tgtOpen}
          onOpenChange={setTgtOpen}
          selected={targetVal}
          onSelect={(_e, v) => { onTargetChange(v as string); setTgtOpen(false); }}
          toggle={(ref) => (
            <MenuToggle ref={ref} onClick={() => setTgtOpen(!tgtOpen)} isExpanded={tgtOpen} style={{ width: '100%' }}>
              {targetVal || `Select ${targetLabel}`}
            </MenuToggle>
          )}
        >
          <SelectList>
            {targets.map((s) => <SelectOption key={s} value={s}>{s}</SelectOption>)}
          </SelectList>
        </Select>
      </GridItem>
    </Grid>
  );
}

function StepNetworkMap({ state, onChange }: { state: WizardState; onChange: (patch: Partial<WizardState>) => void }) {
  return (
    <Form>
      <Content component="p" style={{ marginBottom: '1rem' }}>
        Map source networks to target networks in the OpenShift cluster.
      </Content>
      <FormGroup label="Network mapping" isRequired fieldId="net-map">
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Grid>
              <GridItem span={5}><strong>Source network</strong></GridItem>
              <GridItem span={2} />
              <GridItem span={5}><strong>Target network</strong></GridItem>
            </Grid>
          </FlexItem>
          <FlexItem>
            <MappingRow
              sourceLabel="source network"
              targetLabel="target network"
              sources={SAMPLE_NETWORKS}
              targets={TARGET_NETWORKS}
              sourceVal={state.networkMap.sourceNetwork}
              targetVal={state.networkMap.targetNetwork}
              onSourceChange={(v) => onChange({ networkMap: { ...state.networkMap, sourceNetwork: v } })}
              onTargetChange={(v) => onChange({ networkMap: { ...state.networkMap, targetNetwork: v } })}
            />
          </FlexItem>
        </Flex>
      </FormGroup>
    </Form>
  );
}

function StepStorageMap({ state, onChange }: { state: WizardState; onChange: (patch: Partial<WizardState>) => void }) {
  return (
    <Form>
      <Content component="p" style={{ marginBottom: '1rem' }}>
        Map source datastores to target storage classes in the OpenShift cluster.
      </Content>
      <FormGroup label="Storage mapping" isRequired fieldId="storage-map">
        <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Grid>
              <GridItem span={5}><strong>Source storage</strong></GridItem>
              <GridItem span={2} />
              <GridItem span={5}><strong>Target storage class</strong></GridItem>
            </Grid>
          </FlexItem>
          <FlexItem>
            <MappingRow
              sourceLabel="source storage"
              targetLabel="target storage class"
              sources={SAMPLE_STORAGE}
              targets={TARGET_STORAGE}
              sourceVal={state.storageMap.sourceStorage}
              targetVal={state.storageMap.targetStorage}
              onSourceChange={(v) => onChange({ storageMap: { ...state.storageMap, sourceStorage: v } })}
              onTargetChange={(v) => onChange({ storageMap: { ...state.storageMap, targetStorage: v } })}
            />
          </FlexItem>
        </Flex>
      </FormGroup>
    </Form>
  );
}

function StepReview({
  state,
  providers,
  vms,
}: {
  state: WizardState;
  providers: ReturnType<typeof useMigrations>['providers'];
  vms: ReturnType<typeof useMigrations>['vms'];
}) {
  const source = providers.find((p) => p.id === state.source);
  const target = providers.find((p) => p.id === state.target);
  const selectedVMs = vms.filter((v) => state.selectedVMs.includes(v.id));

  return (
    <>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Plan name</DescriptionListTerm>
          <DescriptionListDescription>{state.name}</DescriptionListDescription>
        </DescriptionListGroup>
        {state.description && (
          <DescriptionListGroup>
            <DescriptionListTerm>Description</DescriptionListTerm>
            <DescriptionListDescription>{state.description}</DescriptionListDescription>
          </DescriptionListGroup>
        )}
        <DescriptionListGroup>
          <DescriptionListTerm>Source provider</DescriptionListTerm>
          <DescriptionListDescription>{source?.name} ({source ? KIND_LABELS[source.kind] : ''})</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Target provider</DescriptionListTerm>
          <DescriptionListDescription>{target?.name} ({target ? KIND_LABELS[target.kind] : ''})</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>VMs selected</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedVMs.map((v) => v.name).join(', ')} ({selectedVMs.length} total)
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Network mapping</DescriptionListTerm>
          <DescriptionListDescription>
            {state.networkMap.sourceNetwork || '—'} → {state.networkMap.targetNetwork || '—'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Storage mapping</DescriptionListTerm>
          <DescriptionListDescription>
            {state.storageMap.sourceStorage || '—'} → {state.storageMap.targetStorage || '—'}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );
}

function CustomFooter({
  state,
  stepIndex,
  onFinish,
}: {
  state: WizardState;
  stepIndex: number;
  onFinish: () => void;
}) {
  const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();

  const isStep1Valid = !!state.name.trim() && !!state.source && !!state.target;
  const isStep2Valid = state.selectedVMs.length > 0;
  const isStep3Valid = !!state.networkMap.sourceNetwork && !!state.networkMap.targetNetwork;
  const isStep4Valid = !!state.storageMap.sourceStorage && !!state.storageMap.targetStorage;

  const isNextDisabled = () => {
    if (stepIndex === 1) return !isStep1Valid;
    if (stepIndex === 2) return !isStep2Valid;
    if (stepIndex === 3) return !isStep3Valid;
    if (stepIndex === 4) return !isStep4Valid;
    return false;
  };

  return (
    <WizardFooter
      activeStep={activeStep}
      onNext={stepIndex === 5 ? onFinish : goToNextStep}
      onBack={goToPrevStep}
      onClose={close}
      nextButtonText={stepIndex === 5 ? 'Create Plan' : 'Next'}
      isNextDisabled={isNextDisabled()}
      isBackHidden={stepIndex === 1}
    />
  );
}

export function PlanNewPage() {
  const navigate = useNavigate();
  const { providers, vms, addPlan, addToast } = useMigrations();
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [activeStepIndex, setActiveStepIndex] = useState(1);

  const onChange = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const handleFinish = () => {
    const networkMap: NetworkMapping | undefined =
      state.networkMap.sourceNetwork && state.networkMap.targetNetwork
        ? {
            id: `nm-new-${Date.now()}`,
            name: `${state.name}-network-map`,
            sourceNetwork: state.networkMap.sourceNetwork,
            targetNetwork: state.networkMap.targetNetwork,
          }
        : undefined;

    const storageMap: StorageMapping | undefined =
      state.storageMap.sourceStorage && state.storageMap.targetStorage
        ? {
            id: `sm-new-${Date.now()}`,
            name: `${state.name}-storage-map`,
            sourceStorage: state.storageMap.sourceStorage,
            targetStorage: state.storageMap.targetStorage,
          }
        : undefined;

    const steps: MigrationStep[] = state.selectedVMs.map((vmId) => ({
      vmId,
      phase: 'pending',
      progressPercent: 0,
    }));

    const newPlan: MigrationPlan = {
      id: `plan-${Date.now()}`,
      name: state.name,
      description: state.description,
      source: state.source,
      target: state.target,
      vms: state.selectedVMs,
      networkMap,
      storageMap,
      status: 'ready',
      progress: 0,
      createdAt: new Date().toISOString(),
      steps,
    };

    addPlan(newPlan);
    addToast({ variant: 'success', title: 'Plan created', body: `"${state.name}" is ready to start.` });
    navigate(`/plans/${newPlan.id}`);
  };

  const handleStepChange = (_e: MouseEvent<HTMLButtonElement>, current: { id: string | number }) => {
    const idx = ['general', 'vms', 'network', 'storage', 'review'].indexOf(String(current.id)) + 1;
    if (idx > 0) setActiveStepIndex(idx);
  };

  return (
    <PageSection hasBodyWrapper={false} style={{ height: 'calc(100vh - 76px)' }}>
      <Wizard
        height="100%"
        header={
          <Title headingLevel="h2" size="xl" style={{ padding: '1rem 1.5rem' }}>
            {t('plan.create.title')}
          </Title>
        }
        onClose={() => navigate('/plans')}
        onStepChange={handleStepChange}
        footer={<CustomFooter state={state} stepIndex={activeStepIndex} onFinish={handleFinish} />}
      >
        <WizardStep name="General" id="general">
          <StepGeneral state={state} onChange={onChange} providers={providers} />
        </WizardStep>
        <WizardStep name="Select VMs" id="vms">
          <StepSelectVMs state={state} onChange={onChange} vms={vms} />
        </WizardStep>
        <WizardStep name="Network mapping" id="network">
          <StepNetworkMap state={state} onChange={onChange} />
        </WizardStep>
        <WizardStep name="Storage mapping" id="storage">
          <StepStorageMap state={state} onChange={onChange} />
        </WizardStep>
        <WizardStep name="Review & create" id="review">
          <StepReview state={state} providers={providers} vms={vms} />
        </WizardStep>
      </Wizard>
    </PageSection>
  );
}