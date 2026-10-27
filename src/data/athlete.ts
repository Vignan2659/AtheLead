export interface Exercise {
  id: string;
  name: string;
  meta: string;
  dose: string;
}

/** Arjun's track session: men's 400 m, speed-endurance day. */
export const TODAY_EXERCISES: Exercise[] = [
  { id: 'ex-drills', name: 'Warm-up + A/B skips', meta: 'Drills · 800 m jog', dose: "15'" },
  { id: 'ex-blocks', name: 'Block starts', meta: 'Reaction · 30 m', dose: '6×' },
  { id: 'ex-300s', name: 'Speed endurance 300 m', meta: '92% · 8 min rest', dose: '3×' },
  { id: 'ex-hurdlemob', name: 'Hurdle mobility', meta: 'Hips · 8 hurdles', dose: "10'" },
  { id: 'ex-trapbar', name: 'Trap-bar deadlift', meta: 'Drive-phase power', dose: '4×4' },
  { id: 'ex-cooldown', name: 'Cool-down + stretch', meta: 'Recovery', dose: "12'" },
];

export const INITIAL_COMPLETED = ['ex-drills', 'ex-blocks', 'ex-300s'];

export const FEEL_OPTIONS = ['Wrecked', 'Sore', 'Okay', 'Good', 'Fresh'] as const;
export const FEEL_READINESS = [48, 61, 72, 84, 93];
export const FEEL_NOTES = [
  'Logged. Coach Ravi will cut the 300s to two.',
  'Logged. Extra mobility added before the 300s.',
  'Logged. Session stays as planned.',
  'Logged. Full intensity today.',
  "Logged. You're primed. Hold 36.5 s on every 300.",
];

export const SESSION_STATS = { loadAu: 540, acwr: 1.18, topKmh: 34.6 };

export const COACH_NOTE = {
  coach: 'Ravi',
  text: 'Third endurance session added. Tempo 6 × 200 m, Saturday 06:30.',
  factors: [
    { label: '300 m time trial 1.2 s faster in 8 weeks', weight: 40 },
    { label: 'U-20 Nationals in 14 days', weight: 35 },
    { label: 'Room in your workload', weight: 25 },
  ],
};

export const FUEL_TODAY = { kcal: 1690, target: 3050 };
export const NEXT_MATCH = { daysTo: 14, date: '03.11', opponent: 'U-20 Nationals · Bhubaneswar' };

/** Arjun's background — a rural athlete found at district trials. */
export const ATHLETE_PROFILE = {
  gender: 'men' as const,
  village: 'Nandigama',
  district: 'NTR district',
  state: 'Andhra Pradesh',
  origin: 'rural' as const,
  discovered: 'District trials · 2024',
  event: '400 m',
  pb: '47.62',
  benchmark: "Men's U-20 national camp · 400 m",
};
