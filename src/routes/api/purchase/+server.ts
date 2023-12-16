import { BulkDownloadService } from '$lib/server/services/bulkDownload.service';
import { QStashService } from '$lib/server/services/qStash.service';
import { SendGridService } from '$lib/server/services/sendgrid.service';
import { ParamsHelper } from '$lib/server/utils/params';
import { normalize } from '$lib/utils/string';
import { json, type RequestHandler } from '@sveltejs/kit';

// the message broker
export const PUT = (async ({ request }) => {
  try {
    const { sendPurchaseEvent } = new QStashService();
    const messageResponse = await sendPurchaseEvent(request);
    console.log('MESSAGE RESPONSE', messageResponse);

    return json(messageResponse);
  } catch (error) {
    console.error('error sending params', error);
    return json({ error });
  }
}) satisfies RequestHandler;

// the message itself
export const POST = (async ({ request }) => {
  try {
    const params = await getRequiredParams(request);

    const bulkTabsData = await new BulkDownloadService(
      params.artistId
    ).getZipFileOfAllTabs();

    const attachment = await bulkTabsData.toBufferPromise();

    await new SendGridService().sendBulkTabs({
      artistName: params.artistName,
      recipient: params.purchaserEmail,
      totalBilledAmount: params.totalBilledAmount,
      paymentMethod: params.paymentMethod,
      purchaseDate: new Date(),
      bulkTabsZipAttachments: [
        {
          content: Buffer.from(attachment).toString('base64'),
          filename: `${normalize(params.artistName)}-tabs.zip`,
          type: 'application/zip'
        }
      ]
    });
  } catch (error) {
    console.error('error sending params', error);
  }

  return json({ purchased: 'true' });
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
