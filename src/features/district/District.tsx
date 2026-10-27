import { useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { Band, Bar, Label, PillButton, RowNum, ScreenHeader, SectionHead, Segmented, StatStrip, Title, cx } from '../../design/primitives';
import { GenderSwitch } from '../../design/GenderSwitch';
import {
  AGE_STAGES, DISTRICT_COHORT, DISTRICT_SPORT, FLAG_AUDIT, FLAG_META, FLAG_TYPES, PILOT_SITES, PILOT_SPORTS, VERIFIED_SHARE,
  TRIAL_OUTCOMES, isMinor, pilotAthlete, resultById, stageOf, yearsOf, type TalentFlag,
} from '../../data/pilot';
import { allFlags, flagState, useAuditView, useCurrentUser, useStore, verificationOf, type FlagState } from '../../state/store';
import { AgeLine, FLAG_STATE_TEXT, FlagBadge, VerifyBadge } from '../pilot/PilotBits';
import { useT } from '../../i18n';

function Header({ lines }: { lines: [string, string] }) {
  const user = useCurrentUser();
  const t = useT();
  return (
    <ScreenHeader label={t('{district} district — Officer', { district: user?.district ?? 'Madurai' })} initials={user?.initials ?? 'SK'}>
      <Title lines={lines} />
    </ScreenHeader>
  );
}

/** Every pilot flag with where it stands. */
function useFlags() {
  const raised = useStore((s) => s.raisedFlags);
  const flagReviews = useStore((s) => s.flagReviews);
  const verified = useStore((s) => s.verified);
  const consent = useStore((s) => s.consent);
  return allFlags(raised).map((f) => ({ f, state: flagState(f, { flagReviews, verified, consent }) }));
}

type Filter = 'open' | 'decided';
const FILTERS = [
  { value: 'open', label: 'To review' },
  { value: 'decided', label: 'Decided' },
] as const;
const DECIDED: FlagState[] = ['confirmed', 'rejected'];

/* ---------- Flags ---------- */

export function DistrictFlags() {
  const t = useT();
  const flags = useFlags();
  const [filter, setFilter] = useState<Filter>('open');
  const ready = flags.filter((x) => x.state === 'ready').length;
  const held = flags.filter((x) => ['unverified', 'no-consent', 'needs-coach'].includes(x.state)).length;
  const decided = flags.filter((x) => DECIDED.includes(x.state)).length;
  const shown = flags.filter((x) => (filter === 'decided') === DECIDED.includes(x.state));
  useAuditView('Viewed flag queue', `${flags.length} athletes · performance data`);
  // Ready first, then the ones waiting on something.
  const order: FlagState[] = ['ready', 'needs-coach', 'unverified', 'no-consent', 'confirmed', 'rejected'];
  shown.sort((a, b) => order.indexOf(a.state) - order.indexOf(b.state));

  return (
    <>
      <Header lines={['Flag', 'Queue.']} />
      <Band tone="panel" i={2} aria-label="Queue summary">
        <StatStrip
          items={[
            { value: ready, label: 'Ready', tone: 'ok' },
            { value: held, label: 'Waiting', tone: 'warn' },
            { value: decided, label: 'Decided' },
          ]}
        />
        <p className="pb__note">{t('A flag opens an opportunity, such as a trial. It never labels a child as lacking talent.')}</p>
      </Band>

      <Band rule="ink" i={3}>
        <Segmented label="Show" options={FILTERS} value={filter} onChange={setFilter} />
      </Band>

      <Band i={4} flush aria-label="Flags">
        {shown.length === 0 && <p className="pb__empty">{t(filter === 'open' ? 'Nothing to review. New flags arrive after each test window.' : 'No decisions yet.')}</p>}
        {shown.map(({ f, state }) => (
          <FlagCard key={f.id} f={f} state={state} />
        ))}
      </Band>

      <Band tone="cobalt" i={5} aria-label="What you see">
        <Label>Performance data only</Label>
        <p className="pb__note">{t('District officers see test results, never health or wellness details. Low-quality results are held back until a coach verifies them.')}</p>
      </Band>
    </>
  );
}

function FlagCard({ f, state }: { f: TalentFlag; state: FlagState }) {
  const t = useT();
  const review = useStore((s) => s.reviewFlag);
  const verified = useStore((s) => s.verified);
  const a = pilotAthlete(f.athleteId);
  const r = resultById(f.resultId);
  if (!a || !r) return null;
  const s = FLAG_STATE_TEXT[state];
  return (
    <div className="pb__card">
      <div className="pb__cardhead">
        <FlagBadge type={f.type} />
        <span className={cx('M pb__state', s.tone)}>{t(s.text)}</span>
      </div>
      <span className="row__name">
        {a.name}
        <SportTag of={a.id} />
        {a.origin === 'rural' && <span className="M tag tag--rural">{t('Rural')}</span>}
      </span>
      <span className="M">
        {t(a.gender === 'men' ? 'Boy' : 'Girl')} · <AgeLine months={a.ageMonths} /> · {t(stageOf(yearsOf(a.ageMonths)).label)}
      </span>
      <span className="M">
        {t(a.sport)} · {t(a.event)} · {a.home}
      </span>
      <p className="pb__reason">{t(f.reason)}</p>
      <span className="M pb__meta">
        {t(r.test)} {r.value} · <VerifyBadge v={verificationOf(r, verified)} /> {t(r.method)}
      </span>
      {f.source === 'coach' && <span className="M tone-cobalt">{t('Raised by the coach')}</span>}
      {state === 'ready' && (
        <div className="pb__actions">
          <PillButton variant="ink" className="pill--sm" onClick={() => review(f.id, 'district', 'confirmed')}>
            Confirm trial
          </PillButton>
          <PillButton variant="outline" className="pill--sm" onClick={() => review(f.id, 'district', 'rejected')}>
            Not now
          </PillButton>
        </div>
      )}
      {(state === 'confirmed' || state === 'rejected') && (
        <div className="pb__actions">
          <PillButton variant="outline" className="pill--sm" onClick={() => review(f.id, 'district', null)}>
            Undo
          </PillButton>
        </div>
      )}
    </div>
  );
}

/* ---------- Cohorts ---------- */

const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

export function DistrictCohorts() {
  const t = useT();
  const gender = useStore((s) => s.genderView);
  const flags = useFlags();
  const cohort = DISTRICT_COHORT[gender];
  const top = Math.max(...Object.values(cohort));
  const tested = sum(cohort);
  const byType = FLAG_TYPES.map((ty) => ({ ty, n: flags.filter((x) => x.f.type === ty).length }));

  return (
    <>
      <Header lines={['District', 'Cohorts.']} />
      <Band tone="panel" i={2} aria-label="District totals">
        <StatStrip
          items={[
            { value: sum(DISTRICT_COHORT.men), label: 'Boys & men' },
            { value: sum(DISTRICT_COHORT.women), label: 'Girls & women' },
            { value: `${VERIFIED_SHARE}%`, label: 'Verified', tone: 'ok' },
          ]}
        />
      </Band>

      <Band rule="ink" i={3}>
        <GenderSwitch note="Cohorts below" />
      </Band>

      <Band i={4} aria-label="By age stage">
        <SectionHead title="By age stage" aside={t('{n} tested', { n: tested })} />
        <ul className="pb__bars" key={gender}>
          {AGE_STAGES.map((st, i) => (
            <li key={st.id}>
              <span className="M">
                {t(st.label)} · {st.ages}
              </span>
              <Bar value={cohort[st.id] / top} tone="cobalt" i={i} />
              <span className="D">{cohort[st.id]}</span>
            </li>
          ))}
        </ul>
        <p className="pb__note">{t('Benchmarks compare within six-month age bands and sex, using age in months, so early developers don’t crowd out late ones.')}</p>
      </Band>

      <Band rule="ink" i={5} aria-label="By sport">
        <SectionHead title="By sport" aside="Pilot sports" />
        <ul className="pb__bars">
          {PILOT_SPORTS.map((sp, i) => (
            <li key={sp}>
              <span className="M">{t(sp)}</span>
              <Bar value={DISTRICT_SPORT[sp][gender] / DISTRICT_SPORT.Athletics[gender]} tone={i ? 'coral' : 'cobalt'} i={i} />
              <span className="D">{DISTRICT_SPORT[sp][gender]}</span>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={6} aria-label="Flags by type">
        <SectionHead title="Flags by type" aside="This term" />
        <ul className="rows">
          {byType.map(({ ty, n }, i) => (
            <li key={ty}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{t(FLAG_META[ty].label)}</span>
                  <span className="M">{t(FLAG_META[ty].text)}</span>
                </span>
                <span className="D row__val">{n}</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="panel" i={7} aria-label="Bias audit">
        <Label>Bias audit · flags per 100 tested</Label>
        <ul className="pb__bars">
          {FLAG_AUDIT.map((x, i) => (
            <li key={x.label}>
              <span className="M">{t(x.label)}</span>
              <Bar value={x.rate / 8} tone={x.label === 'Rural' ? 'coral' : 'cobalt-light'} i={i} />
              <span className="D">{x.rate.toFixed(1)}</span>
            </li>
          ))}
        </ul>
        <p className="pb__note">{t('Rural athletes are flagged less often. Block grounds have fewer timing gates, so check testing access before reading this as talent.')}</p>
      </Band>

      <Band rule="ink" i={8} flush aria-label="Testing sites">
        <SectionHead title="Sites" aside="Share verified" />
        <ul className="rows">
          {PILOT_SITES.map((s, i) => (
            <li key={s.name}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{s.name}</span>
                  <span className="M">{t('{n} tested', { n: s.tested })}</span>
                </span>
                <span className={cx('D row__val', s.verified < 60 && 'tone-warn')}>{s.verified}%</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}

/* ---------- Trials ---------- */

export function DistrictTrials() {
  const t = useT();
  const flags = useFlags().filter((x) => x.state === 'confirmed');
  const outcomes = useStore((s) => s.trialOutcomes);
  const setOutcome = useStore((s) => s.setTrialOutcome);
  const recorded = flags.filter((x) => outcomes[x.f.id] && outcomes[x.f.id] !== 'absent');
  const selected = recorded.filter((x) => outcomes[x.f.id] === 'selected').length;
  return (
    <>
      <Header lines={['District', 'Trials.']} />
      <Band tone="cobalt" i={2} aria-label="Next trials">
        <Label>Next district trials</Label>
        <p className="D pb__stagename">15.11</p>
        <p className="pb__note">{t('Madurai Race Course stadium. Confirm invitations by 08.11 so guardians can plan travel.')}</p>
      </Band>
      <Band i={3} flush aria-label="Invitations">
        <SectionHead title="Invited" aside={t('{n} confirmed', { n: flags.length })} />
        {flags.length === 0 && <p className="pb__empty">{t('No invitations yet. Confirm flags in the queue to invite athletes.')}</p>}
        {flags.map(({ f }) => {
          const a = pilotAthlete(f.athleteId)!;
          return (
            <div className="pb__card" key={f.id}>
              <div className="pb__cardhead">
                <span className="row__name">
                  {a.name}
                  <SportTag of={a.id} />
                </span>
                <span className="M tone-ok pb__told">{t(isMinor(a.ageMonths) ? 'Guardian told' : 'Athlete told')}</span>
              </div>
              <span className="M">
                {t(FLAG_META[f.type].label)} · {a.home}
              </span>
              <Segmented label="Trial outcome" options={TRIAL_OUTCOMES} value={outcomes[f.id] ?? null} onChange={(o) => setOutcome(f.id, o)} />
            </div>
          );
        })}
      </Band>
      <Band tone="panel" i={4} aria-label="Outcomes">
        <Label>After the trials</Label>
        <StatStrip
          items={[
            { value: recorded.length, label: 'Outcomes recorded' },
            { value: selected, label: 'Hostel places', tone: 'ok' },
            { value: recorded.length ? `${Math.round((selected / recorded.length) * 100)}%` : '—', label: 'Flag precision' },
          ]}
        />
        <p className="pb__note">{t('Record each trial or hostel selection result. Outcomes refine the flag thresholds; flag precision is the share of flags a coach confirms at trial.')}</p>
      </Band>
    </>
  );
}
