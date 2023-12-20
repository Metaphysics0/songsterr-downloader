import { PAYPAL_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_PAYPAL_CLIENT_ID } from '$env/static/public';
import type { PayPalCreatePurchaseParams } from '$lib/types/payments';
import { logger } from '$lib/utils/logger';
import { PaymentsBase } from '../base';

export class PayPalService extends PaymentsBase {
  constructor() {
    if (!PUBLIC_PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error(
        'Paypal client failed to initialize. Missing credentials'
      );
    }

    super();
  }
  /**
   * Create an order to start the transaction.
   * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
   */
  async createOrder(params: PayPalCreatePurchaseParams) {
    logger.log(
      `PayPal modal opened for artist: ${params.cart[0].selectedSong.artistId}`
    );

    const accessToken = await this.generateAccessToken();
    const { selectedSong } = params.cart[0];
    const paymentAmount =
      await this.getRequiredPaymentAmountForBulkTabsPurchase(selectedSong);

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: paymentAmount.toFixed(2).toString()
            }
          }
        ]
      })
    });

    return this.handleResponse(response);
  }

  /**
   * Capture payment for the created order to complete the transaction.
   * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
   */
  async captureOrder(orderID: string) {
    logger.log('completed paypal transaction for order: ', orderID);
    const accessToken = await this.generateAccessToken();
    const url = `${this.baseUrl}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
        // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
        // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
        // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
        // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
      }
    });

    return this.handleResponse(response);
  }

  async generateAccessToken() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: this.accessTokenHeaders
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Failed to generate Access Token:', error);
    }
  }

  private get accessTokenHeaders() {
    const auth = Buffer.from(
      PUBLIC_PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET
    ).toString('base64');

    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`
    };
  }

  private readonly baseUrl = 'https://api-m.paypal.com';
}
