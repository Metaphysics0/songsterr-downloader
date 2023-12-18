import { PUBLIC_DEVELOPMENT_URL, PUBLIC_WEBSITE_URL } from '$env/static/public';
import client from '../qstash/client';

export class QStashService {
  sendPurchaseEvent = async (request: Request) => {
    return client.publishJSON({
      url: this.apiUrlPrefix + '/purchase',
      body: await request.json(),
      method: 'POST'
    });
  };

  private get apiUrlPrefix() {
    return 'https://11cc-212-59-70-23.ngrok-free.app/api';
    // return 'https://' + PUBLIC_WEBSITE_URL + '/api';
    // return protocol + domain + '/api';
  }
}
