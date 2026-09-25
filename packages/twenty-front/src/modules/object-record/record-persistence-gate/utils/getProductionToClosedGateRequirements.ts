import { type GateRequirementCheckResult } from '@/object-record/record-persistence-gate/types/GateRequirementCheckResult';
import { buildGateRequirementCheckResult } from '@/object-record/record-persistence-gate/utils/buildGateRequirementCheckResult';

export type ProductionToClosedGateRequirementKey =
  | 'contractSigned'
  | 'executionCompleted'
  | 'assemblyReady'
  | 'travelReady'
  | 'supplyReady'
  | 'teamReady';

type ProductionToClosedGateOpportunity = {
  contractStatus: string | null | undefined;
};

type ProductionToClosedGateCorporateEvent = {
  executionStatus: string | null | undefined;
  assemblyStatus: string | null | undefined;
  travelStatus: string | null | undefined;
  supplyStatus: string | null | undefined;
  teamStatus: string | null | undefined;
};

// Mirrors the checklist status values declared in gsh-events'
// event.object.ts (assemblyStatus/travelStatus/supplyStatus/teamStatus):
// only "Pronto"/"Pronta" and "Não aplicável" satisfy the gate.
const isChecklistItemReady = (value: string | null | undefined): boolean =>
  value === 'READY' || value === 'NOT_APPLICABLE';

export const getProductionToClosedGateRequirements = ({
  opportunity,
  corporateEvent,
}: {
  opportunity: ProductionToClosedGateOpportunity | null | undefined;
  corporateEvent: ProductionToClosedGateCorporateEvent | null | undefined;
}): GateRequirementCheckResult<ProductionToClosedGateRequirementKey> =>
  buildGateRequirementCheckResult<ProductionToClosedGateRequirementKey>({
    contractSigned: opportunity?.contractStatus === 'SIGNED',
    executionCompleted: corporateEvent?.executionStatus === 'COMPLETED',
    assemblyReady: isChecklistItemReady(corporateEvent?.assemblyStatus),
    travelReady: isChecklistItemReady(corporateEvent?.travelStatus),
    supplyReady: isChecklistItemReady(corporateEvent?.supplyStatus),
    teamReady: isChecklistItemReady(corporateEvent?.teamStatus),
  });
