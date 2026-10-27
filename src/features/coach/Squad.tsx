import { memo, useMemo, useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { Band, Bar, CountUp, Label, PillButton, RowNum, ScreenHeader, SectionHead, Segmented, StatStrip, Title, cx } from '../../design/primitives';
import { LaneBar } from '../../design/LaneBar';
import { GenderSwitch } from '../../design/GenderSwitch';
import { SQUADS, type PlanChange, type Squad, type SquadPlayer } from '../../data/squad';
import { FEEL_OPTIONS, FEEL_READINESS } from '../../data/athlete';
import { bandReadinessFor, blendedReadiness } from '../../wearables/preview';
import { acwrTone, formatAcwr } from '../../lib/acwr';
import { pad2 } from '../../lib/format';
import { PATHWAY_STAGES } from '../../data/mission2036';
import { coachCardId, useCurrentUser, useStore } from '../../state/store';
import type { Gender } from '../../data/inclusion';
import type { SwipeDir } from '../../lib/swipe';
import { useT } from '../../i18n';
import { SQUAD_WELLNESS } from '../../data/wellness';
import '../pilot/pilot.css';
import './squad.css';

type Filter = 'all' | 'watch' | 'injured';
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'watch', label: 'Watch' },
  { value: 'injured', label: 'Injured' },
] as const;

