import { useState } from 'react';
import { Band, Chevron, Expander, Label, PillButton, RowNum, ScreenHeader, SectionHead, Segmented, Title, cx } from '../../design/primitives';
import { LineChart } from '../../design/Charts';
import {
  BODY_PARTS, HELPLINES, SEVERITIES, THIS_WEEK, WELLNESS_CONTENT, WELLNESS_HISTORY, WELLNESS_ITEMS, WELLNESS_WEEKS,
  needsReferral, wellnessScore, type BodyPart, type Severity,
} from '../../data/wellness';
import { useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import '../pilot/pilot.css';

const SCALE = ['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }));

/** Weekly wellbeing check-in, own trend, short exercises, helpline, and the injury log. */
export function AthleteWellbeing() {
  const user = useCurrentUser();
  const t = useT();
  const log = useStore((s) => s.wellness);
  const submit = useStore((s) => s.submitWellness);
  const mine = log.find((w) => w.userId === user?.id && w.week === THIS_WEEK);
  const [answers, setAnswers] = useState<(number | null)[]>(() => mine?.answers ?? WELLNESS_ITEMS.map(() => null));
  const [editing, setEditing] = useState(!mine);
  const [open, setOpen] = useState<string | null>(null);
  const ready = answers.every((a) => a !== null);

  const history = mine ? [...WELLNESS_HISTORY, wellnessScore(mine.answers)] : WELLNESS_HISTORY;
  const weeks = mine ? [...WELLNESS_WEEKS, THIS_WEEK] : WELLNESS_WEEKS;

  return (
    <>
      <ScreenHeader label="Wellbeing — private to you" initials={user?.initials ?? 'AR'}>
        <Title lines={['Feel', 'Good.']} />
      </ScreenHeader>

      <Band rule="ink" i={2} aria-label="Weekly check-in">
        <div className="labelrow">
          <Label>{t('Weekly check-in · {week}', { week: THIS_WEEK })}</Label>
          <Label>{t('{n} questions', { n: WELLNESS_ITEMS.length })}</Label>
        </div>
        {editing ? (
          <>
            {WELLNESS_ITEMS.map((q, i) => (
              <div className="wb__q" key={q.id}>
                <p className="pb__reason">{t(q.question)}</p>
                <Segmented
                  label={q.question}
                  options={SCALE}
                  value={answers[i] === null ? null : String(answers[i])}
                  onChange={(v) => setAnswers((a) => a.map((x, k) => (k === i ? Number(v) : x)))}
                />
                <div className="labelrow wb__ends">
                  <span className="M">1 · {t(q.low)}</span>
                  <span className="M">5 · {t(q.high)}</span>
                </div>
              </div>
            ))}
            <PillButton
              variant="coral"
              block
              arrow
              className="ct__go"
              disabled={!ready}
              onClick={() => {
                submit(answers as number[]);
                setEditing(false);
              }}
            >
              Save check-in
            </PillButton>
          </>
        ) : (
          <>
            <p className="pb__note">
              {t(mine && needsReferral(mine.answers)
                ? 'Thanks for being honest. Coach Ravi will check in with you in person. You don’t have to explain anything you don’t want to.'
                : 'Saved. Thanks for checking in.')}
            </p>
            <PillButton variant="outline" className="pill--sm ct__go" onClick={() => setEditing(true)}>
              Change answers
            </PillButton>
          </>
        )}
        <p className="pb__note tone-ink">{t('Only you see your answers. Your coach sees a summary and is alerted if you may need support. Answers are never shared with selectors.')}</p>
      </Band>

      <Band i={3} aria-label="Your trend">
        <SectionHead title="Trend" aside="Out of 5 · weekly" />
        <LineChart key={history.length} values={history} labels={weeks} format={(v) => v.toFixed(1)} label={t('Wellbeing trend')} />
      </Band>

      <Band rule="ink" i={4} flush aria-label="Short exercises">
        <SectionHead title="Try this" aside="Reviewed by a psychologist" />
        <ul className="rows">
          {WELLNESS_CONTENT.map((c, i) => {
            const on = open === c.id;
            return (
              <li key={c.id}>
                <button type="button" className="row" aria-expanded={on} aria-controls={`wb-${c.id}`} onClick={() => setOpen(on ? null : c.id)}>
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(c.title)}</span>
                    <span className="M">{t('{n} min', { n: c.minutes })}</span>
                  </span>
                  <Chevron />
                </button>
                <Expander open={on} id={`wb-${c.id}`}>
                  <ol className="wb__steps">
                    {c.steps.map((st) => (
                      <li key={st}>{t(st)}</li>
                    ))}
                  </ol>
                </Expander>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band tone="cobalt" i={5} aria-label="Need to talk">
        <Label>Need to talk to someone?</Label>
        {HELPLINES.map((h) => (
          <p key={h.number} className="pb__note">
            <span className="D wb__num">{h.number}</span> {t(h.name)} · {t(h.note)}
          </p>
        ))}
        <p className="pb__note">{t('AtheLead is not a crisis service and does not diagnose. If you are in danger now, call 112.')}</p>
      </Band>

      <InjuryLog />
    </>
  );
}

function InjuryLog() {
  const t = useT();
  const user = useCurrentUser();
  const injuries = useStore((s) => s.injuries).filter((x) => x.userId === user?.id);
  const logInjury = useStore((s) => s.logInjury);
  const [part, setPart] = useState<BodyPart | null>(null);
  const [severity, setSeverity] = useState<Severity | null>(null);
  return (
    <Band rule="ink" i={6} aria-label="Injury log">
      <SectionHead title="Injury log" aside="Goes to your coach" />
      <div className="ct__chips">
        {BODY_PARTS.map((p) => (
          <button key={p} type="button" className="pill pill--sm slm__chip" aria-pressed={part === p} onClick={() => setPart(p)}>
            {t(p)}
          </button>
        ))}
      </div>
      <div className="wb__q">
        <Segmented label="Severity" options={SEVERITIES} value={severity} onChange={setSeverity} />
      </div>
      <PillButton
        variant="ink"
        block
        className="ct__go"
        disabled={!part || !severity}
        onClick={() => {
          if (!part || !severity) return;
          logInjury(part, severity);
          setPart(null);
          setSeverity(null);
        }}
      >
        Log injury
      </PillButton>
      {injuries.length > 0 && (
        <ul className="pb__list">
          {injuries.map((x) => (
            <li key={x.id}>
              <span className="row__name">{t(x.part)}</span>
              <span className={cx('M', x.severity === 'severe' ? 'tone-bad' : 'tone-warn')}>
                {t(SEVERITIES.find((s) => s.value === x.severity)!.label)} ·{' '}
                {new Date(x.at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' }).replace('/', '.')} · {t('Coach told')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Band>
  );
}
