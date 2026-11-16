/**
 * The app in plain steps, one list per role. Each step is one screen, with an icon and a short
 * sentence in everyday words, so someone who reads little can still find their way.
 */
import type { IconName } from '../design/Icon';
import type { Role } from '../data/users';

export interface Step {
  /** Path under the role, e.g. "today" → /athlete/today. */
  path: string;
  icon: IconName;
  title: string;
  text: string;
}

/** Why the app exists, said the same way to everyone. */
export const CAUSE =
  'A gifted child in a village should never go unseen. AtheLead finds them, trains them and takes them to the selectors for the 2036 Olympics.';

export const YOUR_PART: Record<Role, string> = {
  athlete: 'Your part: train, record your results and get seen.',
  coach: 'Your part: train your athletes, check their results and put the best ones forward.',
  guardian: 'Your part: see how your child is doing and decide what you allow.',
  district: 'Your part: check the flagged athletes and invite them to trials.',
  board: 'Your part: see talent from every district and choose who moves up.',
};

export const STEPS: Record<Role, Step[]> = {
  athlete: [
    { path: 'today', icon: 'sun', title: 'Check in', text: 'Say how you feel and see today’s training.' },
    { path: 'train', icon: 'run', title: 'Train', text: 'Do your session and the exercises for your sport.' },
    { path: 'fuel', icon: 'food', title: 'Eat', text: 'See what to eat before and after training.' },
    { path: 'wellbeing', icon: 'heart', title: 'Mind and body', text: 'Weekly check-in, and tell your coach about an injury.' },
    { path: 'stats', icon: 'chart', title: 'See progress', text: 'Your results and your passport for selectors.' },
    { path: 'coach', icon: 'chat', title: 'Talk to coach', text: 'Read your coach’s notes and ask for help.' },
  ],
  coach: [
    { path: 'squad', icon: 'people', title: 'See your squad', text: 'Who is ready, who needs rest, who is hurt.' },
    { path: 'train', icon: 'run', title: 'Set training', text: 'Plan the week and the exercises for each sport.' },
    { path: 'tests', icon: 'clipboard', title: 'Record tests', text: 'Enter results for the group and confirm them.' },
    { path: 'scout', icon: 'search', title: 'Find talent', text: 'Compare new athletes and send the best to the board.' },
    { path: 'fixtures', icon: 'calendar', title: 'Plan meets', text: 'See coming meets and who is ready for them.' },
    { path: 'slm', icon: 'spark', title: 'Ask', text: 'Ask a question about your squad and get an answer.' },
  ],
  guardian: [
    { path: 'child', icon: 'child', title: 'See your child', text: 'Training, food and how they are doing.' },
    { path: 'tests', icon: 'clipboard', title: 'See results', text: 'Test results and any talent flag.' },
    { path: 'consent', icon: 'shield', title: 'Give permission', text: 'Choose what data you allow. You can change it any time.' },
  ],
  district: [
    { path: 'flags', icon: 'flag', title: 'Check flags', text: 'Look at each flagged athlete and confirm or reject.' },
    { path: 'cohorts', icon: 'scales', title: 'Check fairness', text: 'See that girls, boys and villages are all tested.' },
    { path: 'trials', icon: 'medal', title: 'Run trials', text: 'Invite athletes and record what happened.' },
  ],
  board: [
    { path: 'home', icon: 'home', title: 'See the country', text: 'All athletes, the talent map and decisions waiting for you.' },
    { path: 'talent', icon: 'search', title: 'Find talent', text: 'Village athletes and the scouting pool.' },
    { path: 'teams', icon: 'people', title: 'Check teams', text: 'How each event group is doing.' },
    { path: 'events', icon: 'calendar', title: 'Plan events', text: 'Trials, camps and meets on the way to 2036.' },
    { path: 'admin', icon: 'sliders', title: 'Rules and export', text: 'Set the flag rules, export data, see who opened what.' },
    { path: 'slm', icon: 'spark', title: 'Ask', text: 'Ask a question about the programme and get an answer.' },
  ],
};

/** The step a path belongs to, or -1 for screens outside the steps. */
export function stepIndex(role: Role, pathname: string) {
  return STEPS[role].findIndex((s) => pathname === `/${role}/${s.path}`);
}
