import { describe, expect, it, vi } from 'vitest';
import type { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getTaskAttachmentFileFieldMetadataId } from 'src/front-components/services/get-task-attachment-file-field-metadata-id.service';

describe('getTaskAttachmentFileFieldMetadataId', () => {
  it('returns the workspace-specific ID for the task attachment field', async () => {
    const query = vi.fn().mockResolvedValue({
      objects: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: [
          {
            node: {
              fieldsList: [
                {
                  id: 'task-files-field-id',
                  universalIdentifier:
                    ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
                },
              ],
            },
          },
        ],
      },
    });

    await expect(
      getTaskAttachmentFileFieldMetadataId(
        { query } as unknown as MetadataApiClient,
      ),
    ).resolves.toBe('task-files-field-id');
  });
});
