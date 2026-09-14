import { type GateFieldStatus } from '@/object-record/record-persistence-gate/types/GateFieldStatus';

export const getGateFieldStatus = ({
  isSatisfied,
  isInherited,
}: {
  isSatisfied: boolean;
  isInherited: boolean;
}): GateFieldStatus => {
  if (!isSatisfied) {
    return 'pending';
  }

  return isInherited ? 'inherited' : 'filled';
};
