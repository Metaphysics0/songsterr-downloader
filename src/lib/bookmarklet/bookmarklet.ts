/*
 * The bookmarklet runs on www.songsterr.com, in the user's own tab, after the
 * user has opened the tab page themselves. It reads the tab metadata Songsterr
 * already embedded in that page and hands it to our app via a URL fragment.
 * The app then downloads the part payloads from Songsterr's CDN in the
 * browser, so our server never has to request songsterr.com.
 *
 * `bookmarkletMain` is serialised with Function#toString, so it must be fully
 * self-contained: no imports, no references to anything outside its body.
 */
export function bookmarkletMain(appUrl: string): void {
  const HASH_KEY = 'songsterr';

  function fail(message: string): void {
    window.alert('Songsterr Downloader: ' + message);
  }

  function songIdFromPath(pathname: string): number | null {
    const matches = pathname.match(/-s(\d+)/g);
    if (!matches) return null;
    return Number(matches[matches.length - 1].slice(2));
  }

  function readCurrent(doc: Document): any {
    const el = doc.getElementById('state');
    if (!el || !el.textContent) return null;
    try {
      const state = JSON.parse(el.textContent);
      return state && state.meta && state.meta.current
        ? state.meta.current
        : null;
    } catch (e) {
      return null;
    }
  }

  /*
   * Fetches video sync points here because the video API answers only on
   * the tab site's own origin, then sends them in the payload. The current revision often
   * has none, so this also tries a few older revisions. If a request fails,
   * the download has no video sync. Mirrors findSyncSets.
   */
  function getJson(path: string): Promise<any> {
    return fetch(path, { credentials: 'include' })
      .then(function (response) {
        return response && response.ok && response.json
          ? response.json()
          : null;
      })
      .catch(function () {
        return null;
      });
  }

  function usableSets(list: any): any[] {
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (entry: any) {
        return (
          entry &&
          typeof entry.videoId === 'string' &&
          Array.isArray(entry.points) &&
          entry.points.length > 1
        );
      })
      .map(function (entry: any) {
        return {
          videoId: entry.videoId,
          feature: entry.feature || undefined,
          tracks: Array.isArray(entry.tracks) ? entry.tracks : undefined,
          points: entry.points.map(function (point: any) {
            return Math.round(Number(point) * 1000) / 1000;
          })
        };
      });
  }

  function loadSyncSets(current: any): Promise<any[]> {
    const base = '/api/video-points/' + current.songId + '/';
    return getJson(base + current.revisionId + '/list').then(function (list) {
      const sets = usableSets(list);
      if (sets.length) return sets;
      return getJson('/api/meta/' + current.songId + '/revisions').then(
        function (revisions) {
          const ids = (Array.isArray(revisions) ? revisions : [])
            .map(function (revision: any) {
              return revision && revision.revisionId;
            })
            .filter(function (id: any) {
              return id && id !== current.revisionId;
            })
            .sort(function (a: number, b: number) {
              return b - a;
            })
            .slice(0, 3);
          let chain: Promise<any[]> = Promise.resolve([]);
          ids.forEach(function (id: number) {
            chain = chain.then(function (found) {
              return found.length
                ? found
                : getJson(base + id + '/list').then(usableSets);
            });
          });
          return chain;
        }
      );
    });
  }

  function toPayload(current: any, syncSets: any[]): string {
    const tracks = (current.tracks || []).map(function (track: any) {
      return {
        partId: track.partId,
        instrumentId: track.instrumentId,
        title: track.title,
        name: track.name,
        tuning: track.tuning,
        isDrums: track.isDrums
      };
    });
    const json = JSON.stringify({
      songId: current.songId,
      revisionId: current.revisionId,
      image: current.image,
      title: current.title,
      artist: current.artist,
      artistId: current.artistId,
      tracks: tracks,
      byLinkUrl: location.origin + location.pathname,
      syncSets: syncSets.length ? syncSets : undefined
    });
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  function send(current: any): void {
    // Don't let a slow video API delay the tab. Browsers allow the popup
    // only shortly after the click.
    let sent = false;
    function go(syncSets: any[]): void {
      if (sent) return;
      sent = true;
      clearTimeout(timer);
      openApp(current, syncSets);
    }
    const timer = setTimeout(function () {
      go([]);
    }, 1500);
    loadSyncSets(current).then(go, function () {
      go([]);
    });
  }

  function openApp(current: any, syncSets: any[]): void {
    const target = appUrl + '#' + HASH_KEY + '=' + toPayload(current, syncSets);
    const opened = window.open(target, 'songsterr-downloader');
    // Popup blocked (e.g. after the async fallback below): navigate instead.
    if (!opened) location.href = target;
  }

  if (!/(^|\.)songsterr\.com$/.test(location.hostname)) {
    fail('open a tab on songsterr.com first, then click this bookmark.');
    return;
  }

  const songId = songIdFromPath(location.pathname);
  if (!songId) {
    fail(
      'open a specific song tab on songsterr.com, then click this bookmark.'
    );
    return;
  }

  /*
   * Songsterr is a single-page app: after in-app navigation the embedded
   * state can still describe the first song loaded. Only trust it when it
   * matches the song in the address bar; otherwise re-read the page.
   */
  const current = readCurrent(document);
  if (current && current.songId === songId) {
    send(current);
    return;
  }

  fetch(location.href, { credentials: 'include' })
    .then(function (response) {
      return response.text();
    })
    .then(function (html) {
      const fresh = readCurrent(
        new DOMParser().parseFromString(html, 'text/html')
      );
      if (fresh && fresh.songId === songId) {
        send(fresh);
      } else {
        fail('could not read this tab. Refresh the page and try again.');
      }
    })
    .catch(function () {
      fail('could not read this tab. Refresh the page and try again.');
    });
}

export function buildBookmarkletHref(appUrl: string): string {
  const source = `(${bookmarkletMain.toString()})(${JSON.stringify(appUrl)});void 0`;
  return 'javascript:' + encodeURIComponent(source);
}
