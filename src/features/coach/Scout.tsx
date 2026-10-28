import { useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { BodyLine } from '../../design/BodyLine';
import { useNavigate } from 'react-router-dom';
import { Band, Bar, Expander, Label, PillButton, RowNum, ScreenHeader, SectionHead, Segmented, Title, cx } from '../../design/primitives';
import { GenderSwitch } from '../../design/GenderSwitch';
import { PIPELINE_STAGES, PROSPECTS, TEAM_GAPS, type Prospect } from '../../data/scouting';
import type { SwipeDir } from '../../lib/swipe';
import { prospectCardId, useCurrentUser, useStore, verificationOf } from '../../state/store';
import { PILOT_ATHLETES, PILOT_DISTRICT, TEST_RESULTS } from '../../data/pilot';
import { bodyOf } from '../../data/body';
import '../pilot/pilot.css';
import { useT } from '../../i18n';
import './coachtabs.css';

type Filter = 'all' | 'rural' | 'shortlist';
const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'rural', label: 'Rural' },
  { value: 'shortlist', label: 'Shortlist' },
] as const;

type Sort = 'fit' | 'height' | 'weight' | 'age';
const SORTS = [
  { value: 'fit', label: 'Team fit' },
  { value: 'height', label: 'Tallest' },
  { value: 'weight', label: 'Heaviest' },
  { value: 'age', label: 'Youngest' },
] as const;
const SORT_KEY: Record<Sort, (p: Prospect) => number> = {
  fit: (p) => -p.teamFit,
  height: (p) => -(bodyOf(p.id)?.heightCm ?? 0),
  weight: (p) => -(bodyOf(p.id)?.weightKg ?? 0),
  age: (p) => p.age,
};

const VERDICT: Record<SwipeDir, { text: string; tone: string }> = {
  right: { text: 'Board approved · offer goes out', tone: 'tone-ok' },
  up: { text: 'Board wants more data', tone: 'tone-warn' },
  left: { text: 'Board declined', tone: 'tone-bad' },
};

const BOARD = PIPELINE_STAGES.length - 1;

