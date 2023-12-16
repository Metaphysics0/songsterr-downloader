import client from '../qstash/client';

export class QStashRepository {
  async publish(url: string, body: any) {
    return client.publishJSON({
      url,
      body
    });
  }
}
