import {
  getIsInvoiceIssuedForContract,
  getIsPurchaseFormSentForInvoice,
  getIsServiceOrderReadyForPurchaseForm,
} from '@/object-record/record-persistence-gate/utils/getFormalizationChainPrerequisites';

describe('getIsServiceOrderReadyForPurchaseForm', () => {
  it('is not ready while the service order is still being prepared', () => {
    expect(getIsServiceOrderReadyForPurchaseForm('PREPARING')).toBe(false);
  });

  it('is not ready when there is no service order yet', () => {
    expect(getIsServiceOrderReadyForPurchaseForm(undefined)).toBe(false);
    expect(getIsServiceOrderReadyForPurchaseForm(null)).toBe(false);
  });

  it('is ready once the service order has been issued or moved further', () => {
    expect(getIsServiceOrderReadyForPurchaseForm('ISSUED')).toBe(true);
    expect(getIsServiceOrderReadyForPurchaseForm('DISTRIBUTED')).toBe(true);
    expect(getIsServiceOrderReadyForPurchaseForm('COMPLETED')).toBe(true);
  });
});

describe('getIsPurchaseFormSentForInvoice', () => {
  it('is not sent while still not started', () => {
    expect(getIsPurchaseFormSentForInvoice('NOT_STARTED')).toBe(false);
    expect(getIsPurchaseFormSentForInvoice(undefined)).toBe(false);
  });

  it('is sent once the purchase form has been sent or completed', () => {
    expect(getIsPurchaseFormSentForInvoice('SENT')).toBe(true);
    expect(getIsPurchaseFormSentForInvoice('COMPLETED')).toBe(true);
  });
});

describe('getIsInvoiceIssuedForContract', () => {
  it('is not registered before it is issued', () => {
    expect(getIsInvoiceIssuedForContract('NOT_REQUESTED')).toBe(false);
    expect(getIsInvoiceIssuedForContract('REQUESTED')).toBe(false);
    expect(getIsInvoiceIssuedForContract(undefined)).toBe(false);
  });

  it('is registered once issued', () => {
    expect(getIsInvoiceIssuedForContract('ISSUED')).toBe(true);
  });
});
