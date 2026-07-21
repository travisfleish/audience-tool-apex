import { APP_VARIANT } from '../appVariant';
import { ActivateModal as PmgActivateModal } from '../apps/pmg/components/ActivateModal';
import { IndexExchangeActivateModal } from '../apps/index-exchange/components/IndexExchangeActivateModal';
import { Audience } from './types';
import type { MomentActivationTarget } from './moments/types';

export interface ActivationModalProps {
  audience: Audience;
  displayName: string;
  requestAudiences?: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
  moment?: MomentActivationTarget | null;
  onSubmitted?: () => void;
  onClose: () => void;
}

export function ActivationModal(props: ActivationModalProps) {
  if (APP_VARIANT === 'index-exchange') {
    return <IndexExchangeActivateModal {...props} />;
  }
  return <PmgActivateModal {...props} />;
}
