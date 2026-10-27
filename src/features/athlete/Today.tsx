import { memo, useState } from 'react';
import { Band, Bar, Chevron, Expander, Label, PillButton, ScreenHeader, SectionHead, Segmented, StatStrip, Title, RowNum, cx } from '../../design/primitives';
import { TrackOval } from '../../design/TrackOval';
import {
  ATHLETE_PROFILE,
  COACH_NOTE,
  FEEL_NOTES,
  FEEL_OPTIONS,
  FEEL_READINESS,
  NEXT_MATCH,
  SESSION_STATS,
  TODAY_EXERCISES,
  type Exercise,
} from '../../data/athlete';
import { acwrTone } from '../../lib/acwr';
import { formatIN, pad2 } from '../../lib/format';
import { dietPlanFor } from '../../data/diet';
import { Link } from 'react-router-dom';
import { ARJUN_PLAN_ID } from '../../data/squad';
import { Ladder } from '../../design/Ladder';
import { ATHLETE_PATHWAY, PATHWAY_STAGES, timeTo2036 } from '../../data/mission2036';
import { useCurrentUser, useStore } from '../../state/store';
import { BandReadiness } from '../../wearables/BandReadiness';
import '../../wearables/devices.css';
import { useT } from '../../i18n';
import './today.css';
import { THIS_WEEK } from '../../data/wellness';

const FEEL_SEG = FEEL_OPTIONS.map((label, i) => ({ value: String(i), label }));

export function AthleteToday() {
  const user = useCurrentUser();
  const completed = useStore((s) => s.completed);
  const doneCount = TODAY_EXERCISES.filter((e) => completed.includes(e.id)).length;
  const left = TODAY_EXERCISES.length - doneCount;
  const t = useT();

  return (
    <>
      <ScreenHeader label="Tue 20.10 — Lane 04" initials={user?.initials ?? 'AR'}>
        <Title lines={['Track', 'Day.']} />
      </ScreenHeader>

      <CheckIn />

      <WellbeingLink />

      <Band tone="panel" i={3} aria-label="Today's session">
        <div className="labelrow">
          <Label>Session · 400 m lap</Label>
          <span className="M tone-coral" aria-live="polite">
            {left === 0 ? t('Lap complete') : t('{n} to go', { n: left })}
          </span>
        </div>
        <TrackOval done={doneCount} total={TODAY_EXERCISES.length} caption={t('Exercises logged')} />
        <StatStrip
          items={[
            { value: SESSION_STATS.loadAu, label: 'Load AU' },
            { value: SESSION_STATS.acwr.toFixed(2), label: 'ACWR', tone: acwrTone(SESSION_STATS.acwr) },
            { value: SESSION_STATS.topKmh.toFixed(1), label: 'Km/h top' },
          ]}
        />
      </Band>

      <RoadTo2036 />

      <Band rule="ink" i={4} flush aria-labelledby="work-h">
        <SectionHead title="The work" aside="Tap to log" />
        <WorkList completed={completed} />
      </Band>

      <CoachBand />

      <Band rule="ink" i={6} className="td__duo">
        <FuelCell />
        <div className="td__duocell">
          <Label>Meet · D–{NEXT_MATCH.daysTo}</Label>
          <div className="D td__big">{NEXT_MATCH.date}</div>
          <Label>{NEXT_MATCH.opponent}</Label>
          <div className="td__count" aria-label={t('Build, peak, taper, race — build phase now')}>
            {['Build', 'Peak', 'Taper', 'Race'].map((p, i) => (
              <span key={p} className={cx('td__seg', i === 0 && 'is-on')} title={t(p)} />
            ))}
          </div>
        </div>
      </Band>
    </>
  );
}

