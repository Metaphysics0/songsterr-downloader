export enum DownloadTabType {
  BY_SOURCE = 'bySource',
  BY_SEARCH_RESULT = 'bySearchResult',
  BULK = 'bulk',
  ULTIMATE_GUITAR = 'ultimate-guitar'
}

export function isValidDownloadType(arg: unknown): arg is DownloadTabType {
  return (
    typeof arg === 'string' &&
    (Object.values(DownloadTabType) as ReadonlyArray<string>).includes(arg)
  );
}
