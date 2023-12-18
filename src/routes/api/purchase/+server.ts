import { BulkDownloadService } from '$lib/server/services/bulkDownload.service';
import { QStashService } from '$lib/server/services/qStash.service';
import { SendGridService } from '$lib/server/services/sendgrid.service';
import { ParamsHelper } from '$lib/server/utils/params';
import { json, type RequestHandler } from '@sveltejs/kit';

// the message broker
export const PUT = (async ({ request }) => {
  try {
    const { sendPurchaseEvent } = new QStashService();
    const messageResponse = await sendPurchaseEvent(request);
    return json(messageResponse);
  } catch (error) {
    console.error('Error sending message', error);
    return json({ error: 'error sending message' });
  }
}) satisfies RequestHandler;

// the message itself
export const POST = (async ({ request }) => {
  try {
    const params = await getRequiredParams(request);

    const bulkTabsZipAttachments = await new BulkDownloadService(
      params.artistId
    ).getZipFileAndAttachmentForEmail(params.artistName);

    await new SendGridService().sendBulkTabs({
      artistName: params.artistName,
      recipient: params.purchaserEmail,
      totalBilledAmount: params.totalBilledAmount,
      paymentMethod: params.paymentMethod,
      purchaseDate: new Date(),
      bulkTabsZipAttachments
    });

    return json({ purchased: 'true' });
  } catch (error) {
    console.error('error sending params', error);

    return json({ error: 'error sending email' });
  }
}) satisfies RequestHandler;

async function getRequiredParams(request: Request) {
  const { getRequiredParams } = new ParamsHelper();

  return getRequiredParams<Record<string, string>>({
    request,
    params: [
      'purchaserEmail',
      'totalBilledAmount',
      'artistName',
      'artistId',
      'paymentMethod'
    ]
  });
}
