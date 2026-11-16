import { describe, expect, it } from 'vitest';
import { ROLES } from '../data/users';
import { TA } from '../i18n/ta';
import { TABS } from './nav';
import { CAUSE, STEPS, YOUR_PART, stepIndex } from './steps';

describe('step guide', () => {
  it('gives every role steps that start at its home tab and cover every tab', () => {
    for (const role of ROLES) {
      const paths = STEPS[role].map((s) => s.path);
      expect(paths[0], role).toBe(TABS[role][0].path);
      expect(new Set(paths).size, role).toBe(paths.length);
      for (const tab of TABS[role]) expect(paths, `${role}/${tab.path}`).toContain(tab.path);
    }
  });

  it('finds the step for a screen, and none for screens outside the steps', () => {
    expect(stepIndex('athlete', '/athlete/fuel')).toBe(2);
    expect(stepIndex('coach', '/coach/tests')).toBe(2);
    expect(stepIndex('coach', '/coach/drills')).toBe(-1);
  });

  it('keeps step words short enough for a tile', () => {
    for (const role of ROLES)
      for (const s of STEPS[role]) {
        expect(s.title.length, s.title).toBeLessThanOrEqual(18);
        expect(s.text.length, s.text).toBeLessThanOrEqual(62);
      }
  });

  it('has Tamil for the cause, every part and every step', () => {
    expect(TA[CAUSE]).toBeTruthy();
    for (const role of ROLES) {
      expect(TA[YOUR_PART[role]], role).toBeTruthy();
      for (const s of STEPS[role]) {
        expect(TA[s.title], s.title).toBeTruthy();
        expect(TA[s.text], s.text).toBeTruthy();
      }
    }
  });
});
