import { logger } from '$lib/utils/logger';
import type { MailDataRequired } from '@sendgrid/mail';
import { SendGridRepository } from '../repositories/sendgrid.repository';
import { omit } from 'lodash-es';
import { BULK_TABS_EMAIL_TEMPLATE_ID_V2 } from '$env/static/private';

export class SendGridService {
  constructor(private repository = new SendGridRepository()) {}

  async sendBulkTabs(params: SendBulkTabsParams) {
    logger.log(
      `Sending bulk tabs purchase with params: ${JSON.stringify(
        omit(params, 'bulkTabsZipAttachments')
      )}`
    );

    return this.repository.sendEmail({
      recipients: [params.recipient],
      templateId: BULK_TABS_EMAIL_TEMPLATE_ID_V2,
      dynamicTemplateData: {
        artistName: params.artistName,
        paymentMethod: params.paymentMethod,
        totalBilledAmount: params.totalBilledAmount,
        purchaseDate: params.purchaseDate.toUTCString()
      },
      attachments: params.bulkTabsZipAttachments
    });
  }
}

export interface SendBulkTabsParams {
  recipient: string;
  artistName: string;
  paymentMethod: string;
  totalBilledAmount: number | string;
  purchaseDate: Date;
  bulkTabsZipAttachments: MailDataRequired['attachments'];
}
