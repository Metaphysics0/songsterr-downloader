import { logger } from '$lib/server/logger';
import { scraper } from '../utils/scraper.util';
import type { SelectedSong } from '$lib/types';
import { parseSelectedSong } from '$lib/songsterr/tab-meta';

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

    return parseSelectedSong({
      ...(current as Record<string, unknown>),
      byLinkUrl: tabUrl
    });
  }
}
