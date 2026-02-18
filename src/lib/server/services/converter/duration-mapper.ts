import * as alphaTab from '@coderline/alphatab';

export interface DurationMappingResult {
  duration: alphaTab.model.Duration;
  dots: number;
  isApproximate: boolean;
}

const baseDurations: alphaTab.model.Duration[] = [
  alphaTab.model.Duration.Whole,
  alphaTab.model.Duration.Half,
  alphaTab.model.Duration.Quarter,
  alphaTab.model.Duration.Eighth,
  alphaTab.model.Duration.Sixteenth,
  alphaTab.model.Duration.ThirtySecond,
  alphaTab.model.Duration.SixtyFourth
];

export function mapSongsterrDuration(
  duration: [number, number] | undefined
): DurationMappingResult {
  if (!duration) {
    return {
      duration: alphaTab.model.Duration.Quarter,
      dots: 0,
      isApproximate: true
    };
  }

  const [numerator, denominator] = duration;
  if (!numerator || !denominator) {
    return {
      duration: alphaTab.model.Duration.Quarter,
      dots: 0,
      isApproximate: true
    };
  }

  const targetValue = numerator / denominator;
  let bestDuration = alphaTab.model.Duration.Quarter;
  let bestDots = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  for (const candidateDuration of baseDurations) {
    const baseValue = 1 / Number(candidateDuration);
    for (const dots of [0, 1, 2]) {
      const dottedValue =
        baseValue +
        (dots >= 1 ? baseValue / 2 : 0) +
        (dots >= 2 ? baseValue / 4 : 0);
      const delta = Math.abs(dottedValue - targetValue);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestDuration = candidateDuration;
        bestDots = dots;
      }
    }
  }

  return {
    duration: bestDuration,
    dots: bestDots,
    isApproximate: bestDelta > 0.000001
  };
}
