import { useId, useMemo, useState, type PointerEvent } from 'react';
import { cx } from './primitives';
import { useLang, useT } from '../i18n';
import './charts.css';

const W = 340;
const H = 170;
const PAD = { l: 8, r: 8, t: 22, b: 24 };

function niceRange(values: number[]): [number, number] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || Math.abs(hi) || 1;
  return [lo - span * 0.15, hi + span * 0.15];
}

/**
 * One series over time. Draws in with stroke-dashoffset; a crosshair and
 * readout follow the pointer or keyboard. The last point is labelled directly.
 */
export function LineChart({
  values,
  labels,
  format,
  label,
}: {
  values: number[];
  labels: string[];
  format: (v: number) => string;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const titleId = useId();
  const tr = useT();
  labels = labels.map((l) => tr(l));
  const [lo, hi] = useMemo(() => niceRange(values), [values]);
  const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, values.length - 1);
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  const area = `${d}L${x(values.length - 1)} ${H - PAD.b}L${x(0)} ${H - PAD.b}Z`;
  const last = values.length - 1;
  const shown = hover ?? last;

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((rel - PAD.l) / (W - PAD.l - PAD.r)) * last);
    setHover(Math.max(0, Math.min(last, i)));
  };

  return (
    <figure className="chart">
      <div className="chart__readout" aria-live="polite">
        <span className="D chart__val">{format(values[shown])}</span>
        <span className="M">{labels[shown]}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart__svg"
        role="img"
        aria-labelledby={titleId}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? last) - 1));
          if (e.key === 'ArrowRight') setHover((h) => Math.min(last, (h ?? last) + 1));
        }}
        onBlur={() => setHover(null)}
      >
        <title id={titleId}>
          {tr('{label}: {a} on {from} to {b} on {to}', { label, a: format(values[0]), from: labels[0], b: format(values[last]), to: labels[last] })}
        </title>
        {[0, 0.5, 1].map((t) => (
          <line key={t} className="chart__grid" x1={PAD.l} x2={W - PAD.r} y1={PAD.t + t * (H - PAD.t - PAD.b)} y2={PAD.t + t * (H - PAD.t - PAD.b)} />
        ))}
        <path d={area} className="chart__area" />
        <path d={d} className="chart__line" pathLength={1} />
        {hover !== null && <line className="chart__cross" x1={x(hover)} x2={x(hover)} y1={PAD.t - 8} y2={H - PAD.b} />}
        <circle cx={x(shown)} cy={y(values[shown])} r={5} className="chart__dot" />
        {labels.map((l, i) =>
          i === 0 || i === last || i === Math.floor(last / 2) ? (
            <text key={l} x={x(i)} y={H - 6} className="chart__axis" textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}>
              {l}
            </text>
          ) : null,
        )}
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      <details className="chart__table">
        <summary className="M">{tr('Show as table')}</summary>
        <table>
          <tbody>
            {values.map((v, i) => (
              <tr key={labels[i]}>
                <th scope="row">{labels[i]}</th>
                <td>{format(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Profile against a reference (squad average). Two series, so it carries a legend. */
export function Radar({
  axes,
  values,
  reference,
  refLabel,
  valueLabel,
}: {
  axes: string[];
  values: number[];
  reference: number[];
  refLabel: string;
  valueLabel: string;
}) {
  const S = 300;
  const c = S / 2;
  // Tamil axis names run longer, so the web shrinks to leave them room.
  const long = useLang((st) => st.lang) === 'ta';
  const R = long ? 76 : 88;
  const [hover, setHover] = useState<number | null>(null);
  const tr = useT();
  axes = axes.map((a) => tr(a));
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [c + Math.cos(a) * R * (v / 100), c + Math.sin(a) * R * (v / 100)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(',')).join(' ');

  return (
    <figure className="chart">
      <ul className="chart__legend" aria-label={tr('Legend')}>
        <li>
          <span className="chart__key chart__key--you" aria-hidden="true" />
          {valueLabel}
        </li>
        <li>
          <span className="chart__key chart__key--ref" aria-hidden="true" />
          {refLabel}
        </li>
      </ul>
      <svg viewBox={`0 0 ${S} ${S}`} className="chart__svg chart__svg--radar" role="img" aria-label={tr('{a} against {b}', { a: valueLabel, b: refLabel })}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <polygon key={t} className="chart__grid" points={poly(axes.map(() => t * 100))} fill="none" />
        ))}
        {axes.map((a, i) => {
          const [x2, y2] = pt(i, 100);
          const [lx, ly] = pt(i, long ? 118 : 120);
          const words = a.split(' ');
          return (
            <g key={a}>
              <line className="chart__grid" x1={c} y1={c} x2={x2} y2={y2} />
              <text
                x={lx}
                y={ly}
                className={cx('chart__axis', hover === i && 'is-on')}
                textAnchor={Math.abs(lx - c) < 4 ? 'middle' : lx > c ? 'start' : 'end'}
                dominantBaseline="middle"
              >
                {words.length > 1 && long
                  ? words.map((w, k) => (
                      <tspan key={w} x={lx} dy={k === 0 ? `${-0.6 * (words.length - 1)}em` : '1.2em'}>
                        {w}
                      </tspan>
                    ))
                  : a}
              </text>
            </g>
          );
        })}
        <polygon points={poly(reference)} className="chart__ref" />
        <g className="chart__grow" style={{ transformOrigin: `${c}px ${c}px` }}>
          <polygon points={poly(values)} className="chart__you" />
          {values.map((v, i) => {
            const [px, py] = pt(i, v);
            return <circle key={i} cx={px} cy={py} r={4} className="chart__dot" />;
          })}
        </g>
        {axes.map((a, i) => {
          const [px, py] = pt(i, 100);
          return (
            <line
              key={a}
              x1={c}
              y1={c}
              x2={px}
              y2={py}
              stroke="transparent"
              strokeWidth={36}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      <p className="chart__radarnote" aria-live="polite">
        {hover !== null ? (
          <>
            <strong>{axes[hover]}</strong> · {tr('you {a} · squad {b}', { a: values[hover], b: reference[hover] })}
          </>
        ) : (
          <span className="M">{tr('Tap an axis to compare')}</span>
        )}
      </p>
      <details className="chart__table">
        <summary className="M">{tr('Show as table')}</summary>
        <table>
          <thead>
            <tr>
              <th />
              <th scope="col">{valueLabel}</th>
              <th scope="col">{refLabel}</th>
            </tr>
          </thead>
          <tbody>
            {axes.map((a, i) => (
              <tr key={a}>
                <th scope="row">{a}</th>
                <td>{values[i]}</td>
                <td>{reference[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
