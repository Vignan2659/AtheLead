import type { Gender, Origin } from './inclusion';

export type PlayerStatus = 'ok' | 'watch' | 'injured';

export interface SquadPlayer {
  id: string;
  name: string;
  position: string;
  note: string;
  acwr: number;
  status: PlayerStatus;
  origin: Origin;
  /** Home village or town, district. */
  home: string;
  /** Linked athlete account, when the player uses AtheLead. */
  userId?: string;
}

export interface CoachRec {
  id: string;
  playerId: string;
  confidence: number;
  title: string;
  reason: string;
  approvedNote: string;
  acwrAfter: number;
  readinessAfter: number;
}

/** A plan change the coach can apply after reading an athlete's progress. */
export interface PlanChange {
  id: string;
  playerId: string;
  name: string;
  progress: string;
  trend: 'up' | 'down';
  change: string;
  notify: string;
}

export interface Squad {
  gender: Gender;
  name: string;
  summary: { size: number; injured: number; watch: number };
  readiness: { base: number; target: number };
  players: SquadPlayer[];
  rec: CoachRec;
  plans: PlanChange[];
  pathway: { counts: number[]; closest: { name: string; devIndex: number; gate: number } };
}

export const SQUADS: Record<Gender, Squad> = {
  men: {
    gender: 'men',
    name: 'Track Squad U-20 · Men',
    summary: { size: 12, injured: 1, watch: 3 },
    readiness: { base: 62, target: 85 },
    players: [
      { id: 'p-yash', name: 'Yash Malhotra', position: '400 m hurdles · PB 52.10', note: 'hamstring tightness', acwr: 1.46, status: 'watch', origin: 'urban', home: 'New Delhi' },
      { id: 'p-arjun', name: 'Arjun Reddy', position: '400 m · PB 47.62', note: '', acwr: 1.18, status: 'ok', origin: 'rural', home: 'Nandigama, NTR', userId: 'ath-arjun' },
      { id: 'p-harsh', name: 'Harsh Patel', position: '200 m · PB 21.48', note: '', acwr: 1.12, status: 'ok', origin: 'urban', home: 'Surat, Gujarat' },
      { id: 'p-kabir', name: 'Kabir Shetty', position: 'Long jump · PB 7.41 m', note: '', acwr: 0.98, status: 'ok', origin: 'urban', home: 'Mangaluru' },
      { id: 'p-nikhil', name: 'Nikhil Varma', position: '1500 m · PB 3:51.3', note: 'low consistency', acwr: 0.79, status: 'watch', origin: 'rural', home: 'Bhawanipatna, Kalahandi' },
      { id: 'p-aditya', name: 'Aditya Rao', position: 'Javelin · PB 71.80 m', note: 'elbow strain, back 08.11', acwr: 0.42, status: 'injured', origin: 'rural', home: 'Sangli, Maharashtra' },
    ],
    rec: {
      id: 'rec-yash',
      playerId: 'p-yash',
      confidence: 87,
      title: "Cut Yash's hurdle volume 30% this week.",
      reason: 'ACWR 1.46 is past the 1.3 risk line, with two hamstring-tightness reports in 10 days. Swap Thursday’s hurdle reps for flat 150 m runs.',
      approvedNote: 'Approved. Yash’s hurdle reps are capped this week.',
      acwrAfter: 1.12,
      readinessAfter: 66,
    },
    plans: [
      {
        id: 'pc-arjun-endurance',
        playerId: 'p-arjun',
        name: 'Arjun Reddy',
        progress: 'Completion 92% · 300 m trial ▲1.2 s in 8 wks',
        trend: 'up',
        change: 'Endurance sessions 2 → 3. Tempo 6 × 200 m, Sat 06:30.',
        notify: 'Arjun',
      },
      {
        id: 'pc-kabir-plyo',
        playerId: 'p-kabir',
        name: 'Kabir Shetty',
        progress: 'Approach speed ▲4% · completion 88%',
        trend: 'up',
        change: 'Move up to the advanced plyometric block.',
        notify: 'Kabir',
      },
      {
        id: 'pc-nikhil-short',
        playerId: 'p-nikhil',
        name: 'Nikhil Varma',
        progress: 'Completion 61% · 3 sessions missed',
        trend: 'down',
        change: 'Shorter 40-min sessions, two check-ins a week.',
        notify: 'Nikhil',
      },
    ],
    pathway: { counts: [0, 3, 7, 2, 0], closest: { name: 'Arjun Reddy', devIndex: 71, gate: 75 } },
  },
  women: {
    gender: 'women',
    name: 'Track Squad U-20 · Women',
    summary: { size: 12, injured: 1, watch: 2 },
    readiness: { base: 71, target: 85 },
    players: [
      { id: 'p-riya', name: 'Riya Thakur', position: '400 m · PB 54.90', note: 'two heavy weeks', acwr: 1.38, status: 'watch', origin: 'urban', home: 'Pune' },
      { id: 'p-anjali', name: 'Anjali Munda', position: '800 m · PB 2:07.8', note: 'found at district trials', acwr: 1.05, status: 'ok', origin: 'rural', home: 'Gumla, Jharkhand' },
      { id: 'p-sneha', name: 'Sneha Kulkarni', position: '100 m hurdles · PB 13.92', note: '', acwr: 1.21, status: 'ok', origin: 'urban', home: 'Kolhapur' },
      { id: 'p-deepti', name: 'Deepti Yadav', position: 'Javelin · PB 51.40 m', note: '', acwr: 0.92, status: 'ok', origin: 'rural', home: 'Etawah, UP' },
      { id: 'p-fatima', name: 'Fatima Shaikh', position: 'Long jump · PB 6.02 m', note: 'board exams', acwr: 0.74, status: 'watch', origin: 'rural', home: 'Malegaon, Nashik' },
      { id: 'p-harpreet', name: 'Harpreet Sandhu', position: '200 m · PB 24.31', note: 'ankle sprain, back 02.11', acwr: 0.55, status: 'injured', origin: 'rural', home: 'Moga, Punjab' },
    ],
    rec: {
      id: 'rec-riya',
      playerId: 'p-riya',
      confidence: 82,
      title: "Swap one of Riya's speed sessions for recovery.",
      reason: 'ACWR 1.38 after two heavy weeks. Keep her race-pace 300s, drop Wednesday’s 150s until Thursday.',
      approvedNote: 'Approved. Riya has a recovery day Wednesday.',
      acwrAfter: 1.16,
      readinessAfter: 74,
    },
    plans: [
      {
        id: 'pc-anjali-strength',
        playerId: 'p-anjali',
        name: 'Anjali Munda',
        progress: 'Last-200 m split 31.9 → 30.8 s in 6 wks',
        trend: 'up',
        change: 'Add a strength block, twice a week.',
        notify: 'Anjali',
      },
      {
        id: 'pc-deepti-throws',
        playerId: 'p-deepti',
        name: 'Deepti Yadav',
        progress: 'Completion 95% · best throw ▲2.1 m',
        trend: 'up',
        change: 'Raise full run-up throws to 18 a session.',
        notify: 'Deepti',
      },
      {
        id: 'pc-fatima-home',
        playerId: 'p-fatima',
        name: 'Fatima Shaikh',
        progress: 'Completion 58% · exams this month',
        trend: 'down',
        change: '25-min home routine, no equipment, until 20.11.',
        notify: 'Fatima',
      },
    ],
    pathway: { counts: [0, 2, 7, 3, 0], closest: { name: 'Anjali Munda', devIndex: 74, gate: 75 } },
  },
};

/** Arjun's endurance change — when applied, it shows on his Today screen. */
export const ARJUN_PLAN_ID = 'pc-arjun-endurance';
