import { describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';
import type { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { uploadTaskAttachment } from 'src/front-components/services/upload-task-attachment.service';

const makeFile = () =>
  new File(['conteúdo'], 'briefing.pdf', { type: 'application/pdf' });

describe('uploadTaskAttachment', () => {
  it('requests an upload target, PUTs the file, completes the upload, and attaches it to the task', async () => {
    const mutation = vi.fn().mockImplementation(async (operation: Record<string, unknown>) => {
      if ('createFileUpload' in operation) {
        return {
          createFileUpload: {
            fileId: 'file-id',
            uploadUrl: 'https://storage.example.com/upload/file-id',
            contentType: 'application/pdf',
          },
        };
      }

      return { completeFileUpload: { id: 'completed-file-id' } };
    });
    const metadataClient = { mutation } as unknown as MetadataApiClient;

    const coreMutation = vi
      .fn()
      .mockResolvedValue({ createAttachment: { id: 'attachment-id' } });
    const coreClient = { mutation: coreMutation } as unknown as CoreApiClient;

    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await uploadTaskAttachment({
      metadataClient,
      coreClient,
      file: makeFile(),
      taskId: 'task-id',
      fetchImpl,
    });

    expect(mutation.mock.calls[0][0].createFileUpload.__args).toEqual({
      filename: 'briefing.pdf',
      size: expect.any(Number),
      fileFolder: 'FilesField',
      fieldMetadataUniversalIdentifier: expect.any(String),
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://storage.example.com/upload/file-id',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        credentials: 'omit',
      }),
    );

    expect(mutation.mock.calls[1][0].completeFileUpload.__args).toEqual({
      fileId: 'file-id',
    });

    expect(coreMutation.mock.calls[0][0].createAttachment.__args).toEqual({
      data: {
        name: 'briefing.pdf',
        targetTaskId: 'task-id',
        file: [{ fileId: 'completed-file-id', label: 'briefing.pdf' }],
      },
    });
  });

  it('throws when the upload target request fails to return an upload url', async () => {
    const mutation = vi.fn().mockResolvedValue({ createFileUpload: null });
    const metadataClient = { mutation } as unknown as MetadataApiClient;
    const coreClient = { mutation: vi.fn() } as unknown as CoreApiClient;
    const fetchImpl = vi.fn();

    await expect(
      uploadTaskAttachment({
        metadataClient,
        coreClient,
        file: makeFile(),
        taskId: 'task-id',
        fetchImpl,
      }),
    ).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('throws when the PUT upload fails', async () => {
    const mutation = vi.fn().mockResolvedValue({
      createFileUpload: {
        fileId: 'file-id',
        uploadUrl: 'https://storage.example.com/upload/file-id',
        contentType: 'application/pdf',
      },
    });
    const metadataClient = { mutation } as unknown as MetadataApiClient;
    const coreClient = { mutation: vi.fn() } as unknown as CoreApiClient;
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });

    await expect(
      uploadTaskAttachment({
        metadataClient,
        coreClient,
        file: makeFile(),
        taskId: 'task-id',
        fetchImpl,
      }),
    ).rejects.toThrow();
  });

  it('throws when the attachment record fails to create', async () => {
    const mutation = vi.fn().mockImplementation(async (operation: Record<string, unknown>) => {
      if ('createFileUpload' in operation) {
        return {
          createFileUpload: {
            fileId: 'file-id',
            uploadUrl: 'https://storage.example.com/upload/file-id',
            contentType: 'application/pdf',
          },
        };
      }

      return { completeFileUpload: { id: 'completed-file-id' } };
    });
    const metadataClient = { mutation } as unknown as MetadataApiClient;
    const coreMutation = vi.fn().mockResolvedValue({ createAttachment: null });
    const coreClient = { mutation: coreMutation } as unknown as CoreApiClient;
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });

    await expect(
      uploadTaskAttachment({
        metadataClient,
        coreClient,
        file: makeFile(),
        taskId: 'task-id',
        fetchImpl,
      }),
    ).rejects.toThrow();
  });
});
