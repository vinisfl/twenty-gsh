import { type SelectOption } from 'twenty-ui/input';

// GSH-specific: mirrors the option values declared in gsh-events'
// event.object.ts (eventType field). Duplicated by hand because this modal
// lives in twenty-front core (see ADR-0001) and can't import from the
// sandboxed gsh-events app package.
export const GSH_EVENT_TYPE_OPTIONS: SelectOption<string>[] = [
  { value: 'COFFEE_BREAK', label: 'Coffee break' },
  { value: 'WELCOME_COFFEE', label: 'Welcome coffee' },
  { value: 'HAPPY_HOUR', label: 'Happy hour' },
  { value: 'COCKTAIL', label: 'Coquetel' },
  { value: 'FAIR', label: 'Feira' },
  { value: 'MEAL', label: 'Refeição' },
  { value: 'OTHER', label: 'Outro' },
];
