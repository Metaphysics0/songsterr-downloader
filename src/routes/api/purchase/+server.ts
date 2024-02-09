import { BulkDownloadService } from '$lib/server/services/bulkDownload.service';
import { QStashService } from '$lib/server/services/qStash.service';
import { SendGridService } from '$lib/server/services/sendgrid.service';
import { ParamsHelper } from '$lib/server/utils/params';
import { logger } from '$lib/utils/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

// the message broker
export const PUT = (async ({ request }) => {
  try {
    const { sendPurchaseEvent } = new QStashService();
    const messageResponse = await sendPurchaseEvent(request);
    return json(messageResponse);
  } catch (error) {
    logger.error('Error sending purchase event', error);
    return json({ error: 'error sending purchase event' });
  }
}) satisfies RequestHandler;

// the message consumer
export const POST = (async ({ request }) => {
  try {
    const params = await getRequiredParamsForPurchase(request);
    logger.log(
      `consuming purchase event with params: ${JSON.stringify(params)}`
    );

    const bulkTabsZipAttachments = await new BulkDownloadService(
      params.artistId
    ).getZipFileAndAttachmentForEmail(params.artistName);

    await new SendGridService().sendBulkTabs({
      artistName: params.artistName,
      recipient: params.purchaserEmail,
      totalBilledAmount: params?.totalBilledAmount,
      paymentMethod: params?.paymentMethod,
      purchaseDate: new Date(),
      bulkTabsZipAttachments
    });

    return json({ purchased: 'true' });
  } catch (error) {
    console.error('Error completing purchase transaction', error);

    return json({ error: 'error sending email' });
  }
}) satisfies RequestHandler;

async function getRequiredParamsForPurchase(request: Request) {
  return new ParamsHelper().getRequiredParams<Record<string, string>>({
    request,
    params: ['purchaserEmail', 'artistName', 'artistId']
  });
}
