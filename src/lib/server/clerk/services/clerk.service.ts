import { createClerkClient } from '@clerk/backend';
import {
  ClerkWebhookService,
  HandleUserWebhookParams
} from './clerk-webhook.service';
import { CLERK_SECRET_KEY } from '$env/static/private';

export class ClerkService {
  async getUserFromId(clerkUserId: string) {
    return this.client.users.getUser(clerkUserId);
  }

  async handleUserWebhook(params: HandleUserWebhookParams) {
    const service = new ClerkWebhookService();
    return service.handleUserWebhook(params);
  }

  private readonly client = createClerkClient({ secretKey: CLERK_SECRET_KEY });
}
