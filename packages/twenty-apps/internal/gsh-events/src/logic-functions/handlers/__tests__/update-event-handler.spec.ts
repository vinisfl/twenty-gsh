import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loadEventUpdateSnapshot, saveEventUpdate } = vi.hoisted(() => ({
  loadEventUpdateSnapshot: vi.fn(),
  saveEventUpdate: vi.fn(),
}));

vi.mock('src/logic-functions/services/load-event-update.service', () => ({ loadEventUpdateSnapshot }));
vi.mock('src/logic-functions/services/save-event-update.service', () => ({ saveEventUpdate }));

import { updateEventHandler } from 'src/logic-functions/handlers/update-event-handler';

describe('updateEventHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns not found when loading an unknown opportunity', async () => {
    loadEventUpdateSnapshot.mockResolvedValue(null);

    await expect(updateEventHandler({ action: 'LOAD', opportunityId: 'missing' })).resolves.toEqual({ success: false, message: 'Oportunidade não encontrada.' });
  });

  it('saves and reloads the snapshot', async () => {
    const snapshot = { opportunityId: 'id', opportunityName: 'Evento' };
    loadEventUpdateSnapshot.mockResolvedValue(snapshot);

    const result = await updateEventHandler({ action: 'SAVE', opportunityId: 'id', opportunity: {}, event: {}, proposal: { createNewVersion: false }, serviceOrder: { enabled: false }, company: {} });

    expect(saveEventUpdate).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ success: true, snapshot });
  });
});
