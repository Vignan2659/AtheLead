import { beforeEach, describe, expect, it } from 'vitest';
import { assignmentsFor, coachCardId, deckCards, inboxFor, prospectCardId, unreadFor, useStore } from './store';
import { ARJUN_PLAN_ID } from '../data/squad';
import { DECIDE_CARDS } from '../data/board';
import { timeAgo } from '../lib/format';

const ATHLETE = 'ath-arjun';
const COACH = 'coach-ravi';
const BOARD = 'board-meera';

const s = () => useStore.getState();
const as = (userId: string) => s().signIn(userId, false);
const latestFor = (userId: string) => inboxFor(s().notices, userId)[0];

beforeEach(() => {
  s().resetDemo();
  s().signOut();
});

describe('notices are scoped to their recipient', () => {
  it('each demo user starts with only their own seeded notices', () => {
    for (const id of [ATHLETE, COACH, BOARD]) {
      const mine = inboxFor(s().notices, id);
      expect(mine.length).toBeGreaterThan(0);
      expect(mine.every((n) => n.to === id)).toBe(true);
    }
  });

  it('mark all read only touches the signed-in user', () => {
    const boardUnread = unreadFor(s().notices, BOARD);
    as(COACH);
    s().markAllRead();
    expect(unreadFor(s().notices, COACH)).toBe(0);
    expect(unreadFor(s().notices, BOARD)).toBe(boardUnread);
  });
});

describe('athlete → coach', () => {
  it('a check-in reaches the coach, and a newer one replaces it', () => {
    as(ATHLETE);
    s().setFeel(3);
    expect(latestFor(COACH).title).toBe('Arjun checked in · readiness 84');
    s().setFeel(0);
    const checkins = inboxFor(s().notices, COACH).filter((n) => n.ref === `checkin-${ATHLETE}`);
    expect(checkins).toHaveLength(1);
    expect(checkins[0]).toMatchObject({ kind: 'injury', title: 'Arjun checked in · readiness 48' });
  });

  it('"Ask coach to approve" queues the plan for the coach once', () => {
    as(ATHLETE);
    s().requestPlan(ARJUN_PLAN_ID);
    s().requestPlan(ARJUN_PLAN_ID);
    expect(s().planRequests).toEqual([ARJUN_PLAN_ID]);
    expect(inboxFor(s().notices, COACH).filter((n) => n.ref === `req-${ARJUN_PLAN_ID}`)).toHaveLength(1);
  });
});

describe('coach → athlete', () => {
  it('applying a plan notifies the athlete and clears the request; undo withdraws it', () => {
    as(ATHLETE);
    s().requestPlan(ARJUN_PLAN_ID);
    as(COACH);
    s().togglePlan(ARJUN_PLAN_ID);
    expect(s().appliedPlans).toContain(ARJUN_PLAN_ID);
    expect(s().planRequests).not.toContain(ARJUN_PLAN_ID);
    expect(latestFor(ATHLETE)).toMatchObject({ kind: 'workout', title: 'New plan from Coach Ravi' });

    s().togglePlan(ARJUN_PLAN_ID);
    expect(inboxFor(s().notices, ATHLETE).some((n) => n.ref === `plan-${ARJUN_PLAN_ID}`)).toBe(false);
  });
});

describe('coach → board → coach', () => {
  it('a recommendation lands first in the deck and notifies the board', () => {
    as(COACH);
    s().recommendToBoard('men');
    s().recommendToBoard('men');
    expect(s().coachCards).toHaveLength(1);
    const deck = deckCards(s().coachCards);
    expect(deck[0]).toMatchObject({ id: coachCardId('men'), title: 'Arjun Reddy to national camp trials' });
    expect(deck).toHaveLength(DECIDE_CARDS.length + 1);
    expect(latestFor(BOARD).title).toBe('Coach Ravi recommends Arjun Reddy');
  });

  it.each([
    ['right', 'Board approved: Arjun Reddy to national camp trials'],
    ['up', 'Board sent back: Arjun Reddy to national camp trials'],
    ['left', 'Board declined: Arjun Reddy to national camp trials'],
  ] as const)('a %s swipe on it goes back to the coach', (dir, title) => {
    as(COACH);
    s().recommendToBoard('men');
    as(BOARD);
    s().decideCard(coachCardId('men'), dir);
    expect(latestFor(COACH)).toMatchObject({ kind: 'decision', title });
  });

  it('decisions on SLM cards do not notify anyone', () => {
    as(BOARD);
    const before = s().notices.length;
    s().decideCard(DECIDE_CARDS[0].id, 'right');
    expect(s().notices).toHaveLength(before);
    expect(s().boardDecisions.map((d) => d.cardId)).toEqual([DECIDE_CARDS[0].id]);
  });
});

