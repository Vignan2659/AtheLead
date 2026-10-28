import { describe, expect, it } from 'vitest';
import { bodyOf, groupOf } from './body';
import { ROSTER_NAMES, personOf } from './roster';
import { TA } from '../i18n/ta';

describe('body profile', () => {
  it('gives every named athlete a profile in a plausible range', () => {
    for (const name of ROSTER_NAMES) {
      const b = bodyOf(name)!;
      expect(b, name).toBeDefined();
      expect(b.age, name).toBeGreaterThanOrEqual(10);
      expect(b.age, name).toBeLessThanOrEqual(24);
      expect(b.heightCm, name).toBeGreaterThanOrEqual(125);
      expect(b.heightCm, name).toBeLessThanOrEqual(200);
      expect(b.weightKg, name).toBeGreaterThanOrEqual(25);
      expect(b.weightKg, name).toBeLessThanOrEqual(105);
      expect(Math.abs(b.armSpanCm - b.heightCm), name).toBeLessThanOrEqual(14);
    }
  });

  it('is the same person by id and by name, every time', () => {
    expect(bodyOf('pr-zaheer')).toEqual(bodyOf('Zaheer Ansari'));
    expect(bodyOf('r-ramesh')).toEqual(bodyOf('rt-ramesh'));
    expect(bodyOf('ath-arjun')).toEqual(bodyOf('Arjun Reddy'));
    expect(bodyOf('ath-arjun')?.heightCm).toBe(181);
  });

  it('keeps recorded ages and weight classes', () => {
    expect(bodyOf('pr-zaheer')?.age).toBe(personOf('pr-zaheer')?.age);
    expect(bodyOf('pa-kavin')?.age).toBe(13);
    expect(bodyOf('pa-kavin')!.weightKg).toBeLessThanOrEqual(55);
    expect(bodyOf('pa-vetri')!.weightKg).toBeLessThanOrEqual(73);
    expect(bodyOf('pa-vetri')!.weightKg).toBeGreaterThan(70);
  });

  it('sorts events into groups', () => {
    expect(groupOf('Javelin', 'Athletics')).toBe('throw');
    expect(groupOf('Sprints and jumps', 'Athletics')).toBe('youth');
    expect(groupOf('Triple jump', 'Athletics')).toBe('jump');
    expect(groupOf('Steeplechase', 'Athletics')).toBe('distance');
    expect(groupOf('400 m hurdles', 'Athletics')).toBe('sprint');
    expect(groupOf('55 kg youth', 'Weightlifting')).toBe('lift');
  });

  it('has Tamil for every place it was measured', () => {
    for (const name of ROSTER_NAMES) expect(TA[bodyOf(name)!.measuredAt], name).toBeTruthy();
  });
});
