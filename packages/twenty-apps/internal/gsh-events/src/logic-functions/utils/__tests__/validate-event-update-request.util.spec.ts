import { describe, expect, it } from 'vitest';
import { validateEventUpdateRequest } from 'src/logic-functions/utils/validate-event-update-request.util';

const validSave = () => ({
  action: 'SAVE',
  opportunityId: 'opportunity-id',
  opportunity: { audience: 80, amountBRL: 12_500, closedAmountBRL: 12_000 },
  event: { startAt: '2026-09-10T18:00:00.000Z', confirmedAudience: 75 },
  proposal: { createNewVersion: true, version: 2, totalBRL: 12_500 },
  serviceOrder: { enabled: false },
  company: {},
});

describe('validateEventUpdateRequest', () => {
  it('accepts load and a complete save payload', () => {
    expect(validateEventUpdateRequest({ action: 'LOAD', opportunityId: 'id' }).errors).toEqual([]);
    expect(validateEventUpdateRequest(validSave()).errors).toEqual([]);
  });

  it('rejects an invalid version, money, audience and date', () => {
    const value = validSave();
    value.opportunity.audience = -1;
    value.opportunity.amountBRL = -10;
    value.opportunity.closedAmountBRL = -20;
    value.event.confirmedAudience = -2;
    value.proposal.version = 0;
    value.proposal.totalBRL = -1;
    value.event.startAt = 'not-a-date';

    expect(validateEventUpdateRequest(value).errors).toEqual([
      'O público deve ser um número não negativo.',
      'O valor da oportunidade deve ser não negativo.',
      'O valor fechado deve ser não negativo.',
      'O público confirmado deve ser um número não negativo.',
      'Os valores da proposta devem ser não negativos.',
      'Uma nova proposta precisa de uma versão positiva.',
      'Uma ou mais datas são inválidas.',
    ]);
  });
});
