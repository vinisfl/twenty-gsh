import { useMemo } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { type SelectOption } from 'twenty-ui/input';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { GSH_EVENT_CATALOG_VENUE_GROUP_OPTIONS_LIMIT } from '@/object-record/record-persistence-gate/constants/GshEventCatalogVenueGroupOptionsLimit';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

type EventCatalogVenueGroupRecord = ObjectRecord & {
  venueGroup: string | null;
};

// GSH-specific: Venue's options are the distinct venueGroup values already
// present on eventCatalog records (synced from the data warehouse), not a
// fixed enum, so there's nothing to declare as a static options constant.
// Only call this from a tree that's confirmed eventCatalog is on the
// workspace schema (same throwing behavior as useCreateOneRecord elsewhere
// in this app — see OpportunityCreateGateModal's isEventCatalogAvailable).
export const useEventCatalogVenueGroupOptions = (): SelectOption<string>[] => {
  const { records } = useFindManyRecords<EventCatalogVenueGroupRecord>({
    objectNameSingular: 'eventCatalog',
    limit: GSH_EVENT_CATALOG_VENUE_GROUP_OPTIONS_LIMIT,
  });

  return useMemo(() => {
    const venueGroups = new Set<string>();

    for (const record of records) {
      if (isNonEmptyString(record.venueGroup)) {
        venueGroups.add(record.venueGroup);
      }
    }

    return Array.from(venueGroups)
      .sort((a, b) => a.localeCompare(b))
      .map((venueGroup) => ({ value: venueGroup, label: venueGroup }));
  }, [records]);
};
