import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Band, Label, RowNum, ScreenHeader, SectionHead, Title, cx, stagger } from '../design/primitives';
import { ROLE_META, type SlmRole } from '../data/users';
import { useCurrentUser } from '../state/store';
import { TABS } from '../app/nav';
import { DATA_SOURCES, SCOPE } from './sources';
import { useT } from '../i18n';
import './engine.css';

const ANALYSIS = [
  { name: 'Workload', text: 'Acute:chronic ratio from session RPE × minutes. Safe band 0.8–1.3.' },
  { name: 'Trends', text: 'Eight-week and six-month changes in speed, fitness and strength.' },
  { name: 'Gaps', text: 'What a squad lacks, matched against prospects from district trials.' },
  { name: 'Pathway', text: 'Distance to the next gate on the road to the 2036 Olympic core.' },
];

const DECIDERS: { role: SlmRole; text: string }[] = [
  { role: 'athlete', text: 'Sees advice for themself. Coach-approved work is marked.' },
  { role: 'coach', text: 'Approves, edits or dismisses every plan change.' },
  { role: 'board', text: 'Approves, rejects or sends back. Every decision is logged.' },
];

/** The "Sports Intelligence Engine" explainer: data → access filter → analysis → recommendation → people. */
export function EngineScreen({ role }: { role: SlmRole }) {
  const user = useCurrentUser();
  const back = role === 'athlete' ? 'coach' : 'slm';
  const backLabel = TABS[role].find((t) => t.path === back)?.label ?? 'SLM';
  const readable = DATA_SOURCES.filter((s) => s.roles.includes(role)).length;
  const t = useT();

  return (
    <>
      <ScreenHeader label="Sports SLM — How it works" initials={user?.initials ?? ''}>
        <Title lines={['The', 'Brain.']} />
      </ScreenHeader>

      <Band rule="ink" i={2}>
        <p className="body">
          {t('A small language model trained on sports science. It reads only what your role allows, explains every suggestion, and leaves the decision to a person.')}
        </p>
        <Link to={`/${role}/${back}`} className="textbtn eng__back">
          {t('← Back to {tab}', { tab: t(backLabel) })}
        </Link>
      </Band>

      <ol className="eng">
        <Step n={1} i={3} title="Data" aside={t('{n} of {total} open to you', { n: readable, total: DATA_SOURCES.length })}>
          <ul className="eng__sources">
            {DATA_SOURCES.map((s) => {
              const ok = s.roles.includes(role);
              return (
                <li key={s.id} className={cx('eng__src', !ok && 'is-locked')}>
                  <span className="eng__srcname">
                    {!ok && <LockIcon />}
                    {t(s.label)}
                  </span>
                  <span className="M">{ok ? t(s.detail) : t('Locked for {role}', { role: t(ROLE_META[role].label) })}</span>
                </li>
              );
            })}
          </ul>
        </Step>

        <Step n={2} i={4} title="Access" aside="Runs first">
          <p className="eng__text">{t(SCOPE[role])}</p>
          <p className="eng__text eng__muted">
            {t('The filter runs before anything is read. A question outside your scope gets a refusal, not a partial answer.')}
          </p>
        </Step>

        <Step n={3} i={5} title="Analysis">
          <dl className="kv eng__kv">
            {ANALYSIS.map((a) => (
              <div key={a.name}>
                <dt className="M">{t(a.name)}</dt>
                <dd>{t(a.text)}</dd>
              </div>
            ))}
          </dl>
        </Step>

        <Step n={4} i={6} title="Advice">
          <p className="eng__text">{t('Each one shows a confidence score and the factors behind it, with their weights.')}</p>
          <div className="eng__sample" aria-label={t('Example recommendation')}>
            <Label className="tone-cobalt">Example · 87% confident</Label>
            <p className="eng__sampletitle">{t("Cut Yash's hurdle volume 30% this week.")}</p>
            <ul className="eng__factors">
              <Factor label="ACWR 1.46, past the 1.3 line" weight={60} />
              <Factor label="Two niggle reports in 10 days" weight={40} />
            </ul>
          </div>
        </Step>

        <Step n={5} i={7} title="People" aside="Decide" last>
          <ul className="eng__deciders">
            {DECIDERS.map((d) => (
              <li key={d.role} className={cx(d.role === role && 'is-you')}>
                <span className="eng__srcname">
                  {t(ROLE_META[d.role].label)}
                  {d.role === role && <span className="M tag">{t('You')}</span>}
                </span>
                <span className="eng__text">{t(d.text)}</span>
              </li>
            ))}
          </ul>
        </Step>
      </ol>
    </>
  );
}

function Step({
  n,
  i,
  title,
  aside,
  last,
  children,
}: {
  n: number;
  i: number;
  title: string;
  aside?: string;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <li className={cx('eng__step rise', last && 'is-last')} style={stagger(i)}>
      <div className="eng__rail" aria-hidden="true">
        <RowNum n={n} />
        {!last && <span className="eng__line" style={stagger(i)} />}
      </div>
      <div className="eng__body">
        <SectionHead title={title} aside={aside} />
        {children}
      </div>
    </li>
  );
}

function Factor({ label, weight }: { label: string; weight: number }) {
  const t = useT();
  return (
    <li className="eng__factor">
      <span>{t(label)}</span>
      <span className="M">{weight}%</span>
      <span className="eng__fbar" aria-hidden="true">
        <span className="grow" style={{ transform: `scaleX(${weight / 100})` }} />
      </span>
    </li>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="eng__lock">
      <rect x="2" y="5.5" width="8" height="5.5" rx="1" fill="currentColor" />
      <path d="M3.8 5.5V4a2.2 2.2 0 0 1 4.4 0v1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
