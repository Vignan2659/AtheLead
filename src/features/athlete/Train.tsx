import { memo, useMemo, useState, type CSSProperties } from 'react';
import { Band, Bar, Chevron, Expander, Label, RowNum, ScreenHeader, SectionHead, StatStrip, Title, cx } from '../../design/primitives';
import { TODAY_EXERCISES } from '../../data/athlete';
import { EXERCISE_DETAIL, ROUTINES, TEMPO_DAY, TEMPO_RUN, TODAY_INDEX, WEEK, WEEK_SUMMARY, type Session } from '../../data/training';
import { ARJUN_PLAN_ID } from '../../data/squad';
import { FOURTEEN_DAY_PLAN } from '../../data/fixtures';
import { formatIN, pad2 } from '../../lib/format';
import { formatAcwr } from '../../lib/acwr';
import { assignmentsFor, useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import { DrillsLink } from './Drills';
import './train.css';

interface DaySession extends Session {
  isNew?: boolean;
}

const BASE_LOAD = WEEK.flatMap((d) => d.sessions).reduce((a, s) => a + s.loadAu, 0);
const RPE = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
const RPE_WORDS = ['Very easy', 'Easy', 'Easy', 'Moderate', 'Moderate', 'Hard', 'Hard', 'Very hard', 'Very hard', 'Max'];

export function AthleteTrain() {
  const user = useCurrentUser();
  const tempo = useStore((s) => s.appliedPlans.includes(ARJUN_PLAN_ID));
  const assignments = useStore((s) => s.assignments);
  const planLive = useStore((s) => s.fixturePlanApplied);
  const [day, setDay] = useState(TODAY_INDEX);
  const t = useT();

  // The base week, plus the coach's approved changes and assigned routines.
  const week = useMemo(() => {
    const mine = assignmentsFor(assignments, user?.id ?? null);
    return WEEK.map((d, i) => {
      const sessions: DaySession[] = [...d.sessions];
      if (tempo && i === TEMPO_DAY) sessions.push({ ...TEMPO_RUN, isNew: true });
      for (const a of mine.filter((x) => x.day === i)) {
        const r = ROUTINES.find((x) => x.id === a.routineId);
        if (r)
          sessions.push({
            id: a.id,
            title: r.name,
            meta: `${r.dose}${r.noEquipment ? ' · no equipment' : ''}`,
            minutes: r.minutes,
            loadAu: r.minutes * 5,
            kind: 'gym',
            source: 'coach',
            isNew: true,
          });
      }
      return { ...d, sessions };
    });
  }, [tempo, assignments, user?.id]);

  const all = week.flatMap((d) => d.sessions);
  // Extra sessions raise this week's acute load against the same chronic base.
  const load = all.reduce((a, s) => a + s.loadAu, 0);
  const acwr = WEEK_SUMMARY.acwr * (load / BASE_LOAD);
  const minutes = all.reduce((a, s) => a + s.minutes, 0);
  const sel = week[day];

  return (
    <>
      <ScreenHeader label="Week 19.10 – 25.10" initials={user?.initials ?? 'AR'}>
        <Title lines={['This', 'Week.']} />
      </ScreenHeader>

      <Band rule="ink" i={2} className="tr__weekband">
        <div className="tr__week" role="group" aria-label={t('Days of the week')} style={{ '--d': day } as CSSProperties}>
          <span className="tr__thumb" aria-hidden="true" />
          {week.map((d, i) => (
            <button
              key={d.day}
              type="button"
              aria-pressed={i === day}
              aria-controls="tr-day"
              className={cx('tr__day', d.status === 'done' && 'is-done', i === TODAY_INDEX && 'is-today')}
              onClick={() => setDay(i)}
            >
              <span className="M">{t(d.day)}</span>
              <span className="D tr__date">{d.date.slice(0, 2)}</span>
              <span className="tr__dots" aria-hidden="true">
                {d.sessions.map((s) => (
                  <span key={s.id} className={cx('tr__dot', s.isNew && 'is-new')} />
                ))}
              </span>
              <span className="sr-only">
                {d.sessions.length ? t('{n} sessions', { n: d.sessions.length }) : t('rest day')}
                {i === TODAY_INDEX && `, ${t('today')}`}
              </span>
            </button>
          ))}
        </div>
      </Band>

      <Band rule="rule" i={3}>
        <StatStrip
          items={[
            { value: pad2(all.length), label: 'Sessions' },
            { value: formatIN(minutes), label: 'Minutes' },
            { value: formatAcwr(acwr), label: 'ACWR', tone: acwr > 1.3 ? 'bad' : 'ok' },
          ]}
        />
      </Band>

      <DrillsLink to="/athlete/drills" i={3} />

      {planLive && (
        <Band tone="panel" i={3} aria-label="Tournament plan">
          <div className="labelrow">
            <Label>Nationals plan · from Coach Ravi</Label>
            <span className="M tone-coral">{t('Live')}</span>
          </div>
          <ol className="tr__phases">
            {FOURTEEN_DAY_PLAN.phases.map((p, i) => (
              <li key={p.name} className={cx(i === 0 && 'is-now')}>
                <span className="D tr__phase">{t(p.name)}</span>
                <span className="M">{p.dates}</span>
              </li>
            ))}
          </ol>
        </Band>
      )}

      <Band i={4} flush aria-labelledby="tr-dayhead">
        <div id="tr-day" key={day} className="tr__panel" aria-live="polite">
          <div className="sechead">
            <h2 className="D sectitle" id="tr-dayhead">
              {t(sel.day)} {sel.date}
            </h2>
            <Label>{day === TODAY_INDEX ? 'Today' : sel.status === 'done' ? 'Done' : 'Planned'}</Label>
          </div>
          {sel.sessions.length === 0 ? (
            <p className="tr__rest body">{t('Rest day. Sleep in, walk, eat well. Recovery is training too.')}</p>
          ) : (
            <ul className="rows">
              {sel.sessions.map((s, i) => (
                <li key={s.id} className="cascade" style={{ ['--i' as string]: i }}>
                  <SessionRow s={s} n={i + 1} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Band>

      {day === TODAY_INDEX && <TodayDetail />}
    </>
  );
}

const SessionRow = memo(function SessionRow({ s, n }: { s: DaySession; n: number }) {
  const t = useT();
  return (
    <div className={cx('row tr__session', s.isNew && 'is-new')}>
      <RowNum n={n} />
      <span className="row__main">
        <span className="row__name">
          {t(s.title)}
          {s.isNew && <span className="M tag tag--new">{t('New')}</span>}
        </span>
        <span className="M">{t(s.meta)}</span>
        <SourceBadge source={s.source} />
      </span>
      <span className="D row__val">
        {s.minutes}
        <span className="M tr__unit">{t('min')}</span>
      </span>
    </div>
  );
});

export function SourceBadge({ source }: { source: 'coach' | 'slm' }) {
  const t = useT();
  return (
    <span className={cx('M tr__badge', source === 'coach' ? 'is-coach' : 'is-ai')}>
      {t(source === 'coach' ? 'Coach-approved' : 'SLM suggestion')}
    </span>
  );
}

/** Today's exercises with full detail, and the post-session RPE log. */
function TodayDetail() {
  const [open, setOpen] = useState<string | null>(null);
  const [rpe, setRpe] = useState<string | null>(null);
  const completed = useStore((s) => s.completed);
  const toggle = useStore((s) => s.toggleExercise);
  const t = useT();

  return (
    <>
      <Band rule="ink" i={5} flush aria-label="Today's exercises">
        <SectionHead title="Exercises" aside="Tap for detail" />
        <ul className="rows">
          {TODAY_EXERCISES.map((ex, i) => {
            const d = EXERCISE_DETAIL[ex.id];
            const isOpen = open === ex.id;
            const done = completed.includes(ex.id);
            return (
              <li key={ex.id}>
                <button
                  type="button"
                  className={cx('row tr__ex', done && 'is-done')}
                  aria-expanded={isOpen}
                  aria-controls={`ex-${ex.id}`}
                  onClick={() => setOpen(isOpen ? null : ex.id)}
                >
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(ex.name)}</span>
                    <span className="M">
                      {t(ex.meta)}
                      {done && ` · ${t('logged')}`}
                    </span>
                  </span>
                  <span className="tr__exend">
                    <span className="D row__val">{t(ex.dose)}</span>
                    <Chevron />
                  </span>
                </button>
                <Expander open={isOpen} id={`ex-${ex.id}`}>
                  <div className="tr__detail">
                    <SourceBadge source={d.source} />
                    <p className="body">{t(d.relevance)}</p>
                    <dl className="tr__dose">
                      <div>
                        <dt className="M">{t('Sets')}</dt>
                        <dd className="D">{d.sets}</dd>
                      </div>
                      <div>
                        <dt className="M">{t('Reps')}</dt>
                        <dd>{t(d.reps)}</dd>
                      </div>
                      <div>
                        <dt className="M">{t('Rest')}</dt>
                        <dd>{t(d.rest)}</dd>
                      </div>
                      <div>
                        <dt className="M">{t('Level')}</dt>
                        <dd>{t(d.difficulty)}</dd>
                      </div>
                    </dl>
                    <p className="tr__muscles">
                      <Label>Targets</Label> {d.targets.map((x) => t(x)).join(' · ')}
                    </p>
                    <p className="tr__safety">
                      <Label className="tone-coral">Safety</Label> {t(d.safety)}
                    </p>
                    <Label>Why this</Label>
                    <ul className="tr__why">
                      {d.why.map((f, j) => (
                        <li key={f.label}>
                          <div className="labelrow">
                            <span>{t(f.label)}</span>
                            <span className="M">{f.weight}%</span>
                          </div>
                          {isOpen && <Bar value={f.weight / 100} thin i={j} />}
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="pill pill--sm" aria-pressed={done} onClick={() => toggle(ex.id)} tabIndex={isOpen ? 0 : -1}>
                      {t(done ? 'Logged' : 'Log as done')}
                    </button>
                  </div>
                </Expander>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band tone="panel" i={6} aria-label="Session effort">
        <Label>After the session · RPE</Label>
        <h2 className="D tr__rpeq">{t('How hard was it?')}</h2>
        <div className="tr__rpe" role="group" aria-label={t('Rate of perceived exertion, 1 to 10')}>
          {RPE.map((o) => (
            <button key={o.value} type="button" className="tr__rpebtn D" aria-pressed={rpe === o.value} onClick={() => setRpe(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
        <p className="tr__rpeout" aria-live="polite">
          {rpe ? (
            <>
              <strong>{t(RPE_WORDS[Number(rpe) - 1])}.</strong>{' '}
              {t('Session load {n} AU (RPE × 85 min). Shared with Coach Ravi.', { n: formatIN(Number(rpe) * 85) })}
            </>
          ) : (
            <span className="M">{t('Log effort so your workload stays accurate')}</span>
          )}
        </p>
      </Band>
    </>
  );
}
