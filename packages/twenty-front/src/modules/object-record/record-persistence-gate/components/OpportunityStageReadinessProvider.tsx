import { useContext, useEffect, useMemo, type ReactNode } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { OpportunityStageReadinessContext } from '@/object-record/record-persistence-gate/contexts/OpportunityStageReadinessContext';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { getOpportunityStageReadiness } from '@/object-record/record-persistence-gate/utils/getOpportunityStageReadiness';
import { getLatestProposal } from '@/object-record/record-persistence-gate/utils/getLatestProposal';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

type OpportunityReadinessRecord = ObjectRecord & {
  eventProcessStage: string | null;
  eventAudience: number | null;
  eventLocation: string | null;
  eventAt: string | null;
  amount: { amountMicros: number } | null;
  eventBudgetCompatible: boolean | null;
  eventClosedAmount: { amountMicros: number } | null;
  eventAcceptanceEvidence: string | null;
  contractStatus: string | null;
  companyId: string | null;
};

type CorporateEventReadinessRecord = ObjectRecord & {
  opportunityId: string | null;
  eventType: string | null;
  city: string | null;
  executionStatus: string | null;
  assemblyStatus: string | null;
  travelStatus: string | null;
  supplyStatus: string | null;
  teamStatus: string | null;
};

type CompanyReadinessRecord = ObjectRecord & {
  legalName: string | null;
  taxId: string | null;
  billingEmail: string | null;
};

type ProposalReadinessRecord = ObjectRecord & {
  opportunityId: string | null;
  status: string | null;
  version: number | null;
};

type OpportunityStageReadinessProviderProps = {
  children: ReactNode;
};

type OpportunityStageReadinessProviderContentProps = {
  children: ReactNode;
};

const getIdsForStages = ({
  opportunities,
  stages,
}: {
  opportunities: OpportunityReadinessRecord[];
  stages: string[];
}) =>
  opportunities
    .filter(({ eventProcessStage }) => stages.includes(eventProcessStage ?? ''))
    .map(({ id }) => id);

export const OpportunityStageReadinessProvider = ({
  children,
}: OpportunityStageReadinessProviderProps) => {
  const { objectMetadataItem } = useContext(RecordBoardContext);

  if (objectMetadataItem.nameSingular !== CoreObjectNameSingular.Opportunity) {
    return children;
  }

  return (
    <OpportunityStageReadinessProviderContent>
      {children}
    </OpportunityStageReadinessProviderContent>
  );
};

