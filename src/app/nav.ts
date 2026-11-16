import type { IconName } from '../design/Icon';
import type { Role } from '../data/users';

export interface Tab {
  path: string;
  label: string;
  icon: IconName;
}

export const TABS: Record<Role, Tab[]> = {
  athlete: [
    { path: 'today', label: 'Today', icon: 'sun' },
    { path: 'train', label: 'Train', icon: 'run' },
    { path: 'fuel', label: 'Fuel', icon: 'food' },
    { path: 'stats', label: 'Stats', icon: 'chart' },
    { path: 'coach', label: 'Coach', icon: 'chat' },
  ],
  coach: [
    { path: 'squad', label: 'Squad', icon: 'people' },
    { path: 'train', label: 'Train', icon: 'run' },
    { path: 'scout', label: 'Scout', icon: 'search' },
    { path: 'fixtures', label: 'Fixtures', icon: 'calendar' },
    { path: 'slm', label: 'SLM', icon: 'spark' },
  ],
  board: [
    { path: 'home', label: 'Home', icon: 'home' },
    { path: 'teams', label: 'Teams', icon: 'people' },
    { path: 'talent', label: 'Talent', icon: 'search' },
    { path: 'events', label: 'Events', icon: 'calendar' },
    { path: 'slm', label: 'SLM', icon: 'spark' },
  ],
  guardian: [
    { path: 'child', label: 'Child', icon: 'child' },
    { path: 'tests', label: 'Tests', icon: 'clipboard' },
    { path: 'consent', label: 'Consent', icon: 'shield' },
  ],
  district: [
    { path: 'flags', label: 'Flags', icon: 'flag' },
    { path: 'cohorts', label: 'Cohorts', icon: 'scales' },
    { path: 'trials', label: 'Trials', icon: 'medal' },
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
