import { PayPalService } from '$lib/server/payments/paypal/service';
import { logger } from '$lib/utils/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, params, fetch }) => {
  try {
    const { orderId } = params;
    if (!orderId) throw new Error('order id param missing');

    const service = new PayPalService();
    const response = await service.captureOrder(orderId);
    console.log('PAYPAL CAPTURE RESPONSE', JSON.stringify(response));

    await triggerPurchaseEvent(fetch, request);

    return json(response);
  } catch (error) {
    logger.error('Failed to capture order:', error);
    return json({ error: 'Failed to capture order:' });
  }
}) satisfies RequestHandler;

async function triggerPurchaseEvent(fetchImpl: typeof fetch, request: Request) {
  const { selectedSong, purchaserEmail } = await request.json();
  const eventResponse = await fetchImpl('/api/purchase', {
    method: 'PUT',
    body: JSON.stringify({
      purchaserEmail,
      artistName: selectedSong.artist,
      artistId: selectedSong.artistId
    })
  });

  logger.log(`triggering purchase event for artist`, selectedSong.artistId);
  return eventResponse.json();
}
