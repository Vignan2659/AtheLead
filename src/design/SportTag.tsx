import { sportOf } from '../data/roster';
import { useT } from '../i18n';
import { cx } from './primitives';

/**
 * The sport an athlete plays, shown right beside their name: "Athletics · 400 m".
 * `sportOnly` drops the event where the line below already shows it.
 */
export function SportTag({ of, sportOnly, className }: { of: string | undefined; sportOnly?: boolean; className?: string }) {
  const t = useT();
  const info = sportOf(of);
  if (!info) return null;
  return (
    <span className={cx('M sporttag', className)}>
      <SportIcon sport={info.sport} />
      {t(info.sport)}
      {!sportOnly && info.event && <> · {t(info.event)}</>}
    </span>
  );
}

function SportIcon({ sport }: { sport: string }) {
  return (
    <svg className="sporttag__icon" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {sport === 'Weightlifting' ? (
        <>
          <path d="M3 8h10" />
          <path d="M3 5v6M5 4v8M11 4v8M13 5v6" />
        </>
      ) : (
        <>
          <circle cx="10" cy="2.8" r="1.4" fill="currentColor" stroke="none" />
          <path d="M8.6 5.2 6.4 8.6l2.6 1.6-1 4" />
          <path d="M8.6 5.2l2.4 2.2 2.2-.6" />
          <path d="M6.4 8.6 3.4 9.4" />
        </>
      )}
    </svg>
  );
}
