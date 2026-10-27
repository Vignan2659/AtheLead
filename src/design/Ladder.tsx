import { cx } from './primitives';
import { useT } from '../i18n';

/**
 * The pathway ladder: one segment per stage. Stages behind the athlete are
 * cobalt, the current one coral, the rest an empty track.
 */
export function Ladder({ stages, current }: { stages: readonly string[]; current: number }) {
  const t = useT();
  return (
    <ol className="ladder" aria-label={t('Pathway stage {n} of {total}: {name}', { n: current + 1, total: stages.length, name: t(stages[current]) })}>
      {stages.map((s, i) => (
        <li key={s} className={cx('ladder__step', i < current && 'is-past', i === current && 'is-now')} aria-current={i === current ? 'step' : undefined}>
          <span className="ladder__seg grow" style={{ ['--i' as string]: i }} aria-hidden="true" />
          <span className="M ladder__name">{t(s)}</span>
        </li>
      ))}
    </ol>
  );
}
