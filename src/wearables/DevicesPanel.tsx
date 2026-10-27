import { useState } from 'react';
import { Band, Label, PillButton, RowNum, SectionHead, StatStrip } from '../design/primitives';
import { useStore } from '../state/store';
import '../features/pilot/pilot.css';
import { PROVIDERS, ROUTE_LABEL } from './providers';
import { PREVIEW_BASELINE, blendedReadiness, latestPreview, wearableReadiness } from './preview';
import { useT } from '../i18n';
import './devices.css';

/**
 * Fitness-band panel. Athletes and coaches see the raw band numbers; the board
 * gets readiness only (RBAC: no heart data leaves athlete + coach).
 */
export function DevicesPanel({
  athleteId,
  audience,
  feel = null,
  i,
}: {
  athleteId: string;
  audience: 'athlete' | 'coach' | 'board';
  /** Check-in readiness, when the athlete has logged one today. */
  feel?: number | null;
  i?: number;
}) {
  const r = latestPreview(athleteId);
  const band = r ? wearableReadiness(r, PREVIEW_BASELINE) : null;
  const blended = blendedReadiness(feel, band);
  const b = PREVIEW_BASELINE;
  const t = useT();

  return (
    <>
      {r && (
        <Band tone="panel" i={i} aria-label="Fitness band readings">
          <div className="labelrow">
            <Label>Fitness band · {r.date}</Label>
            <span className="M tone-coral">{t('Preview data')}</span>
          </div>
          {audience === 'board' ? (
            <p className="dv__line">
              {t('Band readiness')} <strong className="D dv__big">{band}</strong>
              <span className="M">{t('Heart and sleep data stay with athlete and coach')}</span>
            </p>
          ) : (
            <>
              <StatStrip
                items={[
                  { value: r.hrv ?? '—', label: `HRV ms · base ${b.hrv}`, tone: r.hrv !== undefined && r.hrv < b.hrv ? 'warn' : 'ok' },
                  { value: r.restingHr ?? '—', label: `Rest HR · base ${b.restingHr}` },
                  { value: r.sleepHrs?.toFixed(1) ?? '—', label: `Sleep h · base ${b.sleepHrs}`, tone: r.sleepHrs !== undefined && r.sleepHrs < 7 ? 'warn' : undefined },
                ]}
              />
              <div className="dv__blend">
                <div>
                  <span className="M">{t('Band')}</span>
                  <span className="D dv__num">{band ?? '—'}</span>
                </div>
                <span className="dv__op" aria-hidden="true">
                  +
                </span>
                <div>
                  <span className="M">{t('Check-in')}</span>
                  <span className="D dv__num">{feel ?? '—'}</span>
                </div>
                <span className="dv__op" aria-hidden="true">
                  =
                </span>
                <div>
                  <span className="M tone-coral">{t('Readiness')}</span>
                  <span className="D dv__num dv__num--hi">{blended ?? '—'}</span>
                </div>
              </div>
              <p className="M dv__fine">
                {t('Band 60% · check-in 40%.')} {t(audience === 'athlete' ? 'Your coach sees this too.' : 'Shared by the athlete.')}
              </p>
            </>
          )}
        </Band>
      )}

      {audience === 'athlete' && <BandPermissions i={i} />}

      <Band rule="ink" i={i} flush aria-label="Supported fitness bands">
        <SectionHead title="Bands" aside="Coming next" />
        <ul className="rows">
          {PROVIDERS.map((p, n) => (
            <li key={p.id}>
              <div className="row dv__row">
                <RowNum n={n + 1} />
                <span className="row__main">
                  <span className="row__name">{p.name}</span>
                  <span className="M">
                    {p.maker} · {t(ROUTE_LABEL[p.route])}
                  </span>
                </span>
                <span className="M dv__status">{t('Planned')}</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}

const BAND_TYPES = [
  { id: 'restingHr', label: 'Resting heart rate' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'steps', label: 'Steps' },
  { id: 'workouts', label: 'Workout sessions' },
];

/** Consent per data type through Health Connect or HealthKit, disconnect any time, manual entry as a fallback. */
function BandPermissions({ i }: { i?: number }) {
  const t = useT();
  const userId = useStore((s) => s.userId);
  const perms = useStore((s) => s.bandPerms);
  const setPerm = useStore((s) => s.setBandPerm);
  const manual = useStore((s) => s.manualBand).filter((m) => m.userId === userId);
  const logManual = useStore((s) => s.logManualBand);
  const [sleep, setSleep] = useState('');
  const [rhr, setRhr] = useState('');
  const allowed = (id: string) => perms[`${userId}:${id}`] !== false;
  const any = BAND_TYPES.some((b) => allowed(b.id));
  return (
    <Band rule="ink" i={i} flush aria-label="Band data permissions">
      <SectionHead title="Permissions" aside="Health Connect · HealthKit" />
      {BAND_TYPES.map((b) => {
        const on = allowed(b.id);
        return (
          <div className="pb__toggle" key={b.id}>
            <span className="row__name">{t(b.label)}</span>
            <PillButton className="pill--sm" aria-pressed={on} onClick={() => setPerm(b.id, !on)}>
              {on ? 'Allowed ✓' : 'Allow'}
            </PillButton>
          </div>
        );
      })}
      <div className="pb__empty">
        <PillButton variant="outline" className="pill--sm ct__go" disabled={!any} onClick={() => BAND_TYPES.forEach((b) => setPerm(b.id, false))}>
          Disconnect all
        </PillButton>
        <p className="pb__note">{t('Band data is for recovery and load only. It never counts towards talent flags, because consumer sensors vary in accuracy.')}</p>
        <Label>No band? Enter it yourself</Label>
        <div className="be__rows">
          <span className="be__input">
            <input aria-label={t('Sleep hours')} inputMode="decimal" value={sleep} onChange={(e) => setSleep(e.target.value)} />
            <span className="M">{t('h sleep')}</span>
          </span>
          <span className="be__input">
            <input aria-label={t('Resting heart rate')} inputMode="numeric" value={rhr} onChange={(e) => setRhr(e.target.value)} />
            <span className="M">bpm</span>
          </span>
        </div>
        <PillButton
          variant="ink"
          className="pill--sm ct__go"
          disabled={!(Number(sleep) > 0 && Number(rhr) > 0)}
          onClick={() => {
            logManual(Number(sleep), Number(rhr));
            setSleep('');
            setRhr('');
          }}
        >
          Save manual entry
        </PillButton>
        {manual[0] && (
          <p className="pb__note tone-ok">
            {t('Last manual entry: {s} h sleep · {r} bpm', { s: manual[0].sleepHrs, r: manual[0].restingHr })}
          </p>
        )}
      </div>
    </Band>
  );
}
