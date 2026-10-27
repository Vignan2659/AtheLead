import { useMemo, useState, type CSSProperties } from 'react';
import { SportTag } from '../../design/SportTag';
import { Link } from 'react-router-dom';
import { Band, Label, SectionHead, Segmented, StatStrip } from '../../design/primitives';
import { STATES, type StateRow } from '../../data/states';
import { GRID_COLS, GRID_ROWS, INDIA_GRID } from '../../data/indiaGrid';
import { RURAL_TALENT, type Gender } from '../../data/inclusion';
import { useStore } from '../../state/store';
import { useT } from '../../i18n';
import './talentmap.css';

type Metric = 'athletes' | 'rural' | 'reach';

const METRICS: { value: Metric; label: string }[] = [
  { value: 'athletes', label: 'Athletes' },
  { value: 'rural', label: 'Rural %' },
  { value: 'reach', label: 'Per district' },
];

const valueOf = (s: StateRow, m: Metric, g: Gender) =>
  m === 'athletes' ? s[g] : m === 'rural' ? s.ruralShare : s[g] / s.districts;

const fmt = (v: number, m: Metric) => (m === 'reach' ? v.toFixed(1) : m === 'rural' ? `${v}%` : String(v));

/**
 * Where talent is being missed: states that are mostly rural but have few
 * registered athletes per district. Scout these first.
 */
export function missedStates(g: Gender): Set<string> {
  const states = STATES.filter((s) => !s.ut);
  const reach = states.map((s) => s[g] / s.districts).sort((a, b) => a - b);
  const median = reach[Math.floor(reach.length / 2)];
  return new Set(states.filter((s) => s.ruralShare >= 70 && s[g] / s.districts < median).map((s) => s.name));
}

export function TalentMap({ i = 5 }: { i?: number }) {
  const t = useT();
  const gender = useStore((s) => s.genderView);
  const [metric, setMetric] = useState<Metric>('athletes');
  const [picked, setPicked] = useState(STATES.find((s) => s.pilot)?.name ?? STATES[0].name);

  const { level, missed } = useMemo(() => {
    const vals = STATES.map((s) => valueOf(s, metric, gender)).sort((a, b) => a - b);
    const cut = [0.2, 0.4, 0.6, 0.8].map((q) => vals[Math.floor(q * (vals.length - 1))]);
    return {
      level: (v: number) => cut.filter((c) => v > c).length,
      missed: missedStates(gender),
    };
  }, [metric, gender]);

  const s = STATES.find((x) => x.name === picked) ?? STATES[0];
  const talent = RURAL_TALENT.filter((r) => r.state === s.name);

  return (
    <Band rule="ink" i={i} aria-label="Talent map of India">
      <SectionHead title="Talent map" aside={`${t(gender === 'men' ? 'Men' : 'Women')} · ${t('{n} states & UTs', { n: STATES.length })}`} />
      <p className="tm__lede">{t('Where our athletes are, and where talent is being missed. Tap a state.')}</p>
      <Segmented label="Map shows" options={METRICS} value={metric} onChange={setMetric} />

      <div
        className="tm__grid"
        key={`${gender}-${metric}`}
        style={{ '--cols': GRID_COLS, '--rows': GRID_ROWS } as CSSProperties}
        role="group"
        aria-label={t('States and union territories')}
      >
        {STATES.map((st) => {
          const pos = INDIA_GRID[st.name];
          if (!pos) return null;
          const v = valueOf(st, metric, gender);
          return (
            <button
              key={st.name}
              type="button"
              className={`tm__t tm__t--${level(v)} ${missed.has(st.name) ? 'is-missed' : ''}`}
              style={{ gridColumn: pos[0] + 1, gridRow: pos[1] + 1, '--d': (pos[0] + pos[1]) * 30 + 'ms' } as CSSProperties}
              aria-pressed={st.name === picked}
              aria-label={`${st.name}: ${fmt(v, metric)}${missed.has(st.name) ? `, ${t('talent being missed')}` : ''}`}
              onClick={() => setPicked(st.name)}
            >
              <span className="tm__code">{pos[2]}</span>
              <span className="tm__val">{fmt(v, metric)}</span>
            </button>
          );
        })}
      </div>

      <div className="tm__legend" aria-hidden="true">
        <span className="M">{t('Low')}</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`tm__sw tm__t--${l}`} />
        ))}
        <span className="M">{t('High')}</span>
        <span className="M tm__missedkey">
          <span className="tm__dot" /> {t('Mostly rural, few athletes per district: scout here first')}
        </span>
      </div>

      <div className="tm__detail" key={s.name}>
        <div className="labelrow">
          <h3 className="D tm__state">{s.name}</h3>
          {s.pilot ? <span className="M tone-coral">{t('Pilot state')}</span> : missed.has(s.name) ? <span className="M tone-coral">{t('Scout here')}</span> : null}
        </div>
        <StatStrip
          items={[
            { value: s.men, label: t('Men') },
            { value: s.women, label: t('Women') },
            { value: `${s.ruralShare}%`, label: t('Rural') },
            { value: s.districts, label: t('Districts') },
          ]}
        />
        <p className="M tm__reach">
          {t('{n} {g} athletes per district', { n: (s[gender] / s.districts).toFixed(1), g: t(gender === 'men' ? 'men’s' : 'women’s') })}
        </p>
        {talent.length > 0 && (
          <ul className="tm__people">
            {talent.map((r) => (
              <li key={r.id}>
                <Link to={`/passport/${r.id}`} className="tm__person">
                  <span>
                    <span className="row__name">
                      {r.name}
                      <SportTag of={r.id} sportOnly />
                    </span>
                    <Label>
                      {r.event} · {r.village}
                    </Label>
                  </span>
                  <span className="M">{t('Passport →')}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Band>
  );
}
