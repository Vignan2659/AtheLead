/**
 * Phase 1 pilot: Tamil Nadu, athletics and weightlifting, ages 10 to 24.
 * Follows the Phase 1 architecture doc: age stages (section 8), the test
 * battery with verification status (section 9) and three flag types with
 * human review (section 10). Stage rules are proposed defaults; the
 * coaching experts set the final values. All people are fictional.
 */
import type { Gender, Origin } from './inclusion';

export type PilotSport = 'Athletics' | 'Weightlifting';
export const PILOT_SPORTS: PilotSport[] = ['Athletics', 'Weightlifting'];
export const PILOT_DISTRICT = 'Madurai';

/* ---------- Age stages ---------- */

export type StageId = 'foundation' | 'development' | 'specialisation' | 'performance';

export interface AgeStage {
  id: StageId;
  label: string;
  ages: string;
  min: number;
  /** Inclusive upper age in years. */
  max: number;
  athletics: string;
  weightlifting: string;
  /** How the app behaves for athletes in this stage. */
  app: string;
}

export const AGE_STAGES: AgeStage[] = [
  {
    id: 'foundation', label: 'Foundation', ages: '10–12', min: 10, max: 12,
    athletics: 'Play-based running, jumping and throwing, several events',
    weightlifting: 'Movement skills, technique with a stick or very light bar, no maximal lifts',
    app: 'Simple content, guardian visibility, progress against own history only',
  },
  {
    id: 'development', label: 'Development', ages: '13–15', min: 13, max: 15,
    athletics: 'Event exposure, speed and technique',
    weightlifting: 'Technique first, progressive loading only under direct coach supervision',
    app: 'Coach-approved plans only, maturity-aware benchmarks',
  },
  {
    id: 'specialisation', label: 'Specialisation', ages: '16–18', min: 16, max: 18,
    athletics: 'Event-specific training',
    weightlifting: 'Structured loading, weight-class discussions led by coach and nutritionist',
    app: 'Guardian consent still required until 18',
  },
  {
    id: 'performance', label: 'Performance', ages: '19–24', min: 19, max: 24,
    athletics: 'Full training plans',
    weightlifting: 'Full training plans',
    app: 'Adult consent, calculators enabled',
  },
];

export const stageOf = (ageYears: number): AgeStage =>
  AGE_STAGES.find((s) => ageYears <= s.max) ?? AGE_STAGES[AGE_STAGES.length - 1];

/** Age bands run in six-month steps, from age in months: "13.0–13.5". */
export function ageBand(months: number): string {
  const lo = Math.floor(months / 6) / 2;
  return `${lo.toFixed(1)}–${(lo + 0.5).toFixed(1)}`;
}

export const yearsOf = (months: number) => Math.floor(months / 12);
export const isMinor = (months: number) => months < 18 * 12;

/* ---------- Verification ---------- */

export type Verification = 'self' | 'coach' | 'video';

export const VERIFY_META: Record<Verification, { label: string; short: string; tone: string }> = {
  self: { label: 'Self-entered', short: 'Self', tone: 'tone-warn' },
  coach: { label: 'Coach-verified', short: 'Coach', tone: 'tone-ok' },
  video: { label: 'Video-verified', short: 'Video', tone: 'tone-cobalt' },
};

/** Only verified results feed talent flags. */
export const isVerified = (v: Verification) => v !== 'self';

/* ---------- Flags ---------- */

export type FlagType = 'performance' | 'progress' | 'potential';

export const FLAG_META: Record<FlagType, { label: string; text: string }> = {
  performance: { label: 'Performance', text: 'High for age' },
  progress: { label: 'Progress', text: 'Large improvement over time' },
  potential: { label: 'Potential', text: 'Physical attributes plus technique screen' },
};
export const FLAG_TYPES: FlagType[] = ['performance', 'progress', 'potential'];

export type ReviewDecision = 'confirmed' | 'rejected';

/* ---------- Test battery ---------- */

export interface BatteryTest {
  name: string;
  unit: string;
  sport: 'Both' | PilotSport | 'Athletics, optional for weightlifting';
  equipment: string;
}

