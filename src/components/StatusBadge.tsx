import React from 'react';
import { Label } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  PendingIcon,
  EditIcon,
  PlayIcon,
} from '@patternfly/react-icons';
import type { PlanStatus, ProviderStatus } from '../types/migration';
import { t } from '../i18n';

interface PlanStatusBadgeProps {
  status: PlanStatus;
}

export function PlanStatusBadge({ status }: PlanStatusBadgeProps) {
  const config: Record<PlanStatus, { color: 'green' | 'blue' | 'red' | 'grey' | 'teal'; icon: React.ReactNode; label: string }> = {
    succeeded: { color: 'green', icon: <CheckCircleIcon />, label: t('plan.status.succeeded') },
    running: { color: 'blue', icon: <InProgressIcon />, label: t('plan.status.running') },
    failed: { color: 'red', icon: <ExclamationCircleIcon />, label: t('plan.status.failed') },
    ready: { color: 'teal', icon: <PlayIcon />, label: t('plan.status.ready') },
    draft: { color: 'grey', icon: <EditIcon />, label: t('plan.status.draft') },
  };
  const { color, icon, label } = config[status];
  return (
    <Label color={color} icon={icon}>
      {label}
    </Label>
  );
}

interface ProviderStatusBadgeProps {
  status: ProviderStatus;
}

export function ProviderStatusBadge({ status }: ProviderStatusBadgeProps) {
  const config: Record<ProviderStatus, { color: 'green' | 'red' | 'orange' | 'grey'; icon: React.ReactNode; label: string }> = {
    ready: { color: 'green', icon: <CheckCircleIcon />, label: t('provider.status.ready') },
    error: { color: 'red', icon: <ExclamationCircleIcon />, label: t('provider.status.error') },
    critical: { color: 'orange', icon: <ExclamationCircleIcon />, label: t('provider.status.critical') },
    unknown: { color: 'grey', icon: <PendingIcon />, label: t('provider.status.unknown') },
  };
  const { color, icon, label } = config[status];
  return (
    <Label color={color} icon={icon}>
      {label}
    </Label>
  );
}