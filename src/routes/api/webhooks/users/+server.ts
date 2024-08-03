import { ClerkWebhookService } from '$lib/server/clerk/services/clerk-webhook.service';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params }) => {
  const service = new ClerkWebhookService();

  await service.handleUserWebhook(request);

  return json({ foo: 'bar' });
}) satisfies RequestHandler;
