import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Band, Label, PillButton, RowNum, ScreenHeader, SectionHead, Segmented, StatStrip, Title, cx } from '../../design/primitives';
import { LineChart, Radar } from '../../design/Charts';
import { ADHERENCE, BODY, MONTH_LABELS, RADAR_ATHLETE, RADAR_AXES, RADAR_SQUAD, SERIES, WEEK_LABELS, type Series } from '../../data/stats';
import { formatIN } from '../../lib/format';
import { useCurrentUser, useStore } from '../../state/store';
import { FEEL_READINESS } from '../../data/athlete';
import { DevicesPanel } from '../../wearables/DevicesPanel';
import { useT } from '../../i18n';
import { ARJUN_AGE_MONTHS, TEST_BATTERY, todayDDMM } from '../../data/pilot';
import { resultsOf, verificationOf } from '../../state/store';
import { ResultLine, StageCard } from '../pilot/PilotBits';
import './stats.css';

type Range = 'weekly' | 'monthly';
const RANGES = [
  { value: 'weekly', label: '8 weeks' },
  { value: 'monthly', label: '6 months' },
] as const;

const fmt = (s: Series, t: (x: string) => string) => (v: number) =>
  `${s.decimals ? v.toFixed(s.decimals) : formatIN(v)}${s.unit ? ` ${t(s.unit)}` : ''}`;

function change(s: Series, range: Range) {
  const v = s[range];
  const pct = ((v[v.length - 1] - v[0]) / v[0]) * 100;
  return { pct, good: s.higherIsBetter === false ? pct < 0 : pct > 0 };
}

