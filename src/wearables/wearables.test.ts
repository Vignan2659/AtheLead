import { describe, expect, it } from 'vitest';
import { PREVIEW_BASELINE, PREVIEW_WEEK, blendedReadiness, latestPreview, wearableReadiness } from './preview';
import { PROVIDERS } from './providers';

describe('wearableReadiness', () => {
  const b = PREVIEW_BASELINE;
  it('is 75 when every metric sits on baseline', () =>
    expect(wearableReadiness({ athleteId: 'a', date: 'd', provider: 'noise', ...b }, b)).toBe(75));
  it('drops after a short night and low HRV', () => {
    const r = latestPreview('ath-arjun');
    expect(r).toBeDefined();
    expect(wearableReadiness(r!, b)).toBe(60);
  });
  it('rises with HRV above baseline', () =>
    expect(wearableReadiness({ athleteId: 'a', date: 'd', provider: 'noise', ...b, hrv: 90 }, b)!).toBeGreaterThan(75));
  it('rebalances when a band reports fewer metrics', () =>
    expect(wearableReadiness({ athleteId: 'a', date: 'd', provider: 'noise', sleepHrs: b.sleepHrs }, b)).toBe(75));
  it('returns null with no usable metrics', () =>
    expect(wearableReadiness({ athleteId: 'a', date: 'd', provider: 'noise', steps: 9000 }, b)).toBeNull());
  it('stays within 0–100', () => {
    const v = wearableReadiness({ athleteId: 'a', date: 'd', provider: 'noise', hrv: 5, sleepHrs: 2, restingHr: 90 }, b)!;
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(100);
  });
});

describe('blendedReadiness', () => {
  it('leads with the band', () => expect(blendedReadiness(84, 60)).toBe(70));
  it('falls back to whichever exists', () => {
    expect(blendedReadiness(null, 60)).toBe(60);
    expect(blendedReadiness(84, null)).toBe(84);
    expect(blendedReadiness(null, null)).toBeNull();
  });
});

describe('providers', () => {
  it('covers the bands named for India first', () => {
    const ids = PROVIDERS.map((p) => p.id);
    ['fitbit', 'whoop', 'noise'].forEach((id) => expect(ids).toContain(id));
  });
  it('preview week is seven days for one athlete', () => {
    expect(PREVIEW_WEEK).toHaveLength(7);
    expect(new Set(PREVIEW_WEEK.map((r) => r.athleteId)).size).toBe(1);
  });
});
