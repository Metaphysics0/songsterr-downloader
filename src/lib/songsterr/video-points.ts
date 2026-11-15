import type { SongsterrSyncSet } from '$lib/types';
import { parseSyncSets } from './tab-meta';

/*
 * The tab site keeps the video sync data of a tab in `/api/video-points`, one
 * list per revision. Points are often only on an older revision of a tab, so
 * when the current one has none, the newest few others are tried. The
 * bookmarklet has its own copy of this lookup because it must be
 * self-contained. Change both together.
 */

const MAX_OTHER_REVISIONS = 3;

export async function findSyncSets(
  songId: number,
  revisionId: number,
  getJson: (path: string) => Promise<unknown>
): Promise<SongsterrSyncSet[]> {
  const safeGet = async (path: string) => {
    try {
      return await getJson(path);
    } catch {
      return null;
    }
  };

  const current = parseSyncSets(
    await safeGet(`/api/video-points/${songId}/${revisionId}/list`)
  );
  if (current.length > 0) return current;

  const revisions = await safeGet(`/api/meta/${songId}/revisions`);
  const others = (Array.isArray(revisions) ? revisions : [])
    .map(
      (revision) => (revision as { revisionId?: unknown } | null)?.revisionId
    )
    .filter((id): id is number => Number.isSafeInteger(id) && id !== revisionId)
    .sort((a, b) => b - a)
    .slice(0, MAX_OTHER_REVISIONS);

  for (const id of others) {
    const sets = parseSyncSets(
      await safeGet(`/api/video-points/${songId}/${id}/list`)
    );
    if (sets.length > 0) return sets;
  }
  return [];
}
