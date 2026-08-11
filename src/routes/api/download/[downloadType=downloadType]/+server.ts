import { DownloadTabService } from '$lib/server/services/download-tab.service';
import type { SupportedTabDownloadType } from '$lib/types/supported-tab-download-type';
import { logger } from '$lib/server/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

/*
 * Without this the function inherits the Vercel project default (10s on Hobby,
 * 15s on Pro), which a multi-track song can exceed on a cold start alone. The
 * per-request fetch deadlines keep the real worst case well under this ceiling.
 */
export const config = {
  maxDuration: 60
};

export const POST = (async ({ request, params }) => {
  const service = new DownloadTabService(
    params.downloadType as SupportedTabDownloadType
  );

  logger.info({ params }, 'Starting download');
  const startedAt = performance.now();

  try {
    const response = await service.download(request);

    logger.info(
      {
        downloadType: params.downloadType,
        byteLength: response.buffer.byteLength,
        durationMs: Math.round(performance.now() - startedAt)
      },
      'Download succeeded'
    );

    /*
     * The body is a fully buffered ArrayBuffer, so byteLength is exact and
     * safe to declare. Omitting it drops the response to chunked encoding,
     * which costs the browser its determinate download progress.
     */
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
      {
        downloadType: params.downloadType,
        error: message,
        durationMs: Math.round(performance.now() - startedAt)
      },
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