export const TEST_BATTERY: BatteryTest[] = [
  { name: 'Height, weight, arm span', unit: 'cm', sport: 'Both', equipment: 'Stadiometer, scale, tape' },
  { name: 'Standing broad jump', unit: 'm', sport: 'Both', equipment: 'Tape' },
  { name: 'Vertical jump', unit: 'cm', sport: 'Both', equipment: 'Wall or jump mat' },
  { name: '30 m sprint', unit: 's', sport: 'Athletics, optional for weightlifting', equipment: 'Timing gates or stopwatch' },
  { name: '60 m sprint', unit: 's', sport: 'Athletics', equipment: 'Timing gates or stopwatch' },
  { name: '600 m run', unit: 'm:ss', sport: 'Athletics', equipment: 'Track and cones' },
  { name: 'Medicine ball throw', unit: 'm', sport: 'Both', equipment: 'Medicine ball, weight set by age band' },
  { name: 'Overhead squat mobility', unit: '/ 10', sport: 'Weightlifting', equipment: 'Stick' },
  { name: 'Technique screen', unit: '/ 10', sport: 'Weightlifting', equipment: 'Stick or light bar, phone video' },
];

/* ---------- Athletes and results ---------- */

export interface PilotAthlete {
  id: string;
  name: string;
  ageMonths: number;
  gender: Gender;
  sport: PilotSport;
  event: string;
  home: string;
  origin: Origin;
  /** Guardian account, for athletes under 18. */
  guardianId?: string;
}

export interface TestResult {
  id: string;
  athleteId: string;
  test: string;
  value: string;
  /** The same test six months ago, for progress against own history. */
  previous?: string;
  better?: boolean;
  method: 'Timing gates' | 'Stopwatch' | 'Video' | 'Tape' | 'Jump mat' | 'Rubric';
  verification: Verification;
  tester: string;
  date: string;
  /** Percentile within the athlete's age band and sex. */
  pct?: number;
}

export const PILOT_ATHLETES: PilotAthlete[] = [
  { id: 'pa-kavin', name: 'Kavin Murugan', ageMonths: 160, gender: 'men', sport: 'Weightlifting', event: '55 kg youth', home: 'T. Kallupatti, Madurai', origin: 'rural', guardianId: 'grd-lakshmi' },
  { id: 'pa-nila', name: 'Nila Murugan', ageMonths: 134, gender: 'women', sport: 'Athletics', event: 'Sprints and jumps', home: 'T. Kallupatti, Madurai', origin: 'rural', guardianId: 'grd-lakshmi' },
  { id: 'pa-priya', name: 'Priya Selvam', ageMonths: 181, gender: 'women', sport: 'Weightlifting', event: '49 kg youth', home: 'Thirumangalam, Madurai', origin: 'rural' },
  { id: 'pa-anitha', name: 'Anitha Rajendran', ageMonths: 205, gender: 'women', sport: 'Athletics', event: '100 m hurdles', home: 'Peraiyur, Madurai', origin: 'rural' },
  { id: 'pa-deepa', name: 'Deepa Arumugam', ageMonths: 170, gender: 'women', sport: 'Athletics', event: '800 m', home: 'Sholavandan, Madurai', origin: 'rural' },
  { id: 'pa-surya', name: 'Surya Prakash', ageMonths: 198, gender: 'men', sport: 'Athletics', event: '100 m', home: 'Madurai city', origin: 'urban' },
  { id: 'pa-hari', name: 'Hari Krishnan', ageMonths: 146, gender: 'men', sport: 'Athletics', event: 'Throws', home: 'Madurai city', origin: 'urban' },
  { id: 'pa-vetri', name: 'Vetrivel Karuppasamy', ageMonths: 243, gender: 'men', sport: 'Weightlifting', event: '73 kg', home: 'Vadipatti, Madurai', origin: 'rural' },
];

const R = (
  id: string, athleteId: string, test: string, value: string, method: TestResult['method'], verification: Verification,
  extra: Partial<TestResult> = {},
): TestResult => ({ id, athleteId, test, value, method, verification, tester: 'Coach Ravi Menon', date: '14.10', ...extra });

