import { SENDGRID_API_KEY } from '$env/static/private';
import { logger } from '$lib/utils/logger';
import sgMail, { type MailDataRequired } from '@sendgrid/mail';

export class SendGridRepository {
  async sendEmail({
    recipients,
    templateId,
    subject = '',
    dynamicTemplateData = {},
    attachments = []
  }: SendEmailParams) {
    try {
      sgMail.setApiKey(SENDGRID_API_KEY);

      const emailsToSend = recipients.map((recipient) => {
        const payload = {
          to: recipient,
          from: SendGridRepository.FROM_EMAIL,
          subject,
          dynamicTemplateData,
          templateId,
          attachments
        } as MailDataRequired | MailDataRequired[];

        return sgMail.send(payload);
      });

      return Promise.all(emailsToSend);
    } catch (error) {
      logger.error('error sending email: ', error);
    }
  }

  static readonly FROM_EMAIL = 'ryan@fullstackservices.io';
}

interface SendEmailParams {
  recipients: string[];
  templateId: any;
  subject?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: MailDataRequired['attachments'];
}
