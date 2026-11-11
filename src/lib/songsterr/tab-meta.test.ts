import { describe, expect, it } from 'vitest';
import {
  InvalidTabMetaError,
  encodeBase64Url,
  parseSelectedSong,
  readSelectedSongFromHash
} from './tab-meta';

const valid = {
  songId: 27,
  revisionId: 5184162,
  image: 'v5-2-1-GEwclkOmjsFXZOxQ',
  title: 'Song',
  artist: 'Artist',
  tracks: [{ partId: 0, instrumentId: 30 }]
};

describe('parseSelectedSong', () => {
  it('accepts a valid payload and drops unknown fields', () => {
    const song = parseSelectedSong({
      ...valid,
      extra: 'x',
      tracks: [{ partId: 0, instrumentId: 30, views: 5 }]
    });
    expect(song).toEqual(valid);
  });

  it.each([
    ['songId', { songId: -1 }],
    ['revisionId', { revisionId: '5184162' }],
    ['image path traversal', { image: '../../evil' }],
    ['image with slash', { image: 'a/b' }],
    ['empty tracks', { tracks: [] }],
    ['bad partId', { tracks: [{ partId: '0/../x', instrumentId: 30 }] }],
    [
      'too many tracks',
      {
        tracks: Array.from({ length: 101 }, (_, partId) => ({
          partId,
          instrumentId: 30
        }))
      }
    ]
  ])('rejects %s', (_label, override) => {
    expect(() => parseSelectedSong({ ...valid, ...override })).toThrow(
      InvalidTabMetaError
    );
  });

  it('only keeps songsterr byLinkUrls', () => {
    expect(
      parseSelectedSong({ ...valid, byLinkUrl: 'https://evil.example/' })
        .byLinkUrl
    ).toBeUndefined();
    expect(
      parseSelectedSong({
        ...valid,
        byLinkUrl: 'https://www.songsterr.com/a/wsa/x-tab-s27'
      }).byLinkUrl
    ).toBe('https://www.songsterr.com/a/wsa/x-tab-s27');
  });

  it('falls back on missing display text and trims long text', () => {
    const song = parseSelectedSong({
      ...valid,
      title: undefined,
      artist: 'a'.repeat(1000)
    });
    expect(song.title).toBe('Song');
    expect(song.artist).toHaveLength(300);
  });
});

describe('readSelectedSongFromHash', () => {
  it('returns null without a payload', () => {
    expect(readSelectedSongFromHash('')).toBeNull();
    expect(readSelectedSongFromHash('#other=1')).toBeNull();
  });

  it('decodes a base64url payload', () => {
    const hash = `#songsterr=${encodeBase64Url(JSON.stringify(valid))}`;
    expect(readSelectedSongFromHash(hash)).toEqual(valid);
  });

  it('throws on garbage', () => {
    expect(() => readSelectedSongFromHash('#songsterr=%%%')).toThrow(
      InvalidTabMetaError
    );
  });
});
