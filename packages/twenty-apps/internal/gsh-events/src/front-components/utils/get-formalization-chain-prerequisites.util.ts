// Mirror of
// packages/twenty-front/src/modules/object-record/record-persistence-gate/utils/getFormalizationChainPrerequisites.ts
// — manter em sincronia. See the runtime-boundary decision in issue #58.
const SERVICE_ORDER_READY_STATUSES = ['ISSUED', 'DISTRIBUTED', 'COMPLETED'];
const PURCHASE_FORM_SENT_STATUSES = ['SENT', 'COMPLETED'];
const CONTRACT_GENERATED_STATUSES = ['SENT', 'SIGNED'];

export const getIsServiceOrderReadyForPurchaseForm = (
  serviceOrderStatus: string | null | undefined,
): boolean =>
  serviceOrderStatus !== null &&
  serviceOrderStatus !== undefined &&
  SERVICE_ORDER_READY_STATUSES.includes(serviceOrderStatus);

export const getIsPurchaseFormSentForInvoice = (
  purchaseFormStatus: string | null | undefined,
): boolean =>
  purchaseFormStatus !== null &&
  purchaseFormStatus !== undefined &&
  PURCHASE_FORM_SENT_STATUSES.includes(purchaseFormStatus);

export const getIsInvoiceIssuedForContract = (
  invoiceStatus: string | null | undefined,
): boolean => invoiceStatus === 'ISSUED';

export const getIsContractGenerated = (
  contractStatus: string | null | undefined,
): boolean =>
  contractStatus !== null &&
  contractStatus !== undefined &&
  CONTRACT_GENERATED_STATUSES.includes(contractStatus);
