import prisma from '$lib/server/prisma';
import { logger } from '$lib/utils/logger';
import { UserWebhookEvent } from '../types/clerk.types';
import { UserJSON } from '../types/json.types';

export class ClerkUserWebhookHandler {
  private webhookEvent: UserWebhookEvent;
  private clientIpAddress: string;
  constructor({
    webhookEvent,
    clientIpAddress
  }: {
    webhookEvent: UserWebhookEvent;
    clientIpAddress: string;
  }) {
    this.webhookEvent = webhookEvent;
    this.clientIpAddress = clientIpAddress;
  }

  public async handleWebhook(): Promise<void> {
    logger.info(
      `Clerk UserWebhookHandler - Beginning webhook for ${this.webhookEvent.type}`
    );
    switch (this.webhookEvent.type) {
      case 'user.created':
      case 'user.updated':
        await this.upsertUser();
      case 'user.deleted':
        await this.deleteUser();
      default:
        break;
    }
  }

  private async upsertUser(): Promise<void> {
    await prisma.user.upsert({
      where: {
        ipAddress: this.clientIpAddress
      },
      update: {
        email: this.userPrimaryEmailAddress,
        userMetadata: JSON.stringify(this.webhookEvent.data)
      },
      create: {
        ipAddress: this.clientIpAddress,
        email: this.userPrimaryEmailAddress,
        userMetadata: JSON.stringify(this.webhookEvent.data)
      }
    });
  }

  private async deleteUser(): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { email: this.userPrimaryEmailAddress }
    });
    if (!user) {
      logger.warn(
        `ClerkUserWebhookHanlder - Delete User - Unable to find user from webhook: ${JSON.stringify(
          this.webhookEvent
        )}`
      );
      return;
    }

    await prisma.user.delete({ where: { id: user.id } });
  }

  private get userPrimaryEmailAddress() {
    const webhookData = this.webhookEvent.data as UserJSON;
    const {
      email_addresses: emailAddressObjects,
      primary_email_address_id: primaryEmailAddressId
    } = webhookData;

    const primaryEmailAddress = emailAddressObjects.find(
      (emailAddressObject) => emailAddressObject.id === primaryEmailAddressId
    );

    if (!primaryEmailAddress) {
      return emailAddressObjects[0].email_address;
    }

    return primaryEmailAddress.email_address;
  }
}
