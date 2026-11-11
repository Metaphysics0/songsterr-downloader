import type {
  ConversionWarning,
  SongsterrRevisionTrackPayload,
  SongsterrStateMetaCurrent,
  SongsterrStateMetaCurrentTrack
} from '$lib/types';

/*
 * Runs in the browser. Songsterr's revision CDN answers with
 * `Access-Control-Allow-Origin: *`, so the user's browser can fetch the part
 * payloads directly - no server hop, and no datacenter IP for Songsterr to
 * block.
 */

export const CDN_BASE_URL = 'https://dqsljvtekg760.cloudfront.net';
export const CDN_BASE_URL_2 = 'https://d3d3l6a6rcgkaf.cloudfront.net';
export const DEFAULT_FETCH_TIMEOUT_MS = 15000;

export interface SongsterrFetchedRevisionTrack {
  trackMeta: SongsterrStateMetaCurrentTrack;
  revision: SongsterrRevisionTrackPayload;
}

/*
 * 'status' means the CDN answered and rejected us (403/404) - a different CDN
 * host may well have the file. 'timeout' and 'error' mean we never got an
 * answer, so a second full fan-out would most likely stall the same way.
 */
export interface SongsterrRevisionFetchFailure {
  partId: number;
  kind: 'status' | 'timeout' | 'error';
  status?: number;
}

export interface SongsterrFetchAllPartRevisionsResult {
  revisions: SongsterrFetchedRevisionTrack[];
  warnings: ConversionWarning[];
  failures: SongsterrRevisionFetchFailure[];
}

type RevisionMeta = Pick<
  SongsterrStateMetaCurrent,
  'songId' | 'revisionId' | 'image' | 'tracks'
>;

export function buildRevisionJsonUrl({
  songId,
  revisionId,
  image,
  partId,
  cdnBaseUrl = CDN_BASE_URL
}: {
  songId: number;
  revisionId: number;
  image: string;
  partId: number;
  cdnBaseUrl?: string;
}): string {
  return `${cdnBaseUrl}/${songId}/${revisionId}/${image}/${partId}.json`;
}

export async function fetchAllPartRevisions(
  meta: RevisionMeta,
  cdnBaseUrl = CDN_BASE_URL,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS
): Promise<SongsterrFetchAllPartRevisionsResult> {
  const warnings: ConversionWarning[] = [];
  const failures: SongsterrRevisionFetchFailure[] = [];

  const tracks = meta.tracks
    .filter((track) => typeof track.partId === 'number')
    .sort((left, right) => left.partId - right.partId);

  const results = await Promise.all(
    tracks.map(async (track) => {
      const revisionUrl = buildRevisionJsonUrl({
        songId: meta.songId,
        revisionId: meta.revisionId,
        image: meta.image,
        partId: track.partId,
        cdnBaseUrl
      });

      try {
        const response = await fetch(revisionUrl, {
          signal: AbortSignal.timeout(timeoutMs)
        });

        if (!response.ok) {
          warnings.push({
            code: 'revision_fetch_failed',
            message: `Failed to fetch part ${track.partId} (${response.status})`,
            location: `part:${track.partId}`
          });
          failures.push({
            partId: track.partId,
            kind: 'status',
            status: response.status
          });
          return null;
        }

        const revision =
          (await response.json()) as SongsterrRevisionTrackPayload;
        return { trackMeta: track, revision };
      } catch (error) {
        const timedOut = isTimeoutError(error);
        warnings.push({
          code: timedOut ? 'revision_fetch_timeout' : 'revision_fetch_error',
          message: timedOut
            ? `Timed out fetching part ${track.partId} after ${timeoutMs}ms`
            : `Error fetching part ${track.partId}: ${String(error)}`,
          location: `part:${track.partId}`
        });
        failures.push({
          partId: track.partId,
          kind: timedOut ? 'timeout' : 'error'
        });
        return null;
      }
    })
  );

  return {
    revisions: results.filter(Boolean) as SongsterrFetchedRevisionTrack[],
    warnings,
    failures
  };
}

export async function fetchAllPartRevisionsWithFallback(
  meta: RevisionMeta
): Promise<SongsterrFetchAllPartRevisionsResult> {
  const primary = await fetchAllPartRevisions(meta);
  if (primary.revisions.length > 0) return primary;

  /*
   * Only worth a second fan-out when the primary CDN actually answered.
   * If parts timed out, retrying would most likely stall the same way.
   */
  const everyFailureWasAStatus =
    primary.failures.length > 0 &&
    primary.failures.every((failure) => failure.kind === 'status');
  if (!everyFailureWasAStatus) return primary;

  const fallback = await fetchAllPartRevisions(meta, CDN_BASE_URL_2);
  return { ...fallback, warnings: [...primary.warnings, ...fallback.warnings] };
}

/*
 * AbortSignal.timeout rejects with a TimeoutError DOMException. AbortError is
 * accepted too since older runtimes report an aborted fetch that way.
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: string }).name;
  return name === 'TimeoutError' || name === 'AbortError';
}
