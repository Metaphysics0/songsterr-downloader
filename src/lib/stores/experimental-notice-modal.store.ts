import { env } from '$env/dynamic/public';
import { writable } from 'svelte/store';

export const experimentalNoticeModalStore = writable(
  env.PUBLIC_IS_EXPERIMENTAL === 'true'
);
