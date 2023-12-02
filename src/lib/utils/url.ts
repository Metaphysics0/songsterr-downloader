import {
  ULTIMATE_GUITAR_URL_REGEX_PATTERN,
  SONGSTERR_URL_REGEX_PATTERN
} from '$lib/constants';

export function getIdFromUrl(url: string) {
  return url.split('-').at(-1);
}

export function isUrlFromSongsterr(url: any) {
  return SONGSTERR_URL_REGEX_PATTERN.test(String(url));
}

export function isUrlFromUltimateGuitar(url: any) {
  return ULTIMATE_GUITAR_URL_REGEX_PATTERN.test(String(url));
}
