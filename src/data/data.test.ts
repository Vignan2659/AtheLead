import { describe, expect, it } from 'vitest';
import { PATHWAY_BY_GENDER, RURAL_TALENT, TARGET_2036_BY_GENDER, UNION_BY_GENDER } from './inclusion';
import { PATHWAY_STAGES, UNION_PATHWAY } from './mission2036';
import { UNION_SUMMARY } from './board';
import { SQUADS } from './squad';
import { SAMPLE_PLANS } from './diet';

describe('gender sections add up to the union totals', () => {
  it('headcount', () => expect(UNION_BY_GENDER.men + UNION_BY_GENDER.women).toBe(UNION_SUMMARY.athletes));
  it('every pathway stage', () =>
    PATHWAY_STAGES.forEach((_, i) =>
      expect(PATHWAY_BY_GENDER.men[i] + PATHWAY_BY_GENDER.women[i]).toBe(UNION_PATHWAY.counts[i]),
    ));
  it('2036 target', () => expect(TARGET_2036_BY_GENDER.men + TARGET_2036_BY_GENDER.women).toBe(UNION_PATHWAY.target2036));
});

describe('squads', () => {
  it('each squad pathway covers the whole squad', () =>
    Object.values(SQUADS).forEach((s) => expect(s.pathway.counts.reduce((a, b) => a + b, 0)).toBe(s.summary.size)));
  it('recommendations and plans point at real players', () =>
    Object.values(SQUADS).forEach((s) => {
      const ids = s.players.map((p) => p.id);
      expect(ids).toContain(s.rec.playerId);
      s.plans.forEach((p) => expect(ids).toContain(p.playerId));
    }));
});

describe('rural talent', () => {
  it('has a valid pathway stage and both genders', () => {
    RURAL_TALENT.forEach((t) => expect(PATHWAY_STAGES[t.stage]).toBeDefined());
    expect(new Set(RURAL_TALENT.map((t) => t.gender)).size).toBe(2);
  });
});

describe('diet plans respect allergies', () => {
  it('no meal contains a listed allergen', () =>
    SAMPLE_PLANS.forEach((plan) =>
      plan.allergies.forEach((a) =>
        plan.meals.forEach((m) =>
          m.items.forEach((item) => {
            const t = item.toLowerCase();
            const allergen = a.toLowerCase();
            if (t.includes(allergen)) expect(t).toMatch(new RegExp(`no ${allergen}`));
          }),
        ),
      ),
    ));
});
