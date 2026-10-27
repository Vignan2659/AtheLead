import { describe, expect, it } from 'vitest';
import { accessCheck, askSlm, matchIntent } from './engine';
import { SUGGESTED_PROMPTS, sourcesFor } from './sources';
import { SLM_ROLES as ROLES } from '../data/users';

describe('Sports SLM access rules', () => {
  it('stops an athlete asking about a teammate', () => {
    const a = askSlm('athlete', 'How is Yash doing this week?', { firstName: 'Arjun' });
    expect(a.kind).toBe('refusal');
    expect(a.intro).toMatch(/only use your own profile/);
    expect(a.dataUsed).toEqual([]);
  });

  it('lets an athlete ask about themself by name', () => {
    expect(accessCheck('athlete', 'Is Arjun at injury risk?', { firstName: 'Arjun' })).toBeNull();
  });

  it('does not mistake "dev index" for a person', () => {
    expect(askSlm('athlete', 'How do I raise my dev index for national camp?', { firstName: 'Arjun' }).kind).toBe('answer');
  });

  it('stops an athlete asking about scouting or the board', () => {
    expect(askSlm('athlete', 'Who are the scouts looking at?').kind).toBe('refusal');
    expect(askSlm('athlete', 'What did the board decide?').kind).toBe('refusal');
  });

  it('stops a coach asking about budgets or other teams', () => {
    expect(askSlm('coach', 'What is the union budget for 2027?').kind).toBe('refusal');
    expect(askSlm('coach', 'How is the Guwahati centre doing?').kind).toBe('refusal');
    expect(askSlm('coach', 'Is Priya a better coach?').kind).toBe('refusal');
  });

  it('keeps medical detail from the board', () => {
    const a = askSlm('board', "What is Aditya's diagnosis?");
    expect(a.kind).toBe('refusal');
    expect(a.intro).toMatch(/fitness status only/);
  });

  it('never lists a source the role cannot read', () => {
    for (const role of ROLES) {
      const allowed = new Set(sourcesFor(role).map((s) => s.label));
      for (const q of SUGGESTED_PROMPTS[role]) {
        for (const s of askSlm(role, q).dataUsed) expect(allowed.has(s)).toBe(true);
      }
    }
    expect(sourcesFor('board').some((s) => s.id === 'medical')).toBe(false);
  });
});

describe('Sports SLM answers', () => {
  it('answers every suggested prompt with a matching intent', () => {
    for (const role of ROLES) {
      for (const q of SUGGESTED_PROMPTS[role]) {
        const a = askSlm(role, q, { firstName: 'Arjun' });
        expect(a.kind, `${role}: ${q}`).toBe('answer');
        expect(a.confidence, `${role}: ${q}`).toBeGreaterThan(0);
      }
    }
  });

  it('routes questions to the right intent', () => {
    expect(matchIntent('athlete', 'What should I eat before training?')?.id).toBe('fuel');
    expect(matchIntent('coach', 'Build a 14-day plan for the Nationals')?.id).toBe('plan');
    expect(matchIntent('board', 'Which events should we prioritise?')?.id).toBe('events');
  });

  it('uses the check-in in its advice', () => {
    const sore = askSlm('athlete', 'What should I train tomorrow?', { feel: 1 });
    expect(sore.sections.flatMap((s) => s.items).join(' ')).toMatch(/sore/);
  });

  it('falls back gracefully on an unknown question', () => {
    const a = askSlm('coach', 'Tell me a joke');
    expect(a.kind).toBe('answer');
    expect(a.confidence).toBeNull();
  });
});
