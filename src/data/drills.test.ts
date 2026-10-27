import { describe, expect, it } from 'vitest';
import { DRILL_RULES, EXERCISES, LOAD_LABEL, SPORTS } from './drills';
import { TA } from '../i18n/ta';

describe('sport exercise library', () => {
  it('links every item to a real exercise and one of its sport’s needs', () => {
    for (const s of SPORTS) {
      for (const item of s.items) {
        expect(EXERCISES[item.ex], `${s.id}: ${item.ex}`).toBeDefined();
        expect(s.needs.map((n) => n.id), `${s.id}: ${item.need}`).toContain(item.need);
      }
    }
  });

  it('gives every need at least two exercises and every exercise a photo or pictogram', () => {
    for (const s of SPORTS) for (const n of s.needs) expect(s.items.filter((x) => x.need === n.id).length, `${s.id}/${n.id}`).toBeGreaterThanOrEqual(2);
    for (const e of Object.values(EXERCISES)) expect(Boolean(e.photo) !== Boolean(e.icon), e.id).toBe(true);
  });

  it('uses every exercise in at least one sport', () => {
    const used = new Set(SPORTS.flatMap((s) => s.items.map((x) => x.ex)));
    expect(Object.keys(EXERCISES).filter((id) => !used.has(id))).toEqual([]);
  });

  it('has Tamil for every exercise, need, reason, dose and rule', () => {
    const strings = [
      ...Object.values(LOAD_LABEL),
      ...DRILL_RULES,
      ...Object.values(EXERCISES).flatMap((e) => [e.name, e.safety, ...e.cues, ...e.targets]),
      ...SPORTS.flatMap((s) => [s.name, ...s.needs.flatMap((n) => [n.name, n.body]), ...s.items.flatMap((x) => [x.why, x.dose])]),
    ];
    // Doses that are only numbers read the same in both languages.
    const missing = [...new Set(strings)].filter((k) => /[a-z]/i.test(k) && !(k in TA));
    expect(missing).toEqual([]);
  });
});
