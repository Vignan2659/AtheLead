/**
 * Association-wide data the board sees: coaches, teams, events, programmes.
 * Only approved, non-medical fields live here: the board sees fitness status, never diagnoses.
 */
import type { Gender } from './inclusion';

export interface CoachProfile {
  id: string;
  name: string;
  sport: string;
  team: string;
  gender: Gender;
  /** Average dev-index gain per athlete over 6 months. */
  devGain: number;
  retention: number;
  rating: number;
  athletes: number;
  ruralShare: number;
  experienceYrs: number;
  specialisation: string;
  available: string;
  userId?: string;
}

export const COACHES: CoachProfile[] = [
  { id: 'c-ravi', name: 'Ravi Menon', sport: 'Sprints & hurdles', team: 'Track Squad U-20', gender: 'men', devGain: 6.1, retention: 94, rating: 4.7, athletes: 24, ruralShare: 50, experienceYrs: 14, specialisation: '400 m · speed endurance', available: 'Mon–Sat · 06:00–11:00', userId: 'coach-ravi' },
  { id: 'c-lakshmi', name: 'Lakshmi Rao', sport: 'Middle distance', team: 'Track Squad U-20', gender: 'women', devGain: 7.4, retention: 96, rating: 4.8, athletes: 31, ruralShare: 68, experienceYrs: 16, specialisation: '800 · 1500 m', available: 'Mon–Sat' },
  { id: 'c-harjit', name: 'Harjit Singh', sport: 'Long distance', team: 'Distance Group', gender: 'men', devGain: 6.5, retention: 93, rating: 4.6, athletes: 22, ruralShare: 74, experienceYrs: 19, specialisation: '5000 · 10,000 m · steeple', available: 'Mon–Sat' },
  { id: 'c-priya', name: 'Priya Nair', sport: 'Jumps', team: 'Jumps Group', gender: 'women', devGain: 6.8, retention: 91, rating: 4.6, athletes: 18, ruralShare: 39, experienceYrs: 11, specialisation: 'Long · triple jump', available: 'Mon–Fri' },
  { id: 'c-kiran', name: 'Kiran Joshi', sport: 'Throws', team: 'Throws Group', gender: 'men', devGain: 5.9, retention: 88, rating: 4.5, athletes: 26, ruralShare: 81, experienceYrs: 12, specialisation: 'Shot · discus', available: 'Daily' },
  { id: 'c-imran', name: 'Imran Sheikh', sport: 'Race walk', team: 'Walk Group', gender: 'men', devGain: 5.4, retention: 92, rating: 4.4, athletes: 14, ruralShare: 64, experienceYrs: 8, specialisation: '10 · 20 km walk', available: 'Tue–Sun' },
  { id: 'c-daniel', name: 'Daniel Fernandes', sport: 'Strength & conditioning', team: 'All groups', gender: 'men', devGain: 3.2, retention: 84, rating: 4.1, athletes: 28, ruralShare: 36, experienceYrs: 9, specialisation: 'Power · injury prevention', available: 'Mon–Fri' },
  { id: 'c-arun', name: 'Arun Kumar', sport: 'Sprints', team: 'Guwahati centre', gender: 'men', devGain: 2.4, retention: 79, rating: 3.9, athletes: 16, ruralShare: 19, experienceYrs: 6, specialisation: '100 · 200 m', available: 'Evenings' },
];

/** Athletics coaches an athlete can request (Coach tab directory). */
export const COACH_DIRECTORY = [
  { id: 'cd-ravi', name: 'Ravi Menon', focus: 'Sprints · 400 m', city: 'Chennai', rating: 4.7, assigned: true },
  { id: 'cd-sameer', name: 'Sameer Khan', focus: 'Hurdles · technique', city: 'Bengaluru', rating: 4.5 },
  { id: 'cd-anita', name: 'Anita Pillai', focus: 'Strength & conditioning', city: 'Patiala', rating: 4.6 },
  { id: 'cd-vikram', name: 'Vikram Desai', focus: 'Relays · baton work', city: 'Kolkata', rating: 4.3 },
];

