import { useNavigate } from 'react-router-dom';
import { Band, Label, PillButton, ScreenHeader, Title } from '../design/primitives';
import { useCurrentUser } from '../state/store';
import { Overlays } from './Overlays';
import { useT } from '../i18n';

/** Entry point for new athletes. The four-step flow lands in build step 4. */
export function Onboarding() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const t = useT();
  return (
    <main className="screen">
      <ScreenHeader label="Step 1 of 4 — Profile" initials={user?.initials ?? ''}>
        <Title lines={['Welcome', 'Aboard.']} />
      </ScreenHeader>
      <Band rule="ink" i={2}>
        <Label>{user?.name}</Label>
        <p className="body" style={{ marginTop: 10 }}>
          {t('Your account is ready. The four-step onboarding (profile, sport, fitness, diet) is in the next build step.')}
        </p>
      </Band>
      <Band i={3}>
        <PillButton variant="ink" block arrow onClick={() => navigate('/athlete/today')}>
          Go to Today
        </PillButton>
      </Band>
      <Overlays />
    </main>
  );
}
