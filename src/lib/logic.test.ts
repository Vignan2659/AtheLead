import { describe, expect, it } from 'vitest';
import { acwrTone } from './acwr';
import { checkAccess } from './rbac';
import { findByPhone, normalisePhone } from '../features/auth/auth';
import { dragProgress, stackOpacity, swipeDecision } from './swipe';
import { authenticate, validateRegistration } from '../features/auth/auth';
import { DEMO_USERS } from '../data/users';

describe('acwrTone', () => {
  it('flags values past the 1.3 risk line', () => expect(acwrTone(1.46)).toBe('bad'));
  it('flags under-loading below 0.8', () => expect(acwrTone(0.79)).toBe('warn'));
  it('is green inside the safe band, edges included', () => {
    expect(acwrTone(0.8)).toBe('ok');
    expect(acwrTone(1.3)).toBe('ok');
    expect(acwrTone(1.12)).toBe('ok');
  });
  it('is red whenever the player is injured', () => expect(acwrTone(1.0, true)).toBe('bad'));
});

describe('checkAccess', () => {
  it('lets a role into its own namespace', () => expect(checkAccess('coach', 'coach')).toEqual({ ok: true }));
  it('blocks other roles', () => expect(checkAccess('athlete', 'board')).toEqual({ ok: false, reason: 'forbidden' }));
  it('sends signed-out users to sign in', () => expect(checkAccess(null, 'athlete')).toEqual({ ok: false, reason: 'signed-out' }));
});

describe('swipe', () => {
  it('only flings past ±110px', () => {
    expect(swipeDecision(110)).toBeNull();
    expect(swipeDecision(111)).toBe('right');
    expect(swipeDecision(-111)).toBe('left');
    expect(swipeDecision(40)).toBeNull();
  });
  it('caps drag progress at 1', () => {
    expect(dragProgress(55)).toBe(0.5);
    expect(dragProgress(-400)).toBe(1);
  });
  it('fades cards beyond the third', () => {
    expect(stackOpacity(2)).toBe(1);
    expect(stackOpacity(3)).toBe(0);
  });
});

describe('authenticate', () => {
  it('signs in a demo account with the right role', () => {
    const r = authenticate(DEMO_USERS, 'Arjun.Reddy@velora.demo', 'demo1234', 'athlete');
    expect(r.ok).toBe(true);
  });
  it('explains a role mismatch', () => {
    const r = authenticate(DEMO_USERS, 'ravi.menon@velora.demo', 'demo1234', 'athlete');
    expect(r).toEqual({
      ok: false,
      field: 'role',
      error: 'This account is registered as Coach. Select Coach to continue.',
    });
  });
  it('rejects a wrong password', () => {
    expect(authenticate(DEMO_USERS, 'meera.iyer@velora.demo', 'nope', 'board').ok).toBe(false);
  });
  it('keeps board registration invite-only', () => {
    expect(validateRegistration(DEMO_USERS, 'New Person', 'new@velora.demo', 'longenough', 'board').ok).toBe(false);
  });
});

describe('phone sign-in', () => {
  it('finds the account by number, with or without +91', () => {
    expect(normalisePhone('+91 98480 12345')).toBe('9848012345');
    const r = findByPhone(DEMO_USERS, '+91 98480 12345', 'athlete');
    expect(r.ok && r.user.id).toBe('ath-arjun');
    expect(findByPhone(DEMO_USERS, '98480 12345', 'coach').ok).toBe(false);
  });
});
