import type { Role } from '../data/users';

export interface Tab {
  path: string;
  label: string;
}

export const TABS: Record<Role, Tab[]> = {
  athlete: [
    { path: 'today', label: 'Today' },
    { path: 'train', label: 'Train' },
    { path: 'fuel', label: 'Fuel' },
    { path: 'stats', label: 'Stats' },
    { path: 'coach', label: 'Coach' },
  ],
  coach: [
    { path: 'squad', label: 'Squad' },
    { path: 'train', label: 'Train' },
    { path: 'scout', label: 'Scout' },
    { path: 'fixtures', label: 'Fixtures' },
    { path: 'slm', label: 'SLM' },
  ],
  board: [
    { path: 'home', label: 'Home' },
    { path: 'teams', label: 'Teams' },
    { path: 'talent', label: 'Talent' },
    { path: 'events', label: 'Events' },
    { path: 'slm', label: 'SLM' },
  ],
  guardian: [
    { path: 'child', label: 'Child' },
    { path: 'tests', label: 'Tests' },
    { path: 'consent', label: 'Consent' },
  ],
  district: [
    { path: 'flags', label: 'Flags' },
    { path: 'cohorts', label: 'Cohorts' },
    { path: 'trials', label: 'Trials' },
  ],
};

/** Screens outside the bar that light up a tab: the pilot tests sit under Scout. */
export const PARENT_TAB: Record<string, string> = {
  '/coach/tests': 'scout',
  '/athlete/wellbeing': 'today',
  '/athlete/drills': 'train',
  '/coach/drills': 'train',
  '/board/admin': 'talent',
};
