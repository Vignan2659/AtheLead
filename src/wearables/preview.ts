import type { Baseline, DailyReading, WearableSource } from './types';

/**
 * Preview readings so the MVP can show what band data adds. Deterministic and
 * clearly labelled "Preview" in the UI: no real device is connected.
 */
export const PREVIEW_BASELINE: Baseline = { restingHr: 52, hrv: 78, sleepHrs: 7.6 };

export const PREVIEW_WEEK: DailyReading[] = [
  { athleteId: 'ath-arjun', date: '14.10', provider: 'noise', restingHr: 51, hrv: 81, sleepHrs: 7.9, steps: 14200, topSpeedKmh: 33.8 },
  { athleteId: 'ath-arjun', date: '15.10', provider: 'noise', restingHr: 53, hrv: 76, sleepHrs: 7.1, steps: 12800 },
  { athleteId: 'ath-arjun', date: '16.10', provider: 'noise', restingHr: 52, hrv: 79, sleepHrs: 7.8, steps: 15100, topSpeedKmh: 34.2 },
  { athleteId: 'ath-arjun', date: '17.10', provider: 'noise', restingHr: 50, hrv: 84, sleepHrs: 8.2, steps: 9800 },
  { athleteId: 'ath-arjun', date: '18.10', provider: 'noise', restingHr: 52, hrv: 80, sleepHrs: 7.4, steps: 8100 },
  { athleteId: 'ath-arjun', date: '19.10', provider: 'noise', restingHr: 55, hrv: 71, sleepHrs: 6.6, steps: 16400, topSpeedKmh: 34.6 },
  { athleteId: 'ath-arjun', date: '20.10', provider: 'noise', restingHr: 54, hrv: 73, sleepHrs: 6.9, steps: 4200 },
];

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/**
 * Readiness 0–100 from band data: HRV against baseline weighs most, then
 * sleep, then resting HR. A missing metric drops out and the weights rebalance.
 */
export function wearableReadiness(r: DailyReading, b: Baseline): number | null {
  const parts: { score: number; weight: number }[] = [];
  if (r.hrv !== undefined) parts.push({ score: clamp(75 + ((r.hrv - b.hrv) / b.hrv) * 250), weight: 0.5 });
  if (r.sleepHrs !== undefined) parts.push({ score: clamp(75 + (r.sleepHrs - b.sleepHrs) * 25), weight: 0.3 });
  if (r.restingHr !== undefined) parts.push({ score: clamp(75 - (r.restingHr - b.restingHr) * 5), weight: 0.2 });
  if (r.recovery !== undefined) parts.push({ score: clamp(r.recovery), weight: 0.5 });
  if (parts.length === 0) return null;
  const w = parts.reduce((a, p) => a + p.weight, 0);
  return Math.round(parts.reduce((a, p) => a + p.score * p.weight, 0) / w);
}

/**
 * Blend how the athlete says they feel with what the band measured. The band
 * leads (60%) because it is objective; the check-in still counts because pain
 * and mood don't show up on a wrist.
 */
export function blendedReadiness(feel: number | null, band: number | null): number | null {
  if (feel === null) return band;
  if (band === null) return feel;
  return Math.round(band * 0.6 + feel * 0.4);
}

export const previewSource: WearableSource = {
  provider: 'noise',
  connect: async () => {},
  daily: async (athleteId, days) => PREVIEW_WEEK.filter((r) => r.athleteId === athleteId).slice(-days),
};

export const latestPreview = (athleteId: string): DailyReading | undefined =>
  PREVIEW_WEEK.filter((r) => r.athleteId === athleteId).slice(-1)[0];

/** Today's band readiness for an athlete, or null when no band data exists. */
export function bandReadinessFor(athleteId: string | undefined): number | null {
  const r = athleteId ? latestPreview(athleteId) : undefined;
  return r ? wearableReadiness(r, PREVIEW_BASELINE) : null;
}