export function CoachScout() {
  const user = useCurrentUser();
  const gender = useStore((s) => s.genderView);
  const stages = useStore((s) => s.prospectStage);
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('fit');
  const [open, setOpen] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const t = useT();

  const pool = PROSPECTS.filter((p) => p.gender === gender).sort((a, b) => b.teamFit - a.teamFit);
  const shown = pool
    .filter((p) => (filter === 'rural' ? p.origin === 'rural' : filter === 'shortlist' ? (stages[p.id] ?? 0) >= 1 : true))
    .sort((a, b) => SORT_KEY[sort](a) - SORT_KEY[sort](b));
  const counts = PIPELINE_STAGES.map((_, i) => pool.filter((p) => (stages[p.id] ?? 0) === i).length);
  const pair = compare.map((id) => PROSPECTS.find((p) => p.id === id)!).filter((p) => p.gender === gender);

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c.filter((x) => pool.some((p) => p.id === x)), id].slice(-2)));

  return (
    <>
      <ScreenHeader label="Talent — Track Squad U-20" initials={user?.initials ?? 'RM'}>
        <Title lines={['Scout', 'Pool.']} />
      </ScreenHeader>

      <Band rule="ink" i={2}>
        <GenderSwitch note="Separate pools" />
      </Band>

      <Band tone="panel" i={3} aria-label="Squad gaps">
        <Label>Sports SLM · what the squad lacks</Label>
        <div className="sc__gaps">
          {TEAM_GAPS[gender].map((g) => (
            <span key={g} className="sc__gap">
              {t(g)}
            </span>
          ))}
        </div>
      </Band>

      <Band i={4} flush aria-label="Ranked prospects">
        <SectionHead title="Ranked" aside={t(sort === 'fit' ? 'By team fit' : 'By body profile')} />
        <div className="sc__filter">
          <Segmented label="Filter prospects" options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        <div className="sc__filter">
          <Segmented label="Sort prospects" options={SORTS} value={sort} onChange={setSort} />
        </div>
        {shown.length === 0 ? (
          <p className="body ct__empty">{t('No one shortlisted yet. Open a prospect and tap Shortlist.')}</p>
        ) : (
          <ul className="rows" key={`${gender}-${filter}-${sort}`}>
            {shown.map((p, i) => (
              <li key={p.id} className="cascade" style={{ ['--i' as string]: i }}>
                <ProspectRow
                  p={p}
                  n={i + 1}
                  open={open === p.id}
                  onOpen={() => setOpen(open === p.id ? null : p.id)}
                  comparing={compare.includes(p.id)}
                  onCompare={() => toggleCompare(p.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </Band>

      {pair.length === 2 && <Compare a={pair[0]} b={pair[1]} />}

      <Band rule="ink" i={6} aria-label="Pipeline">
        <SectionHead title="Pipeline" aside={`${t(gender === 'men' ? 'Men' : 'Women')} · ${t('{n} prospects', { n: pool.length })}`} />
        <ol className="sc__pipe sc__pipewrap">
          {PIPELINE_STAGES.map((s, i) => (
            <li key={s} className={cx(counts[i] > 0 && 'has')}>
              <span className="D">{counts[i]}</span>
              <span className="M">{t(s)}</span>
            </li>
          ))}
        </ol>
      </Band>

      <PilotLink />
    </>
  );
}

/** The Tamil Nadu pilot group: athletics and weightlifting, ages 10 to 24. */
function PilotLink() {
  const t = useT();
  const navigate = useNavigate();
  const verified = useStore((s) => s.verified);
  const toVerify = TEST_RESULTS.filter((r) => verificationOf(r, verified) === 'self').length;
  return (
    <Band tone="cobalt" i={7} aria-label="Pilot group">
      <Label>{t('Tamil Nadu pilot · {district}', { district: PILOT_DISTRICT })}</Label>
      <p className="pb__note">
        {t('{n} athletes aged 10 to 24 in athletics and weightlifting. {v} results to verify.', { n: PILOT_ATHLETES.length, v: toVerify })}
      </p>
      <PillButton variant="white" block arrow className="ct__go" onClick={() => navigate('/coach/tests')}>
        Open pilot tests
      </PillButton>
    </Band>
  );
}

function ProspectRow({
  p,
  n,
  open,
  onOpen,
  comparing,
  onCompare,
}: {
  p: Prospect;
  n: number;
  open: boolean;
  onOpen: () => void;
  comparing: boolean;
  onCompare: () => void;
}) {
  const stage = useStore((s) => s.prospectStage[p.id] ?? 0);
  const setStage = useStore((s) => s.setProspectStage);
  const recommend = useStore((s) => s.recommendProspect);
  const verdict = useStore((s) => s.boardDecisions.find((d) => d.cardId === prospectCardId(p.id))?.dir);
  const id = `pr-${p.id}`;
  const v = verdict ? VERDICT[verdict] : null;
  const tab = open ? 0 : -1;
  const t = useT();

  return (
    <>
      <button type="button" className={cx('row sc__row', open && 'is-open')} aria-expanded={open} aria-controls={id} onClick={onOpen}>
        <RowNum n={n} />
        <span className="row__main">
          <span className="row__name">
            {p.name}
            <SportTag of={p.id} sportOnly />
            {p.origin === 'rural' && <span className="M tag tag--rural">{t('Rural')}</span>}
          </span>
          <span className="M">
            {t(p.role)} · {p.home}
          </span>
          <BodyLine of={p.id} />
          <span className={cx('M', v ? v.tone : 'tone-cobalt')}>{t(v ? v.text : stage === BOARD ? 'With the board' : PIPELINE_STAGES[stage])}</span>
        </span>
        <span className="sc__fit">
          <span className="D">{p.teamFit}</span>
          <span className="M">{t('Fit')}</span>
        </span>
      </button>
      <Expander open={open} id={id}>
        <div className="sc__detail">
          <Label>{t('SLM {n}% confident · fills {gap} · {via}', { n: p.confidence, gap: t(p.fills).toLowerCase(), via: t(p.foundVia) })}</Label>
          <div className="sc__scores">
            {(
              [
                ['Performance', p.perf],
                ['Fitness', p.fitness],
                ['Potential', p.potential],
                ['Team fit', p.teamFit],
              ] as const
            ).map(([k, val], j) => (
              <div key={k} className="sc__score">
                <span>{t(k)}</span>
                <span className="M">{val}</span>
                {open && <Bar value={val / 100} thin tone={k === 'Team fit' ? 'coral' : 'cobalt'} i={j} />}
              </div>
            ))}
          </div>
          <div className="sc__sw">
            <div>
              <Label className="tone-ok">Strengths</Label>
              <ul>
                {p.strengths.map((s) => (
                  <li key={s}>{t(s)}</li>
                ))}
              </ul>
            </div>
            <div>
              <Label className="tone-warn">Work on</Label>
              <ul>
                {p.weaknesses.map((s) => (
                  <li key={s}>{t(s)}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="sc__actions">
            {stage < BOARD && (
              <button type="button" className="pill pill--sm" aria-pressed={stage >= 1} onClick={() => setStage(p.id, stage >= 1 ? 0 : 1)} tabIndex={tab}>
                {t(stage >= 1 ? 'Shortlisted' : 'Shortlist')}
              </button>
            )}
            {stage >= 1 && stage < BOARD - 1 && (
              <button type="button" className="pill pill--sm" onClick={() => setStage(p.id, stage + 1)} tabIndex={tab}>
                {t('Move to {stage}', { stage: t(PIPELINE_STAGES[stage + 1]).toLowerCase() })}
              </button>
            )}
            <button type="button" className="pill pill--sm" aria-pressed={comparing} onClick={onCompare} tabIndex={tab}>
              {t(comparing ? 'Comparing' : 'Compare')}
            </button>
            {stage >= 1 && stage < BOARD && (
              <button type="button" className="pill pill--sm sc__rec" onClick={() => recommend(p.id)} tabIndex={tab}>
                {t('Recommend to board →')}
              </button>
            )}
          </div>
          <p className="M sc__state" role="status">
            {stage === BOARD && !v && t('Sent to the board · awaiting decision')}
          </p>
        </div>
      </Expander>
    </>
  );
}

function Compare({ a, b }: { a: Prospect; b: Prospect }) {
  const ba = bodyOf(a.id)!;
  const bb = bodyOf(b.id)!;
  // Body rows have no better side: what suits depends on the event, so they are never marked green.
  const rows: { label: string; va: number; vb: number; higher: boolean | null; unit?: string }[] = [
    { label: 'Team fit', va: a.teamFit, vb: b.teamFit, higher: true },
    { label: 'Potential', va: a.potential, vb: b.potential, higher: true },
    { label: 'Fitness', va: a.fitness, vb: b.fitness, higher: true },
    ...a.metrics
      .map((m, i) => ({ label: m.label, va: m.value, vb: b.metrics[i].value, higher: m.higherIsBetter, unit: m.unit }))
      .filter((r) => r.va > 0 && r.vb > 0),
    { label: 'Age', va: a.age, vb: b.age, higher: false },
    { label: 'Height', va: ba.heightCm, vb: bb.heightCm, higher: null, unit: 'cm' },
    { label: 'Weight', va: ba.weightKg, vb: bb.weightKg, higher: null, unit: 'kg' },
    { label: 'Arm span', va: ba.armSpanCm, vb: bb.armSpanCm, higher: null, unit: 'cm' },
  ];
  const t = useT();
  const best = (r: (typeof rows)[number], side: 'a' | 'b') => {
    if (r.va === r.vb || r.higher === null) return false;
    const aWins = r.higher ? r.va > r.vb : r.va < r.vb;
    return side === 'a' ? aWins : !aWins;
  };
  return (
    <Band tone="panel" i={5} aria-label="Compare prospects" className="sc__compare">
      <Label>Compare · better value in green</Label>
      <table>
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">{t('Measure')}</span>
            </th>
            <th scope="col">{a.name.split(' ')[0]}</th>
            <th scope="col">{b.name.split(' ')[0]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row">{t(r.label)}</th>
              <td className={cx(best(r, 'a') && 'is-best')}>{r.va}</td>
              <td className={cx(best(r, 'b') && 'is-best')}>{r.vb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Band>
  );
}
