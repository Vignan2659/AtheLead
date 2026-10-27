import { describe, expect, it } from 'vitest';
import { translate } from './index';
import { TA } from './ta';
import { toEngineQuery } from '../slm/tamil';
import { askSlm } from '../slm/engine';
import { SUGGESTED_PROMPTS } from '../slm/sources';
import { SLM_ROLES as ROLES } from '../data/users';

const ta = (s: string, v?: Record<string, string | number>) => translate('ta', s, v);

describe('English / Tamil strings', () => {
  it('leaves English untouched and fills placeholders', () => {
    expect(translate('en', '{n} to go', { n: 3 })).toBe('3 to go');
  });

  it('translates exact keys and falls back to English', () => {
    expect(ta('Sign out')).toBe('வெளியேறு');
    expect(ta('Zaheer Ansari')).toBe('Zaheer Ansari');
  });

  it('matches placeholder keys in already-filled strings', () => {
    expect(ta('14 to go')).toBe('இன்னும் 14');
    expect(ta('U-20 Nationals · Women')).toBe('U-20 தேசியப் போட்டி · பெண்கள்');
  });

  it('keeps every placeholder in each Tamil entry', () => {
    for (const [en, tamil] of Object.entries(TA)) {
      const names = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
      expect(names(tamil), en).toBe(names(en));
    }
  });

  it('answers every translated suggested prompt like the English one', () => {
    for (const role of ROLES) {
      for (const q of SUGGESTED_PROMPTS[role]) {
        const mapped = toEngineQuery(ta(q), SUGGESTED_PROMPTS[role], (s) => ta(s));
        expect(askSlm(role, mapped, { firstName: 'Arjun' }).title, `${role}: ${q}`).toBe(askSlm(role, q, { firstName: 'Arjun' }).title);
      }
    }
  });

  it('maps typed Tamil onto engine keywords and keeps the access rules', () => {
    expect(askSlm('athlete', toEngineQuery('நாளை என்ன பயிற்சி?', [], ta)).kind).toBe('answer');
    expect(askSlm('athlete', toEngineQuery('Yash எப்படி இருக்கிறார்?', [], ta), { firstName: 'Arjun' }).kind).toBe('refusal');
    expect(askSlm('board', toEngineQuery('எந்த மாநிலங்களுக்குச் சோதனைகள் தேவை?', [], ta)).title).toMatch(/Trials reach least/);
  });
});
