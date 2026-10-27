import type { SlmRole } from '../data/users';
import type { DataSource, Recommendation } from './types';

/**
 * Everything the Sports SLM can read, and which roles may read it. The access
 * filter runs before retrieval, so a source a role cannot see is never loaded.
 */
export const DATA_SOURCES: DataSource[] = [
  { id: 'profile', label: 'Athlete profile', detail: 'Age, sport, role, home district', roles: ['athlete', 'coach'] },
  { id: 'logs', label: 'Training logs', detail: 'Sessions, RPE, completion', roles: ['athlete', 'coach'] },
  { id: 'checkins', label: 'Daily check-ins', detail: 'Feel, sleep, soreness', roles: ['athlete', 'coach'] },
  { id: 'nutrition', label: 'Nutrition', detail: 'Meal logs, sample diet plan', roles: ['athlete', 'coach'] },
  { id: 'medical', label: 'Medical notes', detail: 'Diagnoses, physio reports', roles: ['coach'] },
  { id: 'plans', label: 'Coach plans', detail: 'Approved sessions and plan changes', roles: ['athlete', 'coach'] },
  { id: 'performance', label: 'Performance tests', detail: 'Speed, Yo-Yo, strength', roles: ['athlete', 'coach'] },
  { id: 'scouting', label: 'Scouting reports', detail: 'Prospects, district trials', roles: ['coach', 'board'] },
  { id: 'fixtures', label: 'Fixtures', detail: 'Tournaments, travel', roles: ['athlete', 'coach', 'board'] },
  { id: 'fitness', label: 'Fitness status', detail: 'Fit, managed, unavailable', roles: ['coach', 'board'] },
  { id: 'pipeline', label: 'Talent pipeline', detail: 'Pathway stages by gender and origin', roles: ['coach', 'board'] },
  { id: 'aggregates', label: 'Union aggregates', detail: 'Teams, coaches, gender, rural reach', roles: ['board'] },
  { id: 'budget', label: 'Programmes and budget', detail: 'Costs, reach, priorities', roles: ['board'] },
];

export const sourcesFor = (role: SlmRole) => DATA_SOURCES.filter((s) => s.roles.includes(role));

/** What each role's answers are scoped to. */
export const SCOPE: Record<SlmRole, string> = {
  athlete: 'Your own profile, logs and your coach’s plans.',
  coach: 'Your Track Squad U-20 (men and women), scouting and meets.',
  board: 'Programme-wide aggregates, event groups, talent and fitness status. No medical detail.',
};

export const SUGGESTED_PROMPTS: Record<SlmRole, string[]> = {
  athlete: [
    'What should I train tomorrow?',
    'Am I at risk of injury?',
    'How do I reach national camp?',
    'What should I eat before training?',
    'How has my 300 m time changed?',
  ],
  coach: [
    'Who is at injury risk this week?',
    'Build a 14-day plan for the Nationals',
    'Which 400 m runners should I scout?',
    'Who is closest to national camp?',
    'Who in the women’s squad needs support?',
  ],
  board: [
    'Where should we invest for 2036?',
    'Which event groups need support?',
    'How is rural reach changing?',
    'Which states need more trials?',
    'Which events should we prioritise?',
    'Which coaches perform best?',
  ],
};

/** SLM recommendations in the board's intelligence centre. */
export const BOARD_RECS: Recommendation[] = [
  {
    id: 'br-trials',
    title: 'Fund district trials in 40 more districts',
    detail: '₹1.8 cr · screens about 6,000 athletes, most of them rural.',
    confidence: 86,
    impact: '+9 athletes a year into the State stage',
    factors: [
      { label: 'Rural share falls from 58% to 22% along the pathway', weight: 45 },
      { label: '62% of current State athletes came through trials', weight: 35 },
      { label: 'Lowest cost per athlete found', weight: 20 },
    ],
  },
  {
    id: 'br-zaheer',
    title: 'Trial Zaheer Ansari for the 4 × 400 m pool',
    detail: 'Men’s 400 m, 19, Adoni (Kurnool). 48.10 on a cinder track; fills the squad’s biggest gap.',
    confidence: 89,
    impact: 'Fourth runner for the Nationals 4 × 400 m',
    factors: [
      { label: 'Team fit 94: relay pool is one runner short', weight: 50 },
      { label: '48.10 at 19 without spikes or a coach', weight: 30 },
      { label: 'Rural athlete from district trials', weight: 20 },
    ],
    forwardTo: 'coach-ravi',
  },
  {
    id: 'br-rest',
    title: 'Rest the Nationals 400 m squad at the Velora Relays',
    detail: 'Field U-18 runners at the Velora Relays, 05.12 – 06.12.',
    confidence: 81,
    impact: 'Lower injury risk before the national camp trials in Feb 2027',
    factors: [
      { label: 'Three 400 m runners will be past ACWR 1.3 after the Nationals', weight: 55 },
      { label: 'Low selection value of the Relays', weight: 30 },
      { label: 'Six U-18s ready for senior relays', weight: 15 },
    ],
    forwardTo: 'coach-ravi',
  },
  {
    id: 'br-bands',
    title: 'Buy fitness bands for 500 pathway athletes',
    detail: '₹15 lakh · budget bands that sync through Android Health Connect.',
    confidence: 79,
    impact: 'Measured recovery and sleep for every pathway athlete, rural ones included',
    factors: [
      { label: 'Coaches set load from check-ins alone today', weight: 50 },
      { label: 'Less than one altitude camp', weight: 30 },
      { label: '58% of grassroots athletes are rural and can’t reach a lab', weight: 20 },
    ],
  },
];
