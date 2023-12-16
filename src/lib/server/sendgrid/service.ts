// to do
import { SENDGRID_API_KEY } from '$env/static/private';
import { logger } from '$lib/utils/logger';
import sgMail, { type MailDataRequired } from '@sendgrid/mail';

export class SendGridService {
  async sendEmail({
    recipients,
    templateId,
    subject,
    dynamicTemplateData = {},
    attachments = []
  }: {
    recipients: string[];
    templateId: any;
    subject: string;
    dynamicTemplateData?: Record<string, any>;
    attachments?: MailDataRequired['attachments'];
  }) {
    try {
      sgMail.setApiKey(SENDGRID_API_KEY);
      const payload = {
        to: recipients[0],
        from: SendGridService.FROM_EMAIL,
        subject,
        dynamicTemplateData,
        templateId,
        attachments
      } as MailDataRequired | MailDataRequired[];

      await sgMail.send(payload);
    } catch (error) {
      logger.error('error sending email: ', error);
    }
  }

  static FROM_EMAIL = 'ryanroberts562@gmail.com';
}