export interface TeamRow {
  id: string;
  name: string;
  sport: string;
  coach: string;
  gender: Gender;
  athletes: number;
  form: number;
  readiness: number;
  injured: number;
  ruralShare: number;
  record: { w: number; d: number; l: number };
  support?: string;
}

/** Event-group squads. Athletics has no W-D-L, so records stay zero and the UI hides them. */
export const TEAMS: TeamRow[] = [
  { id: 'tm-sprints-m', name: 'Sprints', sport: '100 · 200 · 400 m', coach: 'Ravi Menon', gender: 'men', athletes: 12, form: 84, readiness: 62, injured: 1, ruralShare: 50, record: { w: 0, d: 0, l: 0 } },
  { id: 'tm-middle-m', name: 'Middle distance', sport: '800 · 1500 m', coach: 'Lakshmi Rao', gender: 'men', athletes: 16, form: 79, readiness: 77, injured: 0, ruralShare: 69, record: { w: 0, d: 0, l: 0 } },
  { id: 'tm-throws-m', name: 'Throws', sport: 'Javelin · shot · discus', coach: 'Kiran Joshi', gender: 'men', athletes: 14, form: 77, readiness: 74, injured: 2, ruralShare: 78, record: { w: 0, d: 0, l: 0 }, support: 'No javelin specialist; second elbow strain this year' },
  { id: 'tm-jumps-m', name: 'Jumps', sport: 'Long · triple · high', coach: 'Priya Nair', gender: 'men', athletes: 10, form: 71, readiness: 68, injured: 1, ruralShare: 36, record: { w: 0, d: 0, l: 0 } },
  { id: 'tm-walk-m', name: 'Race walk', sport: '10 km · 20 km', coach: 'Imran Sheikh', gender: 'men', athletes: 8, form: 63, readiness: 58, injured: 2, ruralShare: 62, record: { w: 0, d: 0, l: 0 }, support: 'Form 63, lowest group; technique review asked' },
  { id: 'tm-sprints-w', name: 'Sprints', sport: '100 · 200 · 400 m', coach: 'Ravi Menon', gender: 'women', athletes: 12, form: 86, readiness: 71, injured: 1, ruralShare: 58, record: { w: 0, d: 0, l: 0 } },
  { id: 'tm-middle-w', name: 'Middle distance', sport: '800 · 1500 m', coach: 'Lakshmi Rao', gender: 'women', athletes: 15, form: 88, readiness: 83, injured: 0, ruralShare: 73, record: { w: 0, d: 0, l: 0 } },
  { id: 'tm-hurdles-w', name: 'Hurdles', sport: '100 m H · 400 m H', coach: 'Ravi Menon', gender: 'women', athletes: 9, form: 82, readiness: 79, injured: 1, ruralShare: 44, record: { w: 0, d: 0, l: 0 } },
  { id: 'tm-throws-w', name: 'Throws', sport: 'Javelin · shot · discus', coach: 'Kiran Joshi', gender: 'women', athletes: 11, form: 80, readiness: 66, injured: 1, ruralShare: 81, record: { w: 0, d: 0, l: 0 } },
  { id: 'tm-jumps-w', name: 'Jumps', sport: 'Long · triple · high', coach: 'Priya Nair', gender: 'women', athletes: 9, form: 68, readiness: 64, injured: 2, ruralShare: 41, record: { w: 0, d: 0, l: 0 }, support: 'Two take-off injuries; needs a spring-floor runway' },
];

/** Athletes by event group, summing to the programme's 1,248. */
export const SPORT_PARTICIPATION = [
  { sport: 'Sprints', n: 268 },
  { sport: 'Middle distance', n: 236 },
  { sport: 'Long distance & steeple', n: 182 },
  { sport: 'Jumps', n: 170 },
  { sport: 'Throws', n: 164 },
  { sport: 'Hurdles', n: 132 },
  { sport: 'Race walk', n: 96 },
];

export const TALENT_FUNNEL = [
  { stage: 'Scouted', n: 412 },
  { stage: 'Assessed', n: 186 },
  { stage: 'Trials', n: 74 },
  { stage: 'Offered', n: 28 },
  { stage: 'Signed', n: 19 },
];

