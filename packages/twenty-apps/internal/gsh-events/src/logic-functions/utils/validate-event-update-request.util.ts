import type { EventUpdateRequest } from 'src/types/event-update-request';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOptionalNonNegativeNumber = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === 'number' && Number.isFinite(value) && value >= 0);

const isOptionalDate = (value: unknown): boolean =>
  value === undefined || value === '' ||
  (typeof value === 'string' && !Number.isNaN(Date.parse(value)));

export const validateEventUpdateRequest = (
  value: unknown,
): { request?: EventUpdateRequest; errors: string[] } => {
  if (!isRecord(value)) {
    return { errors: ['Corpo da requisição inválido.'] };
  }

  const errors: string[] = [];

  if (value.action !== 'LOAD' && value.action !== 'SAVE') {
    errors.push('Ação inválida.');
  }

  if (typeof value.opportunityId !== 'string' || value.opportunityId === '') {
    errors.push('A oportunidade é obrigatória.');
  }

  if (value.action === 'SAVE') {
    if (!isRecord(value.opportunity) || !isRecord(value.event) ||
        !isRecord(value.proposal) || !isRecord(value.serviceOrder) ||
        !isRecord(value.company)) {
      errors.push('Os blocos da atualização estão incompletos.');
    } else {
      if (!isOptionalNonNegativeNumber(value.opportunity.audience)) {
        errors.push('O público deve ser um número não negativo.');
      }
      if (!isOptionalNonNegativeNumber(value.opportunity.amountBRL)) {
        errors.push('O valor da oportunidade deve ser não negativo.');
      }
      if (!isOptionalNonNegativeNumber(value.opportunity.closedAmountBRL)) {
        errors.push('O valor fechado deve ser não negativo.');
      }
      if (!isOptionalNonNegativeNumber(value.event.confirmedAudience)) {
        errors.push('O público confirmado deve ser um número não negativo.');
      }
      if (!isOptionalNonNegativeNumber(value.proposal.totalBRL) ||
          !isOptionalNonNegativeNumber(value.proposal.perPersonBRL)) {
        errors.push('Os valores da proposta devem ser não negativos.');
      }
      if (value.proposal.createNewVersion === true &&
          (typeof value.proposal.version !== 'number' || value.proposal.version < 1)) {
        errors.push('Uma nova proposta precisa de uma versão positiva.');
      }

      const dates = [
        value.opportunity.nextActionAt,
        value.opportunity.eventAt,
        value.event.startAt,
        value.event.endAt,
        value.proposal.validUntil,
        value.proposal.sentAt,
        value.serviceOrder.distributedAt,
      ];

      if (dates.some((date) => !isOptionalDate(date))) {
        errors.push('Uma ou mais datas são inválidas.');
      }
    }
  }

  return errors.length > 0
    ? { errors }
    : { request: value as EventUpdateRequest, errors };
};
