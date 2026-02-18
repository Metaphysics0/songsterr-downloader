import { describe, expect, it } from 'vitest';
import * as alphaTab from '@coderline/alphatab';
import { mapSongsterrDuration } from './duration-mapper';

describe('mapSongsterrDuration', () => {
  it('maps direct durations', () => {
    expect(mapSongsterrDuration([1, 4])).toMatchObject({
      duration: alphaTab.model.Duration.Quarter,
      dots: 0,
      isApproximate: false
    });
  });

  it('maps dotted durations', () => {
    expect(mapSongsterrDuration([3, 4])).toMatchObject({
      duration: alphaTab.model.Duration.Half,
      dots: 1,
      isApproximate: false
    });
  });
});
