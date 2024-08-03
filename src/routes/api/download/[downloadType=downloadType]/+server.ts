import { jsonWithCors } from '$lib/server/cors';
import prisma from '$lib/server/prisma';
import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import { logger } from '$lib/utils/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const ipAddress = request.headers.get('x-forwarded-for');
  const port = request.headers.get('x-forwarded-port');
  // await prisma.iPAddress.upsert({
  //   create: {
  //     ipAddress: '212.59.70.23'
  //   }
  // });
  console.log('IP ADDRESS', ipAddress);
  console.log('port', port);

  // prisma.iPAddress.upsert()
  const service = new DownloadTabService(
    // ts-ignoring here because the downloadType param matcher already ensures this
    // @ts-ignore
    params.downloadType
  );

  logger.info(`Starting download with: ${JSON.stringify(params)}`);

  const response = await service.download(request);

  return jsonWithCors(request, response);
}) satisfies RequestHandler;
