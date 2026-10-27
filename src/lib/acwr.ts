export type Tone = 'ok' | 'warn' | 'bad';

export const ACWR_SAFE: [number, number] = [0.8, 1.3];

/** Red past the risk line or when injured, amber when under-loaded, green in the safe band. */
export function acwrTone(acwr: number, injured = false): Tone {
  if (injured || acwr > ACWR_SAFE[1]) return 'bad';
  if (acwr < ACWR_SAFE[0]) return 'warn';
  return 'ok';
}

export const formatAcwr = (v: number): string => v.toFixed(2);
