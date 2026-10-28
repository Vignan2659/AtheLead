import { Link } from 'react-router-dom';
import { SportTag } from '../../design/SportTag';
import { BodyLine } from '../../design/BodyLine';
import { Band, Bar, Label, RowNum, ScreenHeader, SectionHead, StatStrip, Title, cx } from '../../design/primitives';
import { GenderSwitch } from '../../design/GenderSwitch';
import { LineChart } from '../../design/Charts';
import { DEV_TREND, RETENTION, TALENT_FUNNEL } from '../../data/union';
import { RURAL_TALENT } from '../../data/inclusion';
import { STATES, ZONES } from '../../data/states';
import { PROSPECTS } from '../../data/scouting';
import { DECIDE_CARDS } from '../../data/board';
import { formatIN } from '../../lib/format';
import { DISTRICT_SPORT, FLAG_META, FLAG_TYPES, PILOT_DISTRICT, PILOT_SPORTS, VERIFIED_SHARE } from '../../data/pilot';
import type { SwipeDir } from '../../lib/swipe';
import { allFlags, flagState, useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import './boardtabs.css';
import '../pilot/pilot.css';

const VERDICT: Record<SwipeDir, { text: string; tone: string }> = {
  right: { text: 'Approved', tone: 'tone-ok' },
  up: { text: 'Sent back', tone: 'tone-warn' },
  left: { text: 'Declined', tone: 'tone-bad' },
};

export function BoardTalent() {
  const user = useCurrentUser();
  const gender = useStore((s) => s.genderView);
  const coachCards = useStore((s) => s.coachCards);
  const decisions = useStore((s) => s.boardDecisions);
  const invited = useStore((s) => s.invited);
  const toggleInvite = useStore((s) => s.toggleInvite);
  const t = useT();
  const top = TALENT_FUNNEL[0].n;
  const rural = RURAL_TALENT.filter((t) => t.gender === gender).sort((a, b) => b.devIndex - a.devIndex);
  const pool = PROSPECTS.filter((p) => p.gender === gender).sort((a, b) => b.potential - a.potential).slice(0, 4);
  const verdictOf = (id: string) => decisions.find((d) => d.cardId === id)?.dir;

  return (
    <>
      <ScreenHeader label="Velora Sports Union — Talent" initials={user?.initials ?? 'MI'}>
        <Title lines={['Next', 'Gen.']} />
      </ScreenHeader>

      <Band rule="ink" i={2} aria-label="Scouting funnel">
        <SectionHead title="Funnel" aside="This season" />
        <ul className="bt__funnel">
          {TALENT_FUNNEL.map((f, i) => (
            <li key={f.stage}>
              <span className="M">{t(f.stage)}</span>
              <Bar value={f.n / top} tone={i === TALENT_FUNNEL.length - 1 ? 'coral' : 'cobalt'} i={i} />
              <span className="D">{formatIN(f.n)}</span>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="panel" i={3} aria-label="Retention">
        <Label>Retention · 12 months</Label>
        <div className="bt__ret">
          <StatStrip
            items={[
              { value: `${RETENTION.rate}%`, label: 'All' },
              { value: `${RETENTION.rural}%`, label: 'Rural', tone: 'warn' },
              { value: `${RETENTION.urban}%`, label: 'Urban' },
            ]}
          />
        </div>
        <p className="bt__retnote">{t('Rural athletes leave more often. Travel support is the biggest lever.')}</p>
      </Band>

      <Band rule="ink" i={4} aria-label="Union development index">
        <SectionHead title="Dev index" aside="Union avg" />
        <LineChart values={DEV_TREND.values} labels={DEV_TREND.labels} format={(v) => v.toFixed(1)} label={t('Union development index')} />
      </Band>

      <Band rule="ink" i={5} flush aria-label="Coach recommendations">
        <SectionHead title="From coaches" aside={t('{n} raised', { n: coachCards.length })} />
        <ul className="rows">
          {coachCards.length === 0 && (
            <li>
              <p className="body bt__empty">{t('No coach recommendations yet. They also appear at the top of Decide on Home.')}</p>
            </li>
          )}
          {coachCards.map((c, i) => {
            const v = verdictOf(c.id);
            return (
              <li key={c.id}>
                <div className="row">
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(c.title)}</span>
                    <span className="M">
                      {t(c.owner)} · {c.confidence}%
                    </span>
                  </span>
                  <span className={cx('M', v ? VERDICT[v].tone : 'tone-cobalt')}>{t(v ? VERDICT[v].text : 'In Decide')}</span>
                </div>
              </li>
            );
          })}
          {DECIDE_CARDS.filter((c) => verdictOf(c.id)).map((c, i) => {
            const v = verdictOf(c.id)!;
            return (
              <li key={c.id}>
                <div className="row">
                  <RowNum n={coachCards.length + i + 1} />
                  <span className="row__main">
                    <span className="row__name">{t(c.title)}</span>
                    <span className="M">SLM · {t(c.owner)}</span>
                  </span>
                  <span className={cx('M', VERDICT[v].tone)}>{t(VERDICT[v].text)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band rule="ink" i={6}>
        <GenderSwitch note="Lists below" />
      </Band>

      <AcrossIndia gender={gender} />

      <PilotFlags gender={gender} />

      <Band i={6} flush aria-label="Rural talent">
        <SectionHead title="Rural risers" aside="Dev index" />
        <ul className="rows" key={gender}>
          {rural.map((r, i) => {
            const on = invited.includes(r.id);
            return (
              <li key={r.id} className="cascade" style={{ ['--i' as string]: i }}>
                <div className="row bt__rural">
                  <RowNum n={i + 1} />
                  <span className="row__main">
                    <span className="row__name">
                      {r.name}
                      <SportTag of={r.id} sportOnly />
                    </span>
                    <span className="M">
                      {t(r.event)} · {r.village}, {r.state}
                    </span>
                    <BodyLine of={r.id} />
                    <span className="M tone-ok">{t('+{n} this quarter', { n: r.trend })}</span>
                  </span>
                  <span className="D row__val">{r.devIndex}</span>
                  <button type="button" className="pill pill--sm bt__inv" aria-pressed={on} onClick={() => toggleInvite(r.id)}>
                    {t(on ? 'Invited' : 'Invite to trials')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band rule="ink" i={7} flush aria-label="Scouting pool">
        <SectionHead title="Scouting pool" aside="Athletics · potential" />
        <ul className="rows" key={gender}>
          {pool.map((p, i) => (
            <li key={p.id}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">
                    {p.name}
                    <SportTag of={p.id} sportOnly />
                    {p.origin === 'rural' && <span className="M tag tag--rural">{t('Rural')}</span>}
                  </span>
                  <span className="M">
                    {t(p.role)} · {p.home}
                  </span>
                  <BodyLine of={p.id} />
                </span>
                <span className="D row__val">{p.potential}</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}

/** Tamil Nadu pilot: athletics and weightlifting, flags by type, and how many results are verified. */
function PilotFlags({ gender }: { gender: 'men' | 'women' }) {
  const t = useT();
  const raised = useStore((s) => s.raisedFlags);
  const flagReviews = useStore((s) => s.flagReviews);
  const verified = useStore((s) => s.verified);
  const consent = useStore((s) => s.consent);
  const flags = allFlags(raised).map((f) => ({ f, state: flagState(f, { flagReviews, verified, consent }) }));
  const trials = flags.filter((x) => x.state === 'confirmed').length;
  return (
    <Band rule="ink" i={6} aria-label="Tamil Nadu pilot">
      <SectionHead title="TN pilot" aside={t('{district} · ages 10–24', { district: PILOT_DISTRICT })} />
      <ul className="pb__bars">
        {PILOT_SPORTS.map((sp, i) => (
          <li key={sp}>
            <span className="M">{t(sp)}</span>
            <Bar value={DISTRICT_SPORT[sp][gender] / DISTRICT_SPORT.Athletics[gender]} tone={i ? 'coral' : 'cobalt'} i={i} />
            <span className="D">{DISTRICT_SPORT[sp][gender]}</span>
          </li>
        ))}
      </ul>
      <div className="bt__ret">
        <StatStrip
          items={FLAG_TYPES.map((ty) => ({ value: flags.filter((x) => x.f.type === ty).length, label: FLAG_META[ty].label }))}
        />
      </div>
      <p className="bt__retnote">
        {t('{trials} trial invitations confirmed · {v}% of results verified. A coach and the district officer review every flag.', { trials, v: VERIFIED_SHARE })}
      </p>
      <Link className="pill pill--ink pill--block ct__go" to="/board/admin">
        <span>{t('Pilot admin: rules, export, audit')}</span>
        <span className="pill__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </Band>
  );
}

function AcrossIndia({ gender }: { gender: 'men' | 'women' }) {
  const zones = ZONES.map((z) => {
    const rows = STATES.filter((s) => s.zone === z);
    const n = rows.reduce((a, s) => a + s[gender], 0);
    const rural = Math.round(rows.reduce((a, s) => a + s.ruralShare * s[gender], 0) / Math.max(n, 1));
    return { z, n, rural, count: rows.length };
  });
  const max = Math.max(...zones.map((z) => z.n));
  const thin = STATES.filter((s) => !s.ut)
    .sort((a, b) => a[gender] / a.districts - b[gender] / b.districts)
    .slice(0, 3);
  const pilot = STATES.find((s) => s.pilot);
  const t = useT();
  return (
    <Band rule="ink" i={6} aria-label="Across India">
      <SectionHead title="Across India" aside={t('{n} states & UTs', { n: STATES.length })} />
      <ul className="bt__funnel bt__zones" key={gender}>
        {zones.map((z, i) => (
          <li key={z.z}>
            <span className="M">{t(z.z)}</span>
            <Bar value={z.n / max} tone="cobalt" i={i} />
            <span className="D">{z.n}</span>
            <span className="M bt__zonemeta">
              {t('{n} states & UTs', { n: z.count })} · {t('{n}% rural', { n: z.rural })}
            </span>
          </li>
        ))}
      </ul>
      <p className="bt__retnote bt__zonenote">
        {t('Fewest athletes per district: {list}. Trials there reach the most new talent.', { list: thin.map((s) => s.name).join(', ') })}
      </p>
      {pilot && (
        <p className="bt__retnote bt__zonenote">
          {t('Pilot state: {name} · {n} athletes · {d} districts.', { name: pilot.name, n: pilot[gender], d: pilot.districts })}
        </p>
      )}
    </Band>
  );
}
