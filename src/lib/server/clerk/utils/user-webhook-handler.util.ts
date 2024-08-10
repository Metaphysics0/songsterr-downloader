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
      `Clerk UserWebhookHandler - Beginning webhook event for ${this.webhookEvent.type} `
    );
    switch (this.webhookEvent.type) {
      case 'user.created':
      case 'user.updated':
        await this.upsertUser();
        break;
      case 'user.deleted':
        await this.deleteUser();
        break;
      default:
        break;
    }
  }

  private async upsertUser(): Promise<void> {
    try {
      const logSuffix = `with params: ipAddress: ${this.clientIpAddress}, email: ${this.userPrimaryEmailAddress}`;
      logger.info(
        `Clerk UserWebhookHandler - upserting user from ip address ${logSuffix}`
      );
      await prisma.user.upsert({
        where: { ipAddress: this.clientIpAddress },
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
      logger.info(`Clerk UserWebhookHandler - upserted user ${logSuffix}`);
    } catch (error) {
      logger.error(
        `Clerk UserWebhookHandler - error upserting user  - ${error}`
      );
    }
  }

  private async deleteUser(): Promise<void> {
    try {
      logger.info(
        `Clerk UserWebhookHandler - deleteUser - deleting user from ip address with email: ${this.userPrimaryEmailAddress}`
      );
      const user = await prisma.user.findFirst({
        where: { email: this.userPrimaryEmailAddress }
      });
      if (!user) {
        logger.warn(
          `ClerkUserWebhookHanlder - deleteUser - Unable to find user from webhook: ${JSON.stringify(
            this.webhookEvent
          )}`
        );
        return;
      }

      await prisma.user.delete({ where: { id: user.id } });
    } catch (error) {
      logger.error(`Clerk UserWebhookHandler - deleteUser - error - ${error}`);
    }
  }

  private get userPrimaryEmailAddress(): string {
    try {
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
    } catch (error) {
      logger.error(
        'Clerk UserWebhookHandler - Unable to get user email from webhook event',
        error
      );
      throw new Error('Missing email from webhook payload');
    }
  }
}
