import { ClerkWebhookService } from '$lib/server/clerk/services/clerk-webhook.service';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, ...event }) => {
  const service = new ClerkWebhookService();

  await service.handleUserWebhook({
    request,
    clientIpAddress: event.getClientAddress()
  });

  return json({ foo: 'bar' });
}) satisfies RequestHandler;
