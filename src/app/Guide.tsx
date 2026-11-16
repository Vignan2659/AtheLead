import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROLE_META, type Role } from '../data/users';
import { Icon } from '../design/Icon';
import { Label, cx } from '../design/primitives';
import { useLang, useT } from '../i18n';
import { CAUSE, STEPS, YOUR_PART, stepIndex } from './steps';
import './guide.css';

const HIDE_KEY = 'athelead.guide.hidden';
const readHidden = (role: Role) => {
  try {
    return (localStorage.getItem(HIDE_KEY) ?? '').split(',').includes(role);
  } catch {
    return false;
  }
};
const writeHidden = (role: Role, hidden: boolean) => {
  try {
    const set = new Set((localStorage.getItem(HIDE_KEY) ?? '').split(',').filter(Boolean));
    if (hidden) set.add(role);
    else set.delete(role);
    localStorage.setItem(HIDE_KEY, [...set].join(','));
  } catch {
    /* storage blocked — the guide just stays open */
  }
};

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Reads the steps aloud in the app's language, for people who read little. */
function Listen({ text }: { text: string }) {
  const t = useT();
  const lang = useLang((s) => s.lang);
  const [on, setOn] = useState(false);
  useEffect(() => () => (canSpeak() ? window.speechSynthesis.cancel() : undefined), []);
  if (!canSpeak()) return null;
  const toggle = () => {
    window.speechSynthesis.cancel();
    if (on) return setOn(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
    u.rate = 0.9;
    u.onend = u.onerror = () => setOn(false);
    window.speechSynthesis.speak(u);
    setOn(true);
  };
  return (
    <button type="button" className="pill pill--sm guide__listen" aria-pressed={on} onClick={toggle}>
      <Icon name={on ? 'stop' : 'speaker'} />
      <span>{t(on ? 'Stop' : 'Listen')}</span>
    </button>
  );
}

/**
 * The start of every role's home: why the app exists, what this person's part is, and their
 * screens as numbered picture tiles in the order they are used.
 */
export function RoleGuide({ role }: { role: Role }) {
  const t = useT();
  const { hash, pathname } = useLocation();
  const [hidden, setHidden] = useState(() => readHidden(role));
  const ref = useRef<HTMLElement>(null);
  const steps = STEPS[role];
  const here = stepIndex(role, pathname);

  // "All steps" on any screen lands here with the guide open.
  useEffect(() => {
    if (hash !== '#steps') return;
    setHidden(false);
    ref.current?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const toggle = () => {
    writeHidden(role, !hidden);
    setHidden(!hidden);
  };
  const spoken = [t(CAUSE), t(YOUR_PART[role]), ...steps.map((s, i) => `${t('Step {n}', { n: i + 1 })}. ${t(s.title)}. ${t(s.text)}`)].join(' ');

  return (
    <section className="band guide" id="steps" ref={ref} aria-label={t('How to use this app')}>
      <div className="guide__head">
        <Label>Why AtheLead</Label>
        <button type="button" className="M guide__toggle" aria-expanded={!hidden} onClick={toggle}>
          {t(hidden ? 'Show steps' : 'Hide steps')}
        </button>
      </div>
      <p className="guide__cause">{t(CAUSE)}</p>
      {!hidden && (
        <>
          <p className="guide__part">{t(YOUR_PART[role])}</p>
          <div className="guide__head guide__head--steps">
            <h2 className="D guide__title">{t('Your steps')}</h2>
            <Listen text={spoken} />
          </div>
          <ol className="guide__steps">
            {steps.map((s, i) => (
              <li key={s.path}>
                <Link to={`/${role}/${s.path}`} className={cx('guide__step', i === here && 'is-here')} aria-current={i === here ? 'step' : undefined}>
                  <span className="guide__n D">{i + 1}</span>
                  <Icon name={s.icon} className="guide__icon" />
                  <span className="guide__name">{t(s.title)}</span>
                  <span className="guide__text">{t(s.text)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

/** A thin strip above every screen: which step this is, and a way back to all of them. */
export function StepStrip({ role }: { role: Role }) {
  const t = useT();
  const { pathname } = useLocation();
  const steps = STEPS[role];
  const i = stepIndex(role, pathname);
  if (i < 0) return null;
  return (
    <div className="steps">
      <ol className="steps__dots" aria-hidden="true">
        {steps.map((s, j) => (
          <li key={s.path} className={cx(j < i && 'is-done', j === i && 'is-here')} />
        ))}
      </ol>
      <div className="steps__row">
        <span className="M steps__label">
          <Icon name={steps[i].icon} className="steps__icon" />
          {t('Step {n} of {m}', { n: i + 1, m: steps.length })} · {t(steps[i].title)}
        </span>
        <Link to={`${ROLE_META[role].home}#steps`} className="M steps__all">
          {t('All steps')}
        </Link>
      </div>
    </div>
  );
}

/** At the foot of every step: one big button to the next one, so the app reads start to finish. */
export function NextStep({ role }: { role: Role }) {
  const t = useT();
  const { pathname } = useLocation();
  const steps = STEPS[role];
  const i = stepIndex(role, pathname);
  if (i < 0) return null;
  const last = i === steps.length - 1;
  const next = steps[last ? 0 : i + 1];
  return (
    <nav className="band nextstep" aria-label={t('Next step')}>
      <Link to={`/${role}/${next.path}`} className="nextstep__go">
        <span className="nextstep__n D">{last ? 1 : i + 2}</span>
        <Icon name={next.icon} className="nextstep__icon" />
        <span className="nextstep__main">
          <span className="M">{t(last ? 'Back to step 1' : 'Next step')}</span>
          <span className="nextstep__name">{t(next.title)}</span>
        </span>
        <span className="nextstep__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </nav>
  );
}
