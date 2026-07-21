import { useCallback, useRef, useState } from 'react';
import { SelectSportModal } from '../../components/SelectSportModal';

type UseSportSelectionGuardOptions = {
  selectedSport: string | null;
  onSportSelect: (sportSlug: string) => void;
};

export function useSportSelectionGuard({ selectedSport, onSportSelect }: UseSportSelectionGuardOptions) {
  const [showModal, setShowModal] = useState(false);
  const pendingActionRef = useRef<((sportSlug: string) => void) | null>(null);

  const guardSportSelection = useCallback(
    (action: (sportSlug: string) => void) => {
      if (selectedSport) {
        action(selectedSport);
        return;
      }
      pendingActionRef.current = action;
      setShowModal(true);
    },
    [selectedSport],
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    pendingActionRef.current = null;
  }, []);

  const handleSportSelect = useCallback(
    (sportSlug: string) => {
      onSportSelect(sportSlug);
      setShowModal(false);
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action?.(sportSlug);
    },
    [onSportSelect],
  );

  const sportSelectionModal = showModal ? (
    <SelectSportModal onClose={closeModal} onSportSelect={handleSportSelect} />
  ) : null;

  return { guardSportSelection, sportSelectionModal };
}
