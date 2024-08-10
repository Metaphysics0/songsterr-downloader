import { MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_NON_LOGGED_IN_USER } from '$lib/constants/maximum-amount-of-downloads.constants';
import { writable } from 'svelte/store';

export const amountOfDownloadsAvailable = writable<number>(
  MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_NON_LOGGED_IN_USER
);
