import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type FileUploadClient = Pick<MetadataApiClient, 'mutation'>;
type AttachmentCreateClient = Pick<CoreApiClient, 'mutation'>;

// createFileUpload/completeFileUpload are metadata-scoped resolvers (the
// core /graphql endpoint CoreApiClient talks to doesn't expose them), so the
// upload leg needs a MetadataApiClient; the Attachment record itself is a
// normal core object, created via CoreApiClient like everything else here.
export const uploadTaskAttachment = async ({
  metadataClient,
  coreClient,
  file,
  taskId,
  fetchImpl = fetch,
}: {
  metadataClient: FileUploadClient;
  coreClient: AttachmentCreateClient;
  file: File;
  taskId: string;
  fetchImpl?: typeof fetch;
}): Promise<void> => {
  const uploadTargetResponse = (await metadataClient.mutation({
    createFileUpload: {
      __args: {
        filename: file.name,
        size: file.size,
        fileFolder: 'FilesField',
        fieldMetadataUniversalIdentifier: ATTACHMENT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      },
      fileId: true,
      uploadUrl: true,
      contentType: true,
    },
  } as never)) as unknown as {
    createFileUpload?: {
      fileId?: string;
      uploadUrl?: string;
      contentType?: string;
    } | null;
  };

  const uploadTarget = uploadTargetResponse.createFileUpload;

  if (!uploadTarget?.fileId || !uploadTarget.uploadUrl) {
    throw new Error('Não foi possível iniciar o upload do arquivo.');
  }

  const putResponse = await fetchImpl(uploadTarget.uploadUrl, {
    method: 'PUT',
    headers: uploadTarget.contentType
      ? { 'Content-Type': uploadTarget.contentType }
      : undefined,
    body: file,
    credentials: 'omit',
  });

  if (!putResponse.ok) {
    throw new Error('Não foi possível enviar o arquivo.');
  }

  const completedResponse = (await metadataClient.mutation({
    completeFileUpload: {
      __args: { fileId: uploadTarget.fileId },
      id: true,
    },
  } as never)) as unknown as { completeFileUpload?: { id?: string } | null };

  const completedFileId = completedResponse.completeFileUpload?.id;

  if (!completedFileId) {
    throw new Error('Não foi possível concluir o upload do arquivo.');
  }

  const attachmentResponse = (await coreClient.mutation({
    createAttachment: {
      __args: {
        data: {
          name: file.name,
          targetTaskId: taskId,
          file: [{ fileId: completedFileId, label: file.name }],
        },
      },
      id: true,
    },
  } as never)) as unknown as { createAttachment?: { id?: string } | null };

  if (!attachmentResponse.createAttachment?.id) {
    throw new Error('Não foi possível anexar o arquivo à tarefa.');
  }
};
