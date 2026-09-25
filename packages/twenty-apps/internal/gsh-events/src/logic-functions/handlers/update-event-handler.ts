import { loadEventUpdateSnapshot } from 'src/logic-functions/services/load-event-update.service';
import { saveEventUpdate } from 'src/logic-functions/services/save-event-update.service';
import type { EventUpdateRequest } from 'src/types/event-update-request';
import type { EventUpdateResponse } from 'src/types/event-update-response';

export const updateEventHandler = async (
  request: EventUpdateRequest,
): Promise<EventUpdateResponse> => {
  if (request.action === 'LOAD') {
    const snapshot = await loadEventUpdateSnapshot(request.opportunityId);

    return snapshot
      ? { success: true, message: 'Evento carregado.', snapshot }
      : { success: false, message: 'Oportunidade não encontrada.' };
  }

  await saveEventUpdate(request);
  const snapshot = await loadEventUpdateSnapshot(request.opportunityId);

  return {
    success: true,
    message: 'Evento atualizado com sucesso.',
    snapshot: snapshot ?? undefined,
  };
};
