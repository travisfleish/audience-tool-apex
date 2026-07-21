import { NotebookPage } from '../../../pages/NotebookPage';
import type { Deal } from '../../../core/dealBuilder';

interface PmgNotebookProps {
  deal: Deal;
  onDealSubmitted: () => void;
  onRemoveAudience: () => void;
  onRemoveMoment: () => void;
}

export function PmgNotebook({
  deal,
  onDealSubmitted,
  onRemoveAudience,
  onRemoveMoment,
}: PmgNotebookProps) {
  return (
    <NotebookPage
      deal={deal}
      onDealSubmitted={onDealSubmitted}
      onRemoveAudience={onRemoveAudience}
      onRemoveMoment={onRemoveMoment}
    />
  );
}
