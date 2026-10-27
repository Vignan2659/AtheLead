import {
  memo,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { tween } from '../lib/motion';
import { unreadFor, useStore } from '../state/store';
import { tNode, useT } from '../i18n';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');
const stagger = (i?: number): CSSProperties | undefined =>
  i === undefined ? undefined : ({ '--i': i } as CSSProperties);

/* ---------- Text ---------- */

export function Label({ children, className, ...rest }: { children: ReactNode; className?: string; id?: string }) {
  const t = useT();
  return (
    <span className={cx('M', className)} {...rest}>
      {tNode(t, children)}
    </span>
  );
}

/** Two-line screen title; each line slides up from a mask. */
export function Title({ lines, as: Tag = 'h1', className }: { lines: [string, string]; as?: 'h1' | 'h2'; className?: string }) {
  const t = useT();
  // A whole-title entry ("Your Stats." → "உங்கள்|புள்ளிவிவரம்.") beats line-by-line.
  const whole = t(`${lines[0]} ${lines[1]}`);
  if (whole.includes('|')) lines = whole.split('|') as [string, string];
  else lines = [t(lines[0]), t(lines[1])];
  return (
    <Tag className={cx('D title', className)}>
      <span className="mask" style={stagger(0)}>
        <span>{lines[0]}</span>
      </span>
      <span className="mask l2" style={stagger(1)}>
        <span>{lines[1]}</span>
      </span>
    </Tag>
  );
}

export function SectionHead({ title, aside, asideClass }: { title: string; aside?: ReactNode; asideClass?: string }) {
  const t = useT();
  return (
    <div className="sechead">
      <h2 className="D sectitle">{t(title)}</h2>
      {aside && <Label className={asideClass}>{aside}</Label>}
    </div>
  );
}

/* ---------- Bands ---------- */

type BandTone = 'chalk' | 'panel' | 'cobalt';
type RuleKind = 'ink' | 'rule' | 'none';

export function Band({
  tone = 'chalk',
  rule = 'none',
  i,
  className,
  children,
  flush,
  ...rest
}: {
  tone?: BandTone;
  rule?: RuleKind;
  i?: number;
  className?: string;
  children: ReactNode;
  /** No side padding — for rows that carry their own gutter. */
  flush?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}) {
  const t = useT();
  if (rest['aria-label']) rest = { ...rest, 'aria-label': t(rest['aria-label']) };
  return (
    <section
      className={cx('band', `band--${tone}`, rule !== 'none' && `rule--${rule}`, i !== undefined && 'rise', flush && 'band--flush', className)}
      style={stagger(i)}
      {...rest}
    >
      {children}
    </section>
  );
}

/* ---------- Stat strip ---------- */

export interface Stat {
  value: ReactNode;
  label: string;
  tone?: 'ok' | 'warn' | 'bad' | 'coral' | 'cobalt';
}

export function StatStrip({ items, size = 'md' }: { items: Stat[]; size?: 'md' | 'lg' }) {
  const t = useT();
  return (
    <dl className={cx('stats', size === 'lg' && 'stats--lg')}>
      {items.map((s) => (
        <div className="stats__cell" key={s.label}>
          <dd className={cx('D stats__val', s.tone && `tone-${s.tone}`)}>{tNode(t, s.value)}</dd>
          <dt className="M">{t(s.label)}</dt>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Numbered row ---------- */

export const RowNum = ({ n }: { n: number }) => <span className="D row__num">{String(n).padStart(2, '0')}</span>;

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  label: string;
}) {
  const t = useT();
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div className="seg" role="group" aria-label={t(label)} style={{ '--n': options.length } as CSSProperties}>
      <div className="seg__thumbwrap" aria-hidden="true">
        <div
          className="seg__thumb"
          style={{ transform: `translate3d(${Math.max(idx, 0) * 100}%,0,0)`, opacity: idx < 0 ? 0 : 1 }}
        />
      </div>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="seg__opt"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}

/* ---------- Buttons ---------- */

type PillVariant = 'coral' | 'ink' | 'white' | 'outline' | 'outline-light';

export function PillButton({
  variant = 'ink',
  arrow,
  block,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: PillVariant; arrow?: boolean; block?: boolean }) {
  const t = useT();
  if (rest['aria-label']) rest = { ...rest, 'aria-label': t(rest['aria-label']) };
  return (
    <button type="button" className={cx('pill', `pill--${variant}`, block && 'pill--block', className)} {...rest}>
      <span>{tNode(t, children)}</span>
      {arrow && (
        <span className="pill__arrow" aria-hidden="true">
          →
        </span>
      )}
    </button>
  );
}

export function Avatar({ initials }: { initials: string }) {
  const open = useStore((s) => s.setAccountOpen);
  const t = useT();
  return (
    <button type="button" className="avatar M" onClick={() => open(true)} aria-label={t('Account and sign out')}>
      {initials}
    </button>
  );
}

/** Opens the inbox. The count covers only the signed-in user's notices. */
export function Bell() {
  const open = useStore((s) => s.setInboxOpen);
  const unread = useStore((s) => unreadFor(s.notices, s.userId));
  const t = useT();
  return (
    <button
      type="button"
      className="bell"
      onClick={() => open(true)}
      aria-label={unread ? t('Notifications, {n} unread', { n: unread }) : t('Notifications')}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          d="M9 2.2c-2.6 0-4.5 2-4.5 4.6v2.9L3 12.4h12l-1.5-2.7V6.8C13.5 4.2 11.6 2.2 9 2.2ZM7.2 14.3a1.9 1.9 0 0 0 3.6 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {unread > 0 && (
        <span className="bell__count D" key={unread} aria-hidden="true">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

/** Screen header: label + bell + avatar, then the two-line title. */
export function ScreenHeader({ label, initials, children }: { label: string; initials: string; children?: ReactNode }) {
  return (
    <header className="hdr">
      <div className="hdr__top">
        <Label>{label}</Label>
        <div className="hdr__actions">
          <Bell />
          <Avatar initials={initials} />
        </div>
      </div>
      {children}
    </header>
  );
}

/* ---------- Bars ---------- */

/** A track with a fill that grows with scaleX — never width. */
export const Bar = memo(function Bar({
  value,
  tone = 'cobalt',
  i,
  thin,
  className,
}: {
  value: number;
  tone?: 'cobalt' | 'cobalt-light' | 'coral' | 'white' | 'ok';
  i?: number;
  thin?: boolean;
  className?: string;
}) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cx('bar', thin && 'bar--thin', className)} aria-hidden="true">
      <div className={cx('bar__fill grow', `bar__fill--${tone}`)} style={{ ...stagger(i), transform: `scaleX(${v})` }} />
    </div>
  );
});

/* ---------- Counter ---------- */

/**
 * Counts with requestAnimationFrame. Isolated in its own component so the
 * per-frame state updates only re-render this span.
 */
export function CountUp({
  value,
  duration = 1000,
  format = (n: number) => String(Math.round(n)),
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const cur = useRef(0);
  useEffect(
    () =>
      tween(cur.current, value, duration, (v) => {
        cur.current = v;
        setShown(v);
      }),
    [value, duration],
  );
  return (
    <span className={className}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

/* ---------- Expander (grid-template-rows 0fr → 1fr) ---------- */

export function Expander({ open, id, children }: { open: boolean; id: string; children: ReactNode }) {
  return (
    <div className={cx('expander', open && 'is-open')} id={id} aria-hidden={!open}>
      <div className="expander__inner">{children}</div>
    </div>
  );
}

export function Chevron() {
  return (
    <svg className="chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export { cx, stagger };
