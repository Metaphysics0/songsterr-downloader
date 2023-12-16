import { dev } from '$app/environment';
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
    const protocol = dev ? 'http://' : 'https://';
    const domain = dev ? PUBLIC_DEVELOPMENT_URL : PUBLIC_WEBSITE_URL;

    // replace with ngrok during local development
    return protocol + domain + '/api';
  }
}
