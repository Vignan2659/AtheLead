import { useEffect, useId, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Label, PillButton, RowNum, Segmented } from '../../design/primitives';
import { DEMO_OTP, initialsOf, OPEN_ROLES, ROLE_META, ROLES, type Role, type User } from '../../data/users';
import { prefersReducedMotion } from '../../lib/motion';
import { useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import { LangSwitch } from '../../design/LangSwitch';
import { authenticate, findByPhone, normalisePhone, validateRegistration } from './auth';

const phoneOf = (users: User[], role: Role) => users.find((u) => u.role === role && u.phone)?.phone ?? '';
import './signin.css';

const LANE_A = 'M -30 300 C 70 300 110 140 210 122 S 360 52 430 40';
const LANE_B = 'M -30 350 C 90 350 140 190 240 172 S 380 104 430 92';

function Lanes() {
  const reduced = prefersReducedMotion();
  return (
    <svg className="si__lanes" viewBox="0 0 390 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d={LANE_A} className="si__lane" pathLength={1} />
      <path d={LANE_B} className="si__lane si__lane--b" pathLength={1} />
      <path d={LANE_A} className="si__laneline" />
      <path d={LANE_B} className="si__laneline" />
      <g className="si__dot">
        <circle r="7" className="si__dotc" transform={reduced ? 'translate(210 122)' : undefined}>
          {!reduced && <animateMotion dur="6.5s" begin="0.9s" repeatCount="indefinite" path={LANE_A} />}
        </circle>
      </g>
    </svg>
  );
}

export function SignIn() {
  const user = useCurrentUser();
  const users = useStore((s) => s.users);
  const signIn = useStore((s) => s.signIn);
  const register = useStore((s) => s.register);
  const navigate = useNavigate();
  const ids = useId();
  const t = useT();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [role, setRole] = useState<Role>('athlete');
  const [email, setEmail] = useState(ROLE_META.athlete.demoEmail);
  const [password, setPassword] = useState('demo1234');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<{ field?: string; text: string } | null>(null);
  const [notice, setNotice] = useState('');
  const [via, setVia] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState(phoneOf(users, 'athlete'));
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const location = useLocation();
  const timedOut = (location.state as { timedOut?: boolean } | null)?.timedOut;

  useEffect(() => setError(null), [mode, role, via]);

  if (user) return <Navigate to={ROLE_META[user.role].home} replace />;

  const pickRole = (r: Role) => {
    setRole(r);
    if (mode === 'signin') {
      setEmail(ROLE_META[r].demoEmail);
      setPassword('demo1234');
      setPhone(phoneOf(users, r));
      setCodeSent(false);
      setCode('');
    }
    setNotice('');
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setNotice('');
    if (mode === 'signin' && via === 'phone') {
      const res = findByPhone(users, phone, role);
      if (!res.ok) return setError({ field: res.field, text: res.error });
      if (!codeSent) {
        setCodeSent(true);
        setNotice(t('Code sent to +91 {p}. Demo code: {c}', { p: normalisePhone(phone), c: DEMO_OTP }));
        return;
      }
      if (code.trim() !== DEMO_OTP) return setError({ field: 'code', text: 'That code doesn’t match. Check the SMS and try again.' });
      signIn(res.user.id, remember);
      navigate(ROLE_META[res.user.role].home, { replace: true });
      return;
    }
    if (mode === 'signin') {
      const res = authenticate(users, email, password, role);
      if (!res.ok) return setError({ field: res.field, text: res.error });
      signIn(res.user.id, remember);
      navigate(ROLE_META[res.user.role].home, { replace: true });
      return;
    }
    const res = validateRegistration(users, name, email, password, role);
    if (!res.ok) return setError({ text: res.error });
    const id = `${role === 'athlete' ? 'ath' : role}-${Date.now().toString(36)}`;
    register({ id, name: name.trim(), email: email.trim(), password, role, initials: initialsOf(name) });
    signIn(id, remember);
    navigate(role === 'athlete' ? '/athlete/onboarding' : ROLE_META[role].home, { replace: true });
  };

  const boardInviteOnly = mode === 'register' && (role === 'board' || role === 'district');
  const errId = `${ids}-err`;

  return (
    <div className="si on-cobalt">
      <div className="si__top">
        <div className="si__labels">
          <span className="M">{t('Velora Sports Union · India')}</span>
          <LangSwitch className="si__lang" />
        </div>
        <Lanes />
        <h1 className="D si__mark" aria-label="AtheLead">
          <span className="mask" style={{ ['--i' as string]: 2 }}>
            <span>Athe</span>
          </span>
          <span className="mask si__mark2" style={{ ['--i' as string]: 3 }}>
            <span>Lead.</span>
          </span>
        </h1>

      </div>

      <form className="si__sheet" onSubmit={submit} noValidate>
        <div className="si__pad labelrow">
          <Label>{t(mode === 'signin' ? 'Sign in as' : 'Create account')}</Label>
          <button type="button" className="M si__switch" onClick={() => setMode(mode === 'signin' ? 'register' : 'signin')}>
            {t(mode === 'signin' ? 'New here? Register' : 'Have an account? Sign in')}
          </button>
        </div>

        {mode === 'signin' ? (
          <ul className="rows si__roles" role="group" aria-label={t('Role')}>
            {ROLES.map((r, i) => (
              <li key={r}>
                <button
                  type="button"
                  className="row si__role"
                  aria-pressed={role === r}
                  aria-describedby={error?.field === 'role' ? errId : undefined}
                  onClick={() => pickRole(r)}
                >
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(ROLE_META[r].label)}</span>
                  </span>
                  <span className="M si__blurb">{t(ROLE_META[r].blurb)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="si__pad si__regrole">
            <Segmented
              label="Role"
              value={role}
              onChange={pickRole}
              options={[...OPEN_ROLES, 'board' as const].map((r) => ({ value: r, label: ROLE_META[r].label }))}
            />
          </div>
        )}

        <div className="si__pad si__fields">
          {mode === 'register' && (
            <Field id={`${ids}-name`} label={t('Full name')} value={name} onChange={setName} autoComplete="name" disabled={boardInviteOnly} />
          )}
          {mode === 'signin' && (
            <Segmented
              label="Sign in with"
              options={[
                { value: 'phone', label: 'Phone OTP' },
                { value: 'email', label: 'Email' },
              ]}
              value={via}
              onChange={setVia}
            />
          )}
          {mode === 'signin' && via === 'phone' ? (
            <>
              <Field
                id={`${ids}-phone`}
                label={t('Mobile number')}
                type="tel"
                value={phone}
                onChange={(v) => {
                  setPhone(v);
                  setCodeSent(false);
                }}
                autoComplete="tel-national"
                invalid={error?.field === 'phone'}
                describedBy={error ? errId : undefined}
              />
              {codeSent && (
                <Field
                  id={`${ids}-code`}
                  label={t('6-digit code')}
                  value={code}
                  onChange={setCode}
                  autoComplete="one-time-code"
                  invalid={error?.field === 'code'}
                  describedBy={error ? errId : undefined}
                />
              )}
            </>
          ) : (
            <>
          <Field
            id={`${ids}-email`}
            label={t('Email')}
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            invalid={error?.field === 'email'}
            describedBy={error ? errId : undefined}
            disabled={boardInviteOnly}
          />
          <Field
            id={`${ids}-pw`}
            label={t('Password')}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            invalid={error?.field === 'password'}
            describedBy={error ? errId : undefined}
            disabled={boardInviteOnly}
          />
            </>
          )}

          <div className="si__opts">
            <label className="si__check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="si__box" aria-hidden="true" />
              <span>{t('Remember me')}</span>
            </label>
            {mode === 'signin' && via === 'email' && (
              <button
                type="button"
                className="si__forgot"
                onClick={() =>
                  setNotice(email.trim() ? t('Reset link sent to {email} (simulated).', { email: email.trim() }) : t('Enter your email first.'))
                }
              >
                {t('Forgot password?')}
              </button>
            )}
          </div>
        </div>

        <div className="si__pad">
          <p className={`si__msg ${error || boardInviteOnly ? 'is-err' : ''}`} id={errId} role="status" aria-live="polite">
            {boardInviteOnly
              ? t(
                  role === 'district'
                    ? 'District officer accounts are invite-only. Ask your state admin for an invite.'
                    : 'Board accounts are invite-only. Ask the union secretary for an invite.',
                )
              : error
                ? t(error.text)
                : notice || (timedOut ? t('Signed out after 15 minutes without use, to keep shared phones safe.') : '')}
          </p>
          <PillButton type="submit" variant="coral" block arrow disabled={boardInviteOnly}>
            {mode === 'signin'
              ? via === 'phone' && !codeSent
                ? t('Send code')
                : t('Continue as {role}', { role: t(ROLE_META[role].label) })
              : t('Create {role} account', { role: t(ROLE_META[role].label) })}
          </PillButton>
          <div className="si__demo">
            <Label>{via === 'phone' && mode === 'signin' ? t('Demo code · {c}', { c: DEMO_OTP }) : 'Demo password · demo1234'}</Label>
            <Link to="/mission" className="M si__mission">
              {t('Why AtheLead? Mission 2036 →')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  invalid,
  describedBy,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`si__field ${invalid ? 'is-invalid' : ''}`}>
      <label htmlFor={id} className="M">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="none"
      />
    </div>
  );
}
