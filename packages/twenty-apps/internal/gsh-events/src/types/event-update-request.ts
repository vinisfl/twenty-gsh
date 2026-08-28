import type { LoadEventUpdateRequest } from 'src/types/load-event-update-request';
import type { SaveEventUpdateRequest } from 'src/types/save-event-update-request';

export type EventUpdateRequest = LoadEventUpdateRequest | SaveEventUpdateRequest;
