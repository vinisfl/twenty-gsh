import { act, render } from '@testing-library/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { OpportunityFormalizationChainGateHandler } from '@/object-record/record-persistence-gate/components/OpportunityFormalizationChainGateHandler';
import { recordFieldPersistGateHandlerState } from '@/object-record/record-persistence-gate/states/recordFieldPersistGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockUpdateOneRecord = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

const EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR = 'eventServiceOrder';

let opportunityRecords: unknown[] = [];
let serviceOrderRecords: unknown[] = [];
let taskTargetRecords: unknown[] = [];

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) =>
    objectNameSingular === CoreObjectNameSingular.Opportunity
      ? { records: opportunityRecords, loading: false }
      : objectNameSingular === CoreObjectNameSingular.TaskTarget
        ? { records: taskTargetRecords, loading: false }
        : { records: serviceOrderRecords, loading: false },
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: () => ({ id: 'object-metadata-id' }),
  }),
);

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

// Mounts a single instance and exposes a way to re-read the atom after
// mutating the mocked query results and re-rendering that same instance —
// mounting a second instance instead would compose two handlers together
// and make a stale one fire alongside the fresh one.
const renderHandler = () => {
  const { rerender } = render(<OpportunityFormalizationChainGateHandler />, {
    wrapper: Wrapper,
  });

  const getHandler = () => jotaiStore.get(recordFieldPersistGateHandlerState);

  const rerenderHandler = () => {
    rerender(<OpportunityFormalizationChainGateHandler />);

    return getHandler();
  };

  return { getHandler, rerenderHandler };
};

describe('OpportunityFormalizationChainGateHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    opportunityRecords = [
      {
        id: 'opportunity-1',
        ownerId: 'owner-1',
        purchaseFormStatus: 'NOT_STARTED',
        invoiceStatus: 'NOT_REQUESTED',
        contractStatus: 'NOT_STARTED',
      },
    ];
    serviceOrderRecords = [
      {
        id: 'service-order-1',
        opportunityId: 'opportunity-1',
        status: 'PREPARING',
      },
    ];
    mockUpdateOneRecord.mockResolvedValue({ id: 'task-1' });
    taskTargetRecords = [
      {
        id: 'task-target-os',
        targetOpportunityId: 'opportunity-1',
        task: {
          id: 'task-os',
          title: 'Gerar Ordem de Serviço',
          status: 'TODO',
        },
      },
      {
        id: 'task-target-purchase-form',
        targetOpportunityId: 'opportunity-1',
        task: {
          id: 'task-purchase-form',
          title: 'Preencher Formulário de Compra',
          status: 'TODO',
        },
      },
      {
        id: 'task-target-invoice',
        targetOpportunityId: 'opportunity-1',
        task: {
          id: 'task-invoice',
          title: 'Acompanhar emissão de NF junto ao financeiro',
          status: 'TODO',
        },
      },
      {
        id: 'task-target-contract',
        targetOpportunityId: 'opportunity-1',
        task: { id: 'task-contract', title: 'Gerar contrato', status: 'TODO' },
      },
    ];
  });

  it('is a no-op for fields outside the formalization chain', async () => {
    const { getHandler } = renderHandler();

    await expect(
      getHandler()?.({
        objectNameSingular: CoreObjectNameSingular.Opportunity,
        recordId: 'opportunity-1',
        fieldName: 'eventCurrentSituation',
        valueToPersist: 'IN_EXECUTION',
      }),
    ).resolves.toBe(true);
    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  describe('Formulário de Compra', () => {
    it('blocks editing while the service order has not been issued', async () => {
      const { getHandler } = renderHandler();

      await expect(
        getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'purchaseFormStatus',
          valueToPersist: 'SENT',
        }),
      ).resolves.toBe(false);
      expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) }),
      );
      expect(mockUpdateOneRecord).not.toHaveBeenCalled();
    });

    it('allows editing once the service order has been issued', async () => {
      serviceOrderRecords = [
        {
          id: 'service-order-1',
          opportunityId: 'opportunity-1',
          status: 'ISSUED',
        },
      ];
      const { getHandler } = renderHandler();

      await expect(
        getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'purchaseFormStatus',
          valueToPersist: 'SENT',
        }),
      ).resolves.toBe(true);
      expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
    });

    it('marks the purchase-form task as done once it is sent', async () => {
      serviceOrderRecords = [
        {
          id: 'service-order-1',
          opportunityId: 'opportunity-1',
          status: 'ISSUED',
        },
      ];
      const { getHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'purchaseFormStatus',
          valueToPersist: 'SENT',
        });
      });

      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: 'task-purchase-form',
        updateOneRecordInput: { status: 'DONE' },
      });
    });
  });

  describe('Nota Fiscal', () => {
    it('blocks editing until the purchase form has been sent', async () => {
      const { getHandler } = renderHandler();

      await expect(
        getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'invoiceStatus',
          valueToPersist: 'ISSUED',
        }),
      ).resolves.toBe(false);
      expect(mockUpdateOneRecord).not.toHaveBeenCalled();
    });

    it('marks the NF task done and starts the contract SLA once the NF is registered', async () => {
      opportunityRecords = [
        {
          id: 'opportunity-1',
          ownerId: 'owner-1',
          purchaseFormStatus: 'SENT',
          invoiceStatus: 'REQUESTED',
          contractStatus: 'NOT_STARTED',
        },
      ];
      const { getHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'invoiceStatus',
          valueToPersist: 'ISSUED',
        });
      });

      expect(mockUpdateOneRecord).toHaveBeenNthCalledWith(1, {
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: 'task-invoice',
        updateOneRecordInput: { status: 'DONE' },
      });
      expect(mockUpdateOneRecord).toHaveBeenNthCalledWith(2, {
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: 'task-contract',
        updateOneRecordInput: { dueAt: expect.any(String) },
      });

      const dueAt = new Date(
        mockUpdateOneRecord.mock.calls[1][0].updateOneRecordInput.dueAt,
      ).getTime();
      const expectedDueAt = Date.now() + 7 * 24 * 60 * 60 * 1_000;
      expect(Math.abs(dueAt - expectedDueAt)).toBeLessThan(5_000);
    });
  });

  describe('Contrato', () => {
    it('blocks editing until the NF has been issued', async () => {
      const { getHandler } = renderHandler();

      await expect(
        getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'contractStatus',
          valueToPersist: 'SENT',
        }),
      ).resolves.toBe(false);
    });

    it('marks the contract task done once the contract is sent', async () => {
      opportunityRecords = [
        {
          id: 'opportunity-1',
          ownerId: 'owner-1',
          purchaseFormStatus: 'SENT',
          invoiceStatus: 'ISSUED',
          contractStatus: 'NOT_STARTED',
        },
      ];
      const { getHandler } = renderHandler();

      await expect(
        getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'contractStatus',
          valueToPersist: 'SENT',
        }),
      ).resolves.toBe(true);
      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: 'task-contract',
        updateOneRecordInput: { status: 'DONE' },
      });
    });
  });

  describe('Ordem de Serviço', () => {
    it('is never blocked, being the first link of the chain', async () => {
      const { getHandler } = renderHandler();

      await expect(
        getHandler()?.({
          objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
          recordId: 'service-order-1',
          fieldName: 'status',
          valueToPersist: 'ISSUED',
        }),
      ).resolves.toBe(true);
    });

    it('marks the service-order task done once it is issued', async () => {
      taskTargetRecords.unshift({
        id: 'task-target-other-opportunity',
        targetOpportunityId: 'opportunity-2',
        task: {
          id: 'task-os-other-opportunity',
          title: 'Gerar Ordem de Serviço',
          status: 'TODO',
        },
      });
      const { getHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
          recordId: 'service-order-1',
          fieldName: 'status',
          valueToPersist: 'ISSUED',
        });
      });

      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: 'task-os',
        updateOneRecordInput: { status: 'DONE' },
      });
    });

    it('marks the service-order task done when the status jumps past issued', async () => {
      const { getHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
          recordId: 'service-order-1',
          fieldName: 'status',
          valueToPersist: 'DISTRIBUTED',
        });
      });

      expect(mockUpdateOneRecord).toHaveBeenCalledWith({
        objectNameSingular: CoreObjectNameSingular.Task,
        idToUpdate: 'task-os',
        updateOneRecordInput: { status: 'DONE' },
      });
    });
  });
});
