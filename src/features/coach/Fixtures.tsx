import { useEffect, useRef, useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { Band, Label, PillButton, RowNum, ScreenHeader, SectionHead, Title, cx } from '../../design/primitives';
import { CALENDAR, FOURTEEN_DAY_PLAN, READINESS_ALERTS, STATE_LABEL, TOURNAMENTS, type CalDay, type DayState } from '../../data/fixtures';
import { NEXT_MATCH } from '../../data/athlete';
import { pad2 } from '../../lib/format';
import { prefersReducedMotion } from '../../lib/motion';
import { useCurrentUser, useStore } from '../../state/store';
import { useLang, useT } from '../../i18n';
import './coachtabs.css';

const LEGEND: DayState[] = ['build', 'peak', 'taper', 'key', 'travel', 'match', 'rest'];
const GEN_STEPS = ['Reading fixtures', 'Checking squad workload', 'Planning load and recovery'];

/** Narrow weekday initials (M T W… / தி செ பு…) and short month names from Intl, in the reader's language. */
function useCalendarNames() {
  const lang = useLang((s) => s.lang);
  const locale = lang === 'ta' ? 'ta-IN' : 'en-IN';
  const dow = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2026, 9, 19 + i)));
  const month = (m: number) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2026, m - 1, 1));
  return { dow, month };
}

const dateKey = (c: CalDay) => `${pad2(c.d)}.${c.month}`;

export function CoachFixtures() {
  const user = useCurrentUser();
  const [sel, setSel] = useState<string>('20.10');
  const day = CALENDAR.find((c) => dateKey(c) === sel);
  const t = useT();
  const { dow, month } = useCalendarNames();
  const stateLabel = (s: DayState) => t(STATE_LABEL[s]);

  return (
    <>
      <ScreenHeader label="Meets — Track Squad U-20" initials={user?.initials ?? 'RM'}>
        <Title lines={['Race', 'Days.']} />
      </ScreenHeader>

      <Band tone="panel" i={2} aria-label="Next match">
        <div className="labelrow">
          <Label>First race · {NEXT_MATCH.date} · 09:30</Label>
          <span className="M tone-coral">Bhubaneswar</span>
        </div>
        <div className="fx__count">
          <span className="D fx__days">{pad2(NEXT_MATCH.daysTo)}</span>
          <p className="fx__vs">
            {t('days to')}
            <br />
            {t(NEXT_MATCH.opponent)}
          </p>
        </div>
      </Band>

      {TOURNAMENTS.map((tn, ti) => (
        <Band key={tn.id} rule="ink" i={3 + ti} flush aria-label={tn.name}>
          <SectionHead title={tn.city} aside={tn.dates} />
          <div className="fx__tn">
            <p className="fx__tnname">{t(tn.name)}</p>
            {tn.travel && <Label>Travel {tn.travel}</Label>}
          </div>
          <ul className="rows">
            {tn.matches.map((m, i) => (
              <li key={m.id}>
                <div className="row fx__match">
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(m.opponent)}</span>
                    <span className="M">
                      {t(m.stage)} · {m.time}
                    </span>
                  </span>
                  <span className="D row__val">{m.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </Band>
      ))}

      <Band rule="ink" i={5} aria-label="Calendar">
        <SectionHead title="Calendar" aside="19.10 – 15.11" />
        <div className="fx__cal" role="group" aria-label={t('Four weeks to the Nationals')}>
          {dow.map((d, i) => (
            <span key={i} className="M fx__dow" aria-hidden="true">
              {d}
            </span>
          ))}
          {CALENDAR.map((c) => {
            const k = dateKey(c);
            return (
              <button
                key={k}
                type="button"
                className={cx('fx__cell', `st-${c.state}`, k === '20.10' && 'is-today')}
                aria-pressed={k === sel}
                aria-label={`${c.d} ${month(c.month)}: ${stateLabel(c.state)}${c.note ? `, ${t(c.note)}` : ''}`}
                onClick={() => setSel(k)}
              >
                {c.d}
              </button>
            );
          })}
        </div>
        <p className="fx__note" aria-live="polite">
          {day && (
            <>
              {day.d} {month(day.month)} · {stateLabel(day.state)}
              {day.note && ` · ${t(day.note)}`}
              {sel === '20.10' && ` · ${t('today')}`}
            </>
          )}
        </p>
        <ul className="fx__legend" aria-label={t('Legend')}>
          {LEGEND.map((s) => (
            <li key={s} className="M">
              <span className={cx('fx__sw', `st-${s}`)} aria-hidden="true" />
              {stateLabel(s)}
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={6} flush aria-label="Readiness alerts">
        <SectionHead title="Before 03.11" aside="Readiness" />
        <ul className="rows">
          {READINESS_ALERTS.map((a, i) => (
            <li key={a.name}>
              <div className="row fx__alert">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className={cx('row__name', `tone-${a.tone}`)}>
                    {a.name}
                    <SportTag of={a.name} />
                  </span>
                  <span className="body">{t(a.text)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <PlanGenerator />
    </>
  );
}

function PlanGenerator() {
  const applied = useStore((s) => s.fixturePlanApplied);
  const apply = useStore((s) => s.applyFixturePlan);
  const [step, setStep] = useState(applied ? GEN_STEPS.length : -1);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const generate = () => {
    const ms = prefersReducedMotion() ? 0 : 380;
    setStep(0);
    for (let i = 1; i <= GEN_STEPS.length; i++) timers.current.push(window.setTimeout(() => setStep(i), i * ms));
  };
  const ready = step >= GEN_STEPS.length;
  const p = FOURTEEN_DAY_PLAN;
  const t = useT();

  return (
    <Band tone="cobalt" i={7} aria-label="14-day plan">
      <div className="labelrow">
        <Label>Sports SLM · U-20 Nationals</Label>
        {ready && <Label>{p.confidence}% confident</Label>}
      </div>
      <h2 className="D sq__slmtitle">{t('14-day plan')}</h2>
      {step < 0 && (
        <>
          <p className="sq__reason">{t("Build, peak and taper around the squad's workload, travel and the Bhubaneswar humidity.")}</p>
          <div className="ct__go">
            <PillButton variant="white" block arrow onClick={generate}>
              Generate 14-day plan
            </PillButton>
          </div>
        </>
      )}
      {step >= 0 && !ready && (
        <div className="fx__gen" role="status">
          {GEN_STEPS.map((s, i) => (
            <span key={s} className={cx('M slm__step', i <= step && 'is-on', i < step && 'is-done')} style={{ color: '#fff' }}>
              {t(s)}
            </span>
          ))}
        </div>
      )}
      {ready && (
        <div className="fx__plan">
          <ol className="fx__phases">
            {p.phases.map((ph) => (
              <li key={ph.name}>
                <span className="D">{t(ph.name)}</span>
                <span className="M">{ph.dates}</span>
                <p>{t(ph.focus)}</p>
              </li>
            ))}
          </ol>
          <div className="fx__blocks">
            {p.blocks.map((b) => (
              <div key={b.heading}>
                <Label>{b.heading}</Label>
                <ul>
                  {b.items.map((it) => (
                    <li key={it}>{t(it)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {applied ? (
            <p className="sq__donetxt" role="status">
              {t("Applied · shared with the men's squad. Arjun sees it in his week.")}
            </p>
          ) : (
            <PillButton variant="white" block arrow onClick={apply}>
              Apply and share with squad
            </PillButton>
          )}
        </div>
      )}
    </Band>
  );
}
