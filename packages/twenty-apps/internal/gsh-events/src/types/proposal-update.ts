export type ProposalUpdate = {
  createNewVersion: boolean;
  name?: string;
  version?: number;
  status?: string;
  totalBRL?: number;
  perPersonBRL?: number;
  validUntil?: string;
  paymentTerms?: string;
  documentUrl?: string;
  sentAt?: string;
  changeSummary?: string;
};
