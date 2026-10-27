/**
 * Mental wellness and health log (Phase 1 doc, sections 6 and 12).
 * Items, thresholds and content are drafts: a qualified psychologist chooses
 * and reviews them before launch. Wellness answers are the strictest data
 * class and are never exported to sports bodies.
 */

export interface WellnessItem {
  id: 'mood' | 'stress' | 'sleep' | 'motivation';
  question: string;
  /** Labels for 1 and 5. For stress, 5 is the worst, so scores are flipped. */
  low: string;
  high: string;
  reversed?: boolean;
}

export const WELLNESS_ITEMS: WellnessItem[] = [
  { id: 'mood', question: 'How has your mood been this week?', low: 'Very low', high: 'Very good' },
  { id: 'stress', question: 'How stressed have you felt?', low: 'Calm', high: 'Very stressed', reversed: true },
  { id: 'sleep', question: 'How well have you slept?', low: 'Badly', high: 'Very well' },
  { id: 'motivation', question: 'How motivated are you to train?', low: 'Not at all', high: 'Very' },
];

/** Score 1–5 where 5 is always good. */
export const itemScore = (item: WellnessItem, answer: number) => (item.reversed ? 6 - answer : answer);

export const wellnessScore = (answers: number[]) =>
  answers.reduce((a, v, i) => a + itemScore(WELLNESS_ITEMS[i], v), 0) / answers.length;

/** Draft referral rule: a low average, or any item at its worst. */
export const needsReferral = (answers: number[]) =>
  wellnessScore(answers) <= 2.25 || answers.some((v, i) => itemScore(WELLNESS_ITEMS[i], v) === 1);

/** The demo athlete's last six weekly scores, oldest first. */
export const WELLNESS_HISTORY = [3.8, 4.0, 3.5, 3.9, 4.1, 4.0];
export const WELLNESS_WEEKS = ['W38', 'W39', 'W40', 'W41', 'W42', 'W43'];
export const THIS_WEEK = 'W44';

export const WELLNESS_CONTENT = [
  {
    id: 'breathing',
    title: 'Box breathing',
    minutes: 2,
    steps: ['Breathe in for 4 counts.', 'Hold for 4.', 'Breathe out for 4.', 'Hold for 4. Repeat four times.'],
  },
  {
    id: 'goals',
    title: 'Setting a goal',
    minutes: 3,
    steps: ['Pick one thing to improve this week.', 'Make it something you control, like your start.', 'Write how you will know it worked.'],
  },
  {
    id: 'nerves',
    title: 'Competition nerves',
    minutes: 3,
    steps: ['Nerves mean your body is getting ready.', 'Keep your warm-up the same as in training.', 'Think about your first 30 m only.'],
  },
];

/** National tele-mental-health helpline. Verify every number before launch. */
export const HELPLINES = [{ name: 'Tele-MANAS (national)', number: '14416', note: 'Free, 24 hours, in Tamil and English' }];

/* ---------- Injury log ---------- */

export const BODY_PARTS = ['Hamstring', 'Calf', 'Knee', 'Ankle', 'Back', 'Shoulder', 'Wrist', 'Other'] as const;
export type BodyPart = (typeof BODY_PARTS)[number];
export type Severity = 'mild' | 'moderate' | 'severe';
export const SEVERITIES: { value: Severity; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

/** The coach's squad this week: check-ins in, missed, and open referrals. Summary only, never answers. */
export const SQUAD_WELLNESS = { checkedIn: 10, total: 12, missed: ['Nikhil Varma', 'Yash Malhotra'] };
