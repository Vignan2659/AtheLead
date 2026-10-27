import { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { DEMO_USERS, type User } from '../data/users';
import { FEEL_OPTIONS, FEEL_READINESS, INITIAL_COMPLETED } from '../data/athlete';
import { INITIAL_MEALS_LOGGED } from '../data/diet';
import { DECIDE_CARDS, type DecisionCard } from '../data/board';
import { SQUADS, type PlanChange, type SquadPlayer } from '../data/squad';
import { seedNotices, type Notice } from '../data/notifications';
import type { SwipeDir } from '../lib/swipe';
import type { Gender } from '../data/inclusion';
import { ROUTINES } from '../data/training';
import { PIPELINE_STAGES, PROSPECTS } from '../data/scouting';
import { BOARD_RECS } from '../slm/sources';
import { THIS_WEEK, needsReferral, type BodyPart, type Severity } from '../data/wellness';
import {
  ARJUN_TESTS, FLAG_RULES, PILOT_ATHLETES, PLAN_TEMPLATES, stageOf, yearsOf, CONSENT_PURPOSES, FLAG_META, SEED_CONSENT, TEST_RESULTS, SEED_FLAGS, VERIFY_META, consentKey, isMinor, pilotAthlete, resultById,
  type ConsentPurpose, type TrialOutcome, type FlagType, type ReviewDecision, type TalentFlag, type TestResult, type Verification,
} from '../data/pilot';

const SESSION_KEY = 'athelead.session';
export const STATE_KEY = 'athelead.state';
/** 4: pilot roles, flags, verification and consent; older saved state is dropped. */
const STATE_VERSION = 4;

function readSavedSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function saveSession(userId: string | null, remember: boolean) {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (userId) (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, userId);
  } catch {
    /* storage blocked — session lives in memory only */
  }
}

/** localStorage when it works; an in-memory map when it is blocked or absent (tests, private mode). */
function safeStorage(): StateStorage {
  try {
    const probe = '__athelead_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => void mem.set(k, v),
      removeItem: (k) => void mem.delete(k),
    };
  }
}

const toggle = (list: string[], id: string): string[] =>
  list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

export type CoachDecision = 'pending' | 'approved' | 'dismissed';

export interface BoardDecision {
  cardId: string;
  dir: SwipeDir;
  at: number;
}

/** A Decide card raised by a coach rather than the SLM. */
export interface CoachCard extends DecisionCard {
  fromUserId: string;
  /** Where the coach reads the board's verdict. */
  returnHref?: string;
}

/** A routine a coach has assigned to one player or a whole squad. */
export interface Assignment {
  id: string;
  routineId: string;
  /** A squad player id, or `squad:men` / `squad:women`. */
  target: string;
  /** Index into the Mon–Sun week. */
  day: number;
  at: number;
}

export type BoardRecDecision = 'approved' | 'rejected' | 'sent';

/** A coach and a district officer each confirm or reject a flag. */
export interface FlagReview {
  coach?: ReviewDecision;
  district?: ReviewDecision;
}

export const CONSENT_LABEL: Record<ConsentPurpose, string> = Object.fromEntries(
  CONSENT_PURPOSES.map((c) => [c.id, c.label]),
) as Record<ConsentPurpose, string>;

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LAST_STAGE = PIPELINE_STAGES.length - 1;

/* ---------- Lookups ---------- */

const firstName = (name?: string) => name?.split(' ')[0] ?? '';

function findPlan(planId: string): { plan: PlanChange; player?: SquadPlayer } | null {
  for (const squad of Object.values(SQUADS)) {
    const plan = squad.plans.find((p) => p.id === planId);
    if (plan) return { plan, player: squad.players.find((p) => p.id === plan.playerId) };
  }
  return null;
}

/** The coach on the same team as this athlete. */
export function coachOf(users: User[], athleteId: string): User | undefined {
  const athlete = users.find((u) => u.id === athleteId);
  return users.find((u) => u.role === 'coach' && !!u.teamId && u.teamId === athlete?.teamId);
}

export const coachCardId = (gender: Gender) => `dc-coach-${gender}`;
export const prospectCardId = (prospectId: string) => `dc-prospect-${prospectId}`;

/** Squad players a target reaches: one player, or everyone in a squad. */
export function playersFor(target: string): SquadPlayer[] {
  if (target.startsWith('squad:')) return SQUADS[target.slice(6) as Gender]?.players ?? [];
  for (const squad of Object.values(SQUADS)) {
    const p = squad.players.find((x) => x.id === target);
    if (p) return [p];
  }
  return [];
}

/** Assignments that reach a given athlete account. */
export const assignmentsFor = (list: Assignment[], userId: string | null) =>
  list.filter((a) => playersFor(a.target).some((p) => p.userId === userId));

/** Coach-raised cards first, then the SLM's. */
export const deckCards = (coachCards: CoachCard[]): DecisionCard[] => [...coachCards, ...DECIDE_CARDS];

/* ---------- Pilot lookups ---------- */

