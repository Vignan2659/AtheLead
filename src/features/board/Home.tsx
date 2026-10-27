import { useCallback, useMemo, useRef, useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { Band, Bar, CountUp, Label, PillButton, RowNum, ScreenHeader, SectionHead, StatStrip, cx } from '../../design/primitives';
import { SwipeDeck, type SwipeDeckHandle } from '../../design/SwipeDeck';
import { RISING, TEAM_FORM, UNION_SUMMARY, type DecisionCard } from '../../data/board';
import { formatIN, pad2 } from '../../lib/format';
import { PATHWAY_STAGES } from '../../data/mission2036';
import {
  PATHWAY_BY_GENDER,
  RURAL_SHARE_BY_STAGE,
  RURAL_TALENT,
  TARGET_2036_BY_GENDER,
  UNION_BY_GENDER,
  type RuralTalent,
} from '../../data/inclusion';
import { GenderSwitch } from '../../design/GenderSwitch';
import { Link } from 'react-router-dom';
import { TalentMap } from './TalentMap';
import type { SwipeDir } from '../../lib/swipe';
import { deckCards, useCurrentUser, useStore } from '../../state/store';
import { useT, type T } from '../../i18n';
import './board.css';

const formTone = (score: number) => (score >= 80 ? 'cobalt' : score >= 70 ? 'cobalt-light' : 'coral');

function decisionMessage(card: DecisionCard, dir: SwipeDir, t: T): string {
  if (dir === 'right') return t('Approved · {who} notified', { who: t(card.owner) });
  if (dir === 'up') return t('Sent to {who}', { who: t(card.owner) });
  return t('Rejected · logged for audit');
}

const genderLabel = (g: 'men' | 'women', t: T) => t(g === 'men' ? 'Men' : 'Women');

export function BoardHome() {
  const user = useCurrentUser();
  const gender = useStore((s) => s.genderView);
  const t = useT();

  return (
    <>
      <ScreenHeader label="Velora Sports Union — Board" initials={user?.initials ?? 'MI'}>
        <div className="bd__hero rise" style={{ ['--i' as string]: 0 }}>
          <CountUp value={UNION_SUMMARY.athletes} duration={1100} format={formatIN} className="D bd__counter" />
          <p className="bd__sub">
            {t('athletics athletes · {s} states & UTs · {d} districts', { s: UNION_SUMMARY.states, d: UNION_SUMMARY.districts })}{' '}
            <span className="tone-ok bd__yoy">▲ {t('{n}% YOY', { n: UNION_SUMMARY.yoy })}</span>
          </p>
        </div>
      </ScreenHeader>

      <Band rule="ink" i={1} className="bd__strip">
        <StatStrip
          size="lg"
          items={[
            { value: pad2(UNION_SUMMARY.coaches), label: 'Coaches' },
            { value: pad2(UNION_SUMMARY.eventGroups), label: 'Event groups' },
            { value: pad2(UNION_SUMMARY.eventsAhead), label: 'Events ahead' },
          ]}
        />
      </Band>

      <Band rule="rule" i={1} className="bd__strip" aria-label="Athletes by gender and origin">
        <StatStrip
          items={[
            { value: formatIN(UNION_BY_GENDER.men), label: 'Men' },
            { value: formatIN(UNION_BY_GENDER.women), label: 'Women' },
            { value: `${RURAL_SHARE_BY_STAGE[0]}%`, label: 'From rural India', tone: 'ok' },
          ]}
        />
      </Band>

      <Mission2036 />

      <Decide />

      <Band rule="ink" i={4}>
        <GenderSwitch note="Sections below" />
      </Band>

      <TalentMap i={5} />

      <FromTheVillages />

      <Band rule="ink" i={5} flush aria-label="Team form">
        <SectionHead title="Team form" aside={`${genderLabel(gender, t)} · ${t('30 days')}`} />
        <ul className="rows" key={gender}>
          {TEAM_FORM[gender].map((f, i) => (
            <li key={f.id}>
              <div className="row bd__form">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{t(f.name)}</span>
                  <span className="M">{t(f.sport)}</span>
                </span>
                <span className="D row__val">{f.score}</span>
                <div className="bd__formbar">
                  <Bar value={f.score / 100} tone={formTone(f.score)} thin i={i + 3} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={6} flush aria-label="Rising fastest">
        <SectionHead title="Rising fastest" aside={`${genderLabel(gender, t)} · ${t('potential')}`} />
        <ul className="bd__rising" key={gender}>
          {RISING[gender].map((r) => (
            <li key={r.id} className="bd__riser fade-in">
              <span className="D bd__pot">{r.potential}</span>
              <span className="row__name">{r.name}</span>
              <SportTag of={r.id} sportOnly className="bd__sport" />
              {r.origin === 'rural' && <span className="M tone-ok">{t('Rural')}</span>}
              <span className="M">
                {t(r.sport)} · <span className="tone-ok">+{r.trend}</span>
              </span>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}

function Mission2036() {
  const men = PATHWAY_BY_GENDER.men;
  const women = PATHWAY_BY_GENDER.women;
  const last = men.length - 1;
  const t = useT();
  return (
    <Band tone="panel" i={2} aria-label="Mission 2036">
      <div className="labelrow">
        <Label>Mission 2036 · Pathway funnel</Label>
        <span className="M tone-coral">{t('By gender')}</span>
      </div>
      <div className="bd__fhead" aria-hidden="true">
        <span />
        <span className="M">{t('Stage · rural share')}</span>
        <span className="M bd__fcol">
          <i className="bd__key bd__key--m" />
          {t('Men')}
        </span>
        <span className="M bd__fcol">
          <i className="bd__key bd__key--w" />
          {t('Women')}
        </span>
      </div>
      <ul className="rows bd__funnel">
        {PATHWAY_STAGES.map((stage, i) => (
          <li key={stage}>
            <div className="row bd__fstep">
              <RowNum n={i + 1} />
              <span className="row__main">
                <span className="row__name">{t(stage)}</span>
                <span className="M">{t('{n}% rural', { n: RURAL_SHARE_BY_STAGE[i] })}</span>
              </span>
              <span className="D bd__fval">
                <span className="sr-only">{t('Men')} </span>
                {formatIN(men[i])}
              </span>
              <span className="D bd__fval">
                <span className="sr-only">{t('Women')} </span>
                {formatIN(women[i])}
              </span>
              <div className="bd__fbars">
                <Bar value={Math.sqrt(men[i] / men[0])} tone="cobalt" thin i={i + 2} />
                <Bar value={Math.sqrt(women[i] / women[0])} tone="coral" thin i={i + 2} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="M bd__fnote">{t('Bars on a √ scale so the Olympic core stays visible.')}</p>
      <div className="bd__targets">
        {(['men', 'women'] as const).map((g) => (
          <div key={g} className="bd__target">
            <Label>{`${t('Target 2036')} · ${genderLabel(g, t)}`}</Label>
            <span className="D bd__tnum">
              {pad2(PATHWAY_BY_GENDER[g][last])}
              <small>/{TARGET_2036_BY_GENDER[g]}</small>
            </span>
            <Bar value={PATHWAY_BY_GENDER[g][last] / TARGET_2036_BY_GENDER[g]} tone={g === 'men' ? 'cobalt' : 'coral'} i={7} />
          </div>
        ))}
      </div>
    </Band>
  );
}

/** The bridge: village athletes the board would never otherwise see. */
function FromTheVillages() {
  const gender = useStore((s) => s.genderView);
  const invited = useStore((s) => s.invited);
  const toggle = useStore((s) => s.toggleInvite);
  const list = RURAL_TALENT.filter((t) => t.gender === gender).sort((a, b) => b.devIndex - a.devIndex);
  const t = useT();
  return (
    <Band i={5} flush aria-label="From the villages">
      <SectionHead title="From the villages" aside={`${genderLabel(gender, t)} · ${t('dev index')}`} />
      <p className="bd__lede">
        {t('Rural athletes found through district trials and coach referrals, with verified training data. Invite the strongest to national trials.')}
      </p>
      <ul className="rows" key={gender}>
        {list.map((r, i) => (
          <li key={r.id} className="sq__cascade" style={{ ['--i' as string]: i }}>
            <VillageRow r={r} n={i + 1} on={invited.includes(r.id)} onToggle={toggle} />
          </li>
        ))}
      </ul>
    </Band>
  );
}

function VillageRow({ r: v, n, on, onToggle }: { r: RuralTalent; n: number; on: boolean; onToggle: (id: string) => void }) {
  const t = useT();
  return (
    <div className={cx('row bd__village', on && 'is-on')}>
      <RowNum n={n} />
      <span className="row__main">
        <span className="row__name">
          {v.name}
          <SportTag of={v.id} sportOnly />
        </span>
        <span className="M">
          {t(v.event)} · {t(PATHWAY_STAGES[v.stage])}
        </span>
        <span className="M">
          {v.village}, {v.district}, {v.state}
        </span>
        <Link to={`/passport/${v.id}`} className="M bd__pp">
          {t('Passport →')}
        </Link>
      </span>
      <span className="D row__val">
        {v.devIndex}
        <span className="tone-ok bd__vtrend">▲{v.trend}</span>
      </span>
      <div className="bd__vfoot">
        <span className="M" aria-live="polite">
          {on ? t('Invited to national trials · coach notified') : t('Found via {how}', { how: t(v.discoveredVia) })}
        </span>
        <button type="button" className="pill pill--sm" aria-pressed={on} onClick={() => onToggle(v.id)}>
          {t(on ? 'Invited' : 'Invite to trials')}
        </button>
      </div>
    </div>
  );
}

function Decide() {
  const coachCards = useStore((s) => s.coachCards);
  const decisions = useStore((s) => s.boardDecisions);
  const decideCard = useStore((s) => s.decideCard);
  const resetDeck = useStore((s) => s.resetDeck);
  const deck = useRef<SwipeDeckHandle>(null);
  const [message, setMessage] = useState('');
  const t = useT();

  const all = useMemo(() => deckCards(coachCards), [coachCards]);
  const remaining = useMemo(
    () => all.filter((c) => !decisions.some((d) => d.cardId === c.id)),
    [all, decisions],
  );
  const coachIds = useMemo(() => new Set(coachCards.map((c) => c.id)), [coachCards]);
  const items = useMemo(
    () => remaining.map((c) => ({ id: c.id, node: <DecisionFace card={c} fromCoach={coachIds.has(c.id)} /> })),
    [remaining, coachIds],
  );

  const onDecide = useCallback(
    (id: string, dir: SwipeDir) => {
      const card = all.find((c) => c.id === id);
      if (!card) return;
      decideCard(id, dir);
      setMessage(decisionMessage(card, dir, t));
    },
    [all, decideCard, t],
  );

  const empty = remaining.length === 0;
  const position = Math.min(all.length - remaining.length + 1, all.length);

  return (
    <Band i={3} aria-label="Decisions">
      <SectionHead title="Decide" aside={`${pad2(empty ? all.length : position)} / ${pad2(all.length)}`} />

      {empty ? (
        <div className="bd__empty fade-in">
          <span className="D bd__clear">{t('All clear')}</span>
          <Label>Every recommendation has a decision</Label>
          <button
            type="button"
            className="textbtn"
            onClick={() => {
              resetDeck();
              setMessage('');
            }}
          >
            {t('Show again')}
          </button>
        </div>
      ) : (
        <SwipeDeck ref={deck} items={items} onDecide={onDecide} label={t('Board decisions — swipe right to approve, left to reject')} />
      )}

      <div className={cx('bd__actions', empty && 'is-hidden')}>
        <PillButton variant="outline" onClick={() => deck.current?.fling('left')} disabled={empty}>
          Reject
        </PillButton>
        <PillButton variant="ink" onClick={() => deck.current?.fling('up')} disabled={empty}>
          To coach
        </PillButton>
        <PillButton variant="coral" onClick={() => deck.current?.fling('right')} disabled={empty}>
          Approve
        </PillButton>
      </div>
      <p className="M bd__msg" role="status" aria-live="polite">
        {message}
      </p>
    </Band>
  );
}

function DecisionFace({ card, fromCoach }: { card: DecisionCard; fromCoach: boolean }) {
  const t = useT();
  return (
    <div className="bd__face">
      <div className="labelrow">
        <span className={cx('M', card.priority === 'HIGH' ? 'tone-coral' : '')}>{t(`${card.priority} priority`)}</span>
        <span className="M">{fromCoach ? t('Coach recommends') : `SLM · ${card.confidence}%`}</span>
      </div>
      <h3 className="D bd__ctitle">{t(card.title)}</h3>
      <p className="bd__creason">{t(card.reason)}</p>
      <span className="M bd__owner">→ {t(card.owner)}</span>
    </div>
  );
}
