/**
 * Arjun's training week and the coach's routine library. The demo "today" is
 * Tue 20.10.2026; the week runs Mon 19.10 – Sun 25.10.
 */

export type SessionKind = 'track' | 'gym' | 'run' | 'recovery' | 'race-sim' | 'rest';

export interface Session {
  id: string;
  title: string;
  meta: string;
  minutes: number;
  /** Session load in arbitrary units (sRPE × minutes). */
  loadAu: number;
  kind: SessionKind;
  source: 'coach' | 'slm';
}

export interface DayPlan {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  date: string;
  status: 'done' | 'today' | 'planned';
  sessions: Session[];
}

export const TODAY_INDEX = 1;

export const WEEK: DayPlan[] = [
  {
    day: 'Mon',
    date: '19.10',
    status: 'done',
    sessions: [
      { id: 's-mon-gym', title: 'Lower-body strength', meta: 'Trap bar · split squats · Nordics', minutes: 60, loadAu: 420, kind: 'gym', source: 'coach' },
      { id: 's-mon-run', title: 'Easy aerobic run', meta: '5 km · zone 2', minutes: 30, loadAu: 150, kind: 'run', source: 'coach' },
    ],
  },
  {
    day: 'Tue',
    date: '20.10',
    status: 'today',
    sessions: [
      { id: 's-tue-track', title: 'Track day', meta: '6 exercises · 3 × 300 m at 92%', minutes: 90, loadAu: 540, kind: 'track', source: 'coach' },
    ],
  },
  {
    day: 'Wed',
    date: '21.10',
    status: 'planned',
    sessions: [
      { id: 's-wed-rec', title: 'Recovery + mobility', meta: 'Pool walk · hip flow · ice bath', minutes: 40, loadAu: 120, kind: 'recovery', source: 'coach' },
    ],
  },
  {
    day: 'Thu',
    date: '22.10',
    status: 'planned',
    sessions: [
      { id: 's-thu-gym', title: 'Power + core', meta: 'Hang clean · box jumps · Pallof press', minutes: 55, loadAu: 360, kind: 'gym', source: 'coach' },
      { id: 's-thu-run', title: 'Acceleration', meta: '8 × 30 m from blocks · full recovery', minutes: 25, loadAu: 200, kind: 'run', source: 'coach' },
    ],
  },
  {
    day: 'Fri',
    date: '23.10',
    status: 'planned',
    sessions: [
      { id: 's-fri-sim', title: '400 m race simulation', meta: '2 × 400 m at race pace · 20 min rest', minutes: 75, loadAu: 640, kind: 'race-sim', source: 'coach' },
    ],
  },
  {
    day: 'Sat',
    date: '24.10',
    status: 'planned',
    sessions: [
      { id: 's-sat-mob', title: 'Mobility + yoga', meta: 'Hips, hamstrings, thoracic', minutes: 30, loadAu: 90, kind: 'recovery', source: 'slm' },
    ],
  },
  { day: 'Sun', date: '25.10', status: 'planned', sessions: [] },
];

/** Added to Saturday when Coach Ravi approves the endurance plan change. */
export const TEMPO_RUN: Session = {
  id: 's-sat-tempo',
  title: 'Tempo 6 × 200 m',
  meta: '06:30 · 75% pace, 90 s jog · new',
  minutes: 35,
  loadAu: 280,
  kind: 'run',
  source: 'coach',
};
export const TEMPO_DAY = 5;

export const WEEK_SUMMARY = { acwr: 1.18, chronicAu: 2390 };

export interface ExerciseDetail {
  targets: string[];
  relevance: string;
  sets: number;
  reps: string;
  rest: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  safety: string;
  source: 'coach' | 'slm';
  why: { label: string; weight: number }[];
}