/** Seeded pilot results plus synced entries, for one athlete. */
export const resultsOf = (athleteId: string, entered: TestResult[]) =>
  [...TEST_RESULTS, ...ARJUN_TESTS, ...entered].filter((r) => r.athleteId === athleteId);

export const allFlags = (raised: TalentFlag[]): TalentFlag[] => [...SEED_FLAGS, ...raised];

/** A result's status now: its entry status, or what a coach has verified it as since. */
export const verificationOf = (r: TestResult, verified: Record<string, Verification>): Verification => verified[r.id] ?? r.verification;

export const hasConsent = (consent: Record<string, boolean>, athleteId: string, purpose: ConsentPurpose) => {
  const a = pilotAthlete(athleteId);
  // Adults consent for themselves; the guardian record applies only under 18.
  if (a && !isMinor(a.ageMonths)) return true;
  return consent[consentKey(athleteId, purpose)] ?? false;
};

/** The live threshold for a rule: its latest version, or the expert default. */
export const ruleValue = (versions: { ruleId: FlagType; value: number }[], ruleId: FlagType) =>
  versions.find((v) => v.ruleId === ruleId)?.value ?? FLAG_RULES.find((r) => r.id === ruleId)!.value;

/** Log a view of athlete data once per screen visit. */
export function useAuditView(action: string, detail: string) {
  const log = useStore((s) => s.logAccess);
  useEffect(() => {
    log(action, detail);
  }, [log, action, detail]);
}

export type FlagState = 'needs-coach' | 'unverified' | 'no-consent' | 'ready' | 'confirmed' | 'rejected';

/** Where a flag sits: low-quality results and missing consent hold it back from review. */
export function flagState(flag: TalentFlag, s: Pick<Shared, 'flagReviews' | 'verified' | 'consent'>): FlagState {
  const rv = s.flagReviews[flag.id] ?? {};
  if (rv.district) return rv.district;
  if (rv.coach === 'rejected') return 'rejected';
  const r = resultById(flag.resultId);
  if (r && verificationOf(r, s.verified) === 'self') return 'unverified';
  if (!hasConsent(s.consent, flag.athleteId, 'talent')) return 'no-consent';
  if (rv.coach !== 'confirmed') return 'needs-coach';
  return 'ready';
}

export { VERIFY_META };

/* ---------- Notices ---------- */

let seq = 0;
const nextId = () => `n-${Date.now().toString(36)}-${(seq++).toString(36)}`;

type NewNotice = Omit<Notice, 'id' | 'at' | 'read'>;

/** Prepend a notice. One with the same ref and recipient replaces the older one. */
function pushNotice(list: Notice[], n: NewNotice): Notice[] {
  const rest = n.ref ? list.filter((x) => !(x.ref === n.ref && x.to === n.to)) : list;
  return [{ ...n, id: nextId(), at: Date.now(), read: false }, ...rest];
}

const dropRef = (list: Notice[], ref: string) => list.filter((x) => x.ref !== ref);

function notifyDistrict(s: Pick<Shared, 'users' | 'notices'>, title: string, body: string, ref: string): Notice[] {
  let notices = s.notices;
  for (const d of s.users.filter((u) => u.role === 'district'))
    notices = pushNotice(notices, { to: d.id, kind: 'flag', title, body, href: '/district/flags', ref });
  return notices;
}

export const inboxFor = (notices: Notice[], userId: string | null) => notices.filter((n) => n.to === userId);
export const unreadFor = (notices: Notice[], userId: string | null) =>
  notices.reduce((c, n) => c + (n.to === userId && !n.read ? 1 : 0), 0);

/* ---------- State ---------- */

interface Shared {
  users: User[];

  /** Athlete morning check-in, index into FEEL_OPTIONS. Shared with the coach. */
  feel: number | null;
  completed: string[];
  mealsLogged: string[];
  /** Millilitres drunk today. */
  waterMl: number;

  /** Coach decisions on SLM recommendations, by recommendation id. */
  recDecisions: Record<string, CoachDecision>;
  /** Plan changes the coach has applied after reviewing progress. */
  appliedPlans: string[];
  /** Plan changes an athlete has asked their coach to approve. */
  planRequests: string[];
  /** Rural athletes the board has invited to national trials. */
  invited: string[];

  /** Men's and women's data are analysed separately; this is the section in view. */
  genderView: Gender;

  /** Cards coaches have sent to the board's Decide deck. */
  coachCards: CoachCard[];
  boardDecisions: BoardDecision[];

  /** Coach Train tab → athlete's week. */
  assignments: Assignment[];
  /** Scouting pipeline stage per prospect, index into PIPELINE_STAGES; absent = Identified. */
  prospectStage: Record<string, number>;
  /** The coach applied and shared the 14-day U-20 Nationals plan. */
  fixturePlanApplied: boolean;
  /** Board decisions on SLM recommendations in the intelligence centre. */
  boardRecs: Record<string, BoardRecDecision>;
  /** Forwarded board items the coach has acted on. */
  coachQueueDone: string[];

