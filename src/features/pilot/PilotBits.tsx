import { create } from 'zustand';
import { cx, Label } from '../../design/primitives';
import {
  FLAG_META, VERIFY_META, ageBand, stageOf, yearsOf,
  type FlagType, type PilotSport, type TestResult, type Verification,
} from '../../data/pilot';
import type { FlagState } from '../../state/store';
import { useT } from '../../i18n';
import './pilot.css';

/** A glyph as well as a colour, so status never rests on colour alone. */
const VERIFY_GLYPH: Record<Verification, string> = { self: '○', coach: '✓', video: '▶' };

export function VerifyBadge({ v }: { v: Verification }) {
  const t = useT();
  return (
    <span className={cx('M pb__badge', `pb__badge--${v}`)}>
      <span aria-hidden="true">{VERIFY_GLYPH[v]}</span> {t(VERIFY_META[v].label)}
    </span>
  );
}

export function FlagBadge({ type }: { type: FlagType }) {
  const t = useT();
  return <span className="M pb__flag">{t('{type} flag', { type: t(FLAG_META[type].label) })}</span>;
}

/** "13 y 4 m · band 13.0–13.5" */
export function AgeLine({ months }: { months: number }) {
  const t = useT();
  return <>{t('{y} y {m} m · band {band}', { y: yearsOf(months), m: months % 12, band: ageBand(months) })}</>;
}

/** The athlete's age stage and what it means for their sport and for the app. */
export function StageCard({ months, sport }: { months: number; sport: PilotSport }) {
  const t = useT();
  const st = stageOf(yearsOf(months));
  return (
    <div className="pb__stage">
      <div className="labelrow">
        <Label>Age stage</Label>
        <Label>{t('Ages {range}', { range: st.ages })}</Label>
      </div>
      <p className="D pb__stagename">{t(st.label)}</p>
      <p className="pb__stagetxt">
        <span className="M">{t(sport)}</span> {t(sport === 'Athletics' ? st.athletics : st.weightlifting)}
      </p>
      <p className="pb__stagetxt">
        <span className="M">{t('In the app')}</span> {t(st.app)}
      </p>
    </div>
  );
}

/** A result against the athlete's own last test, with how it was measured and checked. */
export function ResultLine({ r, v, showPct = true }: { r: TestResult; v: Verification; showPct?: boolean }) {
  const t = useT();
  return (
    <>
      <span className="row__name">{t(r.test)}</span>
      <span className="M">
        {r.value}
        {r.previous && <> · {t('was {v}', { v: r.previous })}</>}
        {showPct && r.pct !== undefined && <> · {t('top {n}% for age', { n: 100 - r.pct })}</>}
      </span>
      <span className="M pb__meta">
        <VerifyBadge v={v} /> {t(r.method)} · {t(r.tester)} · {r.date}
      </span>
    </>
  );
}

export const FLAG_STATE_TEXT: Record<FlagState, { text: string; tone: string }> = {
  'needs-coach': { text: 'Waiting for coach review', tone: 'tone-cobalt' },
  unverified: { text: 'Held back: result is self-entered', tone: 'tone-warn' },
  'no-consent': { text: 'Held: no guardian consent for talent review', tone: 'tone-warn' },
  ready: { text: 'Ready for district review', tone: 'tone-cobalt' },
  confirmed: { text: 'Trial invitation confirmed', tone: 'tone-ok' },
  rejected: { text: 'Not now · re-test in three months', tone: 'tone-ink' },
};

/** Which child a guardian is looking at, shared across the guardian tabs. */
export const useChildPick = create<{ id: string | null; set: (id: string) => void }>((set) => ({
  id: null,
  set: (id) => set({ id }),
}));
