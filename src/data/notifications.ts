export type NoticeKind =
  // Athlete
  | 'workout'
  | 'diet'
  | 'tournament'
  | 'coach-message'
  | 'milestone'
  // Coach
  | 'readiness'
  | 'performance'
  | 'injury'
  | 'inconsistency'
  | 'candidate'
  | 'reminder'
  | 'decision'
  // Board
  | 'team'
  | 'high-potential'
  | 'recruitment'
  | 'insight'
  // Pilot: guardian and district officer
  | 'flag'
  | 'trial'
  | 'consent'
  | 'wellness'
  // Any role
  | 'slm';

export const KIND_LABEL: Record<NoticeKind, string> = {
  workout: 'New workout',
  diet: 'Diet updated',
  tournament: 'Tournament',
  'coach-message': 'Coach message',
  milestone: 'Milestone',
  readiness: 'Check-in',
  performance: 'Performance alert',
  injury: 'Injury alert',
  inconsistency: 'Training inconsistency',
  candidate: 'New candidate',
  reminder: 'Reminder',
  decision: 'Board decision',
  team: 'Team alert',
  'high-potential': 'High potential',
  recruitment: 'Recruitment',
  insight: 'Association insight',
  flag: 'Talent flag',
  trial: 'Trial invitation',
  consent: 'Consent',
  wellness: 'Wellbeing',
  slm: 'SLM recommendation',
};

export interface Notice {
  id: string;
  /** Recipient user id. Notices are only ever shown to this user. */
  to: string;
  kind: NoticeKind;
  title: string;
  body: string;
  at: number;
  read: boolean;
  /** Where tapping the notice takes the recipient. */
  href?: string;
  /** Flow key: a newer notice with the same ref replaces the older one. */
  ref?: string;
}

type Seed = Omit<Notice, 'id' | 'at' | 'read'> & { minutesAgo: number; read?: boolean };

const SEEDS: Seed[] = [
  // Arjun Reddy — athlete
  { to: 'ath-arjun', kind: 'coach-message', title: 'Ravi: strong 300s yesterday', body: 'Relax the shoulders in the last 100 m. Three 300s at 92% today.', href: '/athlete/today', minutesAgo: 95 },
  { to: 'ath-arjun', kind: 'tournament', title: 'U-20 Nationals in 14 days', body: 'Bhubaneswar, 03–06.11. Build phase until 25.10, then peak week.', href: '/athlete/today', minutesAgo: 240 },
  { to: 'ath-arjun', kind: 'milestone', title: '300 m time trial personal best · 36.7 s', body: '1.2 s faster in 8 weeks. Your dev index moved 67 → 71.', href: '/athlete/today', minutesAgo: 60 * 26, read: true },
  { to: 'ath-arjun', kind: 'diet', title: 'Race-week fuel targets set', body: '3,050 kcal and 165 g protein a day until 03.11.', href: '/athlete/fuel', minutesAgo: 60 * 50, read: true },

  // Ravi Menon — coach
  { to: 'coach-ravi', kind: 'performance', title: 'Yash Malhotra · ACWR 1.46', body: 'Past the 1.3 risk line with two hamstring-tightness reports in 10 days. SLM suggests capping hurdle reps.', href: '/coach/squad', minutesAgo: 50 },
  { to: 'coach-ravi', kind: 'reminder', title: 'Nationals entries due 27.10', body: 'Confirm individual events and the 4 × 400 m pool for Bhubaneswar.', href: '/coach/squad', minutesAgo: 180 },
  { to: 'coach-ravi', kind: 'injury', title: 'Aditya Rao · elbow strain', body: 'Physio expects him back 08.11. No throwing until then.', href: '/coach/squad', minutesAgo: 60 * 7 },
  { to: 'coach-ravi', kind: 'inconsistency', title: 'Nikhil Varma missed 3 sessions', body: 'Completion 61% this fortnight. A shorter plan is ready to apply.', href: '/coach/squad', minutesAgo: 60 * 28, read: true },
  { to: 'coach-ravi', kind: 'candidate', title: 'Zaheer Ansari · 400 m, 19', body: '48.10 on a cinder track. Team fit 94, SLM confidence 89%. Found at Kurnool district trials.', href: '/coach/scout', minutesAgo: 60 * 52, read: true },

  { to: 'coach-ravi', kind: 'wellness', title: 'Priya Selvam · weight down 2.1 kg in 10 days', body: 'Two skipped meals logged. Talk with her and the nutritionist in person, away from the group. No weigh-in talk.', href: '/coach/tests', minutesAgo: 60 * 3 },

  // Meera Iyer — board
  { to: 'board-meera', kind: 'high-potential', title: 'Sunita Meena ▲9 · women’s 1500 m', body: 'From Sindhari, Barmer. Dev index 86, one gate from national camp.', href: '/board/home', minutesAgo: 70 },
  { to: 'board-meera', kind: 'insight', title: 'Rural share falls 58% → 22% up the pathway', body: 'Village athletes drop out between State and National camp. Travel support is the top cited reason.', href: '/board/home', minutesAgo: 200 },
  { to: 'board-meera', kind: 'team', title: 'Race walk form down to 63', body: 'Lowest event group this month. The coach has asked for a technique review.', href: '/board/home', minutesAgo: 60 * 5 },
  { to: 'board-meera', kind: 'recruitment', title: 'Throws group needs a javelin coach', body: 'Three throwers past 68 m and no specialist. Card waiting in Decide.', href: '/board/home', minutesAgo: 60 * 26, read: true },
  { to: 'board-meera', kind: 'tournament', title: 'U-20 Nationals timetable confirmed', body: 'Bhubaneswar, 03–06.11. Men’s 400 m heats open the meet.', href: '/board/home', minutesAgo: 60 * 49, read: true },

  // Lakshmi Murugan — guardian of Kavin and Nila
  { to: 'grd-lakshmi', kind: 'flag', title: 'Kavin’s broad jump is up 21 cm', body: 'A progress flag went to his coach for review. A flag can open a trial; it never closes a door.', href: '/guardian/child', minutesAgo: 120 },
  { to: 'grd-lakshmi', kind: 'consent', title: 'Nila: talent review consent not given', body: 'Her 30 m progress can’t be reviewed by the district until you allow it.', href: '/guardian/consent', minutesAgo: 60 * 6 },
  { to: 'grd-lakshmi', kind: 'workout', title: 'Kavin’s plan for this week', body: 'Technique with a light bar, three sessions, all with Coach Ravi present.', href: '/guardian/child', minutesAgo: 60 * 30, read: true },

  // Senthil Kumar — Madurai district officer
  { to: 'dist-senthil', kind: 'flag', title: '6 flags from October tests', body: 'Rules flagged 6 Madurai athletes. Two wait on verified results.', href: '/district/flags', minutesAgo: 80 },
  { to: 'dist-senthil', kind: 'insight', title: 'Rural flag rate 5.2 vs urban 7.0', body: 'Fewer timing gates at block grounds. Check testing access before the next window.', href: '/district/cohorts', minutesAgo: 60 * 9 },
  { to: 'dist-senthil', kind: 'reminder', title: 'District trials · 15.11, Race Course stadium', body: 'Confirm invitations by 08.11 so guardians can plan travel.', href: '/district/trials', minutesAgo: 60 * 27, read: true },
];

export function seedNotices(now = Date.now()): Notice[] {
  return SEEDS.map(({ minutesAgo, read, ...n }, i) => ({
    ...n,
    id: `seed-${i}`,
    at: now - minutesAgo * 60_000,
    read: read ?? false,
  })).sort((a, b) => b.at - a.at);
}
