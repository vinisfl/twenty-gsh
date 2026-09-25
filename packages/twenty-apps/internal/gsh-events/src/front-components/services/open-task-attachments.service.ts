import {
  type OpenSidePanelPageFunction,
  SidePanelPages,
} from 'twenty-sdk/front-component';

export const openTaskAttachments = async (
  openSidePanelPage: OpenSidePanelPageFunction,
  taskId: string,
): Promise<void> => {
  await openSidePanelPage({
    page: SidePanelPages.ViewRecord,
    recordId: taskId,
    objectNameSingular: 'task',
    resetNavigationStack: true,
  });
};