export const TEST_RESULTS: TestResult[] = [
  R('tr-kavin-sbj', 'pa-kavin', 'Standing broad jump', '2.18 m', 'Tape', 'coach', { previous: '1.97 m', better: true, pct: 88 }),
  R('tr-kavin-ohs', 'pa-kavin', 'Overhead squat mobility', '8 / 10', 'Rubric', 'video', { previous: '6 / 10', better: true }),
  R('tr-kavin-tech', 'pa-kavin', 'Technique screen', '7 / 10', 'Rubric', 'coach', { previous: '5 / 10', better: true }),
  R('tr-nila-30', 'pa-nila', '30 m sprint', '5.21 s', 'Stopwatch', 'self', { previous: '5.48 s', better: true, tester: 'Self (school PT period)', date: '19.10' }),
  R('tr-nila-sbj', 'pa-nila', 'Standing broad jump', '1.74 m', 'Tape', 'coach', { previous: '1.61 m', better: true }),
  R('tr-priya-tech', 'pa-priya', 'Technique screen', '9 / 10', 'Rubric', 'video', { pct: 96 }),
  R('tr-priya-vj', 'pa-priya', 'Vertical jump', '46 cm', 'Jump mat', 'coach', { previous: '41 cm', better: true, pct: 94 }),
  R('tr-anitha-60', 'pa-anitha', '60 m sprint', '7.98 s', 'Timing gates', 'coach', { previous: '8.21 s', better: true, pct: 97 }),
  R('tr-deepa-600', 'pa-deepa', '600 m run', '1:49.0', 'Stopwatch', 'self', { previous: '2:03.0', better: true, tester: 'Self (village ground)', date: '20.10' }),
  R('tr-surya-30', 'pa-surya', '30 m sprint', '4.18 s', 'Timing gates', 'coach', { previous: '4.24 s', better: true, pct: 82 }),
  R('tr-hari-mb', 'pa-hari', 'Medicine ball throw', '7.40 m', 'Tape', 'coach', { previous: '6.60 m', better: true, pct: 91 }),
  R('tr-hari-arm', 'pa-hari', 'Height, weight, arm span', '158 cm · span 166 cm', 'Tape', 'coach'),
  R('tr-vetri-tech', 'pa-vetri', 'Technique screen', '8 / 10', 'Rubric', 'coach', { pct: 90 }),
  R('tr-vetri-vj', 'pa-vetri', 'Vertical jump', '68 cm', 'Jump mat', 'self', { tester: 'Self (gym)', date: '21.10' }),
];

export interface TalentFlag {
  id: string;
  athleteId: string;
  type: FlagType;
  reason: string;
  /** The result the flag rests on; it must be verified before review. */
  resultId: string;
  source: 'rules' | 'coach';
}

/** Flags the expert-set rules raised from this month's tests. Coach-raised ones join them in the store. */
export const SEED_FLAGS: TalentFlag[] = [
  { id: 'fl-anitha', athleteId: 'pa-anitha', type: 'performance', resultId: 'tr-anitha-60', source: 'rules', reason: '60 m in 7.98 s is in the top 3% for her age band.' },
  { id: 'fl-kavin', athleteId: 'pa-kavin', type: 'progress', resultId: 'tr-kavin-sbj', source: 'rules', reason: 'Standing broad jump up 21 cm in six months.' },
  { id: 'fl-priya', athleteId: 'pa-priya', type: 'potential', resultId: 'tr-priya-tech', source: 'rules', reason: 'Technique screen 9 / 10 with a vertical jump in the top 6% for her age band.' },
  { id: 'fl-deepa', athleteId: 'pa-deepa', type: 'progress', resultId: 'tr-deepa-600', source: 'rules', reason: '600 m 14 s faster than six months ago.' },
  { id: 'fl-hari', athleteId: 'pa-hari', type: 'potential', resultId: 'tr-hari-mb', source: 'rules', reason: 'Arm span 8 cm over height with a medicine ball throw in the top 9%.' },
  { id: 'fl-nila', athleteId: 'pa-nila', type: 'progress', resultId: 'tr-nila-30', source: 'rules', reason: '30 m sprint 0.27 s faster than six months ago.' },
];

/* ---------- Training engine: plan templates by sport and age stage ---------- */

export interface PlanTemplate {
  id: string;
  sport: PilotSport;
  stage: StageId;
  name: string;
  perWeek: number;
  minutes: number;
  session: string;
  /** The stage rule the template enforces. */
  rule: string;
}

