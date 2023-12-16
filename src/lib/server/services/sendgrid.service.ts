import { logger } from '$lib/utils/logger';
import type { MailDataRequired } from '@sendgrid/mail';
import { SendGridRepository } from '../repositories/sendgrid.repository';
import { omit } from 'lodash-es';

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
      templateId: 'd-656ddd08e7ce41b08d141294f271e360',
      dynamicTemplateData: {
        artistName: params.artistName,
        paymentMethod: params.paymentMethod,
        totalBilledAmount: params.totalBilledAmount,
        purchaseDate: params.purchaseDate
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
