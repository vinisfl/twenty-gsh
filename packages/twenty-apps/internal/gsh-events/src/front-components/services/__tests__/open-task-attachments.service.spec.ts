import {
  type OpenSidePanelPageFunction,
  SidePanelPages,
} from 'twenty-sdk/front-component';
import { describe, expect, it, vi } from 'vitest';

import { openTaskAttachments } from 'src/front-components/services/open-task-attachments.service';

describe('openTaskAttachments', () => {
  it('opens the task in its native side panel', async () => {
    const openSidePanelPage = vi.fn().mockResolvedValue(undefined);

    await openTaskAttachments(
      openSidePanelPage as OpenSidePanelPageFunction,
      'task-id',
    );

    expect(openSidePanelPage).toHaveBeenCalledWith({
      page: SidePanelPages.ViewRecord,
      recordId: 'task-id',
      objectNameSingular: 'task',
      resetNavigationStack: true,
    });
  });
});
