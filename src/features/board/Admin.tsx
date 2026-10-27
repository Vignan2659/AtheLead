import { Band, Label, PillButton, RowNum, ScreenHeader, SectionHead, StatStrip, Title, cx } from '../../design/primitives';
import {
  DATA_CLASSES, FLAG_META, FLAG_RULES, PILOT_ATHLETES, PILOT_SITES, SUCCESS_BASELINE, TEST_RESULTS, ageBand, stageOf, yearsOf,
} from '../../data/pilot';
import { allFlags, flagState, ruleValue, useAuditView, useCurrentUser, useStore, verificationOf } from '../../state/store';
import { useT } from '../../i18n';
import '../pilot/pilot.css';

/** Pseudonymised IDs: names stay out of exports and national analytics. */
const pseudo = (id: string) => `VSU-${[...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36).toUpperCase().slice(0, 6)}`;

/** State admin: success measures, flag rules, sites, export and the audit log. */
export function BoardAdmin() {
  const user = useCurrentUser();
  const t = useT();
  const s = useStore();
  useAuditView('Opened admin dashboard', 'Tamil Nadu pilot');

  const results = [...TEST_RESULTS, ...s.entered.filter((r) => PILOT_ATHLETES.some((a) => a.id === r.athleteId))];
  const verifiedShare = Math.round((results.filter((r) => verificationOf(r, s.verified) !== 'self').length / results.length) * 100);
  const flags = allFlags(s.raisedFlags);
  const confirmed = flags.filter((f) => flagState(f, s) === 'confirmed');
  const recorded = confirmed.filter((f) => s.trialOutcomes[f.id] && s.trialOutcomes[f.id] !== 'absent');
  const precision = recorded.length ? `${Math.round((recorded.filter((f) => s.trialOutcomes[f.id] === 'selected').length / recorded.length) * 100)}%` : '—';
  const b = SUCCESS_BASELINE;
  const nameOf = (id: string) => s.users.find((u) => u.id === id)?.name ?? id;

  const exportCsv = () => {
    // Performance class only. Wellness answers are never exported; names are pseudonymised.
    const rows = [['athlete_id', 'sex', 'age_band', 'stage', 'sport', 'origin', 'test', 'value', 'method', 'verification', 'protocol', 'date']];
    for (const r of results) {
      const a = PILOT_ATHLETES.find((x) => x.id === r.athleteId)!;
      rows.push([pseudo(a.id), a.gender === 'men' ? 'M' : 'F', ageBand(a.ageMonths), stageOf(yearsOf(a.ageMonths)).id, a.sport, a.origin, r.test, r.value, r.method, verificationOf(r, s.verified), 'v1.0', r.date]);
    }
    const csv = rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'athelead-tn-pilot-performance.csv';
    link.click();
    URL.revokeObjectURL(url);
    s.logAccess('Exported performance CSV', t('{n} results, pseudonymised', { n: results.length }));
  };

  return (
    <>
      <ScreenHeader label="Tamil Nadu pilot — State admin" initials={user?.initials ?? 'MI'}>
        <Title lines={['Pilot', 'Admin.']} />
      </ScreenHeader>

      <Band tone="panel" i={2} aria-label="Pilot success measures">
        <Label>Pilot success measures</Label>
        <StatStrip
          items={[
            { value: `${b.baselineComplete}%`, label: 'Full baseline' },
            { value: `${verifiedShare}%`, label: 'Coach-verified', tone: 'ok' },
            { value: `${b.weeklyCoaches}/${b.coachesTotal}`, label: 'Coaches weekly' },
          ]}
        />
        <StatStrip
          items={[
            { value: precision, label: 'Flag precision' },
            { value: `${b.retention}%`, label: 'Retention' },
            { value: `${b.syncSuccess}%`, label: 'Sync success' },
          ]}
        />
        <p className="pb__note">
          {t('Test-retest r = {r} · privacy incidents: {n}', { r: b.testRetest.toFixed(2), n: b.privacyIncidents })}
        </p>
      </Band>

      <Band rule="ink" i={3} flush aria-label="Flag rules">
        <SectionHead title="Flag rules" aside="Expert-set · versioned" />
        {FLAG_RULES.map((r) => {
          const v = ruleValue(s.ruleVersions, r.id);
          const history = s.ruleVersions.filter((x) => x.ruleId === r.id);
          return (
            <div className="pb__card" key={r.id}>
              <span className="row__name">{t(FLAG_META[r.id].label)}</span>
              <span className="M">{t(r.text)}</span>
              <div className="ad__rule">
                <PillButton variant="outline" className="pill--sm" aria-label="Lower" disabled={v <= r.min} onClick={() => s.setRule(r.id, v - r.step)}>
                  −
                </PillButton>
                <span className="D ad__val">
                  {v}
                  <small> {t(r.unit)}</small>
                </span>
                <PillButton variant="outline" className="pill--sm" aria-label="Raise" disabled={v >= r.max} onClick={() => s.setRule(r.id, v + r.step)}>
                  +
                </PillButton>
              </div>
              <span className="M tone-ink">
                {history.length
                  ? t('v{n} · {who} · was {old}', { n: history.length + 1, who: history[0].by, old: history[1]?.value ?? r.value })
                  : t('v1 · expert default')}
              </span>
            </div>
          );
        })}
        <p className="pb__empty pb__note">{t('Rules before machine learning: no learning models until thousands of verified records exist.')}</p>
      </Band>

      <Band i={4} flush aria-label="Sites">
        <SectionHead title="Sites" aside="Rosters · verified share" />
        <ul className="rows">
          {PILOT_SITES.map((site, i) => (
            <li key={site.name}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{site.name}</span>
                  <span className="M">{t('{n} tested', { n: site.tested })}</span>
                </span>
                <span className={cx('D row__val', site.verified < 60 && 'tone-warn')}>{site.verified}%</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="cobalt" i={5} aria-label="Export">
        <Label>Export · CSV</Label>
        <p className="pb__note">
          {t('Performance results only, with pseudonymised IDs, in the format agreed with the state sports body. Health and wellness are never exported.')}
        </p>
        <PillButton variant="white" block arrow className="ct__go" onClick={exportCsv}>
          {t('Download {n} results', { n: results.length })}
        </PillButton>
      </Band>

      <Band rule="ink" i={6} flush aria-label="Data classes">
        <SectionHead title="Data classes" aside="Who can see what" />
        <ul className="rows">
          {DATA_CLASSES.map((d) => (
            <li key={d.id}>
              <div className="row">
                <span className="D row__num">{d.id}</span>
                <span className="row__main">
                  <span className="row__name">{t(d.name)}</span>
                  <span className="M">{t(d.examples)}</span>
                  <span className="M tone-cobalt">{t(d.who)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={7} flush aria-label="Audit log">
        <SectionHead title="Audit log" aside={t('{n} entries', { n: s.auditLog.length })} />
        {s.auditLog.length === 0 && <p className="pb__empty">{t('No access recorded yet.')}</p>}
        <ul className="rows">
          {s.auditLog.slice(0, 12).map((e) => (
            <li key={e.at + e.action}>
              <div className="row">
                <span className="M row__num">{new Date(e.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                <span className="row__main">
                  <span className="row__name">{t(e.action)}</span>
                  <span className="M">
                    {nameOf(e.userId)} · {t(e.detail)}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}
