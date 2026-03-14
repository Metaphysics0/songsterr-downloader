import type {
  ConversionWarning,
  SongsterrRevisionTrackPayload,
  SongsterrStateMetaCurrent,
  SongsterrStateMetaCurrentTrack
} from '$lib/types';
import Fetcher from '../utils/fetcher.util';
import { scraper } from '../utils/scraper.util';
import { logger } from '$lib/server/logger';

export interface SongsterrFetchedRevisionTrack {
  trackMeta: SongsterrStateMetaCurrentTrack;
  revision: SongsterrRevisionTrackPayload;
}

export interface SongsterrFetchAllPartRevisionsResult {
  revisions: SongsterrFetchedRevisionTrack[];
  warnings: ConversionWarning[];
}

export class SongsterrRevisionJsonService {
  async getStateMetaFromTabUrl(
    tabUrl: string
  ): Promise<SongsterrStateMetaCurrent> {
    const doc = await scraper.getDocumentFromUrl(tabUrl, 'html');
    const stateScript =
      doc.getElementById('state')?.childNodes?.[0]?.nodeValue ||
      doc.getElementById('state')?.textContent ||
      '';

    if (!stateScript) {
      throw new Error('Unable to find Songsterr state payload in page HTML');
    }

    const parsedState = JSON.parse(stateScript);
    const current = parsedState?.meta?.current;

    if (!current?.songId || !current?.revisionId || !current?.image) {
      throw new Error(
        'Songsterr state payload missing required revision fields'
      );
    }

    const tracks = Array.isArray(current.tracks) ? current.tracks : [];
    return {
      songId: current.songId,
      revisionId: current.revisionId,
      image: current.image,
      title: current.title || 'Song',
      artist: current.artist || 'Unknown Artist',
      tracks
    };
  }

  buildRevisionJsonUrl({
    songId,
    revisionId,
    image,
    partId,
    cdnBaseUrl = this.CDN_BASE_URL
  }: {
    songId: number;
    revisionId: number;
    image: string;
    partId: number;
    cdnBaseUrl?: string;
  }): string {
    return `${cdnBaseUrl}/${songId}/${revisionId}/${image}/${partId}.json`;
  }

  async fetchAllPartRevisions(
    stateMeta: SongsterrStateMetaCurrent,
    cdnBaseUrl = this.CDN_BASE_URL
  ): Promise<SongsterrFetchAllPartRevisionsResult> {
    const warnings: ConversionWarning[] = [];

    const tracks = stateMeta.tracks
      .filter((track) => typeof track.partId === 'number')
      .sort((left, right) => left.partId - right.partId);

    const results = await Promise.all(
      tracks.map(async (track) => {
        const revisionUrl = this.buildRevisionJsonUrl({
          songId: stateMeta.songId,
          revisionId: stateMeta.revisionId,
          image: stateMeta.image,
          partId: track.partId,
          cdnBaseUrl
        });

        try {
          const response = await this.fetcher.fetch(revisionUrl, {
            headers: this.fetcher.browserLikeHeaders
          });

          if (!response.ok) {
            warnings.push({
              code: 'revision_fetch_failed',
              message: `Failed to fetch part ${track.partId} (${response.status})`,
              location: `part:${track.partId}`
            });
            return null;
          }

          const revision =
            (await response.json()) as SongsterrRevisionTrackPayload;
          return { trackMeta: track, revision };
        } catch (error) {
          warnings.push({
            code: 'revision_fetch_error',
            message: `Error fetching part ${track.partId}: ${String(error)}`,
            location: `part:${track.partId}`
          });
          return null;
        }
      })
    );

    return {
      revisions: results.filter(Boolean) as SongsterrFetchedRevisionTrack[],
      warnings
    };
  }

  async fetchAllPartRevisionsWithFallback(
    stateMeta: SongsterrStateMetaCurrent
  ): Promise<SongsterrFetchAllPartRevisionsResult> {
    const primary = await this.fetchAllPartRevisions(stateMeta);
    if (primary.revisions.length > 0) return primary;

    logger.warn(
      { songId: stateMeta.songId, revisionId: stateMeta.revisionId },
      'Primary CDN returned no revisions, retrying with alternate CDN'
    );
    return this.fetchAllPartRevisions(stateMeta, this.CDN_BASE_URL_2);
  }

  private readonly fetcher = new Fetcher({ withBrowserLikeHeaders: true });
  private readonly CDN_BASE_URL = 'https://dqsljvtekg760.cloudfront.net';
  private readonly CDN_BASE_URL_2 = 'https://d3d3l6a6rcgkaf.cloudfront.net';
}
