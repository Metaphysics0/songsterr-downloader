/*
 * input: "Bubble Dream (Tab book version) 231", ".gp"
 * output: "bubble-dream-tab-book-version-231.gp"
 */
export function buildFileNameFromSongName(
  songName: string,
  extension: '.gp' | '.mid'
): string {
  const normalized = normalizeSongName(songName);
  return (normalized || `downloaded-tab_${Date.now()}`) + extension;
}

function normalizeSongName(input: string): string {
  if (/[^a-zA-Z0-9\s]/.test(input)) {
    // Keep non-English titles as-is, minus characters no filesystem accepts.
    return input.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim();
  }

  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
}
