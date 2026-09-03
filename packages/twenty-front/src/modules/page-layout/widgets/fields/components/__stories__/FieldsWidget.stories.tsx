import { type ApolloClient } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { expect, waitFor, within } from 'storybook/test';

import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { FieldsWidget } from '@/page-layout/widgets/fields/components/FieldsWidget';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  ViewType,
  ViewVisibility,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { ChipGeneratorsDecorator } from '~/testing/decorators/ChipGeneratorsDecorator';
import { FileUploadDecorator } from '~/testing/decorators/FileUploadDecorator';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);

const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'name',
});

const addressField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'address',
});

const employeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'employees',
});

const annualRecurringRevenueField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'annualRecurringRevenue',
});

const linkedinField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'linkedinLink',
});

const idealCustomerProfileField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObjectMetadataItem,
  fieldName: 'idealCustomerProfile',
});

const opportunityObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Opportunity,
);

const opportunityStageField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'stage',
});

const opportunityAmountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'amount',
});

const opportunityCloseDateField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'closeDate',
});

const opportunityPointOfContactField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'pointOfContact',
});

const opportunityOwnerField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'owner',
});

const TEST_RECORD_ID = 'test-fields-widget-record-123';
const TEST_OPPORTUNITY_RECORD_ID = 'test-fields-widget-opportunity-456';
const FIELDS_VIEW_ID = 'test-fields-view-001';
const OPPORTUNITY_FIELDS_VIEW_ID = 'test-opportunity-fields-view-001';
const TAB_ID_OVERVIEW = 'tab-overview';

const mockCompanyRecord: ObjectRecord = {
  __typename: 'Company',
  id: TEST_RECORD_ID,
  name: 'Acme Corporation',
  address: {
    addressStreet1: '123 Business St',
    addressStreet2: null,
    addressCity: 'San Francisco',
    addressState: 'CA',
    addressPostcode: '94102',
    addressCountry: 'United States',
    addressLat: null,
    addressLng: null,
  },
  employees: 250,
  linkedinLink: {
    primaryLinkUrl: 'https://linkedin.com/company/acme',
    primaryLinkLabel: null,
    secondaryLinks: null,
  },
  idealCustomerProfile: true,
  annualRecurringRevenue: {
    __typename: 'Currency',
    amountMicros: 5000000000000,
    currencyCode: 'USD',
  },
};

const mockOpportunityRecord: ObjectRecord = {
  __typename: 'Opportunity',
  id: TEST_OPPORTUNITY_RECORD_ID,
  stage: 'MEETING',
  amount: null,
  closeDate: null,
  pointOfContact: null,
  owner: null,
  // GSH's funnel stage field — "Aceite e cadastro" maps to the
  // "Formalização" group, see OpportunityFunnelStageValueToGroupName.
  eventProcessStage: 'ACCEPTANCE_REGISTRATION',
};

const setRecordInStore = (recordId: string, record: ObjectRecord) => {
  jotaiStore.set(recordStoreFamilyState.atomFamily(recordId), record);
};

const JestMetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const CoreClientProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloClient = useApolloClient() as ApolloClient;

  return (
    <ApolloCoreClientContext.Provider value={apolloClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};

const createPageLayoutWithWidget = (
  widget: PageLayoutWidget,
  objectMetadataId: string,
): PageLayout => ({
  applicationId: 'application-id-mock',
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Mock Page Layout',
  type: PageLayoutType.RECORD_PAGE,
  isSystemSideEffect: true,
  objectMetadataId,
  universalIdentifier: '20202020-0000-0000-0000-000000000001',
  tabs: [
    {
      isSystemSideEffect: false,
      universalIdentifier: 'universal-identifier-mock',
      __typename: 'PageLayoutTab' as const,
      isActive: true,
      applicationId: '',
      id: TAB_ID_OVERVIEW,
      title: 'Overview',
      position: 0,
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      widgets: [widget],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      deletedAt: null,
    },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

const createFieldsWidget = (viewId: string | null): PageLayoutWidget => ({
  isSystemSideEffect: false,
  universalIdentifier: 'universal-identifier-mock',
  __typename: 'PageLayoutWidget',
  applicationId: '',
  isActive: true,
  id: 'widget-fields',
  pageLayoutTabId: TAB_ID_OVERVIEW,
  type: WidgetType.FIELDS,
  title: 'Fields',
  objectMetadataId: companyObjectMetadataItem.id,
  gridPosition: {
    __typename: 'GridPosition',
    row: 0,
    column: 0,
    rowSpan: 4,
    columnSpan: 4,
  },
  configuration: {
    __typename: 'FieldsConfiguration',
    configurationType: WidgetConfigurationType.FIELDS,
    viewId,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
});

const createView = (
  overrides: Partial<ViewWithRelations> = {},
): ViewWithRelations => ({
  id: FIELDS_VIEW_ID,
  name: 'Company Fields',
  objectMetadataId: companyObjectMetadataItem.id,
  type: ViewType.FIELDS_WIDGET,
  icon: 'IconList',
  key: null,
  shouldHideEmptyGroups: false,
  position: 0,
  isCompact: false,
  viewFields: [],
  viewGroups: [],
  viewFilters: [],
  viewSorts: [],
  visibility: ViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: null,
  isActive: true,
  ...overrides,
});

const createViewField = (
  id: string,
  fieldMetadataId: string,
  position: number,
  viewFieldGroupId?: string,
) => ({
  id,
  fieldMetadataId,
  position,
  isVisible: true,
  isActive: true,
  size: 200,
  aggregateOperation: null,
  viewId: FIELDS_VIEW_ID,
  ...(viewFieldGroupId !== undefined && { viewFieldGroupId }),
});

const createViewFieldGroup = (
  id: string,
  name: string,
  position: number,
  viewFields: ReturnType<typeof createViewField>[],
  isVisible = true,
  viewId: string = FIELDS_VIEW_ID,
) => ({
  id,
  name,
  position,
  isVisible,
  isActive: true,
  viewId,
  viewFields,
});

const meta: Meta<typeof FieldsWidget> = {
  title: 'Modules/PageLayout/Widgets/FieldsWidget',
  component: FieldsWidget,
  decorators: [
    ComponentDecorator,
    ChipGeneratorsDecorator,
    FileUploadDecorator,
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof FieldsWidget>;

export const WithViewFieldGroups: Story = {
  render: () => {
    const contactInfoFields = [
      createViewField('vf-name', nameField.id, 0, 'group-contact-info'),
      createViewField('vf-address', addressField.id, 1, 'group-contact-info'),
      createViewField('vf-linkedin', linkedinField.id, 2, 'group-contact-info'),
    ];

    const businessFields = [
      createViewField('vf-employees', employeesField.id, 0, 'group-business'),
      createViewField(
        'vf-arr',
        annualRecurringRevenueField.id,
        1,
        'group-business',
      ),
      createViewField(
        'vf-icp',
        idealCustomerProfileField.id,
        2,
        'group-business',
      ),
    ];

    const view = createView({
      viewFields: [...contactInfoFields, ...businessFields],
      viewFieldGroups: [
        createViewFieldGroup(
          'group-contact-info',
          'Contact Info',
          0,
          contactInfoFields,
        ),
        createViewFieldGroup('group-business', 'Business', 1, businessFields),
      ],
    });

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    setTestViewsInMetadataStore(jotaiStore, [view]);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    setRecordInStore(TEST_RECORD_ID, mockCompanyRecord);

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper store={jotaiStore}>
              <LayoutRenderingProvider
                value={{
                  isInSidePanel: false,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: TEST_RECORD_ID,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                    presentation: 'stack',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldsWidget widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const contactInfoHeader = await canvas.findByText('Contact Info');
    expect(contactInfoHeader).toBeVisible();

    const businessHeader = await canvas.findByText('Business');
    expect(businessHeader).toBeVisible();

    const companyName = await canvas.findByText('Acme Corporation');
    expect(companyName).toBeVisible();
  },
};

export const WithDefaultGroups: Story = {
  render: () => {
    const view = createView();

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    setTestViewsInMetadataStore(jotaiStore, [view]);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    setRecordInStore(TEST_RECORD_ID, mockCompanyRecord);

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper store={jotaiStore}>
              <LayoutRenderingProvider
                value={{
                  isInSidePanel: false,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: TEST_RECORD_ID,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                    presentation: 'stack',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldsWidget widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const generalHeader = await canvas.findByText('General');
    expect(generalHeader).toBeVisible();

    const creationDateElements = await canvas.findAllByText('Creation date');
    expect(creationDateElements.length).toBeGreaterThan(0);
    expect(creationDateElements[0]).toBeVisible();
  },
};

export const Empty: Story = {
  render: () => {
    const view = createView({
      viewFieldGroups: [
        createViewFieldGroup('group-empty', 'Empty Group', 0, [], false),
      ],
    });

    const widget = createFieldsWidget(FIELDS_VIEW_ID);

    const pageLayoutData = createPageLayoutWithWidget(
      widget,
      companyObjectMetadataItem.id,
    );

    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    setTestViewsInMetadataStore(jotaiStore, [view]);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayoutData,
    );
    setRecordInStore(TEST_RECORD_ID, mockCompanyRecord);

    return (
      <div style={{ width: '400px', padding: '20px' }}>
        <JestMetadataAndApolloMocksWrapper>
          <CoreClientProviderWrapper>
            <PageLayoutTestWrapper store={jotaiStore}>
              <LayoutRenderingProvider
                value={{
                  isInSidePanel: false,
                  layoutType: PageLayoutType.RECORD_PAGE,
                  targetRecordIdentifier: {
                    id: TEST_RECORD_ID,
                    targetObjectNameSingular:
                      companyObjectMetadataItem.nameSingular,
                  },
                }}
              >
                <PageLayoutContentProvider
                  value={{
                    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                    presentation: 'stack',
                    tabId: TAB_ID_OVERVIEW,
                  }}
                >
                  <WidgetComponentInstanceContext.Provider
                    value={{ instanceId: widget.id }}
                  >
                    <FieldsWidget widget={widget} />
                  </WidgetComponentInstanceContext.Provider>
                </PageLayoutContentProvider>
              </LayoutRenderingProvider>
            </PageLayoutTestWrapper>
          </CoreClientProviderWrapper>
        </JestMetadataAndApolloMocksWrapper>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('No fields to display')).toBeVisible();
    });

    await waitFor(() => {
      expect(
        canvas.getByText('Configure this widget to display fields'),
      ).toBeVisible();
    });
  },
};

const renderOpportunityFieldsWidgetForFunnelStage = (record: ObjectRecord) => {
  const briefingFields = [
    createViewField('vf-stage', opportunityStageField.id, 0, 'group-briefing'),
  ];
  const commercialFields = [
    createViewField(
      'vf-amount',
      opportunityAmountField.id,
      0,
      'group-commercial',
    ),
  ];
  const formalizationFields = [
    createViewField(
      'vf-close-date',
      opportunityCloseDateField.id,
      0,
      'group-formalization',
    ),
  ];
  const productionFields = [
    createViewField(
      'vf-point-of-contact',
      opportunityPointOfContactField.id,
      0,
      'group-production',
    ),
  ];
  const postEventFields = [
    createViewField('vf-owner', opportunityOwnerField.id, 0, 'group-post'),
  ];

  const view = createView({
    id: OPPORTUNITY_FIELDS_VIEW_ID,
    objectMetadataId: opportunityObjectMetadataItem.id,
    viewFields: [
      ...briefingFields,
      ...commercialFields,
      ...formalizationFields,
      ...productionFields,
      ...postEventFields,
    ],
    viewFieldGroups: [
      createViewFieldGroup(
        'group-briefing',
        'Briefing do evento',
        0,
        briefingFields,
        true,
        OPPORTUNITY_FIELDS_VIEW_ID,
      ),
      createViewFieldGroup(
        'group-commercial',
        'Comercial e proposta',
        1,
        commercialFields,
        true,
        OPPORTUNITY_FIELDS_VIEW_ID,
      ),
      createViewFieldGroup(
        'group-formalization',
        'Formalização',
        2,
        formalizationFields,
        true,
        OPPORTUNITY_FIELDS_VIEW_ID,
      ),
      createViewFieldGroup(
        'group-production',
        'Produção do evento',
        3,
        productionFields,
        true,
        OPPORTUNITY_FIELDS_VIEW_ID,
      ),
      createViewFieldGroup(
        'group-post',
        'Pós-evento',
        4,
        postEventFields,
        true,
        OPPORTUNITY_FIELDS_VIEW_ID,
      ),
    ],
  });

  const widget = createFieldsWidget(OPPORTUNITY_FIELDS_VIEW_ID);
  widget.objectMetadataId = opportunityObjectMetadataItem.id;

  const pageLayoutData = createPageLayoutWithWidget(
    widget,
    opportunityObjectMetadataItem.id,
  );

  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );
  jotaiStore.set(isMinimalMetadataReadyState.atom, true);
  setTestViewsInMetadataStore(jotaiStore, [view]);
  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayoutData,
  );
  jotaiStore.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayoutData,
  );
  setRecordInStore(record.id, record);

  return (
    <div style={{ width: '400px', padding: '20px' }}>
      <JestMetadataAndApolloMocksWrapper>
        <CoreClientProviderWrapper>
          <PageLayoutTestWrapper store={jotaiStore}>
            <LayoutRenderingProvider
              value={{
                isInSidePanel: false,
                layoutType: PageLayoutType.RECORD_PAGE,
                targetRecordIdentifier: {
                  id: record.id,
                  targetObjectNameSingular:
                    opportunityObjectMetadataItem.nameSingular,
                },
              }}
            >
              <PageLayoutContentProvider
                value={{
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  presentation: 'stack',
                  tabId: TAB_ID_OVERVIEW,
                }}
              >
                <WidgetComponentInstanceContext.Provider
                  value={{ instanceId: widget.id }}
                >
                  <FieldsWidget widget={widget} />
                </WidgetComponentInstanceContext.Provider>
              </PageLayoutContentProvider>
            </LayoutRenderingProvider>
          </PageLayoutTestWrapper>
        </CoreClientProviderWrapper>
      </JestMetadataAndApolloMocksWrapper>
    </div>
  );
};

export const WithFunnelStageSync: Story = {
  render: () =>
    renderOpportunityFieldsWidgetForFunnelStage(mockOpportunityRecord),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The record's eventProcessStage is "ACCEPTANCE_REGISTRATION", which maps
    // to "Formalização" — the two groups before it should be marked
    // completed, and it should render expanded (its field is visible).
    const briefingCompletedIcon = await canvas.findByTitle(
      'Briefing do evento — Completed',
    );
    expect(briefingCompletedIcon).toBeVisible();

    const commercialCompletedIcon = await canvas.findByTitle(
      'Comercial e proposta — Completed',
    );
    expect(commercialCompletedIcon).toBeVisible();

    expect(
      canvas.queryByTitle('Formalização — Completed'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByTitle('Produção do evento — Completed'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByTitle('Pós-evento — Completed'),
    ).not.toBeInTheDocument();

    const formalizationHeader = await canvas.findByText('Formalização');
    expect(formalizationHeader).toBeVisible();

    const closeDateLabels = await canvas.findAllByText('Close date');
    expect(closeDateLabels.length).toBeGreaterThan(0);
    expect(closeDateLabels[0]).toBeVisible();
  },
};

export const WithFunnelStageOutOfFunnel: Story = {
  render: () =>
    renderOpportunityFieldsWidgetForFunnelStage({
      ...mockOpportunityRecord,
      // LOST/CANCELLED map to no group — every group should render
      // collapsed, and none should show the completed indicator.
      eventProcessStage: 'LOST',
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const briefingHeader = await canvas.findByText('Briefing do evento');
    expect(briefingHeader).toBeVisible();

    expect(
      canvas.queryByTitle('Briefing do evento — Completed'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByTitle('Comercial e proposta — Completed'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByTitle('Formalização — Completed'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByTitle('Produção do evento — Completed'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByTitle('Pós-evento — Completed'),
    ).not.toBeInTheDocument();

    // Every group's content should be collapsed, not just the ones after
    // some computed "current" group.
    expect(canvas.queryByText('Stage')).not.toBeInTheDocument();
    expect(canvas.queryAllByText('Close date')).toHaveLength(0);
    expect(canvas.queryByText('Owner')).not.toBeInTheDocument();
  },
};
