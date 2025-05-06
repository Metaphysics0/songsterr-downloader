import { env } from '$env/dynamic/public';
import { writable } from 'svelte/store';

export const temporarilyDownModalStore = writable(
  env.PUBLIC_WEBSITE_IS_CURRENTLY_DOWN === 'true'
);