/** Drafts written for coaches to approve; qualified coaches set the real content. */
export const PLAN_TEMPLATES: PlanTemplate[] = [
  { id: 'pt-ath-f', sport: 'Athletics', stage: 'foundation', name: 'Run, jump, throw games', perWeek: 3, minutes: 45, session: 'Relay games · hopscotch bounds · soft-ball throws', rule: 'Play-based, several events, no specialisation' },
  { id: 'pt-ath-d', sport: 'Athletics', stage: 'development', name: 'Speed and technique', perWeek: 4, minutes: 60, session: 'Sprint drills · 4 × 30 m flying · hurdle walkovers', rule: 'Coach-approved, event exposure' },
  { id: 'pt-ath-s', sport: 'Athletics', stage: 'specialisation', name: 'Event block · sprints', perWeek: 5, minutes: 75, session: 'Block starts · 3 × 150 m · core circuit', rule: 'Event-specific, load tracked weekly' },
  { id: 'pt-ath-p', sport: 'Athletics', stage: 'performance', name: 'Full sprint plan', perWeek: 6, minutes: 90, session: 'Speed endurance · gym · recovery run', rule: 'Full training plan' },
  { id: 'pt-wl-f', sport: 'Weightlifting', stage: 'foundation', name: 'Movement skills with a stick', perWeek: 3, minutes: 40, session: 'Squat patterns · stick snatch drills · balance games', rule: 'No barbell load, no maximal lifts' },
  { id: 'pt-wl-d', sport: 'Weightlifting', stage: 'development', name: 'Technique with a light bar', perWeek: 3, minutes: 60, session: 'Snatch and clean technique · light bar · mobility', rule: 'Coach present at every session, progressive loading only' },
  { id: 'pt-wl-s', sport: 'Weightlifting', stage: 'specialisation', name: 'Structured loading', perWeek: 4, minutes: 75, session: 'Technique sets · squats at planned percentages', rule: 'Weight class decided with coach and nutritionist' },
  { id: 'pt-wl-p', sport: 'Weightlifting', stage: 'performance', name: 'Full lifting plan', perWeek: 5, minutes: 90, session: 'Snatch · clean and jerk · strength', rule: 'Full training plan' },
];

export type TrialOutcome = 'selected' | 'again' | 'absent';
export const TRIAL_OUTCOMES: { value: TrialOutcome; label: string }[] = [
  { value: 'selected', label: 'Hostel place' },
  { value: 'again', label: 'Trial again' },
  { value: 'absent', label: 'Did not come' },
];

/* ---------- Flag rules (expert-set, versioned) ---------- */

