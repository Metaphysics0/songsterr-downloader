import { CLERK_USER_WEBHOOK_SECRET } from '$env/static/private';
import { Webhook } from 'svix';
import { UserWebhookEvent, WebhookEvent } from '../types/clerk.types';
import { ClerkUserWebhookHandler } from '../utils/user-webhook-handler.util';
import { getMappedIpAddress } from '$lib/constants/ip-address-mapping.const';

export class ClerkWebhookService {
  async handleUserWebhook({
    request,
    clientIpAddress
  }: HandleUserWebhookParams): Promise<any> {
    const webhookEvent = await this.getAndVerifyWebhookEvent({
      request,
      webhookSecret: CLERK_USER_WEBHOOK_SECRET
    });

    const handler = new ClerkUserWebhookHandler({
      webhookEvent: webhookEvent as UserWebhookEvent,
      clientIpAddress: getMappedIpAddress(clientIpAddress)
    });

    await handler.handleWebhook();
  }

  private async getAndVerifyWebhookEvent({
    request,
    webhookSecret
  }: {
    request: Request;
    webhookSecret: string;
  }): Promise<WebhookEvent> {
    if (!webhookSecret) throw new Error('Missing webhook secret from .env');

    // Get the headers
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new Error('Error occured -- missing svix headers');
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      throw new Error('Error occured verifying webhook');
    }

    return evt;
  }
}

export interface HandleUserWebhookParams {
  request: Request;
  clientIpAddress: string;
}
