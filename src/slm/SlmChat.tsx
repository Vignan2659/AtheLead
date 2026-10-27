import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Label, cx } from '../design/primitives';
import { prefersReducedMotion } from '../lib/motion';
import type { SlmRole } from '../data/users';
import { ARJUN_PLAN_ID } from '../data/squad';
import { useCurrentUser, useStore } from '../state/store';
import { askSlm } from './engine';
import { SCOPE, SUGGESTED_PROMPTS } from './sources';
import type { SlmAnswer } from './types';
import { useT } from '../i18n';
import { toEngineQuery } from './tamil';
import './slm.css';

interface Turn {
  id: number;
  q: string;
  a: SlmAnswer | null;
}

const STEPS = ['Checking access', 'Reading your data', 'Writing the answer'];
const STEP_MS = 320;

/** Chat with the Sports SLM. History lives for the visit; nothing is sent anywhere. */
export function SlmChat({ role, heading = 'Ask the SLM' }: { role: SlmRole; heading?: string }) {
  const user = useCurrentUser();
  const feel = useStore((s) => s.feel);
  const tempoApplied = useStore((s) => s.appliedPlans.includes(ARJUN_PLAN_ID));
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [step, setStep] = useState(-1);
  const seq = useRef(0);
  const timers = useRef<number[]>([]);
  const last = useRef<HTMLLIElement>(null);
  const busy = step >= 0;
  const t = useT();

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    last.current?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [turns]);

  /** `q` is what the person sees; the engine reads English, so Tamil is mapped to its keywords first. */
  const ask = (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    const id = ++seq.current;
    setTurns((ts) => [...ts, { id, q: question, a: null }]);
    setDraft('');
    const answer = askSlm(role, toEngineQuery(question, SUGGESTED_PROMPTS[role], t), { firstName: user?.name.split(' ')[0], feel, tempoApplied });
    // Refusals stop at the access check; answers walk all three steps.
    const steps = answer.kind === 'refusal' ? 1 : STEPS.length;
    const stepMs = prefersReducedMotion() ? 0 : STEP_MS;
    setStep(0);
    for (let i = 1; i < steps; i++) timers.current.push(window.setTimeout(() => setStep(i), i * stepMs));
    timers.current.push(
      window.setTimeout(() => {
        setStep(-1);
        setTurns((ts) => ts.map((x) => (x.id === id ? { ...x, a: answer } : x)));
      }, steps * stepMs + 80),
    );
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <div className="slm">
      <div className="slm__head">
        <div className="slm__title">
          <span className="pulse tone-cobalt" aria-hidden="true" />
          <h2 className="D slm__h">{t(heading)}</h2>
        </div>
        <Link to={`/${role}/engine`} className="M slm__how">
          {t('How it works →')}
        </Link>
      </div>
      <p className="slm__scope">
        <Label>Uses</Label> {t(SCOPE[role])}
      </p>

      <ol className="slm__log" aria-live="polite" aria-label={t('Conversation')}>
        {turns.map((turn, i) => (
          <li key={turn.id} ref={i === turns.length - 1 ? last : undefined} className="slm__turn">
            <p className="slm__q">{turn.q}</p>
            {turn.a ? <AnswerCard a={turn.a} example={t(SUGGESTED_PROMPTS[role][0])} onAsk={ask} /> : <Thinking step={step} />}
          </li>
        ))}
      </ol>

      <div className="slm__chips" role="group" aria-label={t('Suggested questions')}>
        {SUGGESTED_PROMPTS[role].map((p) => (
          <button key={p} type="button" className="slm__chip" onClick={() => ask(t(p))} disabled={busy}>
            {t(p)}
          </button>
        ))}
      </div>

      <form className="slm__form" onSubmit={submit}>
        <label htmlFor={`slm-input-${role}`} className="sr-only">
          {t('Ask the Sports SLM')}
        </label>
        <input
          id={`slm-input-${role}`}
          className="slm__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t('Ask about training, risk, talent…')}
          autoComplete="off"
          maxLength={200}
        />
        <button type="submit" className="slm__send" disabled={busy || !draft.trim()} aria-label={t('Send question')}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 9h11M9.5 4.5 14 9l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function Thinking({ step }: { step: number }) {
  const t = useT();
  return (
    <div className="slm__thinking" role="status">
      {STEPS.map((s, i) => (
        <span key={s} className={cx('M slm__step', i <= step && 'is-on', i < step && 'is-done')}>
          {t(s)}
        </span>
      ))}
    </div>
  );
}

function AnswerCard({ a, example, onAsk }: { a: SlmAnswer; example: string; onAsk: (q: string) => void }) {
  const refused = a.kind === 'refusal';
  const t = useT();
  return (
    <article className={cx('slm__ans', refused && 'is-refusal')}>
      <div className="slm__anshead">
        <Label className={refused ? 'tone-coral' : 'tone-cobalt'}>{t(refused ? 'Access check · blocked' : 'Sports SLM')}</Label>
        {a.confidence !== null && <Label>{a.confidence}% confident</Label>}
      </div>
      <h3 className="D slm__anstitle">{t(a.title)}</h3>
      <p className="slm__intro">{t(a.intro)}</p>
      {a.sections.map((s) => (
        <section key={s.heading} className="slm__sec">
          <div className="slm__sechead">
            <span className="slm__secname">{t(s.heading)}</span>
            {!refused && (
              <span className={cx('M slm__badge', s.tag === 'coach' ? 'is-coach' : 'is-ai')}>
                {t(s.tag === 'coach' ? 'Coach-approved' : 'SLM suggestion')}
              </span>
            )}
          </div>
          <ul className="slm__items">
            {s.items.map((it) => (
              <li key={it}>{t(it)}</li>
            ))}
          </ul>
        </section>
      ))}
      {a.nextSteps.length > 0 && (
        <div className="slm__next">
          <Label>Next</Label>
          <ul className="slm__items">
            {a.nextSteps.map((n) => (
              <li key={n}>{t(n)}</li>
            ))}
          </ul>
        </div>
      )}
      {a.dataUsed.length > 0 && <p className="M slm__used">{t('Used: {list}', { list: a.dataUsed.map((d) => t(d)).join(' · ') })}</p>}
      {a.kind === 'answer' && a.confidence === null && (
        <p className="slm__hint">
          {t('For example:')}{' '}
          <button type="button" className="textbtn" onClick={() => onAsk(example)}>
            {example}
          </button>
        </p>
      )}
    </article>
  );
}
