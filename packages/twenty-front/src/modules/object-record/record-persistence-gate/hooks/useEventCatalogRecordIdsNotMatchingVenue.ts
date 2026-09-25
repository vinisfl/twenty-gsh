import { useMemo } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { GSH_EVENT_CATALOG_VENUE_GROUP_OPTIONS_LIMIT } from '@/object-record/record-persistence-gate/constants/GshEventCatalogVenueGroupOptionsLimit';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type EventCatalogVenueGroupRecord = ObjectRecord & {
  venueGroup: string | null;
};

// GSH-specific: the Evento picker (FormSingleRecordPicker) is backed by the
// generic cross-object search endpoint, whose filter input only supports
// id/createdAt/updatedAt/deletedAt — there's no way to ask it for eventCatalog
// records matching an arbitrary field like venueGroup. Scoping Evento to the
// selected Venue therefore works by excluding every non-matching record
// instead of filtering server-side. Shares its underlying query with
// useEventCatalogVenueGroupOptions, so Apollo serves both from one request.
export const useEventCatalogRecordIdsNotMatchingVenue = (
  venue: string,
): string[] => {
  const { records } = useFindManyRecords<EventCatalogVenueGroupRecord>({
    objectNameSingular: 'eventCatalog',
    limit: GSH_EVENT_CATALOG_VENUE_GROUP_OPTIONS_LIMIT,
  });

  return useMemo(
    () =>
      records
        .filter((record) => record.venueGroup !== venue)
        .map((record) => record.id),
    [records, venue],
  );
};
