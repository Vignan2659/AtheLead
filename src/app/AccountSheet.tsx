import { useCallback } from 'react';
import { SportTag } from '../design/SportTag';
import { Link, useNavigate } from 'react-router-dom';
import { Label, PillButton, RowNum } from '../design/primitives';
import { Sheet } from '../design/Sheet';
import { DEMO_USERS, ROLE_META } from '../data/users';
import { useCurrentUser, useStore } from '../state/store';
import { useT } from '../i18n';
import { LangSwitch } from '../design/LangSwitch';

/** Profile + sign out, plus the demo account switcher for presenting. */
export function AccountSheet() {
  const open = useStore((s) => s.accountOpen);
  const setOpen = useStore((s) => s.setAccountOpen);
  const signIn = useStore((s) => s.signIn);
  const signOut = useStore((s) => s.signOut);
  const resetDemo = useStore((s) => s.resetDemo);
  const simOffline = useStore((s) => s.simOffline);
  const setSimOffline = useStore((s) => s.setSimOffline);
  const user = useCurrentUser();
  const navigate = useNavigate();
  const close = useCallback(() => setOpen(false), [setOpen]);
  const t = useT();

  if (!user) return null;

  return (
    <Sheet open={open} onClose={close} label={t('Account')}>
      <div className="sheet__pad">
        <Label>{t('Signed in · {role}', { role: t(ROLE_META[user.role].label) })}</Label>
        <h2 className="D acct__name">{user.name}</h2>
        <SportTag of={user.id} className="acct__sport" />
        <Label>{user.email}</Label>
        <div className="acct__lang">
          <Label>{t('Language')}</Label>
          <LangSwitch />
        </div>
        <div className="acct__lang">
          <Label>{t('Network · demo')}</Label>
          <button type="button" className="pill pill--sm" aria-pressed={simOffline} onClick={() => setSimOffline(!simOffline)}>
            {t(simOffline ? 'Offline ✓' : 'Go offline')}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div className="sheet__pad" style={{ marginBottom: 8 }}>
          <Label>Demo · switch account</Label>
        </div>
        <ul className="rows">
          {DEMO_USERS.map((u, i) => (
            <li key={u.id}>
              <button
                type="button"
                className="row press"
                aria-current={u.id === user.id}
                onClick={() => {
                  signIn(u.id, true);
                  navigate(ROLE_META[u.role].home);
                }}
              >
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">
                    {u.name}
                    <SportTag of={u.id} />
                  </span>
                  <Label>{t(ROLE_META[u.role].label)}</Label>
                </span>
                <span className="M">{t(u.id === user.id ? 'Current' : 'Switch →')}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sheet__pad acct__links" style={{ marginTop: 18 }}>
        <Link to="/mission" className="textbtn" onClick={close}>
          {t('About Mission 2036 →')}
        </Link>
        <button
          type="button"
          className="textbtn acct__reset"
          onClick={() => {
            resetDemo();
            navigate(ROLE_META[user.role].home);
          }}
        >
          {t('Reset demo data')}
        </button>
      </div>

      <div className="acct__actions">
        <PillButton
          variant="ink"
          block
          onClick={() => {
            signOut();
            navigate('/signin');
          }}
        >
          {t('Sign out')}
        </PillButton>
      </div>
    </Sheet>
  );
}
