import { ClerkService } from '$lib/server/clerk/services/clerk.service';
import { logger } from '$lib/utils/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, ...event }) => {
  try {
    logger.info('POST api/webhooks/users - Incoming webhook request');
    const service = new ClerkService();
    await service.handleUserWebhook({
      request,
      clientIpAddress: event.getClientAddress()
    });
    return json({ success: true });
  } catch (error) {
    logger.error(`POST api/webhooks/users - Webhook request failed - ${error}`);
    return json({ success: false, error });
  }
}) satisfies RequestHandler;
