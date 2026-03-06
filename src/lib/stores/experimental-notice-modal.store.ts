import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'songsterr.experimental-notice.dismissed';

function createStore() {
  const { subscribe, set } = writable(false);

  if (browser) {
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (env.PUBLIC_IS_EXPERIMENTAL === 'true' && !dismissed) {
      set(true);
    }
  }

  return {
    subscribe,
    show: () => set(true),
    hide: () => {
      set(false);
      if (browser) {
        try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
      }
    },
  };
}

export const experimentalNoticeModalStore = createStore();
