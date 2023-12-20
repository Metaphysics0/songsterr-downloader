import { PayPalService } from '$lib/server/payments/paypal/service';
import { ParamsHelper } from '$lib/server/utils/params';
import type { PayPalCreatePurchaseParams } from '$lib/types/payments';
import { logger } from '$lib/utils/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request }) => {
  try {
    const service = new PayPalService();
    const { cart } = await getRequiredParams(request);
    const response = await service.createOrder({ cart });
    return json(response);
  } catch (error) {
    logger.error('Failed to create order:', error);
    return json({ error: 'Failed to create order:' });
  }
}) satisfies RequestHandler;

async function getRequiredParams(request: Request) {
  const { getRequiredParams } = new ParamsHelper();

  return getRequiredParams<PayPalCreatePurchaseParams>({
    request,
    params: ['cart']
  });
}
