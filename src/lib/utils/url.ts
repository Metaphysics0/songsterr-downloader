import { SONGSTERR_URL_REGEX_PATTERN } from '../../consts';

export function getIdFromUrl(url: string) {
  return url.split('-').at(-1);
}

export function isUrlValid(url: any) {
  return SONGSTERR_URL_REGEX_PATTERN.test(String(url));
}
