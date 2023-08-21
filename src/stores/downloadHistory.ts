import { browser } from '$app/environment';
import { logger } from '$lib/utils/logger';
import { persisted } from 'svelte-local-storage-store';

export const downloadHistoryLocalStorageKey = 'downloadHistory';

export const downloadHistory = persisted<IDownloadHistoryItem[]>(
  downloadHistoryLocalStorageKey,
  getInitialValue()
);

function getInitialValue(): IDownloadHistoryItem[] {
  if (!browser) return [];

  const localStorageItem = localStorage.getItem(downloadHistoryLocalStorageKey);

  if (!localStorageItem) return [];

  try {
    return JSON.parse(localStorageItem);
  } catch (error) {
    logger.error(
      'stores/downloadHistory.ts',
      'Error parsing localStorage value for download history',
      error
    );
    return [];
  }
}
