/** Track Squad U-20 meets and the coach's calendar. Demo today: Tue 20.10.2026.
 * In athletics a "match" is a race round; `opponent` holds the event. */

export interface Match {
  id: string;
  date: string;
  time: string;
  opponent: string;
  stage: string;
}

export interface Tournament {
  id: string;
  name: string;
  city: string;
  dates: string;
  travel?: string;
  matches: Match[];
}

export const TOURNAMENTS: Tournament[] = [
  {
    id: 'tn-nationals',
    name: 'Velora U-20 Nationals',
    city: 'Bhubaneswar',
    dates: '03.11 – 06.11',
    travel: '01.11 – 02.11 · train from Chennai, 20 h',
    matches: [
      { id: 'm-1', date: '03.11', time: '09:30', opponent: 'Men’s 400 m', stage: 'Heats' },
      { id: 'm-2', date: '04.11', time: '17:10', opponent: 'Men’s 400 m', stage: 'Semi-final' },
      { id: 'm-3', date: '05.11', time: '18:20', opponent: 'Men’s 400 m', stage: 'Final' },
      { id: 'm-4', date: '05.11', time: '17:40', opponent: 'Women’s 1500 m', stage: 'Final' },
      { id: 'm-5', date: '06.11', time: '18:45', opponent: 'Men’s 4 × 400 m', stage: 'Final' },
    ],
  },
  {
    id: 'tn-relays',
    name: 'Velora Relays',
    city: 'Chennai',
    dates: '05.12 – 06.12',
    matches: [
      { id: 'm-6', date: '05.12', time: '17:00', opponent: 'Men’s 4 × 100 m', stage: 'Final' },
      { id: 'm-7', date: '06.12', time: '18:00', opponent: 'Mixed 4 × 400 m', stage: 'Final' },
    ],
  },
];

export type DayState = 'build' | 'peak' | 'taper' | 'travel' | 'match' | 'rest' | 'key';

export interface CalDay {
  /** Day of month. */
  d: number;
  month: 10 | 11;
  state: DayState;
  note?: string;
}

/** 19.10 – 15.11: four weeks from this Monday to the day after the final. */
export const CALENDAR: CalDay[] = (() => {
  const out: CalDay[] = [];
  const special: Record<string, { state: DayState; note?: string }> = {
    '20.10': { state: 'key', note: 'Track · 3 × 300 m' },
    '23.10': { state: 'key', note: '400 m race simulation' },
    '25.10': { state: 'rest' },
    '30.10': { state: 'key', note: '300 m time trial · selection' },
    '31.10': { state: 'taper' },
    '01.11': { state: 'travel', note: 'Train to Bhubaneswar' },
    '02.11': { state: 'travel', note: 'Arrive · track walk' },
    '03.11': { state: 'match', note: '400 m heats' },
    '04.11': { state: 'match', note: '400 m semi-final' },
    '05.11': { state: 'match', note: '400 m final' },
    '06.11': { state: 'match', note: '4 × 400 m final' },
  };
  for (let i = 0; i < 28; i++) {
    const date = new Date(2026, 9, 19 + i);
    const d = date.getDate();
    const month = (date.getMonth() + 1) as 10 | 11;
    const key = `${String(d).padStart(2, '0')}.${month}`;
    const base: DayState =
      month === 10 && d <= 25 ? 'build' : month === 10 && d <= 30 ? 'peak' : month === 10 || d <= 2 ? 'taper' : 'rest';
    const s = special[key];
    out.push({ d, month, state: s?.state ?? base, note: s?.note });
  }
  return out;
})();

export const STATE_LABEL: Record<DayState, string> = {
  build: 'Build',
  peak: 'Peak',
  taper: 'Taper',
  travel: 'Travel',
  match: 'Race',
  rest: 'Rest',
  key: 'Key session',
};

export const READINESS_ALERTS = [
  { name: 'Yash Malhotra', text: 'ACWR 1.46 with hamstring tightness. Cap hurdle reps or he risks missing the heats.', tone: 'bad' as const },
  { name: 'Aditya Rao', text: 'Elbow strain, back 08.11 at the earliest. Withdraw him from the javelin entry.', tone: 'bad' as const },
  { name: 'Nikhil Varma', text: 'Completion 61%. Needs two full sessions before the 30.10 time trial.', tone: 'warn' as const },
];

/** "Generate 14-day plan" output for the U-20 Nationals. */
export const FOURTEEN_DAY_PLAN = {
  phases: [
    { name: 'Build', dates: '20.10 – 25.10', focus: 'Speed endurance and strength. ACWR 1.0–1.25.' },
    { name: 'Peak', dates: '26.10 – 30.10', focus: 'Race pace, lower volume. 300 m time trial 30.10 picks the 4 × 400 m.' },
    { name: 'Taper', dates: '31.10 – 02.11', focus: 'Volume −40%, keep speed. Train to Bhubaneswar 01.11.' },
  ],
  blocks: [
    { heading: 'Workload caps', items: ['400 m group: max 3 × 300 m in Build, 2 × 200 m in Taper', 'Yash: no hurdle reps until ACWR < 1.3'] },
    { heading: 'Recovery', items: ['Ice bath after every speed-endurance session', 'Sleep target 8 h; band data checked every morning'] },
    { heading: 'Nutrition', items: ['Carbs up 31.10 – 02.11 (rice, idli, rotis)', 'Electrolytes on the train; Bhubaneswar forecast 30 °C, humid'] },
    { heading: 'Race prep', items: ['Heats at 09:30: practise morning races twice this week', 'Arjun runs lane 3–6 in seeding; rehearse the first 200 m at 22.6 s'] },
    { heading: 'Travel', items: ['Depart Chennai 01.11 06:10 by train', 'Track walk and light strides on 02.11'] },
  ],
  confidence: 84,
};
