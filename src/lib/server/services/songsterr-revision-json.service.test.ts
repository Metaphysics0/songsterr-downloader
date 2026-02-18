import { describe, expect, it } from 'vitest';
import { SongsterrRevisionJsonService } from './songsterr-revision-json.service';

describe('SongsterrRevisionJsonService', () => {
  it('builds revision json url from state data', () => {
    const service = new SongsterrRevisionJsonService();
    const url = service.buildRevisionJsonUrl({
      songId: 27,
      revisionId: 5184162,
      image: 'v5-2-1-GEwclkOmjsFXZOxQ',
      partId: 3
    });

    expect(url).toBe(
      'https://dqsljvtekg760.cloudfront.net/27/5184162/v5-2-1-GEwclkOmjsFXZOxQ/3.json'
    );
  });
});
