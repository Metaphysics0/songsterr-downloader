import { writable } from 'svelte/store';

export const downloadHistory = writable<IDownloadHistoryItem>({});
export type IDownloadHistoryItem = {};
