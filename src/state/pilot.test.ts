import { beforeEach, describe, expect, it } from 'vitest';
import { allFlags, flagState, hasConsent, inboxFor, useStore } from './store';
import { ageBand, stageOf } from '../data/pilot';
import { checkAccess, roleFromPath } from '../lib/rbac';

const COACH = 'coach-ravi';
const GUARDIAN = 'grd-lakshmi';
const DISTRICT = 'dist-senthil';

const s = () => useStore.getState();
const as = (userId: string) => s().signIn(userId, false);
const flag = (id: string) => allFlags(s().raisedFlags).find((f) => f.id === id)!;
const stateOf = (id: string) => flagState(flag(id), s());

beforeEach(() => {
  s().resetDemo();
  s().signOut();
});

describe('age stages', () => {
  it('maps ages 10 to 24 onto the four stages', () => {
    expect(stageOf(10).id).toBe('foundation');
    expect(stageOf(13).id).toBe('development');
    expect(stageOf(18).id).toBe('specialisation');
    expect(stageOf(19).id).toBe('performance');
  });
  it('bands age in six-month steps from months', () => {
    expect(ageBand(160)).toBe('13.0–13.5');
    expect(ageBand(167)).toBe('13.5–14.0');
  });
});

describe('roles', () => {
  it('guardian and district officer each stay in their own area', () => {
    expect(roleFromPath('/guardian/child')).toBe('guardian');
    expect(roleFromPath('/district/flags')).toBe('district');
    expect(checkAccess('guardian', 'district')).toEqual({ ok: false, reason: 'forbidden' });
    expect(checkAccess('district', 'guardian')).toEqual({ ok: false, reason: 'forbidden' });
  });
});

describe('flag review', () => {
  it('holds a flag on a self-entered result until the coach verifies it', () => {
    expect(stateOf('fl-deepa')).toBe('unverified');
    as(COACH);
    s().verifyResult('tr-deepa-600', 'coach');
    expect(stateOf('fl-deepa')).toBe('needs-coach');
  });

  it('holds a minor’s flag without guardian consent for talent review', () => {
    as(COACH);
    s().verifyResult('tr-nila-30', 'video');
    expect(stateOf('fl-nila')).toBe('no-consent');
    as(GUARDIAN);
    s().setConsent('pa-nila', 'talent', true);
    expect(stateOf('fl-nila')).toBe('needs-coach');
  });

  it('coach confirms → district queue; district confirms → coach and guardian hear', () => {
    as(COACH);
    s().reviewFlag('fl-kavin', 'coach', 'confirmed');
    expect(stateOf('fl-kavin')).toBe('ready');
    expect(inboxFor(s().notices, DISTRICT)[0].title).toContain('Kavin Murugan');
    as(DISTRICT);
    s().reviewFlag('fl-kavin', 'district', 'confirmed');
    expect(stateOf('fl-kavin')).toBe('confirmed');
    expect(inboxFor(s().notices, COACH)[0].title).toBe('Trial invitation: Kavin Murugan');
    expect(inboxFor(s().notices, GUARDIAN)[0].kind).toBe('trial');
  });

  it('the coach’s flag button goes straight to the district queue', () => {
    as(COACH);
    s().raiseFlag('pa-surya', 'performance', 'tr-surya-30');
    expect(stateOf('fl-c-pa-surya-performance')).toBe('ready');
  });
});

describe('consent', () => {
  it('withdrawing tells the coach; adults consent for themselves', () => {
    as(GUARDIAN);
    s().setConsent('pa-kavin', 'video', false);
    expect(hasConsent(s().consent, 'pa-kavin', 'video')).toBe(false);
    expect(inboxFor(s().notices, COACH)[0].kind).toBe('consent');
    expect(s().consentLog[0]).toMatchObject({ athleteId: 'pa-kavin', purpose: 'video', given: false });
    expect(hasConsent(s().consent, 'pa-vetri', 'talent')).toBe(true);
  });
});

describe('wellness and health', () => {
  it('a low check-in alerts the coach without the answers; a good one clears it', () => {
    as('ath-arjun');
    s().submitWellness([1, 5, 2, 2]);
    const n = inboxFor(s().notices, COACH)[0];
    expect(n.kind).toBe('wellness');
    expect(n.body).not.toMatch(/[1-5] \/ 5|mood|stress/i);
    expect(s().referrals).toHaveLength(1);
    s().submitWellness([4, 2, 4, 4]);
    expect(s().referrals).toHaveLength(0);
  });

  it('an injury reaches the coach', () => {
    as('ath-arjun');
    s().logInjury('Hamstring', 'severe');
    expect(inboxFor(s().notices, COACH)[0].title).toContain('Hamstring');
  });
});

describe('offline-first results', () => {
  const row = (value: string) => ({
    id: `tr-x-${value}`, athleteId: 'pa-surya', test: '30 m sprint', value, method: 'Stopwatch' as const, verification: 'coach' as const, tester: 'Coach', date: '25.10',
  });
  it('queues on the phone, syncs later, and sends clashes to the coach', () => {
    s().enterResults([row('4.20 s')]);
    expect(s().entered).toHaveLength(0);
    s().syncNow();
    expect(s().entered).toHaveLength(1);
    s().enterResults([row('4.31 s')]);
    s().syncNow();
    expect(s().entered).toHaveLength(1);
    expect(s().conflicts).toHaveLength(1);
    s().resolveConflict(0, 'b');
    expect(s().entered[0].value).toBe('4.31 s');
    expect(s().conflicts).toHaveLength(0);
  });
});

describe('plans, trials, audit', () => {
  it('approving a stage plan tells guardians of minors in that group', () => {
    as(COACH);
    s().approvePlan('pt-wl-d');
    expect(inboxFor(s().notices, GUARDIAN)[0].title).toContain('Kavin');
  });
  it('logs one audit entry per view', () => {
    as(DISTRICT);
    s().logAccess('Viewed flag queue', '6');
    s().logAccess('Viewed flag queue', '6');
    expect(s().auditLog).toHaveLength(1);
  });
});
