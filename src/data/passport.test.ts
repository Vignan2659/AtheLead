import { describe, expect, it } from 'vitest';
import { PASSPORTS, passportFor } from './passport';
import { RURAL_TALENT } from './inclusion';
import { STATES } from './states';
import { INDIA_GRID } from './indiaGrid';
import { missedStates } from '../features/board/TalentMap';

describe('athlete passport', () => {
  it('exists for Arjun and every village athlete', () => {
    expect(passportFor('ath-arjun')?.pb).toBe('47.62');
    for (const r of RURAL_TALENT) expect(passportFor(r.id)?.name).toBe(r.name);
  });

  it('has unique numbers and at least one verified result', () => {
    expect(new Set(PASSPORTS.map((p) => p.number)).size).toBe(PASSPORTS.length);
    for (const p of PASSPORTS) expect(p.results.length).toBeGreaterThan(0);
  });

  it('carries performance data only', () => {
    const text = JSON.stringify(PASSPORTS).toLowerCase();
    for (const word of ['hrv', 'heart', 'sleep', 'allerg', 'injur', 'wellbeing']) expect(text).not.toContain(word);
  });
});

describe('talent map', () => {
  it('places every state and UT in its own tile', () => {
    const cells = STATES.map((s) => INDIA_GRID[s.name]);
    expect(cells.every(Boolean)).toBe(true);
    expect(new Set(cells.map((c) => `${c[0]},${c[1]}`)).size).toBe(STATES.length);
  });

  it('flags some mostly rural states as missed talent for each gender', () => {
    for (const g of ['men', 'women'] as const) {
      const m = missedStates(g);
      expect(m.size).toBeGreaterThan(0);
      for (const name of m) expect(STATES.find((s) => s.name === name)!.ruralShare).toBeGreaterThanOrEqual(70);
    }
  });
});
