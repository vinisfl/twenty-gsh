import { type SelectOption } from 'twenty-ui/input';

// GSH-specific: mirrors the option values declared in gsh-events'
// opportunity-source.field.ts. Duplicated by hand because this modal lives
// in twenty-front core (see ADR-0001) and can't import from the sandboxed
// gsh-events app package.
export const GSH_EVENT_SOURCE_OPTIONS: SelectOption<string>[] = [
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'REFERRAL', label: 'Indicação' },
  { value: 'BH', label: 'BH' },
  { value: 'RIO', label: 'Rio' },
  { value: 'OTHER', label: 'Outro' },
];
