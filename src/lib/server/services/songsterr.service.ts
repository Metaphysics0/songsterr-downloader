import { logger } from '$lib/server/logger';
import { scraper } from '../utils/scraper.util';
import type { SelectedSong } from '$lib/types';
import { parseSelectedSong } from '$lib/songsterr/tab-meta';
import { findSyncSets } from '$lib/songsterr/video-points';
import Fetcher from '../utils/fetcher.util';

export class SongsterrService {
  /*
   * Returns everything the browser needs to download the tab itself. This
   * server-side scrape is what Songsterr blocks from datacenter IPs; the
   * bookmarklet path skips it entirely.
   */
  async getSelectedSongFromTabUrl(tabUrl: string): Promise<SelectedSong> {
    const doc = await scraper.getDocumentFromUrl(tabUrl, 'html');
    if (!doc) throw new Error('Unable to get page data from songsterr');

    let current: unknown;
    try {
      const stateScript =
        doc.getElementById('state')?.childNodes?.[0]?.nodeValue ||
        doc.getElementById('state')?.textContent ||
        '';
      current = JSON.parse(stateScript)?.meta?.current;
    } catch (error) {
      logger.error({ err: error }, 'error parsing metadata');
      throw new Error('Error reading tab data');
    }

    const song = parseSelectedSong({
      ...(current as Record<string, unknown>),
      byLinkUrl: tabUrl
    });

    // Video sync is optional extra data: never let it fail the lookup.
    const syncSets = await this.getSyncSets(tabUrl, song).catch(() => []);
    return syncSets.length > 0 ? { ...song, syncSets } : song;
  }

  private getSyncSets(tabUrl: string, song: SelectedSong) {
    const origin = new URL(tabUrl).origin;
    const fetcher = new Fetcher({ withRotatingUserAgent: false });
    return findSyncSets(song.songId, song.revisionId, async (path) => {
      const response = await fetcher.fetch(origin + path, {
        headers: {
          ...fetcher.browserLikeDocumentHeaders,
          Accept: 'application/json'
        }
      });
      return response.ok ? response.json() : null;
    });
  }
}
