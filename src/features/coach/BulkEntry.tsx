import { useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { Band, Label, PillButton, SectionHead, Segmented, cx } from '../../design/primitives';
import { PILOT_ATHLETES, TEST_BATTERY, todayDDMM, type PilotSport, type TestResult } from '../../data/pilot';
import { useCurrentUser, useStore } from '../../state/store';
import { useOnline } from '../../app/Connectivity';
import { useT } from '../../i18n';

const METHODS = [
  { value: 'Timing gates', label: 'Timing gates' },
  { value: 'Stopwatch', label: 'Stopwatch' },
  { value: 'Tape', label: 'Tape' },
] as const;
type Method = (typeof METHODS)[number]['value'];

/** One test for the whole group at once. Saved on the phone first, so it works at grounds with no signal. */
export function BulkEntry({ sport, i }: { sport: PilotSport; i: number }) {
  const t = useT();
  const user = useCurrentUser();
  const online = useOnline();
  const enter = useStore((s) => s.enterResults);
  const queued = useStore((s) => s.syncQueue.length);
  const battery = TEST_BATTERY.filter((b) => b.sport === 'Both' || b.sport.startsWith(sport) || (sport === 'Weightlifting' && b.sport.includes('optional')));
  const [test, setTest] = useState(battery[1]?.name ?? battery[0].name);
  const [method, setMethod] = useState<Method>('Tape');
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(0);
  const athletes = PILOT_ATHLETES.filter((a) => a.sport === sport);
  const unit = battery.find((b) => b.name === test)?.unit ?? '';
  const filled = athletes.filter((a) => values[a.id]?.trim());

  const save = () => {
    const date = todayDDMM();
    const rows: TestResult[] = filled.map((a) => ({
      id: `tr-e-${a.id}-${Date.now().toString(36)}`,
      athleteId: a.id,
      test,
      value: `${values[a.id].trim()} ${unit}`.trim(),
      method,
      // The coach ran the test, so it enters as coach-verified.
      verification: 'coach',
      tester: user ? `Coach ${user.name}` : 'Coach',
      date,
    }));
    enter(rows);
    setSaved(rows.length);
    setValues({});
  };

  return (
    <Band rule="ink" i={i} aria-label="Bulk entry">
      <SectionHead title="Bulk entry" aside={t(online ? 'Online' : 'Offline · saves on phone')} asideClass={online ? 'tone-ok' : 'tone-warn'} />
      <label className="be__field">
        <Label>Test</Label>
        <select className="be__select" value={test} onChange={(e) => setTest(e.target.value)}>
          {battery.map((b) => (
            <option key={b.name} value={b.name}>
              {t(b.name)}
            </option>
          ))}
        </select>
      </label>
      <div className="be__field">
        <Segmented label="Method" options={METHODS} value={method} onChange={setMethod} />
      </div>
      <ul className="be__rows">
        {athletes.map((a) => (
          <li key={a.id}>
            <label htmlFor={`be-${a.id}`} className="row__name">
              {a.name}
              <SportTag of={a.id} />
            </label>
            <span className="be__input">
              <input
                id={`be-${a.id}`}
                inputMode="decimal"
                autoComplete="off"
                value={values[a.id] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [a.id]: e.target.value }))}
              />
              <span className="M">{unit}</span>
            </span>
          </li>
        ))}
      </ul>
      <PillButton variant="ink" block arrow className="ct__go" disabled={!filled.length} onClick={save}>
        {t('Save {n} results', { n: filled.length })}
      </PillButton>
      <p className={cx('pb__note', saved ? 'tone-ok' : 'tone-ink')} role="status">
        {saved
          ? t(online ? '{n} saved and synced.' : '{n} saved on this phone. They sync when the network is back.', { n: saved })
          : t('Protocol v1.0. Results you enter are coach-verified and become read-only once synced.')}
        {queued > 0 && <> {t('{n} waiting to sync.', { n: queued })}</>}
      </p>
    </Band>
  );
}

/** Sync found two values for the same athlete, test and day: the coach keeps one. */
export function Conflicts({ i }: { i: number }) {
  const t = useT();
  const conflicts = useStore((s) => s.conflicts);
  const resolve = useStore((s) => s.resolveConflict);
  if (!conflicts.length) return null;
  const nameOf = (id: string) => PILOT_ATHLETES.find((a) => a.id === id)?.name ?? id;
  return (
    <Band tone="panel" i={i} aria-label="Sync conflicts">
      <Label>{t('{n} sync conflicts · you decide', { n: conflicts.length })}</Label>
      {conflicts.map((c, k) => (
        <div key={c.b.id} className="be__conflict">
          <p className="pb__reason">
            {nameOf(c.a.athleteId)}
            <SportTag of={c.a.athleteId} /> · {t(c.a.test)} · {c.a.date}
          </p>
          <div className="pb__actions">
            <PillButton variant="white" className="pill--sm" onClick={() => resolve(k, 'a')}>
              {t('Keep {v}', { v: c.a.value })}
            </PillButton>
            <PillButton variant="outline-light" className="pill--sm" onClick={() => resolve(k, 'b')}>
              {t('Keep {v}', { v: c.b.value })}
            </PillButton>
          </div>
        </div>
      ))}
    </Band>
  );
}

/** Results squad athletes entered themselves, waiting for the coach to verify. */
export function SquadSelfEntries({ i }: { i: number }) {
  const t = useT();
  const entered = useStore((s) => s.entered);
  const verified = useStore((s) => s.verified);
  const users = useStore((s) => s.users);
  const verify = useStore((s) => s.verifyResult);
  const pending = entered.filter((r) => r.verification === 'self' && !verified[r.id]);
  if (!pending.length) return null;
  return (
    <Band rule="ink" i={i} flush aria-label="Self-entered by the squad">
      <SectionHead title="To verify" aside="Self-entered by the squad" />
      {pending.map((r) => (
        <div className="pb__card" key={r.id}>
          <span className="row__name">
            {users.find((u) => u.id === r.athleteId)?.name}
            <SportTag of={r.athleteId} />
          </span>
          <span className="M">
            {t(r.test)} · {r.value} · {r.date}
          </span>
          <div className="pb__actions">
            <PillButton variant="ink" className="pill--sm" onClick={() => verify(r.id, 'coach')}>
              Verify · I watched it
            </PillButton>
            <PillButton variant="outline" className="pill--sm" onClick={() => verify(r.id, 'video')}>
              Verify from video
            </PillButton>
          </div>
        </div>
      ))}
    </Band>
  );
}
