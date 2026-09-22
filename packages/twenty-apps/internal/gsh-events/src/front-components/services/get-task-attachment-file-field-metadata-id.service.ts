import type { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const OBJECTS_PAGE_SIZE = 100;

type ObjectsPage = {
  fields: { id: string; universalIdentifier: string | null }[];
  nextCursor: string | null;
};

const fetchObjectsPage = async (
  metadataClient: Pick<MetadataApiClient, 'query'>,
  after: string | null,
): Promise<ObjectsPage> => {
  const result = await metadataClient.query({
    objects: {
      __args: {
        paging: { first: OBJECTS_PAGE_SIZE, ...(after ? { after } : {}) },
        filter: {},
      },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: {
        node: { fieldsList: { id: true, universalIdentifier: true } },
      },
    },
  });

  return {
    fields: result.objects.edges.flatMap((edge) => edge.node.fieldsList ?? []),
    nextCursor: result.objects.pageInfo.hasNextPage
      ? (result.objects.pageInfo.endCursor ?? null)
      : null,
  };
};

// Field IDs differ per workspace. The native upload host requires the local
// ID, while the app definition only has the stable universal identifier.
export const getTaskAttachmentFileFieldMetadataId = async (
  metadataClient: Pick<MetadataApiClient, 'query'>,
): Promise<string | null> => {
  let cursor: string | null = null;

  for (;;) {
    const page = await fetchObjectsPage(metadataClient, cursor);
    const fileField = page.fields.find(
      (field) =>
        field.universalIdentifier ===
        ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
    );

    if (fileField) {
      return fileField.id;
    }

    if (page.nextCursor === null) {
      return null;
    }

    cursor = page.nextCursor;
  }
};