const OpportunityStageReadinessProviderContent = ({
  children,
}: OpportunityStageReadinessProviderContentProps) => {
  const recordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
  );
  const shouldLoadReadiness = recordIds.length > 0;

  const { records: opportunities } =
    useFindManyRecords<OpportunityReadinessRecord>({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      filter: { id: { in: recordIds } },
      limit: Math.max(recordIds.length, 1),
      skip: !shouldLoadReadiness,
      recordGqlFields: {
        id: true,
        eventProcessStage: true,
        eventAudience: true,
        eventLocation: true,
        eventAt: true,
        amount: true,
        eventBudgetCompatible: true,
        eventClosedAmount: true,
        eventAcceptanceEvidence: true,
        contractStatus: true,
        companyId: true,
      },
    });

  const corporateEventOpportunityIds = getIdsForStages({
    opportunities,
    stages: ['QUALIFICATION', 'PRODUCTION_FORMALIZATION_EVENT'],
  });
  const companyIds = opportunities
    .filter(
      ({ eventProcessStage }) =>
        eventProcessStage === 'ACCEPTANCE_REGISTRATION',
    )
    .map(({ companyId }) => companyId)
    .filter(isDefined);
  const proposalOpportunityIds = getIdsForStages({
    opportunities,
    stages: ['PROPOSAL_NEGOTIATION'],
  });

  const {
    records: corporateEvents,
    loading: corporateEventsLoading,
    error: corporateEventsError,
    hasNextPage: corporateEventsHasNextPage,
    fetchMoreRecords: fetchMoreCorporateEvents,
  } = useFindManyRecords<CorporateEventReadinessRecord>({
    objectNameSingular: 'corporateEvent',
    filter: { opportunityId: { in: corporateEventOpportunityIds } },
    orderBy: [{ createdAt: 'DescNullsLast' }],
    limit: 60,
    skip: corporateEventOpportunityIds.length === 0,
    recordGqlFields: {
      id: true,
      opportunityId: true,
      eventType: true,
      city: true,
      executionStatus: true,
      assemblyStatus: true,
      travelStatus: true,
      supplyStatus: true,
      teamStatus: true,
    },
  });

  const {
    records: companies,
    loading: companiesLoading,
    error: companiesError,
  } = useFindManyRecords<CompanyReadinessRecord>({
    objectNameSingular: CoreObjectNameSingular.Company,
    filter: { id: { in: companyIds } },
    limit: Math.max(companyIds.length, 1),
    skip: companyIds.length === 0,
    recordGqlFields: {
      id: true,
      legalName: true,
      taxId: true,
      billingEmail: true,
    },
  });

  const {
    records: proposals,
    loading: proposalsLoading,
    error: proposalsError,
    hasNextPage: proposalsHasNextPage,
    fetchMoreRecords: fetchMoreProposals,
  } = useFindManyRecords<ProposalReadinessRecord>({
    objectNameSingular: 'eventProposal',
    filter: { opportunityId: { in: proposalOpportunityIds } },
    orderBy: [{ version: 'DescNullsLast' }],
    limit: 60,
    skip: proposalOpportunityIds.length === 0,
    recordGqlFields: {
      id: true,
      opportunityId: true,
      status: true,
      version: true,
    },
  });

  useEffect(() => {
    if (!proposalsLoading && proposalsHasNextPage && !proposalsError) {
      void fetchMoreProposals();
    }
  }, [
    fetchMoreProposals,
    proposalsError,
    proposalsHasNextPage,
    proposalsLoading,
  ]);

  useEffect(() => {
    if (
      !corporateEventsLoading &&
      corporateEventsHasNextPage &&
      !corporateEventsError
    ) {
      void fetchMoreCorporateEvents();
    }
  }, [
    corporateEventsError,
    corporateEventsHasNextPage,
    corporateEventsLoading,
    fetchMoreCorporateEvents,
  ]);

  const readinessContextValue = useMemo(() => {
    const corporateEventByOpportunityId = new Map<
      string,
      CorporateEventReadinessRecord
    >();

    for (const corporateEvent of corporateEvents) {
      if (
        isDefined(corporateEvent.opportunityId) &&
        !corporateEventByOpportunityId.has(corporateEvent.opportunityId)
      ) {
        corporateEventByOpportunityId.set(
          corporateEvent.opportunityId,
          corporateEvent,
        );
      }
    }
    const companyById = new Map(
      companies.map((company) => [company.id, company]),
    );
    const proposalsByOpportunityId = new Map<
      string,
      ProposalReadinessRecord[]
    >();

    for (const proposal of proposals) {
      if (!isDefined(proposal.opportunityId)) {
        continue;
      }

      const opportunityProposals = proposalsByOpportunityId.get(
        proposal.opportunityId,
      );

      if (opportunityProposals) {
        opportunityProposals.push(proposal);
      } else {
        proposalsByOpportunityId.set(proposal.opportunityId, [proposal]);
      }
    }

    const readinessByOpportunityId = new Map(
      opportunities.flatMap((opportunity) => {
        const isProposalReadinessPending =
          opportunity.eventProcessStage === 'PROPOSAL_NEGOTIATION' &&
          (proposalsLoading ||
            proposalsHasNextPage ||
            isDefined(proposalsError));
        const isCorporateEventReadinessPending =
          (opportunity.eventProcessStage === 'QUALIFICATION' ||
            opportunity.eventProcessStage ===
              'PRODUCTION_FORMALIZATION_EVENT') &&
          (corporateEventsLoading ||
            corporateEventsHasNextPage ||
            isDefined(corporateEventsError));
        const isCompanyReadinessPending =
          opportunity.eventProcessStage === 'ACCEPTANCE_REGISTRATION' &&
          (companiesLoading || isDefined(companiesError));

        if (
          isProposalReadinessPending ||
          isCorporateEventReadinessPending ||
          isCompanyReadinessPending
        ) {
          return [];
        }

        const readiness = getOpportunityStageReadiness({
          opportunity,
          corporateEvent: corporateEventByOpportunityId.get(opportunity.id),
          company: isDefined(opportunity.companyId)
            ? companyById.get(opportunity.companyId)
            : undefined,
          latestProposal: getLatestProposal(
            proposalsByOpportunityId.get(opportunity.id) ?? [],
          ),
        });

        return isDefined(readiness)
          ? [[opportunity.id, readiness] as const]
          : [];
      }),
    );

    return { readinessByOpportunityId };
  }, [
    companies,
    companiesError,
    companiesLoading,
    corporateEvents,
    corporateEventsError,
    corporateEventsHasNextPage,
    corporateEventsLoading,
    opportunities,
    proposals,
    proposalsError,
    proposalsHasNextPage,
    proposalsLoading,
  ]);

  return (
    <OpportunityStageReadinessContext.Provider value={readinessContextValue}>
      {children}
    </OpportunityStageReadinessContext.Provider>
  );
};