  /** Pilot results verified since entry, by result id. */
  verified: Record<string, Verification>;
  /** Flags a coach raised with the flag button. Rule-raised ones are SEED_FLAGS. */
  raisedFlags: TalentFlag[];
  flagReviews: Record<string, FlagReview>;
  /** Guardian consent, keyed `athleteId:purpose`. */
  consent: Record<string, boolean>;
  consentLog: { athleteId: string; purpose: ConsentPurpose; given: boolean; at: number }[];

  /** Weekly wellness check-ins by the signed-in athlete. Answers stay with the athlete. */
  wellness: { userId: string; week: string; answers: number[]; at: number }[];
  /** Wellness referrals a designated adult follows up. */
  referrals: { id: string; userId: string; at: number; done: boolean }[];
  injuries: Injury[];

  /** Results entered on this phone and not yet synced (offline-first). */
  syncQueue: TestResult[];
  /** Results that reached the server: coach bulk entry and athlete self-entry. */
  entered: TestResult[];
  /** Two different values for the same athlete, test and day: the coach picks one. */
  conflicts: { a: TestResult; b: TestResult }[];
  lastSync: number | null;

  /** Plan templates the coach approved and assigned to their stage group. */
  approvedPlans: string[];
  trialOutcomes: Record<string, TrialOutcome>;
  /** Band data types the athlete allows, keyed `userId:type`. Absent = allowed. */
  bandPerms: Record<string, boolean>;
  /** Manual fallback when there is no band. */
  manualBand: { userId: string; sleepHrs: number; restingHr: number; at: number }[];

  /** Every access to athlete data, newest first. */
  auditLog: { at: number; userId: string; action: string; detail: string }[];
  /** Flag-rule thresholds with history, newest first. */
  ruleVersions: { ruleId: FlagType; value: number; at: number; by: string }[];

  notices: Notice[];
}

export interface Injury {
  id: string;
  userId: string;
  part: BodyPart;
  severity: Severity;
  at: number;
}

interface State extends Shared {
  userId: string | null;
  /** Demo switch: behave as if the phone has no network. */
  simOffline: boolean;
  setSimOffline: (v: boolean) => void;
  accountOpen: boolean;
  inboxOpen: boolean;

  signIn: (userId: string, remember: boolean) => void;
  signOut: () => void;
  register: (user: User) => void;
  setAccountOpen: (open: boolean) => void;
  setInboxOpen: (open: boolean) => void;

  setFeel: (i: number) => void;
  toggleExercise: (id: string) => void;
  toggleMeal: (id: string) => void;
  addWater: (ml: number) => void;
  requestPlan: (planId: string) => void;

  decideRec: (recId: string, d: CoachDecision) => void;
  togglePlan: (planId: string) => void;
  recommendToBoard: (gender: Gender) => void;

  toggleInvite: (athleteId: string) => void;
  setGenderView: (g: Gender) => void;
  decideCard: (cardId: string, dir: SwipeDir) => void;
  resetDeck: () => void;

  assignRoutine: (routineId: string, target: string, day: number) => void;
  unassign: (id: string) => void;
  setProspectStage: (prospectId: string, stage: number) => void;
  recommendProspect: (prospectId: string) => void;
  applyFixturePlan: () => void;
  decideBoardRec: (recId: string, d: BoardRecDecision | null) => void;
  completeQueueItem: (recId: string) => void;
  askCoach: (text: string) => void;

  verifyResult: (resultId: string, how: Exclude<Verification, 'self'>) => void;
  raiseFlag: (athleteId: string, type: FlagType, resultId: string) => void;
  reviewFlag: (flagId: string, by: 'coach' | 'district', d: ReviewDecision | null) => void;
  setConsent: (athleteId: string, purpose: ConsentPurpose, given: boolean) => void;

  submitWellness: (answers: number[]) => void;
  followUpReferral: (id: string) => void;
  logInjury: (part: BodyPart, severity: Severity) => void;

  enterResults: (rows: TestResult[]) => void;
  syncNow: () => void;
  resolveConflict: (index: number, keep: 'a' | 'b') => void;

  approvePlan: (templateId: string) => void;
  setTrialOutcome: (flagId: string, o: TrialOutcome | null) => void;
  setBandPerm: (type: string, allowed: boolean) => void;
  logManualBand: (sleepHrs: number, restingHr: number) => void;

  logAccess: (action: string, detail: string) => void;
  setRule: (ruleId: FlagType, value: number) => void;

  markRead: (id: string) => void;
  markAllRead: () => void;
  resetDemo: () => void;
}

