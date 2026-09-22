import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { UploadFileFunction } from 'twenty-sdk/front-component';

type AttachmentCreateClient = Pick<CoreApiClient, 'mutation'>;

export const uploadTaskAttachment = async ({
  coreClient,
  uploadFile,
  file,
  taskId,
  fieldMetadataId,
}: {
  coreClient: AttachmentCreateClient;
  uploadFile: UploadFileFunction;
  file: File;
  taskId: string;
  fieldMetadataId: string;
}): Promise<void> => {
  const uploaded = await uploadFile(file, {
    fieldMetadataId,
    fileName: file.name,
  });

  if (uploaded.status === 'failed') {
    throw new Error('Não foi possível enviar o arquivo.');
  }

  const attachmentResponse = (await coreClient.mutation({
    createAttachment: {
      __args: {
        data: {
          name: file.name,
          targetTaskId: taskId,
          file: [{ fileId: uploaded.file.fileId, label: file.name }],
        },
      },
      id: true,
    },
  } as never)) as unknown as { createAttachment?: { id?: string } | null };

  if (!attachmentResponse.createAttachment?.id) {
    throw new Error('Não foi possível anexar o arquivo à tarefa.');
  }
};
