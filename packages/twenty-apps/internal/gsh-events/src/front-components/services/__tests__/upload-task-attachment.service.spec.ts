import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { UploadFileFunction } from 'twenty-sdk/front-component';

import { uploadTaskAttachment } from 'src/front-components/services/upload-task-attachment.service';

const makeFile = () =>
  new File(['conteúdo'], 'briefing.pdf', { type: 'application/pdf' });

describe('uploadTaskAttachment', () => {
  it('uploads through the native host and then attaches the uploaded file to the task', async () => {
    const uploadFile = vi.fn().mockResolvedValue({
      status: 'uploaded',
      file: {
        fileId: 'uploaded-file-id',
        path: 'briefing.pdf',
        url: 'https://storage.example.com/briefing.pdf',
        size: 9,
        mimeType: 'application/pdf',
      },
    }) as unknown as UploadFileFunction;
    const mutation = vi
      .fn()
      .mockResolvedValue({ createAttachment: { id: 'attachment-id' } });

    await uploadTaskAttachment({
      coreClient: { mutation } as unknown as CoreApiClient,
      uploadFile,
      file: makeFile(),
      taskId: 'task-id',
      fieldMetadataId: 'task-files-field-id',
    });

    expect(uploadFile).toHaveBeenCalledWith(
      expect.any(File),
      {
        fieldMetadataId: 'task-files-field-id',
        fileName: 'briefing.pdf',
      },
    );
    expect(mutation.mock.calls[0][0].createAttachment.__args).toEqual({
      data: {
        name: 'briefing.pdf',
        targetTaskId: 'task-id',
        file: [{ fileId: 'uploaded-file-id', label: 'briefing.pdf' }],
      },
    });
  });

  it('does not create an attachment when the native upload fails', async () => {
    const uploadFile = vi
      .fn()
      .mockResolvedValue({ status: 'failed', reason: 'upload-failed' }) as unknown as UploadFileFunction;
    const mutation = vi.fn();

    await expect(
      uploadTaskAttachment({
        coreClient: { mutation } as unknown as CoreApiClient,
        uploadFile,
        file: makeFile(),
        taskId: 'task-id',
        fieldMetadataId: 'task-files-field-id',
      }),
    ).rejects.toThrow('Não foi possível enviar o arquivo.');

    expect(mutation).not.toHaveBeenCalled();
  });
});
