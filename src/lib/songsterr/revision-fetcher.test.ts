import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CDN_BASE_URL,
  CDN_BASE_URL_2,
  buildRevisionJsonUrl,
  fetchAllPartRevisionsWithFallback
} from './revision-fetcher';

const meta = {
  songId: 27,
  revisionId: 5184162,
  image: 'v5-2-1-GEwclkOmjsFXZOxQ',
  tracks: [
    { partId: 1, instrumentId: 30 },
    { partId: 0, instrumentId: 33 }
  ]
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('revision-fetcher', () => {
  it('builds revision json url from state data', () => {
    expect(buildRevisionJsonUrl({ ...meta, partId: 3 })).toBe(
      'https://dqsljvtekg760.cloudfront.net/27/5184162/v5-2-1-GEwclkOmjsFXZOxQ/3.json'
    );
  });

  it('fetches every part, sorted by partId', async () => {
    const fetch = vi.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => ({ measures: [], url })
    }));
    vi.stubGlobal('fetch', fetch);

    const result = await fetchAllPartRevisionsWithFallback(meta);

    expect(result.failures).toEqual([]);
    expect(result.revisions.map((r) => r.trackMeta.partId)).toEqual([0, 1]);
    expect(
      fetch.mock.calls.every(([url]) => url.startsWith(CDN_BASE_URL))
    ).toBe(true);
  });

  it('falls back to the alternate CDN when the primary rejects every part', async () => {
    const fetch = vi.fn(async (url: string) =>
      url.startsWith(CDN_BASE_URL_2)
        ? { ok: true, status: 200, json: async () => ({ measures: [] }) }
        : { ok: false, status: 403, json: async () => ({}) }
    );
    vi.stubGlobal('fetch', fetch);

    const result = await fetchAllPartRevisionsWithFallback(meta);

    expect(result.revisions).toHaveLength(2);
    expect(result.warnings).toHaveLength(2);
  });

  it('does not retry when the primary CDN never answered', async () => {
    const fetch = vi.fn(async () => {
      throw Object.assign(new Error('timeout'), { name: 'TimeoutError' });
    });
    vi.stubGlobal('fetch', fetch);

    const result = await fetchAllPartRevisionsWithFallback(meta);

    expect(result.revisions).toHaveLength(0);
    expect(result.failures.every((f) => f.kind === 'timeout')).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
