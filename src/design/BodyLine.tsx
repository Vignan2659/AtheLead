import { bodyOf, reachOf } from '../data/body';
import { useT } from '../i18n';
import { Label, cx } from './primitives';

/**
 * Age, height and weight on one short line under an athlete's name: "19 y · 181 cm · 70 kg".
 * Selectors scan it to compare athletes without opening each one. `noAge` drops the age where
 * the card already shows it.
 */
export function BodyLine({ of, noAge, className }: { of: string | undefined; noAge?: boolean; className?: string }) {
  const t = useT();
  const b = bodyOf(of);
  if (!b) return null;
  return (
    <span className={cx('M bodyline', className)}>
      <span className="sr-only">{t('Body')}: </span>
      {!noAge && `${t('{n} y', { n: b.age })} · `}
      {t('{n} cm', { n: b.heightCm })} · {t('{n} kg', { n: b.weightKg })}
    </span>
  );
}

/** The full body profile, for the passport and other one-athlete screens. */
export function BodyCard({ of }: { of: string | undefined }) {
  const t = useT();
  const b = bodyOf(of);
  if (!b) return null;
  const reach = reachOf(b);
  const cells: [string, string][] = [
    ['Age', t('{n} y', { n: b.age })],
    ['Height', t('{n} cm', { n: b.heightCm })],
    ['Weight', t('{n} kg', { n: b.weightKg })],
    ['Arm span', t('{n} cm', { n: b.armSpanCm })],
    ['Reach vs height', `${reach > 0 ? '+' : ''}${t('{n} cm', { n: reach })}`],
    ['Strong side', t(b.side)],
  ];
  return (
    <div className="bodycard">
      <dl className="bodycard__grid">
        {cells.map(([k, v]) => (
          <div key={k}>
            <dt className="M">{t(k)}</dt>
            <dd className="D">{v}</dd>
          </div>
        ))}
      </dl>
      <Label className="bodycard__src">{t('Measured · {where} · {date}', { where: t(b.measuredAt), date: b.measuredOn })}</Label>
    </div>
  );
}
