import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Band, Chevron, Expander, Label, RowNum, ScreenHeader, SectionHead, Segmented, Title } from '../../design/primitives';
import { DRILL_RULES, EXERCISES, LOAD_LABEL, SPORTS, photoUrl, sportPlan, type Exercise, type Pictogram } from '../../data/drills';
import { ARJUN_AGE_MONTHS, yearsOf } from '../../data/pilot';
import { useCurrentUser } from '../../state/store';
import { useT } from '../../i18n';
import './drills.css';

const AGES = [
  { value: 'young', label: 'Under 16' },
  { value: 'adult', label: '16 and over' },
] as const;
type Age = (typeof AGES)[number]['value'];
const GROUPS = [
  { label: 'Athletics', sports: SPORTS.filter((s) => s.group === 'Athletics') },
  { label: 'Other sports', sports: SPORTS.filter((s) => !s.group) },
];

/** Sport-specific strength work: what the body needs, then photo exercises for each need. */
export function SportDrills() {
  const user = useCurrentUser();
  const t = useT();
  const [sportId, setSportId] = useState('sprint');
  const [age, setAge] = useState<Age>(user?.role === 'athlete' && yearsOf(ARJUN_AGE_MONTHS) < 16 ? 'young' : 'adult');
  const [open, setOpen] = useState<string | null>(null);
  const sport = sportPlan(sportId);

  const pick = (id: string) => {
    setSportId(id);
    setOpen(null);
  };

  return (
    <>
      <ScreenHeader label="Train for your sport" initials={user?.initials ?? 'AR'}>
        <Title lines={['Build', 'Body.']} />
      </ScreenHeader>

      <Band tone="panel" i={2} aria-label="Sport">
        {GROUPS.map((g) => (
          <div key={g.label} className="dr__group">
            <Label>{g.label}</Label>
            <div className="dr__sports" role="group" aria-label={t(g.label)}>
              {g.sports.map((s) => (
                <button key={s.id} type="button" className="pill pill--sm dr__sport" aria-pressed={s.id === sportId} onClick={() => pick(s.id)}>
                  {t(s.name)}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="dr__age">
          <Segmented label="Age" options={AGES} value={age} onChange={setAge} />
        </div>
      </Band>

      <Band rule="ink" i={3} flush aria-label="What your body needs">
        <SectionHead title={sport.group ? `${t(sport.group)} · ${t(sport.name)}` : sport.name} aside="What your body needs" />
        <ul className="rows">
          {sport.needs.map((n, k) => (
            <li key={n.id}>
              <a className="row dr__need" href={`#need-${n.id}`}>
                <RowNum n={k + 1} />
                <span className="row__main">
                  <span className="row__name">{t(n.name)}</span>
                  <span className="M">{t(n.body)}</span>
                </span>
                <span className="D row__val">
                  {sport.items.filter((x) => x.need === n.id).length}
                  <span className="sr-only"> {t('exercises')}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Band>

      {sport.needs.map((n, k) => (
        <Band key={`${sport.id}-${n.id}`} rule="ink" i={4 + k} flush aria-label={t(n.name)}>
          <div id={`need-${n.id}`} className="dr__anchor" />
          <SectionHead title={n.name} aside={n.body} />
          <ul className="rows">
            {sport.items
              .filter((x) => x.need === n.id)
              .map((item) => {
                const ex = EXERCISES[item.ex];
                const key = `${sport.id}-${item.ex}`;
                const isOpen = open === key;
                const young = age === 'young' && ex.load === 'bar';
                return (
                  <li key={key}>
                    <button
                      type="button"
                      className="row dr__row"
                      aria-expanded={isOpen}
                      aria-controls={`dr-${key}`}
                      onClick={() => setOpen(isOpen ? null : key)}
                    >
                      <Thumb ex={ex} />
                      <span className="row__main">
                        <span className="row__name">{t(ex.name)}</span>
                        <span className="M">
                          {t(item.dose)} · {t(young ? 'Stick or empty bar' : LOAD_LABEL[ex.load])}
                        </span>
                      </span>
                      <Chevron />
                    </button>
                    <Expander open={isOpen} id={`dr-${key}`}>
                      <div className="dr__detail">
                        {isOpen && <Frames ex={ex} />}
                        <p className="body">
                          <Label className="tone-cobalt">{t('For {sport}', { sport: t(sport.name) })}</Label> {t(item.why)}
                        </p>
                        {young && <p className="dr__young">{t('Under 16: learn this with a stick or an empty bar, with the coach present. No added load.')}</p>}
                        <Label>How to do it</Label>
                        <ol className="dr__cues">
                          {ex.cues.map((c) => (
                            <li key={c}>{t(c)}</li>
                          ))}
                        </ol>
                        <p className="dr__line">
                          <Label>Targets</Label> {ex.targets.map((x) => t(x)).join(' · ')}
                        </p>
                        <p className="dr__line">
                          <Label className="tone-coral">Safety</Label> {t(ex.safety)}
                        </p>
                      </div>
                    </Expander>
                  </li>
                );
              })}
          </ul>
        </Band>
      ))}

      <Band tone="panel" i={4 + sport.needs.length} aria-label="Safety rules">
        <Label>Every sport · safety rules</Label>
        <ol className="dr__rules">
          {DRILL_RULES.map((r) => (
            <li key={r}>{t(r)}</li>
          ))}
        </ol>
        <p className="M dr__credit">{t('Photos: free-exercise-db, public domain. A strength coach reviews this list before launch.')}</p>
      </Band>
    </>
  );
}

/** Entry point on the Train tabs. */
export function DrillsLink({ to, i }: { to: string; i: number }) {
  const t = useT();
  return (
    <Band rule="ink" i={i} aria-label="Train for your sport">
      <div className="labelrow">
        <Label>Train for your sport</Label>
        <span className="M tone-cobalt">{t('{n} sports', { n: SPORTS.length })}</span>
      </div>
      <Link className="pill pill--outline pill--block dr__link" to={to}>
        <span>{t('Body needs & photo exercises')}</span>
        <span className="pill__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </Band>
  );
}

/** Start-position photo as a thumbnail, or a pictogram for drills with no photo. */
function Thumb({ ex }: { ex: Exercise }) {
  const [broken, setBroken] = useState(false);
  if (!ex.photo || broken) return <span className="dr__thumb dr__thumb--icon"><Picto icon={ex.icon ?? 'feet'} /></span>;
  return <img className="dr__thumb" src={photoUrl(ex.photo, 0)} alt="" loading="lazy" onError={() => setBroken(true)} />;
}

/** Start and finish photos side by side, so the movement reads without animation. */
function Frames({ ex }: { ex: Exercise }) {
  const t = useT();
  const [broken, setBroken] = useState(false);
  if (!ex.photo || broken)
    return (
      <figure className="dr__frames dr__frames--icon">
        <Picto icon={ex.icon ?? 'feet'} />
        {ex.photo && <figcaption className="M">{t('Photos load when you are online.')}</figcaption>}
      </figure>
    );
  return (
    <figure className="dr__frames">
      {([0, 1] as const).map((f) => (
        <div key={f}>
          <img src={photoUrl(ex.photo!, f)} alt={t(f === 0 ? '{name}: start position' : '{name}: finish position', { name: t(ex.name) })} onError={() => setBroken(true)} />
          <figcaption className="M">
            {f + 1} · {t(f === 0 ? 'Start' : 'Finish')}
          </figcaption>
        </div>
      ))}
    </figure>
  );
}

/** Line pictograms for drills the photo set doesn't cover. */
function Picto({ icon }: { icon: Pictogram }) {
  return (
    <svg viewBox="0 0 48 48" className="dr__picto" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {icon === 'breath' && (
        <>
          <path d="M24 8v14" />
          <path d="M24 20c-3 0-5-3-9-3-4 0-7 6-7 14 0 6 2 9 6 9 5 0 7-4 7-9V22" />
          <path d="M24 20c3 0 5-3 9-3 4 0 7 6 7 14 0 6-2 9-6 9-5 0-7-4-7-9V22" />
        </>
      )}
      {icon === 'feet' && (
        <>
          <path d="M14 30c-3 0-5-3-5-8s2-11 6-11 5 5 5 10-2 9-6 9Z" />
          <path d="M11 35h6" />
          <path d="M34 22c-3 0-5-3-5-8s2-8 5-8 5 4 5 8-2 8-5 8Z" />
          <path d="M31 27h6" />
          <path d="M8 42h8M32 42h8" strokeDasharray="2 4" />
        </>
      )}
      {icon === 'fist' && (
        <>
          <rect x="12" y="16" width="22" height="16" rx="5" />
          <path d="M19 16v8M26 16v8M12 24h10" />
          <path d="M16 32v6h14v-6" />
          <path d="M38 20h6M38 26h8M38 32h6" />
        </>
      )}
      {icon === 'aim' && (
        <>
          <circle cx="24" cy="24" r="16" />
          <circle cx="24" cy="24" r="9" />
          <circle cx="24" cy="24" r="2" fill="currentColor" />
          <path d="M24 2v8M24 38v8M2 24h8M38 24h8" />
        </>
      )}
    </svg>
  );
}
