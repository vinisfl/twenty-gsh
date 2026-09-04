import { act, render } from '@testing-library/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { OpportunityFormalizationChainGateHandler } from '@/object-record/record-persistence-gate/components/OpportunityFormalizationChainGateHandler';
import { recordFieldPersistGateHandlerState } from '@/object-record/record-persistence-gate/states/recordFieldPersistGateHandlerState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockCreateTask = jest.fn();
const mockCreateTaskTarget = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();

const EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR = 'eventServiceOrder';

let opportunityRecords: unknown[] = [];
let serviceOrderRecords: unknown[] = [];

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) =>
    objectNameSingular === CoreObjectNameSingular.Opportunity
      ? { records: opportunityRecords, loading: false }
      : { records: serviceOrderRecords, loading: false },
}));

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: ({
    objectNameSingular,
  }: {
    objectNameSingular: string;
  }) => {
    switch (objectNameSingular) {
      case CoreObjectNameSingular.Task:
        return { createOneRecord: mockCreateTask };
      case CoreObjectNameSingular.TaskTarget:
        return { createOneRecord: mockCreateTaskTarget };
      default:
        throw new Error(`Unexpected object: ${objectNameSingular}`);
    }
  },
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: mockEnqueueErrorSnackBar }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => ({ id: 'current-member-1' }),
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
    mockCreateTask.mockResolvedValue({ id: 'task-1' });
    mockCreateTaskTarget.mockResolvedValue({ id: 'task-target-1' });
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
    expect(mockCreateTask).not.toHaveBeenCalled();
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
      expect(mockCreateTask).not.toHaveBeenCalled();
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

    it('creates the NF follow-up task the first time it is marked as sent, and only then', async () => {
      serviceOrderRecords = [
        {
          id: 'service-order-1',
          opportunityId: 'opportunity-1',
          status: 'ISSUED',
        },
      ];
      const { getHandler, rerenderHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'purchaseFormStatus',
          valueToPersist: 'SENT',
        });
      });

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Acompanhar emissão de NF junto ao financeiro',
          assigneeId: 'owner-1',
        }),
      );
      expect(mockCreateTaskTarget).toHaveBeenCalledWith({
        taskId: 'task-1',
        targetOpportunityId: 'opportunity-1',
      });

      // Already sent: re-saving the same value must not re-create the task.
      opportunityRecords = [
        { ...(opportunityRecords[0] as object), purchaseFormStatus: 'SENT' },
      ];
      const handlerAfterSent = rerenderHandler();

      await act(async () => {
        await handlerAfterSent?.({
          objectNameSingular: CoreObjectNameSingular.Opportunity,
          recordId: 'opportunity-1',
          fieldName: 'purchaseFormStatus',
          valueToPersist: 'SENT',
        });
      });

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
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
      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it('creates the contract task with a 7-day due date once the NF is registered', async () => {
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

      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Gerar contrato',
          assigneeId: 'owner-1',
          dueAt: expect.any(String),
        }),
      );

      const dueAt = new Date(mockCreateTask.mock.calls[0][0].dueAt).getTime();
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

    it('allows editing once the NF has been issued and does not create a further task', async () => {
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
      expect(mockCreateTask).not.toHaveBeenCalled();
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

    it('creates the purchase-form task the first time it is marked as issued, and only then', async () => {
      const { getHandler, rerenderHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
          recordId: 'service-order-1',
          fieldName: 'status',
          valueToPersist: 'ISSUED',
        });
      });

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Preencher Formulário de Compra',
          assigneeId: 'owner-1',
        }),
      );
      expect(mockCreateTaskTarget).toHaveBeenCalledWith({
        taskId: 'task-1',
        targetOpportunityId: 'opportunity-1',
      });

      // Already issued: distributing later must not re-create the task.
      serviceOrderRecords = [
        {
          id: 'service-order-1',
          opportunityId: 'opportunity-1',
          status: 'ISSUED',
        },
      ];
      const handlerAfterIssued = rerenderHandler();

      await act(async () => {
        await handlerAfterIssued?.({
          objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
          recordId: 'service-order-1',
          fieldName: 'status',
          valueToPersist: 'DISTRIBUTED',
        });
      });

      expect(mockCreateTask).toHaveBeenCalledTimes(1);
    });

    it('still creates the purchase-form task when the status jumps straight past "issued"', async () => {
      const { getHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
          recordId: 'service-order-1',
          fieldName: 'status',
          valueToPersist: 'DISTRIBUTED',
        });
      });

      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Preencher Formulário de Compra' }),
      );
    });

    it('skips the task rather than assigning it to the current user when the opportunity cannot be resolved', async () => {
      opportunityRecords = [];
      const { getHandler } = renderHandler();

      await act(async () => {
        await getHandler()?.({
          objectNameSingular: EVENT_SERVICE_ORDER_OBJECT_NAME_SINGULAR,
          recordId: 'service-order-1',
          fieldName: 'status',
          valueToPersist: 'ISSUED',
        });
      });

      expect(mockCreateTask).not.toHaveBeenCalled();
    });
  });
});
