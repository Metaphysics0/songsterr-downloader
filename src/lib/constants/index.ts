export const SUPPORTED_DOWNLOAD_TAB_TYPES = [
  'bySource',
  'bySearchResult',
  'ultimate-guitar'
] as const;

export const SONGSTERR_BASE_URL = 'https://www.songsterr.com';

export const SONGSTERR_URL_REGEX_PATTERN =
  /^https:\/\/www\.songsterr\.com\/a\/wsa\/.*/;

export const ULTIMATE_GUITAR_URL_REGEX_PATTERN =
  /^https:\/\/(tabs\.ultimate-guitar\.com)\/.*/i;

export const SONGSTERR_OR_ULTIMATE_GUITAR_URL_REGEX_PATTERN =
  /^https:\/\/(www\.)?(songsterr\.com|tabs\.ultimate-guitar\.com)\/.*/i;

export const GUITAR_PRO_CONTENT_TYPE = 'application/gp';
