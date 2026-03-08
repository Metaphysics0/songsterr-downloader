const SUPPORTED_DOWNLOAD_TAB_TYPES = [
  'byRevisionJson',
  'byRevisionJsonMidi'
] as const;

export type SupportedTabDownloadType =
  (typeof SUPPORTED_DOWNLOAD_TAB_TYPES)[number];

export function isValidDownloadType(
  arg: unknown
): arg is SupportedTabDownloadType {
  return (
    typeof arg === 'string' &&
    (SUPPORTED_DOWNLOAD_TAB_TYPES as ReadonlyArray<string>).includes(arg)
  );
}
