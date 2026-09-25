import type { CompanyUpdate } from 'src/types/company-update';
import type { CorporateEventUpdate } from 'src/types/corporate-event-update';
import type { OpportunityUpdate } from 'src/types/opportunity-update';
import type { ProposalUpdate } from 'src/types/proposal-update';
import type { ServiceOrderUpdate } from 'src/types/service-order-update';

export type SaveEventUpdateRequest = {
  action: 'SAVE';
  opportunityId: string;
  opportunity: OpportunityUpdate;
  event: CorporateEventUpdate;
  proposal: ProposalUpdate;
  serviceOrder: ServiceOrderUpdate;
  company: CompanyUpdate;
};
