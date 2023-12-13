export const SUPPORTED_DOWNLOAD_TAB_TYPES = [
  'bySource',
  'bySearchResult',
  'bulk',
  'ultimate-guitar'
] as const;

export const CLOUDFRONT_S3_BASE_URL = 'https://d2ekxcn5z5vr8x.cloudfront.net';

export const SONGSTERR_URL_REGEX_PATTERN =
  /^https:\/\/www\.songsterr\.com\/a\/wsa\/.*/;

export const ULTIMATE_GUITAR_URL_REGEX_PATTERN =
  /^https:\/\/(tabs\.ultimate-guitar\.com)\/.*/i;

export const SONGSTERR_OR_ULTIMATE_GUITAR_URL_REGEX_PATTERN =
  /^https:\/\/(www\.)?(songsterr\.com|tabs\.ultimate-guitar\.com)\/.*/i;

export const GUITAR_PRO_CONTENT_TYPE = 'application/gp';

export const MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD = 5.0;