export function AthleteStats() {
  const user = useCurrentUser();
  const [range, setRange] = useState<Range>('weekly');
  const [metric, setMetric] = useState(SERIES[0].id);
  const s = SERIES.find((x) => x.id === metric) ?? SERIES[0];
  const labels = range === 'weekly' ? WEEK_LABELS : MONTH_LABELS;
  const c = change(s, range);
  const t = useT();

  const ranked = RADAR_AXES.map((a, i) => ({ a, d: RADAR_ATHLETE[i] - RADAR_SQUAD[i], v: RADAR_ATHLETE[i] })).sort((x, y) => y.d - x.d);

  return (
    <>
      <ScreenHeader label="Arjun Reddy — Athletics · 400 m" initials={user?.initials ?? 'AR'}>
        <Title lines={['Your', 'Stats.']} />
      </ScreenHeader>

      <Band tone="cobalt" i={1} aria-label="Athlete passport">
        <Link to="/passport/ath-arjun" className="st__pp">
          <span>
            <Label>Athlete passport</Label>
            <span className="st__pptitle">{t('Your verified record, ready for selectors')}</span>
          </span>
          <span className="pill__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </Band>

      <Band rule="ink" i={2}>
        <Segmented label="Time range" options={RANGES} value={range} onChange={setRange} />
      </Band>

      <Band i={3} aria-label={t('{name} trend', { name: t(s.label) })}>
        <div className="labelrow">
          <Label>{s.label}</Label>
          <span className={cx('M', c.good ? 'tone-ok' : 'tone-warn')}>
            {c.pct > 0 ? '▲' : '▼'} {Math.abs(c.pct).toFixed(1)}%
          </span>
        </div>
        <LineChart key={`${metric}-${range}`} values={s[range]} labels={labels} format={fmt(s, t)} label={t(s.label)} />
      </Band>

      <Band i={4} flush aria-label="Choose a metric">
        <ul className="rows">
          {SERIES.map((x, i) => {
            const v = x[range];
            const cc = change(x, range);
            return (
              <li key={x.id}>
                <button type="button" className={cx('row st__metric', x.id === metric && 'is-on')} aria-pressed={x.id === metric} onClick={() => setMetric(x.id)}>
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(x.label)}</span>
                    <span className={cx('M', cc.good ? 'tone-ok' : 'tone-warn')}>
                      {cc.pct > 0 ? '▲' : '▼'} {Math.abs(cc.pct).toFixed(1)}% · {t(range === 'weekly' ? '8 wks' : '6 mths')}
                    </span>
                  </span>
                  <span className="D row__val">{x.decimals ? v[v.length - 1].toFixed(x.decimals) : formatIN(v[v.length - 1])}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band rule="ink" i={5} aria-label="Profile against the squad">
        <SectionHead title="Vs squad" aside="Track Squad U-20 men · avg" />
        <Radar axes={RADAR_AXES} values={RADAR_ATHLETE} reference={RADAR_SQUAD} valueLabel={t('You')} refLabel={t('Squad average')} />
        <div className="st__sw">
          <div>
            <Label className="tone-ok">Strengths</Label>
            <p className="st__swtxt">
              {ranked
                .slice(0, 2)
                .map((r) => `${t(r.a)} ${r.v}`)
                .join(' · ')}
            </p>
          </div>
          <div>
            <Label className="tone-warn">Work on</Label>
            <p className="st__swtxt">
              {ranked
                .slice(-2)
                .reverse()
                .map((r) => `${t(r.a)} ${r.v}`)
                .join(' · ')}
            </p>
          </div>
        </div>
      </Band>

      <Band tone="panel" i={6} aria-label="Body and adherence">
        <Label>Body · since May</Label>
        <div className="st__strip">
          <StatStrip
            items={[
              { value: BODY.weightKg.toFixed(1), label: `kg · +${BODY.weightDelta}` },
              { value: `${BODY.bodyFat}%`, label: `Body fat · ${BODY.bodyFatDelta}`, tone: 'ok' },
            ]}
          />
        </div>
        <Label>Adherence · 8 weeks</Label>
        <div className="st__strip">
          <StatStrip
            items={[
              { value: `${ADHERENCE.training}%`, label: 'Training' },
              { value: `${ADHERENCE.nutrition}%`, label: 'Nutrition' },
              { value: ADHERENCE.sleepHrs.toFixed(1), label: 'Sleep · h' },
            ]}
          />
        </div>
      </Band>

      <StatsTests />

      <StatsDevices />
    </>
  );
}

/** Phase 1 test battery against the athlete's own history, each with how it was verified. */
function StatsTests() {
  const t = useT();
  const verified = useStore((s) => s.verified);
  const user = useCurrentUser();
  const entered = useStore((s) => s.entered);
  const queued = useStore((s) => s.syncQueue);
  const mine = [...resultsOf(user?.id ?? 'ath-arjun', entered), ...queued.filter((r) => r.athleteId === user?.id)];
  return (
    <>
      <Band i={7} flush aria-label="Tests">
        <SectionHead title="Tests" aside="Own history · protocol v1.0" />
        <ul className="rows">
          {mine.map((r, i) => (
            <li key={r.id}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main pb__rowcol">
                  <ResultLine r={r} v={verificationOf(r, verified)} />
                </span>
                {r.better && <span className="M tone-ok">{t('▲ better')}</span>}
              </div>
            </li>
          ))}
        </ul>
        <p className="pb__empty pb__note">{t('Self-entered results count for your own progress. Ask your coach to verify one before it can count for selection.')}</p>
      </Band>
      <SelfEntry />
      <Band rule="ink" i={7} aria-label="Age stage">
        <StageCard months={ARJUN_AGE_MONTHS} sport="Athletics" />
      </Band>
    </>
  );
}

/** Athletes self-enter a test; it counts for their own progress until a coach verifies it. */
function SelfEntry() {
  const t = useT();
  const user = useCurrentUser();
  const enter = useStore((s) => s.enterResults);
  const tests = TEST_BATTERY.filter((b) => b.sport !== 'Weightlifting');
  const [test, setTest] = useState(tests[1].name);
  const [value, setValue] = useState('');
  const [done, setDone] = useState(false);
  const unit = tests.find((b) => b.name === test)?.unit ?? '';
  return (
    <Band rule="ink" i={7} aria-label="Add a result">
      <SectionHead title="Add a result" aside="Self-entered" />
      <div className="be__rows">
        <label className="be__field">
          <Label>Test</Label>
          <select className="be__select" value={test} onChange={(e) => setTest(e.target.value)}>
            {tests.map((b) => (
              <option key={b.name} value={b.name}>
                {t(b.name)}
              </option>
            ))}
          </select>
        </label>
        <span className="be__input">
          <input aria-label={t('Result')} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} />
          <span className="M">{unit}</span>
        </span>
      </div>
      <PillButton
        variant="ink"
        block
        className="ct__go"
        disabled={!value.trim() || !user}
        onClick={() => {
          if (!user) return;
          enter([
            { id: `tr-s-${Date.now().toString(36)}`, athleteId: user.id, test, value: `${value.trim()} ${unit}`.trim(), method: 'Stopwatch', verification: 'self', tester: 'Self', date: todayDDMM() },
          ]);
          setValue('');
          setDone(true);
        }}
      >
        Save result
      </PillButton>
      {done && <p className="pb__note tone-ok">{t('Saved. Your coach is asked to verify it.')}</p>}
    </Band>
  );
}

/** Fitness-band preview, blended with today's check-in. */
function StatsDevices() {
  const user = useCurrentUser();
  const feel = useStore((s) => s.feel);
  return <DevicesPanel athleteId={user?.id ?? 'ath-arjun'} audience="athlete" feel={feel === null ? null : FEEL_READINESS[feel]} i={8} />;
}