export interface FlagRule {
  id: FlagType;
  text: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

/** Thresholds the sports scientists set. Rules before machine learning. */
export const FLAG_RULES: FlagRule[] = [
  { id: 'performance', text: 'Percentile for age band and sex at or above', unit: 'th', value: 95, min: 85, max: 99, step: 1 },
  { id: 'progress', text: 'Improvement over six months of at least', unit: '%', value: 8, min: 4, max: 20, step: 1 },
  { id: 'potential', text: 'Technique screen score of at least', unit: '/ 10', value: 8, min: 6, max: 10, step: 1 },
];

/** Pilot success measures (doc section 21). Seeded values are the demo baseline. */
export const SUCCESS_BASELINE = {
  baselineComplete: 78,
  weeklyCoaches: 9,
  coachesTotal: 11,
  testRetest: 0.91,
  retention: 94,
  syncSuccess: 99.2,
  privacyIncidents: 0,
};

/** Data classes and who may see them (doc section 7). */
export const DATA_CLASSES = [
  { id: 'A', name: 'Identity', examples: 'Name, phone, date of birth, guardian', who: 'Encrypted, minimal access' },
  { id: 'B', name: 'Performance', examples: 'Tests, sessions, results', who: 'Scoped by site, district and state' },
  { id: 'C', name: 'Health', examples: 'Injuries, body measurements, band data, nutrition notes', who: 'Athlete, guardian, coach summary, reviewer' },
  { id: 'D', name: 'Wellness', examples: 'Check-in answers, referrals', who: 'Strictest; never exported' },
];

/* ---------- Guardian consent ---------- */

export type ConsentPurpose = 'training' | 'health' | 'talent' | 'band' | 'video';

export const CONSENT_PURPOSES: { id: ConsentPurpose; label: string; text: string }[] = [
  { id: 'training', label: 'Training and tests', text: 'Plans, session logs and test results. Needed to take part.' },
  { id: 'health', label: 'Health and wellness', text: 'Check-ins and injury notes. Seen by you, your child and the coach (summary only).' },
  { id: 'talent', label: 'Talent review', text: 'Performance results shared with the district officer when a flag needs review. Never health details.' },
  { id: 'video', label: 'Technique videos', text: 'Short phone videos used to verify results and score technique.' },
  { id: 'band', label: 'Fitness band', text: 'Heart rate and sleep from a band, for recovery only. Never used for talent flags.' },
];

export const consentKey = (athleteId: string, purpose: ConsentPurpose) => `${athleteId}:${purpose}`;

/**
 * Consent on file when the pilot began, keyed `athleteId:purpose`. Every minor
 * has a guardian's record; most allow all but the fitness band. Nila's guardian
 * has not yet allowed talent review or videos.
 */
export const SEED_CONSENT: Record<string, boolean> = Object.fromEntries(
  PILOT_ATHLETES.filter((a) => isMinor(a.ageMonths)).flatMap((a) =>
    CONSENT_PURPOSES.map((p) => [
      consentKey(a.id, p.id),
      p.id !== 'band' && !(a.id === 'pa-nila' && (p.id === 'talent' || p.id === 'video')),
    ]),
  ),
);

/* ---------- District cohort (Madurai pilot) ---------- */

/** Tested athletes by age stage, per gender. Performance data only; no health details. */
export const DISTRICT_COHORT: Record<Gender, Record<StageId, number>> = {
  men: { foundation: 64, development: 81, specialisation: 52, performance: 31 },
  women: { foundation: 58, development: 66, specialisation: 38, performance: 22 },
};

export const DISTRICT_SPORT: Record<PilotSport, Record<Gender, number>> = {
  Athletics: { men: 152, women: 131 },
  Weightlifting: { men: 76, women: 53 },
};

/** Share of this term's results that are coach- or video-verified, in %. */
export const VERIFIED_SHARE = 71;

/** Flags per 100 tested, for the bias audit by sex and origin. */
export const FLAG_AUDIT = [
  { label: 'Men', rate: 6.1 },
  { label: 'Women', rate: 5.4 },
  { label: 'Rural', rate: 5.2 },
  { label: 'Urban', rate: 7.0 },
];

/** Sites testing in the pilot district. */
export const PILOT_SITES = [
  { name: 'Madurai Race Course stadium', tested: 186, verified: 84 },
  { name: 'Thirumangalam school cluster', tested: 112, verified: 66 },
  { name: 'Usilampatti block ground', tested: 71, verified: 52 },
  { name: 'Melur weightlifting hall', tested: 43, verified: 77 },
];

/* ---------- The demo athlete's own tests (Arjun, 19, performance stage) ---------- */

/** Daily estimates shown only in guardian, coach and nutritionist views for under-18s. */
export const CHILD_FOOD: Record<string, { kcal: readonly [number, number]; protein: readonly [number, number] }> = {
  'pa-kavin': { kcal: [2200, 2500], protein: [55, 70] },
  'pa-nila': { kcal: [1800, 2100], protein: [40, 50] },
};

export const ARJUN_AGE_MONTHS = 231;
export const ARJUN_HEIGHT_CM = 178;

export const ARJUN_TESTS: TestResult[] = [
  R('tr-arjun-30', 'ath-arjun', '30 m sprint', '3.92 s', 'Timing gates', 'coach', { previous: '3.98 s', better: true, date: '02.10' }),
  R('tr-arjun-60', 'ath-arjun', '60 m sprint', '6.98 s', 'Timing gates', 'video', { previous: '7.06 s', better: true, date: '02.10' }),
  R('tr-arjun-sbj', 'ath-arjun', 'Standing broad jump', '2.88 m', 'Tape', 'self', { previous: '2.84 m', better: true, tester: 'Self', date: '18.10' }),
  R('tr-arjun-vj', 'ath-arjun', 'Vertical jump', '62 cm', 'Jump mat', 'coach', { previous: '60 cm', better: true, date: '02.10' }),
];

/** Today as DD.MM, the app's date format. */
export const todayDDMM = (d = new Date()) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;

export const pilotAthlete = (id: string) => PILOT_ATHLETES.find((a) => a.id === id);
export const resultById = (id: string) => [...TEST_RESULTS, ...ARJUN_TESTS].find((r) => r.id === id);
