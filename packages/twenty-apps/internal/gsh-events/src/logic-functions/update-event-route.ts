import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { UPDATE_EVENT_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { RelatedRecordCardinalityError } from 'src/errors/related-record-cardinality.error';
import { updateEventHandler } from 'src/logic-functions/handlers/update-event-handler';
import { validateEventUpdateRequest } from 'src/logic-functions/utils/validate-event-update-request.util';

const handler = async (event: RoutePayload): Promise<Response> => {
  const validation = validateEventUpdateRequest(event.body);

  if (!validation.request) {
    return new Response(JSON.stringify({ success: false, message: validation.errors.join(' ') }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await updateEventHandler(validation.request);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[gsh-events] Falha ao atualizar evento:', error);

    if (error instanceof RelatedRecordCardinalityError) {
      return new Response(JSON.stringify({ success: false, message: error.message }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Não foi possível atualizar o evento.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: UPDATE_EVENT_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'update-event-route',
  description: 'Carrega e salva, em uma única interface, os dados do evento selecionado.',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/gsh-events/update',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
