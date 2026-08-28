import { describe, expect, it } from 'vitest';
import { compactUpdateData } from 'src/logic-functions/utils/compact-update-data.util';

describe('compactUpdateData', () => {
  it('keeps explicit empty values while removing undefined fields', () => {
    expect(compactUpdateData({ keep: '', clear: null, remove: undefined })).toEqual({ keep: '', clear: null });
  });
});
