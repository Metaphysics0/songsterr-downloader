import { SUPPORTED_DOWNLOAD_TAB_TYPES } from '$lib/constants';

export enum DownloadTabType {
  'bySource',
  'bySearchResult',
  'bulk',
  'ultimate-guitar'
}

export function isValidDownloadType(arg: unknown): arg is DownloadTabType {
  return (
    typeof arg === 'string' && Object.values(DownloadTabType).includes(arg)
  );
}
