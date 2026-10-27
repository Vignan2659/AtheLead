import type { Gender, Origin } from './inclusion';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DecisionCard {
  id: string;
  priority: Priority;
  confidence: number;
  title: string;
  reason: string;
  owner: string;
}

export const DECIDE_CARDS: DecisionCard[] = [
  {
    id: 'dc-sunita',
    priority: 'HIGH',
    confidence: 92,
    title: 'Sunita Meena to the national U-20 camp',
    reason: 'Women’s 1500 m, dev index 86, up 9 this year. Ran 4:21.6 at the state meet; from Sindhari, Barmer.',
    owner: 'Lakshmi Rao',
  },
  {
    id: 'dc-throws',
    priority: 'HIGH',
    confidence: 88,
    title: 'A javelin coach for the throws group by 20.11',
    reason: 'Three throwers in the pool are past 68 m with no specialist coach; Aditya’s elbow strain is the group’s second this year.',
    owner: 'Kiran Joshi',
  },
  {
    id: 'dc-altitude',
    priority: 'MEDIUM',
    confidence: 79,
    title: 'Altitude block for eight middle-distance runners',
    reason: 'All eight are within 3% of national camp standard; a three-week altitude block is the usual next step.',
    owner: 'Lakshmi Rao',
  },
  {
    id: 'dc-trials',
    priority: 'MEDIUM',
    confidence: 74,
    title: 'Open 400 m / 800 m trials in 12 rural districts',
    reason: 'Rural share falls from 58% to 22% up the pathway; 31 juniors already hit trial standard.',
    owner: 'Ravi Menon',
  },
];

/** The MVP shows one sport: athletics. `sports` stays for older screens; `eventGroups` and `districts` lead. */
export const UNION_SUMMARY = { athletes: 1248, sports: 1, eventGroups: 7, districts: 330, states: 36, yoy: 6, coaches: 64, teams: 14, eventsAhead: 9 };

export interface TeamForm {
  id: string;
  name: string;
  sport: string;
  score: number;
}

/** Team form, analysed separately for men's and women's sides. */
/** Form by event group, analysed separately for men and women. */
export const TEAM_FORM: Record<Gender, TeamForm[]> = {
  men: [
    { id: 't-sprints-m', name: 'Sprints', sport: '100 · 200 · 400 m', score: 84 },
    { id: 't-middle-m', name: 'Middle distance', sport: '800 · 1500 m', score: 79 },
    { id: 't-throws-m', name: 'Throws', sport: 'Javelin · shot · discus', score: 77 },
    { id: 't-jumps-m', name: 'Jumps', sport: 'Long · triple · high', score: 71 },
    { id: 't-walk-m', name: 'Race walk', sport: '10 km · 20 km', score: 63 },
  ],
  women: [
    { id: 't-middle-w', name: 'Middle distance', sport: '800 · 1500 m', score: 88 },
    { id: 't-sprints-w', name: 'Sprints', sport: '100 · 200 · 400 m', score: 86 },
    { id: 't-hurdles-w', name: 'Hurdles', sport: '100 m H · 400 m H', score: 82 },
    { id: 't-throws-w', name: 'Throws', sport: 'Javelin · shot · discus', score: 80 },
    { id: 't-jumps-w', name: 'Jumps', sport: 'Long · triple · high', score: 68 },
  ],
};

export interface Riser {
  id: string;
  name: string;
  sport: string;
  potential: number;
  trend: number;
  origin: Origin;
}

export const RISING: Record<Gender, Riser[]> = {
  men: [
    { id: 'r-rohit', name: 'Rohit Yadav', sport: 'Javelin', potential: 90, trend: 9, origin: 'rural' },
    { id: 'r-ramesh', name: 'Ramesh Gond', sport: 'Steeplechase', potential: 84, trend: 7, origin: 'rural' },
    { id: 'r-lalit', name: 'Lalit Oraon', sport: '400 m', potential: 82, trend: 8, origin: 'rural' },
  ],
  women: [
    { id: 'r-ananya', name: 'Ananya Krishnan', sport: '100 m hurdles', potential: 94, trend: 5, origin: 'urban' },
    { id: 'r-meghana', name: 'Meghana Rao', sport: '800 m', potential: 92, trend: 8, origin: 'rural' },
    { id: 'r-pooja', name: 'Pooja Dahiya', sport: 'Shot put', potential: 89, trend: 6, origin: 'rural' },
  ],
};
