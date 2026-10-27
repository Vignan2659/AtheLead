import { describe, expect, it } from 'vitest';
import { ROSTER_NAMES, eventOf, sportOf } from './roster';
import { SQUADS } from './squad';
import { PROSPECTS } from './scouting';
import { RURAL_TALENT } from './inclusion';
import { RISING } from './board';
import { PILOT_ATHLETES } from './pilot';
import { PASSPORTS } from './passport';
import { READINESS_ALERTS } from './fixtures';
import { TA } from '../i18n/ta';

describe('roster: sport beside every athlete', () => {
  it('knows the sport and event of every athlete the app names', () => {
    const names = [
      ...Object.values(SQUADS).flatMap((s) => [...s.players.map((p) => p.name), s.pathway.closest.name, ...s.plans.map((p) => p.name)]),
      ...PROSPECTS.map((p) => p.name),
      ...RURAL_TALENT.map((r) => r.name),
      ...Object.values(RISING).flatMap((l) => l.map((r) => r.name)),
      ...PILOT_ATHLETES.map((a) => a.name),
      ...PASSPORTS.map((p) => p.name),
      ...READINESS_ALERTS.map((a) => a.name),
    ];
    expect(names.filter((n) => !sportOf(n)?.event)).toEqual([]);
    expect(PASSPORTS.filter((p) => !sportOf(p.id))).toEqual([]);
  });

  it('resolves the athlete account and pilot ids', () => {
    expect(sportOf('ath-arjun')).toEqual({ sport: 'Athletics', event: '400 m' });
    expect(sportOf('pa-kavin')).toEqual({ sport: 'Weightlifting', event: '55 kg youth' });
    expect(sportOf('coach-ravi')).toBeUndefined();
  });

  it('strips marks from events', () => {
    expect(eventOf('400 m hurdles · PB 52.10')).toBe('400 m hurdles');
    expect(eventOf('1500 m · 4:21.6')).toBe('1500 m');
  });

  it('has Tamil for every sport and event shown in a tag', () => {
    const keys = new Set(ROSTER_NAMES.flatMap((n) => [sportOf(n)!.sport, sportOf(n)!.event]));
    expect([...keys].filter((k) => !(k in TA))).toEqual([]);
  });
});
