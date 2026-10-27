import type { SlmRole } from '../data/users';

/** Who wrote a block of advice: the model, or a coach-approved plan. */
export type SourceTag = 'ai' | 'coach';

export interface AnswerSection {
  heading: string;
  tag: SourceTag;
  items: string[];
}

export interface SlmAnswer {
  kind: 'answer' | 'refusal';
  title: string;
  intro: string;
  sections: AnswerSection[];
  nextSteps: string[];
  /** 0–100. Refusals carry no confidence. */
  confidence: number | null;
  /** Data sources the answer was built from, after the access check. */
  dataUsed: string[];
}

export interface DataSource {
  id: string;
  label: string;
  detail: string;
  roles: SlmRole[];
}

export interface Factor {
  label: string;
  weight: number;
}

/** A recommendation with the factors behind it, for the "Why?" view. */
export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  confidence: number;
  impact: string;
  factors: Factor[];
  /** Coach the board can forward this to. */
  forwardTo?: string;
}