function RoadTo2036() {
  const { years, months } = timeTo2036();
  const p = ATHLETE_PATHWAY;
  const t = useT();
  return (
    <Band i={4} aria-label="Road to 2036">
      <SectionHead title="Road to 2036" aside="Dates TBC" />
      <div className="td__games">
        <span className="D td__gamesnum">
          {years}
          <small>Y</small> {pad2(months)}
          <small>M</small>
        </span>
        <Label>To the Games · India</Label>
      </div>
      <Ladder stages={PATHWAY_STAGES} current={p.stage} />
      <p className="td__journey">
        <span>
          {t('From {village}, {district}, {state}. Found at {found}.', {
            village: ATHLETE_PROFILE.village,
            district: ATHLETE_PROFILE.district,
            state: ATHLETE_PROFILE.state,
            found: t(ATHLETE_PROFILE.discovered),
          })}
        </span>
        <span className="M">{t('Benchmarked vs {who}', { who: t(ATHLETE_PROFILE.benchmark) })}</span>
      </p>
      <dl className="td__path">
        <div>
          <dt className="M">{t('Dev index')}</dt>
          <dd className="D td__pathnum">
            {p.devIndex} <span className="tone-ok td__delta">▲{p.devDelta}</span>
          </dd>
        </div>
        <div>
          <dt className="M">{t('Next gate')}</dt>
          <dd className="D td__pathnum">{p.nextGateIndex}</dd>
        </div>
        <div>
          <dt className="M">{t('Next step')}</dt>
          <dd className="td__next">{t(p.nextStep)}</dd>
        </div>
      </dl>
    </Band>
  );
}

