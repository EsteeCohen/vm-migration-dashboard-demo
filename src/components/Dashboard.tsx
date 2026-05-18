import React from 'react';
import { 
  PageSection, 
  Title, 
  Progress, 
  Label, 
  ProgressMeasureLocation
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon, PendingIcon } from '@patternfly/react-icons';
import { mockVms, type VmStatus } from '../data/mockVms';

export const Dashboard: React.FC = () => {
  
  const getStatusIcon = (status: VmStatus) => {
    switch (status) {
      case 'Completed': return <CheckCircleIcon />;
      case 'Failed': return <ExclamationCircleIcon />;
      case 'Running': return <InProgressIcon />;
      case 'Pending': return <PendingIcon />;
    }
  };

  const getStatusColor = (status: VmStatus) => {
    switch (status) {
      case 'Completed': return 'green';
      case 'Failed': return 'red';
      case 'Running': return 'blue';
      case 'Pending': return 'grey';
    }
  };

  return (
    <PageSection>
      <Title headingLevel="h1" size="3xl" style={{ marginBottom: '20px' }}>
        Virtual Machine Migration Status
      </Title>
      
      <Table aria-label="VM Migration Table" variant="compact">
        <Thead>
          <Tr>
            <Th>VM Name</Th>
            <Th>Source Provider</Th>
            <Th>Status</Th>
            <Th>Migration Progress</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mockVms.map(vm => (
            <Tr key={vm.id}>
              <Td dataLabel="VM Name"><b>{vm.name}</b></Td>
              <Td dataLabel="Source Provider">{vm.provider}</Td>
              <Td dataLabel="Status">
                <Label color={getStatusColor(vm.status)} icon={getStatusIcon(vm.status)}>
                  {vm.status}
                </Label>
              </Td>
              <Td dataLabel="Migration Progress">
                <Progress 
                  value={vm.progress} 
                  title={vm.status}
                  variant={vm.status === 'Failed' ? 'danger' : vm.status === 'Completed' ? 'success' : undefined}
                  measureLocation={ProgressMeasureLocation.outside}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </PageSection>
  );
};