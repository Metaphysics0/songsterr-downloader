import { SongsterrPartialMetadata } from '$lib/types';

function createGetMockSearchResultResponse(): SongsterrPartialMetadata {
  return {
    songId: 0,
    artistId: 0,
    title: 'You are the best',
    artist: 'Thanks for using this app',
    source: ''
    videos: []
  };
}

export const mockSearchResult = createGetMockSearchResultResponse();
