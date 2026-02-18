import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const DISMISSAL_STORAGE_KEY = 'songsterr.fretwise-promo.dismissed-at';
const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function getLastDismissedAt(): number | null {
  if (!browser) return null;

  try {
    const value = localStorage.getItem(DISMISSAL_STORAGE_KEY);
    if (!value) return null;

    const timestamp = Number(value);
    if (Number.isNaN(timestamp)) {
      localStorage.removeItem(DISMISSAL_STORAGE_KEY);
      return null;
    }

    return timestamp;
  } catch {
    return null;
  }
}

function setLastDismissedAt(timestamp: number): void {
  if (!browser) return;

  try {
    localStorage.setItem(DISMISSAL_STORAGE_KEY, String(timestamp));
  } catch {
    // Ignore storage failures and fall back to non-persistent behavior.
  }
}

function isInDismissalCooldown(now: number = Date.now()): boolean {
  const dismissedAt = getLastDismissedAt();
  if (dismissedAt === null) return false;

  return now - dismissedAt < DISMISSAL_COOLDOWN_MS;
}

function createFretwisePromoModalStore() {
  const { subscribe, set } = writable(false);

  return {
    subscribe,
    show: () => {
      if (isInDismissalCooldown()) return;
      set(true);
    },
    hide: () => {
      setLastDismissedAt(Date.now());
      set(false);
    }
  };
}

export const fretwisePromoModalStore = createFretwisePromoModalStore();
