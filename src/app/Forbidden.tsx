import { useNavigate } from 'react-router-dom';
import { Band, Label, PillButton, ScreenHeader, Title } from '../design/primitives';
import { ROLE_META, type Role, type User } from '../data/users';
import { Overlays } from './Overlays';
import { useT } from '../i18n';

export function Forbidden({ user, required }: { user: User; required: Role }) {
  const navigate = useNavigate();
  const t = useT();
  return (
    <main className="screen">
      <ScreenHeader label="403 — Access control" initials={user.initials}>
        <Title lines={['403.', 'Locked.']} />
      </ScreenHeader>
      <Band rule="ink" i={2}>
        <p className="body">
          {t("You don't have access to this area. {role} screens are only open to {role} accounts.", { role: t(ROLE_META[required].label) })}
        </p>
      </Band>
      <div className="rise" style={{ ['--i' as string]: 3 }}>
        <dl className="kv">
          <div>
            <dt className="M">role</dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt className="M">required</dt>
            <dd>{required}</dd>
          </div>
          <div>
            <dt className="M">user_id</dt>
            <dd>{user.id}</dd>
          </div>
        </dl>
      </div>
      <Band i={4}>
        <PillButton variant="ink" block arrow onClick={() => navigate(ROLE_META[user.role].home, { replace: true })}>
          {t('Back to {role} home', { role: t(ROLE_META[user.role].label) })}
        </PillButton>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Label>Logged for audit</Label>
        </div>
      </Band>
      <Overlays />
    </main>
  );
}
