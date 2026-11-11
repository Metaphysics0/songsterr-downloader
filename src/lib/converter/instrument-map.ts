export interface InstrumentMapping {
  program: number;
  isPercussion: boolean;
  primaryChannel?: number;
  secondaryChannel?: number;
}

export function mapSongsterrInstrumentToPlayback(
  instrumentId: number | undefined
): InstrumentMapping {
  if (instrumentId === 1024) {
    return {
      program: 0,
      isPercussion: true,
      primaryChannel: 9,
      secondaryChannel: 9
    };
  }

  const normalizedProgram =
    typeof instrumentId === 'number'
      ? Math.min(Math.max(instrumentId, 0), 127)
      : 24;

  return {
    program: normalizedProgram,
    isPercussion: false
  };
}
