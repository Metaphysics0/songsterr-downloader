import { browser } from '$app/environment';
// Bravura is the SMuFL music font AlphaTab needs to render notation. We resolve
// the shipped font files to hashed asset URLs so they are served by Vite,
// avoiding the (broken-on-Vite-5) AlphaTab bundler plugin entirely.
import bravuraWoff2 from '@coderline/alphatab/font/Bravura.woff2?url';
import bravuraWoff from '@coderline/alphatab/font/Bravura.woff?url';
import bravuraOtf from '@coderline/alphatab/font/Bravura.otf?url';

/**
 * Renders Guitar Pro bytes with AlphaTab in the browser and opens its
 * print-optimized popup, where the user can save the tab as a PDF.
 *
 * AlphaTab has no server-side PDF export, so this runs entirely client-side:
 * the score is parsed into a hidden, offscreen AlphaTabApi instance and
 * `print()` clones the currently selected tracks into a print popup.
 *
 * Rendering is configured worker-free so no separate worker script needs to be
 * bundled — including the print popup, which otherwise forces workers back on.
 */
export async function printTab(file: number[]): Promise<void> {
  if (!browser) return;

  const alphaTab = await import('@coderline/alphatab');

  // Resolve to absolute URLs: the print popup is an `about:blank` window, so
  // root-relative asset paths (e.g. /@fs/...) would not resolve against it.
  const absolute = (url: string): string =>
    new URL(url, window.location.origin).href;

  const smuflFontSources = new Map<number, string>([
    [alphaTab.FontFileFormat.Woff2, absolute(bravuraWoff2)],
    [alphaTab.FontFileFormat.Woff, absolute(bravuraWoff)],
    [alphaTab.FontFileFormat.OpenType, absolute(bravuraOtf)]
  ]);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  document.body.appendChild(container);

  const api = new alphaTab.AlphaTabApi(container, {
    core: { useWorkers: false, smuflFontSources },
    player: { enablePlayer: false }
  });

  const cleanup = (): void => {
    // Delay teardown so the print popup can finish rendering the cloned
    // tracks (it references this score) before the source api is destroyed.
    setTimeout(() => {
      api.destroy();
      container.remove();
    }, 2000);
  };

  return new Promise<void>((resolve, reject) => {
    api.error.on((error) => {
      cleanup();
      reject(
        error instanceof Error ? error : new Error('Failed to render tab')
      );
    });

    api.scoreLoaded.on((score) => {
      // Select every track so the printed PDF contains the full tab, then open
      // AlphaTab's print popup (keeping workers off in the popup too).
      api.renderTracks(score.tracks);
      api.print(undefined, { core: { useWorkers: false } });
      cleanup();
      resolve();
    });

    api.load(new Uint8Array(file));
  });
}
