export class RelatedRecordCardinalityError extends Error {
  constructor(relationLabel: string) {
    super(`A oportunidade possui mais de um registro de ${relationLabel}. Corrija a duplicidade antes de continuar.`);
    this.name = 'RelatedRecordCardinalityError';
  }
}
