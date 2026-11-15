/*
 * Turns "one start time per bar" lists into points on a score's played bars.
 * A list is only placed when it provably fits the score's bar structure.
 */

export interface PlayedBar {
  barIndex: number;
  /** Which pass through the bar this is, in playback order (0 = first). */
  occurrence: number;
  /** The bar's length at the score's tempo, when known. */
  seconds?: number | null;
}

export interface BarPoint {
  barIndex: number;
  occurrence: number;
  timeMs: number;
}

export interface PlacementInfo {
  /** Bars that got points, when the list covered only the start of the score. */
  covered?: number;
  /** The list had one time per bar without repeats. */
  firstPassOnly?: boolean;
  /** Trailing times that had no bar. */
  extra?: number;
}

const MIN_PREFIX_SHARE = 0.5;
const MAX_PREFIX_ERROR = 0.12;

/** Converts times to milliseconds. A median gap under 100 means the input is in seconds, because a bar is never 100 s long. */
export function timesToMs(values: number[]): number[] {
  const gaps = values
    .slice(1)
    .map((v, i) => v - values[i])
    .sort((a, b) => a - b);
  const median = gaps[Math.floor(gaps.length / 2)];
  const scale = median < 100 ? 1000 : 1;
  return values.map((v) => Math.round(v * scale));
}

function firstPassBars(playedBars: PlayedBar[]): PlayedBar[] {
  return playedBars.filter((bar) => !bar.occurrence);
}

function barsForCount(
  count: number,
  playedBars: PlayedBar[]
): PlayedBar[] | null {
  if (count === playedBars.length) return playedBars;
  const once = firstPassBars(playedBars);
  return count === once.length ? once : null;
}

/** A short list is the start of the score when its gaps follow the bar lengths. */
function fitsScoreStart(times: number[], playedBars: PlayedBar[]): boolean {
  const n = times.length;
  if (
    n < 3 ||
    n >= playedBars.length ||
    n < playedBars.length * MIN_PREFIX_SHARE
  ) {
    return false;
  }
  let error = 0;
  let length = 0;
  for (let i = 0; i < n - 1; i++) {
    const seconds = playedBars[i].seconds;
    if (!seconds || !(seconds > 0)) return false;
    error += Math.abs((times[i + 1] - times[i]) / 1000 - seconds);
    length += seconds;
  }
  return error / length <= MAX_PREFIX_ERROR;
}

/**
 * Places one time per bar on the played bars. A different count means a
 * different bar structure, so it throws rather than put points on wrong bars.
 * Accepted: one time per played bar; one per bar without repeats (first pass
 * only); a start-of-score prefix; a longer list (extra times are dropped).
 */
export function placeBarTimes(
  barTimesMs: number[],
  playedBars: PlayedBar[],
  info: PlacementInfo = {}
): BarPoint[] {
  let times = barTimesMs;
  let target = barsForCount(times.length, playedBars);
  const partial =
    !target &&
    times.length < playedBars.length &&
    fitsScoreStart(times, playedBars);
  const longer =
    !target && playedBars.length > 0 && times.length > playedBars.length;
  if (longer) {
    info.extra = times.length - playedBars.length;
    times = times.slice(0, playedBars.length);
    target = playedBars;
  }
  if (!target && !partial) {
    const once = firstPassBars(playedBars).length;
    const plays =
      once !== playedBars.length ? ` (${once} without its repeats)` : '';
    throw new Error(
      `List has ${times.length} bars, but the tab plays ${playedBars.length}${plays}`
    );
  }
  const bars = target ?? playedBars;
  if (bars !== playedBars) info.firstPassOnly = true;
  if (partial) info.covered = times.length;

  // Keep times at or above 0 and strictly increasing, as a sync file requires.
  let last = -1;
  return times.map((ms, i) => {
    const timeMs = Math.max(last + 1, Math.round(Math.max(0, ms)));
    last = timeMs;
    return {
      barIndex: bars[i].barIndex,
      occurrence: bars[i].occurrence,
      timeMs
    };
  });
}
