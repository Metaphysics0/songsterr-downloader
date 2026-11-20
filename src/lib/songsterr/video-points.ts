import type { SongsterrSyncSet } from '$lib/types';
import { parseSyncSets } from './tab-meta';

/*
 * The tab site keeps the video sync data of a tab in `/api/video-points`, one
 * list per revision. Only entries with status "done" count. Only the revision
 * of the tab being downloaded is used, because another revision can have a
 * different bar layout. The bookmarklet has its own copy of this lookup
 * because it must be self-contained. Change both together.
 */

export async function findSyncSets(
  songId: number,
  revisionId: number,
  getJson: (path: string) => Promise<unknown>
): Promise<SongsterrSyncSet[]> {
  try {
    const list = await getJson(
      `/api/video-points/${songId}/${revisionId}/list`
    );
    return parseSyncSets(
      Array.isArray(list)
        ? list.filter((entry) => entry?.status === 'done')
        : []
    );
  } catch {
    return [];
  }
}
