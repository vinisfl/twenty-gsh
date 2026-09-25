import { getShouldBlockOpportunityStageAdvanceDrop } from '@/object-record/record-persistence-gate/utils/getShouldBlockOpportunityStageAdvanceDrop';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const buildGroup = (
  position: number,
  value: string,
): RecordGroupDefinition => ({
  id: value,
  type: 'value' as RecordGroupDefinition['type'],
  title: value,
  value,
  color: 'blue',
  position,
  isVisible: true,
});

describe('getShouldBlockOpportunityStageAdvanceDrop', () => {
  it('should block a stage advance when the registered handler blocks', () => {
    expect(
      getShouldBlockOpportunityStageAdvanceDrop({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordId: 'record-1',
        sourceGroup: buildGroup(0, 'ENTRY'),
        destinationGroup: buildGroup(1, 'QUALIFICATION'),
        opportunityStageAdvanceGateHandler: () => false,
      }),
    ).toBe(true);
  });

  it('should not block a stage advance when the registered handler allows, reproducing native behavior', () => {
    expect(
      getShouldBlockOpportunityStageAdvanceDrop({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordId: 'record-1',
        sourceGroup: buildGroup(0, 'ENTRY'),
        destinationGroup: buildGroup(1, 'QUALIFICATION'),
        opportunityStageAdvanceGateHandler: () => true,
      }),
    ).toBe(false);
  });

  it('should never invoke the handler on a stage regression', () => {
    const handler = jest.fn(() => false);

    const shouldBlock = getShouldBlockOpportunityStageAdvanceDrop({
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      recordId: 'record-1',
      sourceGroup: buildGroup(1, 'QUALIFICATION'),
      destinationGroup: buildGroup(0, 'ENTRY'),
      opportunityStageAdvanceGateHandler: handler,
    });

    expect(handler).not.toHaveBeenCalled();
    expect(shouldBlock).toBe(false);
  });

  it('should not block when no handler is registered', () => {
    expect(
      getShouldBlockOpportunityStageAdvanceDrop({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordId: 'record-1',
        sourceGroup: buildGroup(0, 'ENTRY'),
        destinationGroup: buildGroup(1, 'QUALIFICATION'),
        opportunityStageAdvanceGateHandler: undefined,
      }),
    ).toBe(false);
  });

  it('should not call the handler for objects other than Opportunity', () => {
    const handler = jest.fn(() => false);

    const shouldBlock = getShouldBlockOpportunityStageAdvanceDrop({
      objectNameSingular: CoreObjectNameSingular.Company,
      recordId: 'record-1',
      sourceGroup: buildGroup(0, 'ENTRY'),
      destinationGroup: buildGroup(1, 'QUALIFICATION'),
      opportunityStageAdvanceGateHandler: handler,
    });

    expect(handler).not.toHaveBeenCalled();
    expect(shouldBlock).toBe(false);
  });

  it('should not block when source or destination group cannot be resolved', () => {
    expect(
      getShouldBlockOpportunityStageAdvanceDrop({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordId: 'record-1',
        sourceGroup: undefined,
        destinationGroup: buildGroup(1, 'QUALIFICATION'),
        opportunityStageAdvanceGateHandler: () => false,
      }),
    ).toBe(false);
  });
});