export function CoachSquad() {
  const user = useCurrentUser();
  const gender = useStore((s) => s.genderView);
  const recDecisions = useStore((s) => s.recDecisions);
  const feel = useStore((s) => s.feel);
  const [filter, setFilter] = useState<Filter>('all');
  const t = useT();

  const squad = SQUADS[gender];
  const recApproved = recDecisions[squad.rec.id] === 'approved';

  // Live squad: approved SLM caps and the athlete's own check-in flow in here.
  const players = useMemo<SquadPlayer[]>(
    () =>
      squad.players.map((p) => {
        if (p.id === squad.rec.playerId && recApproved) return { ...p, acwr: squad.rec.acwrAfter, note: 'load adjusted' };
        if (p.userId === 'ath-arjun' && feel !== null)
          return { ...p, note: `feels ${FEEL_OPTIONS[feel].toLowerCase()} · readiness ${blendedReadiness(FEEL_READINESS[feel], bandReadinessFor(p.userId))} with band` };
        return p;
      }),
    [squad, recApproved, feel],
  );
  const shown = filter === 'all' ? players : players.filter((p) => p.status === filter);
  const readiness = recApproved ? squad.rec.readinessAfter : squad.readiness.base;
  const rural = squad.players.filter((p) => p.origin === 'rural').length;

  return (
    <>
      <ScreenHeader label="Athletics — Head coach · sprints" initials={user?.initials ?? 'RM'}>
        <Title lines={['Track', 'U-20.']} />
      </ScreenHeader>

      <Band rule="ink" i={2}>
        <GenderSwitch note={squad.name} />
      </Band>

      <Band rule="rule" i={2} className="sq__strip">
        <StatStrip
          items={[
            { value: pad2(squad.summary.size), label: 'Squad' },
            { value: pad2(squad.summary.injured), label: 'Injured', tone: 'bad' },
            { value: pad2(squad.summary.watch), label: 'To watch', tone: 'warn' },
            { value: pad2(rural), label: 'Rural', tone: 'ok' },
          ]}
        />
      </Band>

      <Band tone="panel" i={3} aria-label="Squad readiness">
        <div className="labelrow">
          <Label>{t('U-20 Nationals · {g}', { g: t(gender === 'men' ? 'Men' : 'Women') })}</Label>
          <span className="M tone-coral">D–14 · 03.11</span>
        </div>
        <div className="sq__ready">
          <CountUp value={readiness} className="D sq__readynum" />
          <p className="sq__readytxt">
            {t('% squad ready,')}
            <br />
            {t('target {n}%', { n: squad.readiness.target })}
          </p>
        </div>
        <div className="sq__readybar">
          <Bar value={readiness / 100} tone="cobalt" i={3} />
          <span className="sq__tick" style={{ left: `${squad.readiness.target}%` }} aria-hidden="true" />
        </div>
        <div className="sq__phases">
          <Label>Build 20.10</Label>
          <Label>Peak 26.10</Label>
          <Label>Taper 31.10</Label>
        </div>
      </Band>

      <Band i={4} flush aria-label="Workload">
        <SectionHead title="Workload" aside="ACWR · safe 0.8–1.3" />
        <div className="sq__filter">
          <Segmented label="Filter squad" options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        <ul className="rows" key={`${gender}-${filter}`} aria-live="polite">
          {shown.map((p, i) => (
            <li key={p.id} className="sq__cascade" style={{ ['--i' as string]: i }}>
              <PlayerRow p={p} n={i + 1} />
            </li>
          ))}
        </ul>
      </Band>

      <AdjustPlans squad={squad} />

      <Band rule="ink" i={6} flush aria-label="2036 pathway">
        <SectionHead title="2036 pathway" aside={`${squad.name} · ${squad.summary.size}`} />
        <ul className="rows" key={gender}>
          {PATHWAY_STAGES.map((stage, i) => (
            <li key={stage}>
              <div className="row sq__stage">
                <RowNum n={i + 1} />
                <span className="row__name">{t(stage)}</span>
                <span className="D row__val">{pad2(squad.pathway.counts[i])}</span>
                <div className="sq__lane">
                  <Bar value={squad.pathway.counts[i] / squad.summary.size} tone={i >= 3 ? 'coral' : 'cobalt'} thin i={i + 2} />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="sq__closest">
          <span className="M">{t('Closest to national camp')}</span>
          <span>
            <strong>{squad.pathway.closest.name}</strong>
            <SportTag of={squad.pathway.closest.name} /> · {t('dev index')} {squad.pathway.closest.devIndex}/{squad.pathway.closest.gate}
          </span>
          <RecommendToBoard gender={gender} name={squad.pathway.closest.name} />
        </div>
      </Band>

      <SlmBand squad={squad} />

      <SquadWellbeing />
    </>
  );
}

const PlayerRow = memo(function PlayerRow({ p, n }: { p: SquadPlayer; n: number }) {
  const tone = acwrTone(p.acwr, p.status === 'injured');
  const t = useT();
  return (
    <div className="row sq__row">
      <RowNum n={n} />
      <span className="row__main">
        <span className="row__name">
          {p.name}
          <SportTag of={p.id} sportOnly />
          {p.origin === 'rural' && <span className="M tag tag--rural">{t('Rural')}</span>}
        </span>
        <span className="M">
          {t(p.position)} · {p.home}
          {p.note && ` · ${t(p.note)}`}
        </span>
      </span>
      <span className={cx('D row__val', `tone-${tone}`)}>
        <span className="sr-only">ACWR </span>
        {formatAcwr(p.acwr)}
      </span>
      <div className="sq__lane">
        <LaneBar value={p.acwr} tone={tone} />
      </div>
    </div>
  );
});

/** Progress in → plan change out. The coach reads the trend and decides. */
function AdjustPlans({ squad }: { squad: Squad }) {
  const applied = useStore((s) => s.appliedPlans);
  const requests = useStore((s) => s.planRequests);
  const toggle = useStore((s) => s.togglePlan);
  const count = squad.plans.filter((p) => applied.includes(p.id)).length;
  const plans = useMemo(
    () => [...squad.plans].sort((a, b) => Number(requests.includes(b.id)) - Number(requests.includes(a.id))),
    [squad.plans, requests],
  );
  return (
    <Band rule="ink" i={5} flush aria-label="Adjust plans">
      <SectionHead title="Adjust plans" aside={`By progress · ${pad2(count)}/${pad2(squad.plans.length)} applied`} />
      <ul className="rows" key={squad.gender}>
        {plans.map((p, i) => (
          <li key={p.id} className="sq__cascade" style={{ ['--i' as string]: i }}>
            <PlanRow plan={p} n={i + 1} on={applied.includes(p.id)} asked={requests.includes(p.id)} onToggle={toggle} />
          </li>
        ))}
      </ul>
    </Band>
  );
}

const PlanRow = memo(function PlanRow({
  plan,
  n,
  on,
  asked,
  onToggle,
}: {
  plan: PlanChange;
  n: number;
  on: boolean;
  asked: boolean;
  onToggle: (id: string) => void;
}) {
  const t = useT();
  return (
    <div className={cx('row sq__plan', on && 'is-on', asked && !on && 'is-asked')}>
      <RowNum n={n} />
      <span className="row__main">
        <span className="row__name">
          {plan.name}
          <SportTag of={plan.playerId} />
          {asked && !on && <span className="M tag tag--ask">{t('Asked you')}</span>}
        </span>
        <span className={cx('M', plan.trend === 'up' ? 'tone-ok' : 'tone-warn')}>
          {plan.trend === 'up' ? '▲' : '▼'} {t(plan.progress)}
        </span>
      </span>
      <button type="button" className="pill pill--sm sq__apply" aria-pressed={on} onClick={() => onToggle(plan.id)}>
        {t(on ? 'Applied' : 'Apply')}
      </button>
      <p className="sq__change">
        {t(plan.change)}
        <span className="M sq__sent" aria-live="polite">
          {on
            ? t('Sent to {who} · plan updated', { who: plan.notify })
            : asked
              ? t('{who} asked for this · needs your OK', { who: plan.notify })
              : t('SLM suggestion · needs your OK')}
        </span>
      </p>
    </div>
  );
});

const BOARD_VERDICT: Record<SwipeDir, { text: string; tone: string }> = {
  right: { text: 'Board approved · trials invite this week', tone: 'tone-ok' },
  up: { text: 'Board sent it back · add more data', tone: 'tone-warn' },
  left: { text: 'Board declined · logged for audit', tone: 'tone-bad' },
};

/** Coach → board: the closest athlete becomes a card in the board's Decide deck. */
function RecommendToBoard({ gender, name }: { gender: Gender; name: string }) {
  const id = coachCardId(gender);
  const sent = useStore((s) => s.coachCards.some((c) => c.id === id));
  const verdict = useStore((s) => s.boardDecisions.find((d) => d.cardId === id)?.dir);
  const recommend = useStore((s) => s.recommendToBoard);
  const t = useT();
  if (!sent) {
    return (
      <PillButton variant="ink" className="sq__rec" arrow onClick={() => recommend(gender)}>
        Recommend {name.split(' ')[0]} to board
      </PillButton>
    );
  }
  const v = verdict ? BOARD_VERDICT[verdict] : null;
  return (
    <span className={cx('M sq__recstate', v?.tone)} role="status" aria-live="polite">
      {t(v ? v.text : 'Sent to board · awaiting decision')}
    </span>
  );
}

function SlmBand({ squad }: { squad: Squad }) {
  const rec = squad.rec;
  const decision = useStore((s) => s.recDecisions[rec.id] ?? 'pending');
  const decide = useStore((s) => s.decideRec);
  const firstName = rec.title.split("'")[0].split(' ').pop();
  const t = useT();
  return (
    <Band tone="cobalt" i={7} aria-label="Sports SLM recommendation">
      <div className="sq__slmhead">
        <span className="pulse" style={{ color: '#fff' }} aria-hidden="true" />
        <Label>Sports SLM · {rec.confidence}% confident</Label>
      </div>
      <h2 className="D sq__slmtitle">{t(rec.title)}</h2>
      <p className="sq__reason">{t(rec.reason)}</p>

      <div className="sq__swap">
        <div className={cx('sq__layer', decision === 'pending' && 'is-on')}>
          <PillButton variant="outline-light" onClick={() => decide(rec.id, 'dismissed')} tabIndex={decision === 'pending' ? 0 : -1}>
            Not now
          </PillButton>
          <PillButton variant="white" onClick={() => decide(rec.id, 'approved')} tabIndex={decision === 'pending' ? 0 : -1}>
            Approve · tell {firstName}
          </PillButton>
        </div>
        <div className={cx('sq__layer sq__done', decision !== 'pending' && 'is-on')} role="status" aria-live="polite">
          <span className="sq__donetxt">
            {decision === 'approved' && t(rec.approvedNote)}
            {decision === 'dismissed' && t('Dismissed. SLM rechecks tomorrow.')}
          </span>
          {decision !== 'pending' && (
            <button type="button" className="textbtn" onClick={() => decide(rec.id, 'pending')}>
              {t('Undo')}
            </button>
          )}
        </div>
      </div>
    </Band>
  );
}

/** Wellbeing summary for the coach: who checked in, who missed, open referrals. Never the answers. */
function SquadWellbeing() {
  const t = useT();
  const users = useStore((s) => s.users);
  const referrals = useStore((s) => s.referrals);
  const injuries = useStore((s) => s.injuries);
  const followUp = useStore((s) => s.followUpReferral);
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? id;
  return (
    <Band rule="ink" i={8} aria-label="Squad wellbeing">
      <SectionHead title="Wellbeing" aside="Summary only" />
      <StatStrip
        items={[
          { value: `${SQUAD_WELLNESS.checkedIn}/${SQUAD_WELLNESS.total}`, label: 'Checked in' },
          { value: referrals.filter((r) => !r.done).length, label: 'To follow up', tone: referrals.some((r) => !r.done) ? 'warn' : undefined },
          { value: injuries.length, label: 'Injuries logged' },
        ]}
      />
      <p className="pb__note">{t('Missed this week: {names}', { names: SQUAD_WELLNESS.missed.join(', ') })}</p>
      {referrals.map((r) => (
        <div className="pb__toggle" key={r.id}>
          <span className="row__name">
            {nameOf(r.userId)}
            <SportTag of={r.userId} />
          </span>
          <PillButton className="pill--sm" aria-pressed={r.done} onClick={() => followUp(r.id)}>
            {r.done ? 'Followed up ✓' : 'Mark followed up'}
          </PillButton>
          <p>{t('Talk in person and follow the referral protocol. Answers stay private to the athlete.')}</p>
        </div>
      ))}
    </Band>
  );
}
