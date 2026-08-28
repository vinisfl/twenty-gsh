import type { EventUpdateSnapshot } from 'src/types/event-update-snapshot';

export type EventUpdateResponse = {
  success: boolean;
  message: string;
  snapshot?: EventUpdateSnapshot;
};