describe('persistence', () => {
  it('saves shared state but never the per-tab session', () => {
    as(COACH);
    s().togglePlan(ARJUN_PLAN_ID);
    const saved = useStore.persist.getOptions().partialize?.(s()) as Record<string, unknown>;
    expect(saved.appliedPlans).toEqual([ARJUN_PLAN_ID]);
    expect(saved).not.toHaveProperty('userId');
    expect(saved).not.toHaveProperty('inboxOpen');
  });
});

describe('timeAgo', () => {
  const now = 1_000_000_000;
  it('formats compact ages', () => {
    expect(timeAgo(now, now)).toBe('now');
    expect(timeAgo(now - 12 * 60_000, now)).toBe('12 min');
    expect(timeAgo(now - 3 * 3_600_000, now)).toBe('3 h');
    expect(timeAgo(now - 50 * 3_600_000, now)).toBe('2 d');
  });
});

describe('stage 4 flows', () => {
  it('assigning a routine to the men’s squad notifies Arjun and lands in his week', () => {
    as(COACH);
    s().assignRoutine('rt-prehab', 'squad:men', 3);
    expect(latestFor(ATHLETE).title).toMatch(/Sprinter hamstring prehab/);
    expect(assignmentsFor(s().assignments, ATHLETE)).toHaveLength(1);
    // Undo withdraws the notice too.
    s().unassign(s().assignments[0].id);
    expect(inboxFor(s().notices, ATHLETE).some((n) => /prehab/.test(n.title))).toBe(false);
  });

  it('a routine for one women’s player does not reach Arjun', () => {
    as(COACH);
    s().assignRoutine('rt-home', 'p-fatima', 2);
    expect(assignmentsFor(s().assignments, ATHLETE)).toHaveLength(0);
  });

  it('a recommended prospect goes to the board and the verdict comes back to Scout', () => {
    as(COACH);
    s().setProspectStage('pr-zaheer', 1);
    s().recommendProspect('pr-zaheer');
    expect(deckCards(s().coachCards)[0].id).toBe(prospectCardId('pr-zaheer'));
    expect(latestFor(BOARD).title).toMatch(/Zaheer/);
    as(BOARD);
    s().decideCard(prospectCardId('pr-zaheer'), 'right');
    expect(latestFor(COACH).href).toBe('/coach/scout');
  });

  it('applying the 14-day plan notifies the squad once', () => {
    as(COACH);
    s().applyFixturePlan();
    s().applyFixturePlan();
    expect(inboxFor(s().notices, ATHLETE).filter((n) => n.ref === 'fixture-plan')).toHaveLength(1);
  });

  it('board → coach → board round trip on a forwarded recommendation', () => {
    as(BOARD);
    s().decideBoardRec('br-zaheer', 'sent');
    expect(latestFor(COACH).href).toBe('/coach/slm');
    as(COACH);
    s().completeQueueItem('br-zaheer');
    expect(latestFor(BOARD).title).toMatch(/actioned/);
    as(BOARD);
    s().decideBoardRec('br-zaheer', null);
    expect(s().boardRecs['br-zaheer']).toBeUndefined();
    expect(s().coachQueueDone).not.toContain('br-zaheer');
  });

  it('an athlete message reaches only their coach', () => {
    as(ATHLETE);
    s().askCoach('Side feels tight after nets');
    expect(latestFor(COACH).body).toBe('Side feels tight after nets');
    expect(inboxFor(s().notices, BOARD).some((n) => n.body.includes('tight'))).toBe(false);
  });
});
