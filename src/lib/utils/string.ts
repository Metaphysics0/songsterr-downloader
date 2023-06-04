// i.e. input: "Bubble Dream (Tab book version) 231";
// output: "bubble-dream-tab-book-version-231"
export function normalize(input: string) {
  // Convert the string to lowercase
  let normalized = input.toLowerCase();

  // Remove special characters and replace them with a space
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');

  // Replace consecutive spaces with a single space
  normalized = normalized.replace(/\s+/g, ' ');

  // Trim leading and trailing spaces
  normalized = normalized.trim();

  // Replace spaces with dashes
  normalized = normalized.replace(/\s+/g, '-');

  return normalized;
}

export function getGuitarProFileTypeFromUrl(url: string) {
  return url.endsWith('.gp5') ? '.gp5' : '.gp';
}
