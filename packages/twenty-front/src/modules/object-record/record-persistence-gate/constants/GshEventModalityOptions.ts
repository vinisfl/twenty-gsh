import { type SelectOption } from 'twenty-ui/input';

import { GSH_EVENT_MODALITY_INTERNAL_VALUE } from '@/object-record/record-persistence-gate/constants/GshEventModalityInternalValue';

// GSH-specific: mirrors the option values declared in gsh-events'
// opportunity-modality.field.ts. Duplicated by hand because this modal lives
// in twenty-front core (see ADR-0001) and can't import from the sandboxed
// gsh-events app package.
export const GSH_EVENT_MODALITY_OPTIONS: SelectOption<string>[] = [
  { value: GSH_EVENT_MODALITY_INTERNAL_VALUE, label: 'Interno / na casa' },
  { value: 'EXTERNAL', label: 'Externo / fora da casa' },
];