/** Detail for each of today's exercises (keys match TODAY_EXERCISES ids). */
export const EXERCISE_DETAIL: Record<string, ExerciseDetail> = {
  'ex-drills': {
    targets: ['Hip flexors', 'Calves', 'Ankles'],
    relevance: 'Primes front-side mechanics so the first 100 m of the 400 m is fast and relaxed.',
    sets: 1,
    reps: '15 min',
    rest: '—',
    difficulty: 'Easy',
    safety: 'Build intensity gradually; no maximal efforts in the warm-up.',
    source: 'coach',
    why: [
      { label: 'Ground contact 0.11 s → target 0.10 s', weight: 60 },
      { label: 'Morning heats at Nationals: rehearse the routine', weight: 40 },
    ],
  },
  'ex-blocks': {
    targets: ['Glutes', 'Quads', 'Calves'],
    relevance: 'A sharper start saves tenths in the first 30 m and sets the 200 m split.',
    sets: 6,
    reps: '30 m',
    rest: '3 min',
    difficulty: 'Moderate',
    safety: 'Full recovery between reps. Stop if the hamstring tightens.',
    source: 'coach',
    why: [
      { label: 'Reaction 0.17 s, squad best 0.14 s', weight: 55 },
      { label: '30 m split 4.12 s, target 4.05 s', weight: 45 },
    ],
  },
  'ex-300s': {
    targets: ['Whole body', 'Lactate tolerance'],
    relevance: 'The heart of 400 m training: holding speed when the body wants to slow in the last 100 m.',
    sets: 3,
    reps: '300 m at 92%',
    rest: '8 min',
    difficulty: 'Hard',
    safety: 'Walk the recovery. Stop the set if your form breaks down or you feel sick.',
    source: 'coach',
    why: [
      { label: 'U-20 Nationals start 03.11', weight: 50 },
      { label: 'Last-100 m drop-off 1.6 s, target 1.2 s', weight: 30 },
      { label: 'ACWR 1.18 leaves room for load', weight: 20 },
    ],
  },
  'ex-hurdlemob': {
    targets: ['Hip flexors', 'Adductors', 'Glutes'],
    relevance: 'Hip mobility for a longer, freer stride at speed.',
    sets: 1,
    reps: '10 min',
    rest: '—',
    difficulty: 'Easy',
    safety: 'Move within a pain-free range.',
    source: 'slm',
    why: [
      { label: 'Sore check-ins twice this fortnight', weight: 50 },
      { label: 'Hip extension 12°, target 18°', weight: 50 },
    ],
  },
  'ex-trapbar': {
    targets: ['Glutes', 'Hamstrings', 'Quads', 'Spinal erectors'],
    relevance: 'Force into the track: stronger hips mean a more powerful drive phase.',
    sets: 4,
    reps: '4 reps',
    rest: '2 min',
    difficulty: 'Hard',
    safety: 'Neutral spine, bar close. Stop the set if your lower back rounds.',
    source: 'coach',
    why: [
      { label: 'Strength block week 3 of 4', weight: 45 },
      { label: 'Countermovement jump 57 cm, target 60 cm', weight: 35 },
      { label: 'Taper starts 31.10: last heavy session', weight: 20 },
    ],
  },
  'ex-cooldown': {
    targets: ['Hamstrings', 'Calves', 'Hip flexors'],
    relevance: 'Brings heart rate down and starts recovery for tomorrow.',
    sets: 1,
    reps: '12 min',
    rest: '—',
    difficulty: 'Easy',
    safety: 'Easy jog then static stretches; nothing bouncy.',
    source: 'slm',
    why: [
      { label: 'Band HRV below baseline this morning', weight: 60 },
      { label: 'Recovery session tomorrow', weight: 40 },
    ],
  },
};

/* ---------- Coach routine library ---------- */

export interface Routine {
  id: string;
  name: string;
  focus: string;
  dose: string;
  minutes: number;
  noEquipment?: boolean;
}

export const ROUTINES: Routine[] = [
  { id: 'rt-prehab', name: 'Sprinter hamstring prehab', focus: 'Nordics · bridges · isometrics', dose: '3 × 6 · 4 drills', minutes: 20 },
  { id: 'rt-tempo', name: 'Tempo 6 × 200 m', focus: 'Aerobic power', dose: '75% pace, 90 s jog', minutes: 35 },
  { id: 'rt-home', name: 'Village home routine', focus: 'Strength · no equipment', dose: '5 rounds · 6 moves', minutes: 25, noEquipment: true },
  { id: 'rt-accel', name: 'Acceleration block', focus: 'First 30 m', dose: '8 × 30 m', minutes: 25 },
  { id: 'rt-recovery', name: 'Recovery day', focus: 'Pool + mobility', dose: '40 min easy', minutes: 40 },
];
