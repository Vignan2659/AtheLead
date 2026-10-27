import { Navigate, useParams } from 'react-router-dom';
import { Band, Label, ScreenHeader, Title } from '../design/primitives';
import type { Role } from '../data/users';
import { useCurrentUser } from '../state/store';
import { TABS } from './nav';
import { useT } from '../i18n';

/** Stand-in for tabs scheduled for a later build step. */
export function Placeholder({ role }: { role: Role }) {
  const { tab } = useParams();
  const user = useCurrentUser();
  const t = useT();
  const meta = TABS[role].find((t) => t.path === tab);
  if (!meta) return <Navigate to={`/${role}/${TABS[role][0].path}`} replace />;
  return (
    <>
      <ScreenHeader label={`${role} — ${meta.label}`} initials={user?.initials ?? ''}>
        <Title lines={[meta.label, 'Soon.']} />
      </ScreenHeader>
      <Band rule="ink" i={2}>
        <Label>In the build queue</Label>
        <p className="body" style={{ marginTop: 10 }}>
          {t('This tab is part of the next build step. The home screen, sign-in and role access are live now.')}
        </p>
      </Band>
    </>
  );
}
