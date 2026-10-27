import { Link } from 'react-router-dom';
import { bandReadinessFor, blendedReadiness } from './preview';
import { useT } from '../i18n';

/** One line under the check-in: what the band measured and the blended readiness. */
export function BandReadiness({ athleteId, feel }: { athleteId: string; feel: number | null }) {
  const t = useT();
  const band = bandReadinessFor(athleteId);
  if (band === null) return null;
  const blended = blendedReadiness(feel, band);
  return (
    <p className="M band-ready">
      {t('Fitness band {n}', { n: band })}
      {feel !== null && ` · ${t('with your check-in {n}', { n: blended ?? '' })}`} · {t('preview')} ·{' '}
      <Link to="/athlete/stats" className="band-ready__link">
        {t('See band data')}
      </Link>
    </p>
  );
}
