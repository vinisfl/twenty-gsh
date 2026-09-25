import { getShouldBlockOpportunityCreate } from '@/object-record/record-persistence-gate/utils/getShouldBlockOpportunityCreate';
import { CoreObjectNameSingular } from 'twenty-shared/types';

describe('getShouldBlockOpportunityCreate', () => {
  it('should block when a registered handler blocks', () => {
    expect(
      getShouldBlockOpportunityCreate({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordInput: {},
        opportunityCreateGateHandler: () => false,
      }),
    ).toBe(true);
  });

  it('should not block when a registered handler allows, reproducing native behavior', () => {
    expect(
      getShouldBlockOpportunityCreate({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordInput: {},
        opportunityCreateGateHandler: () => true,
      }),
    ).toBe(false);
  });

  it('should not block when no handler is registered', () => {
    expect(
      getShouldBlockOpportunityCreate({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordInput: {},
        opportunityCreateGateHandler: undefined,
      }),
    ).toBe(false);
  });

  it('should not block for objects other than Opportunity, even with a blocking handler registered', () => {
    expect(
      getShouldBlockOpportunityCreate({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordInput: {},
        opportunityCreateGateHandler: () => false,
      }),
    ).toBe(false);
  });

  it('should not call the handler for objects other than Opportunity', () => {
    const handler = jest.fn(() => false);

    getShouldBlockOpportunityCreate({
      objectNameSingular: CoreObjectNameSingular.Company,
      recordInput: {},
      opportunityCreateGateHandler: handler,
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
