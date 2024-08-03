import { WebhookEvent } from '../types/clerk.types';

export class ClerkUserWebhookHandler {
  private readonly webhookEvent: WebhookEvent;
  constructor(webhookEvent: WebhookEvent) {
    this.webhookEvent = webhookEvent;
  }

  public async handleWebhook(): Promise<void> {
    switch (this.webhookEvent.type) {
      case 'user.created':
        await this.userCreated();
      case 'user.updated':
        await this.userUpdated();
      case 'user.deleted':
        await this.userDeleted();
      default:
        break;
    }
  }

  private async userCreated(): Promise<any> {
    console.log('user created');
  }

  private async userUpdated(): Promise<void> {
    console.log('user updated');
  }

  private async userDeleted(): Promise<void> {
    console.log('USER DELETED WEBHOOK');
  }
}
export async function handleUserWebhook(
  webhookEvent: WebhookEvent
): Promise<void> {}
