import { logger } from '$lib/utils/logger';
import { kv } from '@vercel/kv';

export class KvService {
  async setBulkSongsToDownload(
    artistId: string,
    results: any[]
  ): Promise<void> {
    if (!results) return;
    try {
      await kv.set(this.getCacheKey.forBulkSongs(artistId), results);
    } catch (error) {
      logger.error(`Kv set failed for artist id: ${artistId}`, error);
    }
  }

  async getBulkSongsToDownload(artistId: string): Promise<any[] | null> {
    try {
      const result = (await kv.get(
        this.getCacheKey.forBulkSongs(artistId)
      )) as any[];

      if (result) {
        logger.log('Cache HIT for artist id:', artistId);
        return result;
      }

      return null;
    } catch (error) {
      logger.error(`Cache retrieval failed for artist id: ${artistId}`);
      return null;
    }
  }

  private getCacheKey = {
    forBulkSongs: (artistId: string) => `BULK_SONGS_TO_DOWNLOAD_${artistId}`
  };
}
