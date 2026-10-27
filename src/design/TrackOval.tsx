import { useEffect, useRef } from 'react';
import { tween } from '../lib/motion';
import { useT } from '../i18n';
import './track.css';

/** 400 m stadium: two 152-unit straights joined by r=80 bends. Length ≈ 807. */
const LANE = 'M 95 15 H 247 A 80 80 0 0 1 247 175 H 95 A 80 80 0 0 1 95 15 Z';
const OUTER = 'M 95 1 H 247 A 94 94 0 0 1 247 189 H 95 A 94 94 0 0 1 95 1 Z';
const INNER = 'M 95 29 H 247 A 66 66 0 0 1 247 161 H 95 A 66 66 0 0 1 95 29 Z';

/**
 * Session progress drawn as a lap. The cobalt stroke and the coral runner are
 * driven by the same rAF tween so they never drift apart.
 */
export function TrackOval({ done, total, caption }: { done: number; total: number; caption: string }) {
  const t = useT();
  const progRef = useRef<SVGPathElement>(null);
  const runnerRef = useRef<SVGGElement>(null);
  const cur = useRef(0);
  const mounted = useRef(false);
  const p = total > 0 ? done / total : 0;

  useEffect(() => {
    const path = progRef.current;
    const runner = runnerRef.current;
    if (!path || !runner) return;
    const L = path.getTotalLength();
    path.style.strokeDasharray = `${L} ${L}`;
    const duration = mounted.current ? 700 : 1100;
    mounted.current = true;
    return tween(cur.current, p, duration, (v) => {
      cur.current = v;
      path.style.strokeDashoffset = String(L * (1 - v));
      path.style.opacity = v > 0.002 ? '1' : '0';
      const pt = path.getPointAtLength(L * v);
      runner.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
    });
  }, [p]);

  return (
    <div className="track">
      <svg viewBox="0 0 342 190" className="track__svg" role="img" aria-label={t('{done} of {total} exercises logged', { done, total })}>
        <path d={OUTER} className="track__rule" />
        <path d={INNER} className="track__rule" />
        <path d={LANE} className="track__lane" />
        <path d={LANE} className="track__laneline" />
        <line x1="95" y1="2" x2="95" y2="28" className="track__start" />
        <path ref={progRef} d={LANE} className="track__prog" />
        <g ref={runnerRef} transform="translate(95 15)">
          <circle r="8" className="track__ping" />
          <circle r="8" className="track__runner" />
        </g>
      </svg>
      <div className="track__centre" aria-hidden="true">
        <span className="D track__count">
          {done}/{total}
        </span>
        <span className="M">{caption}</span>
      </div>
    </div>
  );
}
