import { DownloadTabService } from '$lib/server/services/download-tab.service';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { logger } from '$lib/server/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const service = new DownloadTabService(
    params.downloadType as SupportedTabDownloadType
  );

  logger.info({ params }, 'Starting download');

  try {
    const response = await service.download(request);
    return new Response(response.buffer, {
      headers: {
        'Content-Type': response.contentType,
        'Content-Disposition': buildContentDisposition(response.fileName),
        'Content-Length': String(response.buffer.byteLength)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(
      { downloadType: params.downloadType, error: message },
      'Download failed'
    );
    return json({ error: message }, { status: 500 });
  }
}) satisfies RequestHandler;

function buildContentDisposition(fileName: string): string {
  const safeFileName = fileName.replace(/[\r\n]/g, '');
  const asciiFallback = safeFileName
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/["\\]/g, '_');

  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`;
}
