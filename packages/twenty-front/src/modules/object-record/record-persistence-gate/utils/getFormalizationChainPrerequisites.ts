// GSH-specific: each field of the formalization chain (OS -> Formulário de
// Compra -> NF -> Contrato) stays locked until the previous one is complete.
// "Complete" means reaching or passing the value below, not matching it
// exactly, so a further step already reached (e.g. Formulário "Concluído")
// still counts as unlocking the next one.
const SERVICE_ORDER_READY_STATUSES = ['ISSUED', 'DISTRIBUTED', 'COMPLETED'];
const PURCHASE_FORM_SENT_STATUSES = ['SENT', 'COMPLETED'];

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
