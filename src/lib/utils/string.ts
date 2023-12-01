/*
 * input: "Bubble Dream (Tab book version) 231"
 * output: "bubble-dream-tab-book-version-231"
 */
export function normalize(input: string) {
  let normalized = input.toLowerCase();
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
  normalized = normalized.replace(/\s+/g, ' ');
  normalized = normalized.trim();
  normalized = normalized.replace(/\s+/g, '-');

  return normalized;
}

export function getGuitarProFileTypeFromUrl(url: string) {
  return url.endsWith('.gp5') ? '.gp5' : '.gp';
}
