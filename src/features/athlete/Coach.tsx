import { useState, type FormEvent } from 'react';
import { Band, Label, PillButton, RowNum, ScreenHeader, SectionHead, Title } from '../../design/primitives';
import { COACHES, COACH_DIRECTORY } from '../../data/union';
import { SlmChat } from '../../slm/SlmChat';
import { coachOf, useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import './coach.css';

export function AthleteCoach() {
  const user = useCurrentUser();
  const users = useStore((s) => s.users);
  const askCoach = useStore((s) => s.askCoach);
  const coachUser = user ? coachOf(users, user.id) : undefined;
  const profile = COACHES.find((c) => c.userId === coachUser?.id);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const t = useT();

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    askCoach(msg);
    setSent(msg.trim());
    setMsg('');
  };

  return (
    <>
      <ScreenHeader label="Your coach — Track Squad U-20" initials={user?.initials ?? 'AR'}>
        <Title lines={['Coach', 'Ravi.']} />
      </ScreenHeader>

      {profile && (
        <Band tone="panel" i={2} aria-label="Assigned coach">
          <div className="labelrow">
            <Label>{profile.specialisation}</Label>
            <span className="M tone-coral">★ {profile.rating}</span>
          </div>
          <dl className="kv ac__kv">
            <div>
              <dt className="M">{t('Experience')}</dt>
              <dd>{t('{n} years', { n: profile.experienceYrs })}</dd>
            </div>
            <div>
              <dt className="M">{t('Available')}</dt>
              <dd>{t(profile.available)}</dd>
            </div>
            <div>
              <dt className="M">{t('Avg gain · 6 mths')}</dt>
              <dd>{t('+{n} dev index', { n: profile.devGain })}</dd>
            </div>
          </dl>
          <form className="ac__msg" onSubmit={send}>
            <label htmlFor="ac-msg" className="M">
              {t('Message Coach Ravi')}
            </label>
            <div className="ac__msgrow">
              <input
                id="ac-msg"
                className="ac__input"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={t('e.g. My hamstring feels tight after the 300s')}
                maxLength={240}
                autoComplete="off"
              />
              <PillButton type="submit" variant="coral" disabled={!msg.trim()}>
                {t('Send')}
              </PillButton>
            </div>
            <p className="M ac__sent" role="status">
              {t(sent ? 'Sent · Coach Ravi sees it in his inbox' : 'Private between you and your coach')}
            </p>
          </form>
        </Band>
      )}

      <Band rule="ink" i={3}>
        <SlmChat role="athlete" />
      </Band>

      <Band rule="ink" i={4} flush aria-label="Other athletics coaches">
        <SectionHead title="Directory" aside="Athletics" />
        <ul className="rows">
          {COACH_DIRECTORY.map((c, i) => (
            <li key={c.id}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{c.name}</span>
                  <span className="M">
                    {t(c.focus)} · {c.city}
                  </span>
                </span>
                <span className="M">{c.assigned ? t('Your coach') : `★ ${c.rating}`}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="M ac__note">{t('Specialist sessions are booked through Coach Ravi.')}</p>
      </Band>
    </>
  );
}
