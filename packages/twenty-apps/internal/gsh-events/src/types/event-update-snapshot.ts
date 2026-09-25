import type { CompanyUpdate } from 'src/types/company-update';
import type { CorporateEventUpdate } from 'src/types/corporate-event-update';
import type { OpportunityUpdate } from 'src/types/opportunity-update';
import type { ProposalUpdate } from 'src/types/proposal-update';
import type { ServiceOrderUpdate } from 'src/types/service-order-update';

export type EventUpdateSnapshot = {
  opportunityId: string;
  opportunityName: string;
  companyName?: string;
  opportunity: OpportunityUpdate;
  event: CorporateEventUpdate;
  latestProposal: Omit<ProposalUpdate, 'createNewVersion'>;
  serviceOrder: Omit<ServiceOrderUpdate, 'enabled'>;
  company: CompanyUpdate;
};
