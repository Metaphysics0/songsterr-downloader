import { PUBLIC_WEBSITE_URL } from '$env/static/public';
import { logger } from '$lib/utils/logger';
import client from '../qstash/client';

export class QStashService {
  sendPurchaseEvent = async (request: Request) => {
    const requestBody = await request.json();
    logger.log(
      `sending purchase event with params: ${JSON.stringify(requestBody)}`
    );
    return client.publishJSON({
      url: this.apiUrlPrefix + '/purchase',
      body: requestBody,
      method: 'POST'
    });
  };

  private get apiUrlPrefix() {
    return 'https://' + PUBLIC_WEBSITE_URL + '/api';
  }
}
