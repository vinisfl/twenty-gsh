import { type SelectOption } from 'twenty-ui/input';

const GSH_EVENT_ARENAS = [
  { value: 'Nubank', label: 'Nubank', city: 'São Paulo' },
  { value: 'Morumbis', label: 'Morumbis', city: 'São Paulo' },
] as const;

export const GSH_EVENT_ARENA_OPTIONS: SelectOption<string>[] =
  GSH_EVENT_ARENAS.map(({ value, label }) => ({ value, label }));

export const getGshEventArenaCity = (arena: string) =>
  GSH_EVENT_ARENAS.find(({ value }) => value === arena)?.city;