function CheckIn() {
  const feel = useStore((s) => s.feel);
  const setFeel = useStore((s) => s.setFeel);
  const t = useT();
  return (
    <Band rule="ink" i={2} aria-label="Morning check-in">
      <div className="labelrow">
        <Label>How do you feel?</Label>
        {feel !== null && (
          <span className="M fade-in" key={feel}>
            {t('Readiness')} <strong className="td__ready">{FEEL_READINESS[feel]}</strong>
          </span>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <Segmented
          label="How do you feel this morning?"
          options={FEEL_SEG}
          value={feel === null ? null : String(feel)}
          onChange={(v) => setFeel(Number(v))}
        />
      </div>
      <p className="td__note" aria-live="polite">
        {t(feel === null ? 'Your check-in goes straight to Coach Ravi.' : FEEL_NOTES[feel])}
      </p>
      <BandReadiness athleteId="ath-arjun" feel={feel === null ? null : FEEL_READINESS[feel]} />
    </Band>
  );
}

function WorkList({ completed }: { completed: string[] }) {
  const toggle = useStore((s) => s.toggleExercise);
  return (
    <ul className="rows" id="work-h">
      {TODAY_EXERCISES.map((ex, i) => (
        <li key={ex.id}>
          <ExerciseRow ex={ex} n={i + 1} done={completed.includes(ex.id)} onToggle={toggle} />
        </li>
      ))}
    </ul>
  );
}

const ExerciseRow = memo(function ExerciseRow({
  ex,
  n,
  done,
  onToggle,
}: {
  ex: Exercise;
  n: number;
  done: boolean;
  onToggle: (id: string) => void;
}) {
  const t = useT();
  return (
    <button type="button" className={cx('row td__ex', done && 'is-done')} aria-pressed={done} onClick={() => onToggle(ex.id)}>
      <span className="td__numcell" aria-hidden="true">
        <span className="td__num">
          <RowNum n={n} />
        </span>
        <svg className="td__check" viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="12" fill="var(--cobalt)" />
          <path d="M7 12.5 10.5 16 17 8.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="row__main">
        <span className="row__name">
          {t(ex.name)}
          <span className="td__strike" aria-hidden="true" />
        </span>
        <span className="M">{t(ex.meta)}</span>
      </span>
      <span className="D row__val">{t(ex.dose)}</span>
      <span className="sr-only">{t(done ? 'logged' : 'not logged')}</span>
    </button>
  );
});

function CoachBand() {
  const [open, setOpen] = useState(false);
  const approved = useStore((s) => s.appliedPlans.includes(ARJUN_PLAN_ID));
  const asked = useStore((s) => s.planRequests.includes(ARJUN_PLAN_ID));
  const requestPlan = useStore((s) => s.requestPlan);
  const t = useT();
  return (
    <Band tone="cobalt" i={5} aria-label="Coach update">
      <div className="labelrow">
        <Label>{approved ? t('Coach {c} · Approved', { c: COACH_NOTE.coach }) : t('SLM suggestion · awaiting Coach {c}', { c: COACH_NOTE.coach })}</Label>
        {!approved && <span className="pulse" style={{ color: '#fff' }} aria-hidden="true" />}
      </div>
      <p className="td__coach" aria-live="polite">
        {t(approved ? COACH_NOTE.text : 'Your progress points to a third endurance session. Coach Ravi reviews it next.')}
      </p>
      {!approved && (
        <div className="td__ask">
          {asked ? (
            <span className="M td__asked" role="status">
              {t('Sent to Coach {c} · waiting for approval', { c: COACH_NOTE.coach })}
            </span>
          ) : (
            <PillButton variant="white" arrow onClick={() => requestPlan(ARJUN_PLAN_ID)}>
              Ask coach to approve
            </PillButton>
          )}
        </div>
      )}
      <button
        type="button"
        className="textbtn td__why"
        aria-expanded={open}
        aria-controls="coach-why"
        onClick={() => setOpen((o) => !o)}
      >
        {t('Why this?')} <Chevron />
      </button>
      <Expander open={open} id="coach-why">
        <ul className="td__factors">
          {COACH_NOTE.factors.map((f, i) => (
            <li key={f.label}>
              <div className="labelrow">
                <span className="td__flabel">{t(f.label)}</span>
                <span className="D td__fw">{f.weight}%</span>
              </div>
              {open && <Bar value={f.weight / 100} tone="white" thin i={i} />}
            </li>
          ))}
        </ul>
        <p className="M td__fine">
          {t('Suggested by the Sports SLM.')} {t(approved ? 'Your coach approved it.' : 'A person makes the final decision.')}
        </p>
      </Expander>
    </Band>
  );
}

function FuelCell() {
  const user = useCurrentUser();
  const logged = useStore((s) => s.mealsLogged);
  const plan = dietPlanFor(user?.id ?? '');
  if (!plan) {
    return (
      <div className="td__duocell">
        <Label>Fuel · kcal</Label>
        <div className="D td__big">—</div>
        <Label>Plan arriving from the nutrition team</Label>
      </div>
    );
  }
  const kcal = plan.meals.filter((m) => logged.includes(m.id)).reduce((a, m) => a + m.kcal, 0);
  return (
    <Link to="/athlete/fuel" className="td__duocell press">
      <Label>Fuel · kcal{plan.source === 'sample' && ' · sample'}</Label>
      <div className="D td__big">{formatIN(kcal)}</div>
      <Label>of {formatIN(plan.targets.kcal)}</Label>
      <Bar value={kcal / plan.targets.kcal} tone="coral" i={6} />
    </Link>
  );
}

/** The weekly wellbeing check-in and injury log live on their own private screen. */
function WellbeingLink() {
  const t = useT();
  const user = useCurrentUser();
  const done = useStore((s) => s.wellness.some((w) => w.userId === user?.id && w.week === THIS_WEEK));
  return (
    <Band rule="ink" i={2} aria-label="Wellbeing">
      <div className="labelrow">
        <Label>{t('Wellbeing · {week}', { week: THIS_WEEK })}</Label>
        <span className={cx('M', done ? 'tone-ok' : 'tone-warn')}>{t(done ? 'Checked in' : 'Due this week')}</span>
      </div>
      <Link className="pill pill--outline pill--block td__wb" to="/athlete/wellbeing">
        <span>{t('Weekly check-in & injury log')}</span>
        <span className="pill__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </Band>
  );
}