const initialShared = (): Shared => ({
  users: DEMO_USERS,
  feel: null,
  completed: INITIAL_COMPLETED,
  mealsLogged: INITIAL_MEALS_LOGGED,
  waterMl: 1750,
  recDecisions: {},
  appliedPlans: [],
  planRequests: [],
  invited: [],
  genderView: 'men',
  coachCards: [],
  boardDecisions: [],
  assignments: [],
  prospectStage: {},
  fixturePlanApplied: false,
  boardRecs: {},
  coachQueueDone: [],
  verified: {},
  raisedFlags: [],
  flagReviews: {},
  consent: SEED_CONSENT,
  consentLog: [],
  wellness: [],
  referrals: [],
  injuries: [],
  syncQueue: [],
  entered: [],
  conflicts: [],
  lastSync: null,
  approvedPlans: [],
  trialOutcomes: {},
  bandPerms: {},
  manualBand: [],
  auditLog: [],
  ruleVersions: [],
  notices: seedNotices(),
});

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const me = () => get().users.find((u) => u.id === get().userId);

      return {
        ...initialShared(),
        userId: readSavedSession(),
        accountOpen: false,
        inboxOpen: false,
        simOffline: false,
        setSimOffline: (simOffline) => set({ simOffline }),

        signIn: (userId, remember) => {
          saveSession(userId, remember);
          set({ userId, accountOpen: false, inboxOpen: false });
        },
        signOut: () => {
          saveSession(null, false);
          set({ userId: null, accountOpen: false, inboxOpen: false });
        },
        register: (user) => set((s) => ({ users: [...s.users, user] })),
        setAccountOpen: (accountOpen) => set({ accountOpen, inboxOpen: false }),
        setInboxOpen: (inboxOpen) => set({ inboxOpen, accountOpen: false }),

        /* ----- Athlete ----- */

        // Check-in → the athlete's coach sees readiness, and an alert when it is low.
        setFeel: (feel) =>
          set((s) => {
            const athlete = me();
            const coach = athlete?.role === 'athlete' ? coachOf(s.users, athlete.id) : undefined;
            if (!athlete || !coach) return { feel };
            const low = feel <= 1;
            return {
              feel,
              notices: pushNotice(s.notices, {
                to: coach.id,
                kind: low ? 'injury' : 'readiness',
                title: `${firstName(athlete.name)} checked in · readiness ${FEEL_READINESS[feel]}`,
                body: low
                  ? `Feels ${FEEL_OPTIONS[feel].toLowerCase()}. Consider trimming today's load.`
                  : `Feels ${FEEL_OPTIONS[feel].toLowerCase()}. Session stays as planned.`,
                href: '/coach/squad',
                ref: `checkin-${athlete.id}`,
              }),
            };
          }),
        toggleExercise: (id) => set((s) => ({ completed: toggle(s.completed, id) })),
        toggleMeal: (id) => set((s) => ({ mealsLogged: toggle(s.mealsLogged, id) })),
        addWater: (ml) => set((s) => ({ waterMl: Math.max(0, s.waterMl + ml) })),

        // "Ask coach to approve" → coach notice + the plan row is flagged in the coach's queue.
        requestPlan: (planId) =>
          set((s) => {
            if (s.planRequests.includes(planId) || s.appliedPlans.includes(planId)) return {};
            const athlete = me();
            const found = findPlan(planId);
            const coach = athlete ? coachOf(s.users, athlete.id) : undefined;
            if (!athlete || !found || !coach) return {};
            return {
              planRequests: [...s.planRequests, planId],
              notices: pushNotice(s.notices, {
                to: coach.id,
                kind: 'slm',
                title: `${firstName(athlete.name)} asks you to approve a plan change`,
                body: found.plan.change,
                href: '/coach/squad',
                ref: `req-${planId}`,
              }),
            };
          }),

        /* ----- Coach ----- */

        decideRec: (recId, d) => set((s) => ({ recDecisions: { ...s.recDecisions, [recId]: d } })),

        // Apply → the athlete is notified and sees the new plan. Undo withdraws the notice.
        togglePlan: (planId) =>
          set((s) => {
            const on = !s.appliedPlans.includes(planId);
            const found = findPlan(planId);
            const athleteId = found?.player?.userId;
            const ref = `plan-${planId}`;
            let notices = s.notices;
            if (athleteId && found) {
              notices = on
                ? pushNotice(dropRef(notices, `req-${planId}`), {
                    to: athleteId,
                    kind: 'workout',
                    title: `New plan from Coach ${firstName(me()?.name) || 'Ravi'}`,
                    body: found.plan.change,
                    href: '/athlete/today',
                    ref,
                  })
                : dropRef(notices, ref);
            }
            return {
              appliedPlans: toggle(s.appliedPlans, planId),
              planRequests: on ? s.planRequests.filter((x) => x !== planId) : s.planRequests,
              notices,
            };
          }),

        // The squad's closest-to-camp athlete becomes a card at the front of the board's deck.
        recommendToBoard: (gender) =>
          set((s) => {
            const id = coachCardId(gender);
            const coach = me();
            if (!coach || s.coachCards.some((c) => c.id === id)) return {};
            const squad = SQUADS[gender];
            const { name, devIndex, gate } = squad.pathway.closest;
            const player = squad.players.find((p) => p.name === name);
            const card: CoachCard = {
              id,
              priority: 'HIGH',
              confidence: 81,
              title: `${name} to national camp trials`,
              reason: `Dev index ${devIndex}, gate ${gate}.${player ? ` ${player.origin === 'rural' ? 'Rural athlete from' : 'From'} ${player.home}.` : ''} Coach ${firstName(coach.name)} recommends.`,
              owner: coach.name,
              fromUserId: coach.id,
            };
            let notices = s.notices;
            for (const b of s.users.filter((u) => u.role === 'board')) {
              notices = pushNotice(notices, {
                to: b.id,
                kind: 'recruitment',
                title: `Coach ${firstName(coach.name)} recommends ${name}`,
                body: 'National camp trials. New card at the top of Decide.',
                href: '/board/home',
                ref: `card-${id}`,
              });
            }
            return { coachCards: [card, ...s.coachCards], notices };
          }),

        /* ----- Board ----- */

        toggleInvite: (athleteId) => set((s) => ({ invited: toggle(s.invited, athleteId) })),
        setGenderView: (genderView) => set({ genderView }),

        // A decision on a coach's card goes back to that coach.
        decideCard: (cardId, dir) =>
          set((s) => {
            const decisions = [...s.boardDecisions.filter((d) => d.cardId !== cardId), { cardId, dir, at: Date.now() }];
            const card = s.coachCards.find((c) => c.id === cardId);
            if (!card) return { boardDecisions: decisions };
            const who = me()?.name ?? 'The board';
            const outcome =
              dir === 'right'
                ? { title: `Board approved: ${card.title}`, body: `${who} approved it. The trials invitation goes out this week.` }
                : dir === 'up'
                  ? { title: `Board sent back: ${card.title}`, body: `${who} wants more data before deciding. It is back in your queue.` }
                  : { title: `Board declined: ${card.title}`, body: `${who} declined it for now. Logged for audit.` };
            return {
              boardDecisions: decisions,
              notices: pushNotice(s.notices, {
                to: card.fromUserId,
                kind: 'decision',
                ...outcome,
                href: card.returnHref ?? '/coach/squad',
                ref: `decision-${cardId}`,
              }),
            };
          }),
        resetDeck: () => set({ boardDecisions: [] }),

        /* ----- Coach: train, scout, fixtures ----- */

        // Every linked athlete the routine reaches gets a workout notice.
        assignRoutine: (routineId, target, day) =>
          set((s) => {
            const routine = ROUTINES.find((r) => r.id === routineId);
            if (!routine) return {};
            const a: Assignment = { id: nextId(), routineId, target, day, at: Date.now() };
            let notices = s.notices;
            for (const p of playersFor(target)) {
              if (!p.userId) continue;
              notices = pushNotice(notices, {
                to: p.userId,
                kind: 'workout',
                title: `New workout: ${routine.name}`,
                body: `${DAY_NAMES[day]} · ${routine.dose} · ${routine.minutes} min. From Coach ${firstName(me()?.name) || 'Ravi'}.`,
                href: '/athlete/train',
                ref: `assign-${a.id}`,
              });
            }
            return { assignments: [...s.assignments, a], notices };
          }),
        unassign: (id) =>
          set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id), notices: dropRef(s.notices, `assign-${id}`) })),

        setProspectStage: (prospectId, stage) =>
          set((s) => ({ prospectStage: { ...s.prospectStage, [prospectId]: Math.max(0, Math.min(LAST_STAGE - 1, stage)) } })),

        // Prospect → board's Decide deck; the board's verdict comes back to Scout.
        recommendProspect: (prospectId) =>
          set((s) => {
            const id = prospectCardId(prospectId);
            const coach = me();
            const p = PROSPECTS.find((x) => x.id === prospectId);
            if (!coach || !p || s.coachCards.some((c) => c.id === id)) return {};
            const card: CoachCard = {
              id,
              priority: p.teamFit >= 90 ? 'HIGH' : 'MEDIUM',
              confidence: p.confidence,
              title: `Sign ${p.name} for Track Squad U-20`,
              reason: `${p.role}, ${p.age}, ${p.home}.${p.origin === 'rural' ? ' Rural athlete.' : ''} Fills ${p.fills.toLowerCase()}; team fit ${p.teamFit}.`,
              owner: coach.name,
              fromUserId: coach.id,
              returnHref: '/coach/scout',
            };
            let notices = s.notices;
            for (const b of s.users.filter((u) => u.role === 'board')) {
              notices = pushNotice(notices, {
                to: b.id,
                kind: 'recruitment',
                title: `Coach ${firstName(coach.name)} recommends signing ${p.name}`,
                body: `${p.role} from ${p.home}. New card at the top of Decide.`,
                href: '/board/home',
                ref: `card-${id}`,
              });
            }
            return {
              coachCards: [card, ...s.coachCards],
              prospectStage: { ...s.prospectStage, [prospectId]: LAST_STAGE },
              notices,
            };
          }),

        applyFixturePlan: () =>
          set((s) => {
            if (s.fixturePlanApplied) return {};
            let notices = s.notices;
            for (const p of SQUADS.men.players) {
              if (!p.userId) continue;
              notices = pushNotice(notices, {
                to: p.userId,
                kind: 'tournament',
                title: 'Nationals plan is live',
                body: 'Build to 25.10, peak to 30.10, taper to 02.11. Men’s 400 m heats 03.11 in Bhubaneswar.',
                href: '/athlete/train',
                ref: 'fixture-plan',
              });
            }
            return { fixturePlanApplied: true, notices };
          }),

        /* ----- Board ↔ coach: intelligence centre ----- */

        decideBoardRec: (recId, d) =>
          set((s) => {
            const boardRecs = { ...s.boardRecs };
            if (d) boardRecs[recId] = d;
            else delete boardRecs[recId];
            const rec = BOARD_RECS.find((r) => r.id === recId);
            const ref = `fwd-${recId}`;
            let notices = dropRef(s.notices, ref);
            if (d === 'sent' && rec?.forwardTo) {
              notices = pushNotice(notices, {
                to: rec.forwardTo,
                kind: 'slm',
                title: `Board asks you to review: ${rec.title}`,
                body: `${firstName(me()?.name) || 'The board'} forwarded an SLM recommendation. It is in your SLM queue.`,
                href: '/coach/slm',
                ref,
              });
            }
            return { boardRecs, notices, coachQueueDone: s.coachQueueDone.filter((x) => x !== recId) };
          }),

        completeQueueItem: (recId) =>
          set((s) => {
            if (s.coachQueueDone.includes(recId)) return {};
            const rec = BOARD_RECS.find((r) => r.id === recId);
            let notices = s.notices;
            for (const b of s.users.filter((u) => u.role === 'board')) {
              notices = pushNotice(notices, {
                to: b.id,
                kind: 'team',
                title: `Coach ${firstName(me()?.name) || 'Ravi'} actioned: ${rec?.title ?? 'your request'}`,
                body: 'Accepted and added to the squad plan.',
                href: '/board/slm',
                ref: `done-${recId}`,
              });
            }
            return { coachQueueDone: [...s.coachQueueDone, recId], notices };
          }),

        askCoach: (text) =>
          set((s) => {
            const athlete = me();
            const coach = athlete ? coachOf(s.users, athlete.id) : undefined;
            if (!athlete || !coach || !text.trim()) return {};
            return {
              notices: pushNotice(s.notices, {
                to: coach.id,
                kind: 'coach-message',
                title: `Message from ${firstName(athlete.name)}`,
                body: text.trim().slice(0, 240),
                href: '/coach/squad',
              }),
            };
          }),

        /* ----- Pilot: tests, flags, consent ----- */

        verifyResult: (resultId, how) => set((s) => ({ verified: { ...s.verified, [resultId]: how } })),

        // The flag button → the district officer's review queue.
        raiseFlag: (athleteId, type, resultId) =>
          set((s) => {
            const a = pilotAthlete(athleteId);
            const r = resultById(resultId);
            const id = `fl-c-${athleteId}-${type}`;
            if (!a || !r || allFlags(s.raisedFlags).some((f) => f.id === id)) return {};
            const flag: TalentFlag = { id, athleteId, type, resultId, source: 'coach', reason: `${r.test}: ${r.value}. Raised by the coach.` };
            return {
              raisedFlags: [...s.raisedFlags, flag],
              flagReviews: { ...s.flagReviews, [id]: { coach: 'confirmed' } },
              notices: notifyDistrict(s, `Coach ${firstName(me()?.name) || 'Ravi'} flagged ${a.name}`, `${FLAG_META[type].label} flag · ${r.test} ${r.value}.`, `flag-${id}`),
            };
          }),

        // Both reviews in → a trial invitation (or "not now") goes to the coach and the guardian.
        reviewFlag: (flagId, by, d) =>
          set((s) => {
            const prev = s.flagReviews[flagId] ?? {};
            const next: FlagReview = { ...prev, [by]: d ?? undefined };
            const flagReviews = { ...s.flagReviews, [flagId]: next };
            const flag = allFlags(s.raisedFlags).find((f) => f.id === flagId);
            const a = flag && pilotAthlete(flag.athleteId);
            if (!flag || !a) return { flagReviews };
            const ref = `flag-${flagId}`;
            let notices = dropRef(s.notices, ref);
            if (by === 'coach' && d === 'confirmed') {
              notices = notifyDistrict({ ...s, notices }, `Coach confirmed a flag: ${a.name}`, `${FLAG_META[flag.type].label} flag is ready for your review.`, ref);
            }
            if (by === 'district' && d) {
              const yes = d === 'confirmed';
              const title = yes ? `Trial invitation: ${a.name}` : `Not now: ${a.name}`;
              const body = yes
                ? `${firstName(me()?.name) || 'The district officer'} confirmed the ${FLAG_META[flag.type].label.toLowerCase()} flag. A district trial invitation is on its way.`
                : 'No trial this round. Keep training; the next test window is in three months.';
              const coach = s.users.find((u) => u.role === 'coach');
              if (coach) notices = pushNotice(notices, { to: coach.id, kind: yes ? 'trial' : 'flag', title, body, href: '/coach/tests', ref });
              if (a.guardianId && isMinor(a.ageMonths))
                notices = pushNotice(notices, { to: a.guardianId, kind: yes ? 'trial' : 'flag', title, body, href: '/guardian/child', ref: `${ref}-g` });
            }
            return { flagReviews, notices };
          }),

        // Every change is logged; the coach hears when consent is withdrawn.
        setConsent: (athleteId, purpose, given) =>
          set((s) => {
            const a = pilotAthlete(athleteId);
            const coach = s.users.find((u) => u.role === 'coach');
            let notices = s.notices;
            if (a && coach && !given) {
              notices = pushNotice(notices, {
                to: coach.id,
                kind: 'consent',
                title: `Consent withdrawn: ${a.name}`,
                body: `${CONSENT_LABEL[purpose]}. Stop collecting this data for ${firstName(a.name)}.`,
                href: '/coach/tests',
                ref: `consent-${athleteId}-${purpose}`,
              });
            } else if (a) notices = dropRef(notices, `consent-${athleteId}-${purpose}`);
            return {
              consent: { ...s.consent, [consentKey(athleteId, purpose)]: given },
              consentLog: [{ athleteId, purpose, given, at: Date.now() }, ...s.consentLog],
              notices,
            };
          }),

        /* ----- Wellness and health ----- */

        // The coach hears that a check-in crossed the line, never the answers.
        submitWellness: (answers) =>
          set((s) => {
            const athlete = me();
            if (!athlete) return {};
            const entry = { userId: athlete.id, week: THIS_WEEK, answers, at: Date.now() };
            const wellness = [...s.wellness.filter((w) => !(w.userId === athlete.id && w.week === THIS_WEEK)), entry];
            const coach = coachOf(s.users, athlete.id);
            const ref = `wellness-${athlete.id}-${THIS_WEEK}`;
            if (!needsReferral(answers) || !coach)
              return { wellness, referrals: s.referrals.filter((r) => r.id !== ref), notices: dropRef(s.notices, ref) };
            return {
              wellness,
              referrals: [...s.referrals.filter((r) => r.id !== ref), { id: ref, userId: athlete.id, at: Date.now(), done: false }],
              notices: pushNotice(s.notices, {
                to: coach.id,
                kind: 'wellness',
                title: `Wellbeing check: talk to ${firstName(athlete.name)}`,
                body: 'This week’s check-in crossed the referral line. Follow the written protocol; answers stay private.',
                href: '/coach/squad',
                ref,
              }),
            };
          }),
        followUpReferral: (id) => set((s) => ({ referrals: s.referrals.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),

        logInjury: (part, severity) =>
          set((s) => {
            const athlete = me();
            if (!athlete) return {};
            const injury: Injury = { id: nextId(), userId: athlete.id, part, severity, at: Date.now() };
            const coach = coachOf(s.users, athlete.id);
            return {
              injuries: [injury, ...s.injuries],
              notices: coach
                ? pushNotice(s.notices, {
                    to: coach.id,
                    kind: 'injury',
                    title: `${firstName(athlete.name)} logged an injury · ${part}`,
                    body: severity === 'severe' ? 'Severe. Stop training and arrange a physio check today.' : `${severity === 'moderate' ? 'Moderate' : 'Mild'}. Review today’s load.`,
                    href: '/coach/squad',
                    ref: `injury-${injury.id}`,
                  })
                : s.notices,
            };
          }),

        /* ----- Offline-first results ----- */

        // Saved on the phone first; syncNow sends them when there is a network.
        enterResults: (rows) => set((s) => ({ syncQueue: [...s.syncQueue, ...rows] })),

        // Same athlete, test and day with a different value → a conflict for the coach, never an overwrite.
        syncNow: () =>
          set((s) => {
            if (!s.syncQueue.length) return { lastSync: Date.now() };
            const entered = [...s.entered];
            const conflicts = [...s.conflicts];
            let notices = s.notices;
            for (const r of s.syncQueue) {
              const k = entered.findIndex((x) => x.athleteId === r.athleteId && x.test === r.test && x.date === r.date);
              if (k >= 0 && entered[k].value !== r.value) conflicts.push({ a: entered[k], b: r });
              else if (k < 0) entered.push(r);
              if (r.verification === 'self' && k < 0) {
                const coach = coachOf(s.users, r.athleteId);
                if (coach)
                  notices = pushNotice(notices, {
                    to: coach.id,
                    kind: 'performance',
                    title: `Verify a result: ${firstName(s.users.find((u) => u.id === r.athleteId)?.name)} · ${r.test}`,
                    body: `${r.value}, self-entered. Verify it so it can count for selection.`,
                    href: '/coach/tests',
                    ref: `verify-${r.id}`,
                  });
              }
            }
            return { entered, conflicts, syncQueue: [], lastSync: Date.now(), notices };
          }),

        resolveConflict: (index, keep) =>
          set((s) => {
            const c = s.conflicts[index];
            if (!c) return {};
            const winner = keep === 'a' ? c.a : c.b;
            return {
              entered: s.entered.map((x) => (x.id === c.a.id ? { ...winner, id: c.a.id } : x)),
              conflicts: s.conflicts.filter((_, k) => k !== index),
            };
          }),

        /* ----- Training engine, trial outcomes, band permissions ----- */

        // Approving a template assigns it to that stage group; guardians of minors are told.
        approvePlan: (templateId) =>
          set((s) => {
            const tpl = PLAN_TEMPLATES.find((p) => p.id === templateId);
            if (!tpl) return {};
            const on = !s.approvedPlans.includes(templateId);
            const ref = `plan-${templateId}`;
            let notices = dropRef(s.notices, ref);
            if (on) {
              for (const a of PILOT_ATHLETES.filter((x) => x.sport === tpl.sport && stageOf(yearsOf(x.ageMonths)).id === tpl.stage)) {
                if (!a.guardianId || !isMinor(a.ageMonths)) continue;
                notices = pushNotice(notices, {
                  to: a.guardianId,
                  kind: 'workout',
                  title: `New plan for ${firstName(a.name)}: ${tpl.name}`,
                  body: `${tpl.perWeek} sessions a week, ${tpl.minutes} min. ${tpl.rule}.`,
                  href: '/guardian/child',
                  ref: `${ref}-${a.id}`,
                });
              }
            } else notices = notices.filter((n) => !n.ref?.startsWith(ref));
            return { approvedPlans: toggle(s.approvedPlans, templateId), notices };
          }),

        setTrialOutcome: (flagId, o) =>
          set((s) => {
            const trialOutcomes = { ...s.trialOutcomes };
            if (o) trialOutcomes[flagId] = o;
            else delete trialOutcomes[flagId];
            return { trialOutcomes };
          }),

        setBandPerm: (type, allowed) =>
          set((s) => (s.userId ? { bandPerms: { ...s.bandPerms, [`${s.userId}:${type}`]: allowed } } : {})),
        logManualBand: (sleepHrs, restingHr) =>
          set((s) => (s.userId ? { manualBand: [{ userId: s.userId, sleepHrs, restingHr, at: Date.now() }, ...s.manualBand] } : {})),

        /* ----- Audit and rules ----- */

        logAccess: (action, detail) =>
          set((s) => {
            if (!s.userId) return {};
            const last = s.auditLog[0];
            // One entry per view, not per re-render.
            if (last && last.userId === s.userId && last.action === action && last.detail === detail && Date.now() - last.at < 5000) return {};
            return { auditLog: [{ at: Date.now(), userId: s.userId, action, detail }, ...s.auditLog].slice(0, 200) };
          }),
        setRule: (ruleId, value) =>
          set((s) => ({ ruleVersions: [{ ruleId, value, at: Date.now(), by: me()?.name ?? 'Admin' }, ...s.ruleVersions] })),

        /* ----- Notices ----- */

        markRead: (id) => set((s) => ({ notices: s.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
        markAllRead: () =>
          set((s) => ({ notices: s.notices.map((n) => (n.to === s.userId && !n.read ? { ...n, read: true } : n)) })),

        resetDemo: () => set({ ...initialShared(), accountOpen: false, inboxOpen: false, simOffline: false }),
      };
    },
    {
      name: STATE_KEY,
      version: STATE_VERSION,
      storage: createJSONStorage(safeStorage),
      // The session and open sheets stay per tab; everything else is shared.
      partialize: (s): Shared => ({
        users: s.users,
        feel: s.feel,
        completed: s.completed,
        mealsLogged: s.mealsLogged,
        waterMl: s.waterMl,
        recDecisions: s.recDecisions,
        appliedPlans: s.appliedPlans,
        planRequests: s.planRequests,
        invited: s.invited,
        genderView: s.genderView,
        coachCards: s.coachCards,
        boardDecisions: s.boardDecisions,
        assignments: s.assignments,
        prospectStage: s.prospectStage,
        fixturePlanApplied: s.fixturePlanApplied,
        boardRecs: s.boardRecs,
        coachQueueDone: s.coachQueueDone,
        verified: s.verified,
        raisedFlags: s.raisedFlags,
        flagReviews: s.flagReviews,
        consent: s.consent,
        consentLog: s.consentLog,
        wellness: s.wellness,
        referrals: s.referrals,
        injuries: s.injuries,
        syncQueue: s.syncQueue,
        entered: s.entered,
        conflicts: s.conflicts,
        lastSync: s.lastSync,
        approvedPlans: s.approvedPlans,
        trialOutcomes: s.trialOutcomes,
        bandPerms: s.bandPerms,
        manualBand: s.manualBand,
        auditLog: s.auditLog,
        ruleVersions: s.ruleVersions,
        notices: s.notices,
      }),
      // Older saved shapes are dropped rather than half-migrated.
      migrate: () => initialShared(),
    },
  ),
);

// Another tab changed the shared state (e.g. the coach approved a plan) — pick it up.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STATE_KEY) void useStore.persist.rehydrate();
  });
}

export const useCurrentUser = (): User | null =>
  useStore((s) => s.users.find((u) => u.id === s.userId) ?? null);
