import { BulkDownloadService } from '$lib/server/services/bulkDownload.service';
import { SendGridService } from '$lib/server/services/sendgrid.service';
import { normalize } from '$lib/utils/string';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request }) => {
  try {
    const params = await request.json();

    const bulkTabsData = await new BulkDownloadService(
      params.artistId
    ).getZipFileOfAllTabs();

    const attachment = await bulkTabsData.toBufferPromise();

    await new SendGridService().sendBulkTabs({
      artistName: params.artistName,
      recipient: params.purchaserEmail,
      totalBilledAmount: params.totalBilledAmount,
      paymentMethod: 'paypal',
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
