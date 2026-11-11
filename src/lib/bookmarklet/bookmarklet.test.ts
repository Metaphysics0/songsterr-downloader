import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildBookmarkletHref } from './bookmarklet';
import { readSelectedSongFromHash } from '$lib/songsterr/tab-meta';

const APP_URL = 'https://songsterr-downloader.com/';

const current = {
  songId: 334,
  revisionId: 10072207,
  image: 'v0-3-2-9ceIrAtumZwGiRt3',
  title: 'Through The Fire And Flames',
  artist: 'DragonForce',
  artistId: 167503,
  views: 123,
  author: { name: 'not forwarded' },
  tracks: [
    {
      partId: 0,
      instrumentId: 30,
      title: 'Herman Li - Distortion Guitar',
      name: 'Herman Li',
      tuning: [64, 59, 55, 50, 45, 40],
      isDrums: false,
      views: 99
    },
    { partId: 1, instrumentId: 1024, name: 'Drums', isDrums: true }
  ]
};

function fakeDocument(state: unknown) {
  return {
    getElementById: (id: string) =>
      id === 'state' && state !== undefined
        ? { textContent: JSON.stringify({ meta: { current: state } }) }
        : null
  };
}

interface RunOptions {
  href?: string;
  state?: unknown;
  fetchedState?: unknown;
  popupBlocked?: boolean;
}

/*
 * Executes the exact `javascript:` URL users drag to their bookmarks bar,
 * against stubbed browser globals.
 */
async function runBookmarklet({
  href = 'https://www.songsterr.com/a/wsa/dragonforce-through-the-fire-and-flames-tab-s334',
  state = current,
  fetchedState,
  popupBlocked = false
}: RunOptions = {}) {
  const url = new URL(href);
  const location = {
    hostname: url.hostname,
    pathname: url.pathname,
    origin: url.origin,
    href: url.href
  };
  const alert = vi.fn();
  const open = vi.fn(() => (popupBlocked ? null : {}));
  const fetch = vi.fn(async () => ({ text: async () => 'html' }));
  class DOMParser {
    parseFromString() {
      return fakeDocument(fetchedState);
    }
  }

  vi.stubGlobal('window', { alert, open });
  vi.stubGlobal('location', location);
  vi.stubGlobal('document', fakeDocument(state));
  vi.stubGlobal('fetch', fetch);
  vi.stubGlobal('DOMParser', DOMParser);

  const code = decodeURIComponent(
    buildBookmarkletHref(APP_URL).slice('javascript:'.length)
  );
  new Function(code)();
  await new Promise((resolve) => setTimeout(resolve, 0));

  return { alert, open, fetch, location };
}

function hashOf(target: string) {
  return target.slice(APP_URL.length);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bookmarklet', () => {
  it('produces a javascript: URL', () => {
    expect(buildBookmarkletHref(APP_URL)).toMatch(/^javascript:/);
  });

  it('opens the app with a payload the app accepts', async () => {
    const { open, alert } = await runBookmarklet();

    expect(alert).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledOnce();
    const [target, name] = open.mock.calls[0] as unknown as [string, string];
    expect(name).toBe('songsterr-downloader');
    expect(target.startsWith(`${APP_URL}#songsterr=`)).toBe(true);

    const song = readSelectedSongFromHash(hashOf(target));
    expect(song).toEqual({
      songId: 334,
      revisionId: 10072207,
      image: 'v0-3-2-9ceIrAtumZwGiRt3',
      title: 'Through The Fire And Flames',
      artist: 'DragonForce',
      artistId: 167503,
      byLinkUrl:
        'https://www.songsterr.com/a/wsa/dragonforce-through-the-fire-and-flames-tab-s334',
      tracks: [
        {
          partId: 0,
          instrumentId: 30,
          title: 'Herman Li - Distortion Guitar',
          name: 'Herman Li',
          tuning: [64, 59, 55, 50, 45, 40],
          isDrums: false
        },
        { partId: 1, instrumentId: 1024, name: 'Drums', isDrums: true }
      ]
    });
  });

  it('round-trips non-ASCII titles', async () => {
    const { open } = await runBookmarklet({
      state: { ...current, title: 'Пачка сигарет', artist: 'Кино' }
    });
    const [target] = open.mock.calls[0] as unknown as [string];
    const song = readSelectedSongFromHash(hashOf(target));
    expect(song?.title).toBe('Пачка сигарет');
    expect(song?.artist).toBe('Кино');
  });

  it('re-reads the page when the embedded state is for a different song', async () => {
    const { open, fetch } = await runBookmarklet({
      href: 'https://www.songsterr.com/a/wsa/some-other-song-tab-s999',
      state: current,
      fetchedState: { ...current, songId: 999 }
    });

    expect(fetch).toHaveBeenCalledOnce();
    const [target] = open.mock.calls[0] as unknown as [string];
    expect(readSelectedSongFromHash(hashOf(target))?.songId).toBe(999);
  });

  it('asks for a refresh when it cannot find matching state', async () => {
    const { open, alert } = await runBookmarklet({
      href: 'https://www.songsterr.com/a/wsa/some-other-song-tab-s999',
      fetchedState: undefined
    });

    expect(open).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(
      expect.stringContaining('Refresh the page')
    );
  });

  it('refuses to run outside songsterr.com', async () => {
    const { open, alert } = await runBookmarklet({
      href: 'https://example.com/a/wsa/x-tab-s1'
    });

    expect(open).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(
      expect.stringContaining('songsterr.com')
    );
  });

  it('asks for a song page when not on a tab', async () => {
    const { open, alert } = await runBookmarklet({
      href: 'https://www.songsterr.com/'
    });

    expect(open).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(
      expect.stringContaining('specific song')
    );
  });

  it('navigates the current tab when the popup is blocked', async () => {
    const { location } = await runBookmarklet({ popupBlocked: true });
    expect(location.href.startsWith(`${APP_URL}#songsterr=`)).toBe(true);
  });
});