/** Union development index, last 12 months. */
export const DEV_TREND = {
  labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  values: [58, 58.6, 59.4, 60.1, 60.5, 61.8, 62.6, 63.1, 64.4, 65.2, 66.0, 67.3],
};

export const RETENTION = { rate: 89, rural: 84, urban: 93 };

export interface UnionEvent {
  id: string;
  name: string;
  sport: string;
  city: string;
  dates: string;
  gender: Gender | 'mixed';
  level: 'Zonal' | 'National' | 'Invitational' | 'Trials';
  /** SLM priority score 0–100. */
  priority: number;
  reason: string;
}

export const EVENTS: UnionEvent[] = [
  { id: 'ev-nat', name: 'Velora U-20 Nationals', sport: 'Athletics', city: 'Bhubaneswar', dates: '03.11 – 06.11', gender: 'mixed', level: 'National', priority: 93, reason: 'National camp selectors attend; Arjun and Sunita are one gate away.' },
  { id: 'ev-xc', name: 'District cross-country trials', sport: 'Athletics', city: 'Barmer', dates: '18.11', gender: 'mixed', level: 'Trials', priority: 88, reason: 'Desert districts produce our best middle-distance runners; 62% of last year’s finds were rural.' },
  { id: 'ev-trials', name: '400 m / 800 m open trials', sport: 'Athletics', city: 'Coimbatore', dates: '29.11', gender: 'mixed', level: 'Trials', priority: 84, reason: '31 juniors at trial standard, 19 of them rural.' },
  { id: 'ev-throws', name: 'Throws invitational', sport: 'Athletics', city: 'Sonipat', dates: '24.11 – 25.11', gender: 'mixed', level: 'Invitational', priority: 80, reason: 'Pooja Dahiya (shot put, 89) can hit national camp standard here.' },
  { id: 'ev-ne', name: 'North-East open trials', sport: 'Athletics', city: 'Imphal', dates: '01.12', gender: 'mixed', level: 'Trials', priority: 79, reason: 'Manipur, Assam and Mizoram juniors rarely reach national trials; travel support covers 40 athletes.' },
  { id: 'ev-relays', name: 'Velora Relays', sport: 'Athletics', city: 'Chennai', dates: '05.12 – 06.12', gender: 'mixed', level: 'Invitational', priority: 61, reason: 'Home meet, low selection value. Rest the Nationals 400 m squad.' },
  { id: 'ev-walk', name: 'State race walk', sport: 'Athletics', city: 'Ranchi', dates: '10.12', gender: 'men', level: 'Zonal', priority: 44, reason: 'Form 63. Fix technique first; enter only the U-18s.' },
];

export interface Programme {
  id: string;
  name: string;
  cost: string;
  reach: string;
  priority: number;
  why: string;
}

export const PROGRAMMES: Programme[] = [
  { id: 'pg-trials', name: 'District trials in 40 more districts', cost: '₹1.8 cr', reach: '≈ 6,000 athletes screened', priority: 92, why: 'Rural share is 58% at grassroots but only 22% in the Olympic core. Most rural talent is never timed.' },
  { id: 'pg-travel', name: 'Travel support for rural athletes', cost: '₹45 lakh', reach: '214 State-stage athletes', priority: 88, why: 'Travel cost is the top reason rural athletes miss national camp trials.' },
  { id: 'pg-bands', name: 'Fitness bands for 500 pathway athletes', cost: '₹15 lakh', reach: '500 athletes, all districts', priority: 81, why: 'Budget bands give coaches real recovery and sleep data for every athlete, for less than one altitude camp.' },
  { id: 'pg-kit', name: 'Spikes and starting blocks for 60 rural clubs', cost: '₹28 lakh', reach: '60 clubs · ≈ 1,100 athletes', priority: 78, why: 'Most village clubs train barefoot on mud; spikes and blocks are the cheapest speed gain.' },
  { id: 'pg-women', name: 'Women’s middle-distance hostels', cost: '₹60 lakh', reach: '3 districts: Barmer, Gumla, Kalahandi', priority: 76, why: 'Women’s middle distance has the best form in the programme (88) and the highest rural share.' },
];
