import { memo } from 'react';
import { ACWR_SAFE, type Tone } from '../lib/acwr';

/**
 * A thin 0–max lane with the safe zone shaded. The marker moves with
 * translate3d on a full-width wrapper, so percentages map to the lane width.
 */
export const LaneBar = memo(function LaneBar({
  value,
  tone,
  max = 2,
  safe = ACWR_SAFE,
}: {
  value: number;
  tone: Tone;
  max?: number;
  safe?: [number, number];
}) {
  const pos = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div className="lane" aria-hidden="true">
      <div
        className="lane__safe"
        style={{ left: `${(safe[0] / max) * 100}%`, width: `${((safe[1] - safe[0]) / max) * 100}%` }}
      />
      <div className="lane__mk" style={{ transform: `translate3d(${pos}%,0,0)` }}>
        <span className={`lane__dot tone-${tone}`} />
      </div>
    </div>
  );
});
