import type { Gender, Origin } from './inclusion';

/** Talent the SLM has ranked for Track Squad U-20, split into men's and women's pools. */
export interface Prospect {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  role: string;
  home: string;
  state: string;
  origin: Origin;
  foundVia: string;
  perf: number;
  fitness: number;
  potential: number;
  teamFit: number;
  confidence: number;
  fills: string;
  strengths: string[];
  weaknesses: string[];
  /** Headline numbers for the compare table. */
  metrics: { label: string; value: number; unit: string; higherIsBetter: boolean }[];
}

export const TEAM_GAPS: Record<Gender, string[]> = {
  men: ['400 m depth for the 4 × 400 m', 'Javelin', 'Sprint hurdles'],
  women: ['800 m', '100 m hurdles', 'High jump'],
};

export const PIPELINE_STAGES = ['Identified', 'Shortlisted', 'Trial', 'Offer', 'Board'] as const;

/** Metrics that compare fairly across events. Each prospect's event PB is in their strengths. */
const m = (speed: number, cmj: number, dev: number) => [
  { label: 'Top speed', value: speed, unit: 'km/h', higherIsBetter: true },
  { label: 'CMJ', value: cmj, unit: 'cm', higherIsBetter: true },
  { label: 'Dev index', value: dev, unit: '', higherIsBetter: true },
];

export const PROSPECTS: Prospect[] = [
  {
    id: 'pr-zaheer', name: 'Zaheer Ansari', age: 19, gender: 'men', role: '400 m', home: 'Adoni, Kurnool', state: 'Andhra Pradesh', origin: 'rural',
    foundVia: 'Kurnool district trials · Sep 2026', perf: 86, fitness: 82, potential: 92, teamFit: 94, confidence: 89, fills: '400 m depth for the 4 × 400 m',
    strengths: ['48.10 at 19, on a cinder track', 'Even 200 m splits (23.4 / 24.7)', 'Ran three rounds in two days at district finals'],
    weaknesses: ['Slow out of the blocks (reaction 0.19 s)', 'First season with a coach'],
    metrics: m(33.9, 54, 84),
  },
  {
    id: 'pr-ishaan', name: 'Ishaan Chauhan', age: 18, gender: 'men', role: 'Javelin', home: 'Kosli, Rewari', state: 'Haryana', origin: 'rural',
    foundVia: 'School league · Aug 2026', perf: 79, fitness: 84, potential: 88, teamFit: 87, confidence: 81, fills: 'Javelin',
    strengths: ['68.40 m with the 800 g javelin at 18', 'Fast run-up, strong block leg'],
    weaknesses: ['Release angle varies throw to throw', 'Elbow load needs managing'],
    metrics: m(31.2, 58, 79),
  },
  {
    id: 'pr-rahul', name: 'Rahul Bhat', age: 20, gender: 'men', role: '110 m hurdles', home: 'Bijbehara, Anantnag', state: 'Jammu & Kashmir', origin: 'rural',
    foundVia: 'Coach referral · Jul 2026', perf: 83, fitness: 78, potential: 84, teamFit: 85, confidence: 77, fills: 'Sprint hurdles',
    strengths: ['14.08 s, three-step rhythm holds to hurdle 10', 'Calm in finals'],
    weaknesses: ['Trains on grass in winter', 'Lead-leg clearance high'],
    metrics: m(34.1, 59, 80),
  },
  {
    id: 'pr-siddharth', name: 'Siddharth Nambiar', age: 20, gender: 'men', role: 'Long jump', home: 'Thrissur', state: 'Kerala', origin: 'urban',
    foundVia: 'State U-23 camp', perf: 81, fitness: 80, potential: 83, teamFit: 72, confidence: 79, fills: 'Jumps depth',
    strengths: ['7.52 m, wind legal', 'Consistent board accuracy'],
    weaknesses: ['Approach speed drops in round 4+', 'Overlaps with Kabir Shetty'],
    metrics: m(33.6, 62, 78),
  },
  {
    id: 'pr-dev', name: 'Dev Saxena', age: 20, gender: 'men', role: '200 m', home: 'Lucknow', state: 'Uttar Pradesh', origin: 'urban',
    foundVia: 'Velora sprint trials', perf: 80, fitness: 76, potential: 80, teamFit: 74, confidence: 74, fills: '4 × 100 m',
    strengths: ['21.30 s, strong bend running', 'Good relay changeovers'],
    weaknesses: ['Fitness below squad average', 'Fades after 150 m'],
    metrics: m(34.8, 55, 76),
  },
  {
    id: 'pr-akash', name: 'Akash Mohanty', age: 19, gender: 'men', role: 'Triple jump', home: 'Cuttack', state: 'Odisha', origin: 'urban',
    foundVia: 'Coach referral · Sep 2026', perf: 77, fitness: 74, potential: 85, teamFit: 70, confidence: 72, fills: 'Jumps depth',
    strengths: ['15.62 m at 19', 'Big step phase'],
    weaknesses: ['Heel bruising from the hop', 'Runway rhythm'],
    metrics: m(32.9, 60, 75),
  },
  {
    id: 'pr-lalitha', name: 'Lalitha Gowda', age: 18, gender: 'women', role: '800 m', home: 'Malavalli, Mandya', state: 'Karnataka', origin: 'rural',
    foundVia: 'Mandya district trials · Aug 2026', perf: 82, fitness: 80, potential: 91, teamFit: 93, confidence: 86, fills: '800 m',
    strengths: ['2:08.9 in her first season of structured training', 'Strong last 200 m (31.2 s)'],
    weaknesses: ['Boxed in on the bell lap', 'No spikes until this year'],
    metrics: m(28.4, 41, 82),
  },
  {
    id: 'pr-shabnam', name: 'Shabnam Ansari', age: 19, gender: 'women', role: '100 m hurdles', home: 'Kaliachak, Malda', state: 'West Bengal', origin: 'rural',
    foundVia: 'Coach referral · Jun 2026', perf: 78, fitness: 79, potential: 86, teamFit: 88, confidence: 80, fills: '100 m hurdles',
    strengths: ['14.21 s, clean hurdle technique', 'Rotates quickly between barriers'],
    weaknesses: ['Start to hurdle 1', 'Strength base'],
    metrics: m(29.6, 44, 79),
  },
  {
    id: 'pr-divya', name: 'Divya Murugesan', age: 18, gender: 'women', role: '400 m', home: 'Chinnasalem, Kallakurichi', state: 'Tamil Nadu', origin: 'rural',
    foundVia: 'Tamil Nadu pilot trials · Sep 2026', perf: 79, fitness: 81, potential: 89, teamFit: 86, confidence: 82, fills: '4 × 400 m depth',
    strengths: ['55.10 at 18, from a sports hostel', 'Strong back straight'],
    weaknesses: ['Tightens in the last 80 m', 'Race tactics in rounds'],
    metrics: m(29.2, 43, 80),
  },
  {
    id: 'pr-ritika', name: 'Ritika Chauhan', age: 20, gender: 'women', role: 'High jump', home: 'Shimla', state: 'Himachal Pradesh', origin: 'urban',
    foundVia: 'State U-23 camp', perf: 80, fitness: 77, potential: 84, teamFit: 84, confidence: 78, fills: 'High jump',
    strengths: ['1.76 m, good curve approach', 'Competes well under pressure'],
    weaknesses: ['Take-off foot plant', 'Strength in the last 3 steps'],
    metrics: m(28.1, 47, 78),
  },
];
