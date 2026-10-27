import { Band, Bar, Label, RowNum, ScreenHeader, SectionHead, StatStrip, Title, cx } from '../../design/primitives';
import { GenderSwitch } from '../../design/GenderSwitch';
import { COACHES, SPORT_PARTICIPATION, TEAMS } from '../../data/union';
import { formatIN, pad2 } from '../../lib/format';
import { useCurrentUser, useStore } from '../../state/store';
import { useT } from '../../i18n';
import './boardtabs.css';

const formTone = (score: number) => (score >= 80 ? 'cobalt' : score >= 70 ? 'cobalt-light' : 'coral');

export function BoardTeams() {
  const user = useCurrentUser();
  const gender = useStore((s) => s.genderView);
  const teams = TEAMS.filter((t) => t.gender === gender).sort((a, b) => b.form - a.form);
  const unavailable = teams.reduce((a, t) => a + t.injured, 0);
  const athletes = teams.reduce((a, t) => a + t.athletes, 0);
  const coaches = [...COACHES].sort((a, b) => b.devGain - a.devGain);
  const maxSport = SPORT_PARTICIPATION[0].n;
  const tr = useT();

  return (
    <>
      <ScreenHeader label="Velora Sports Union — Teams" initials={user?.initials ?? 'MI'}>
        <Title lines={['Every', 'Team.']} />
      </ScreenHeader>

      <Band rule="ink" i={2}>
        <GenderSwitch note="Teams by section" />
      </Band>

      <Band rule="rule" i={2}>
        <StatStrip
          items={[
            { value: pad2(teams.length), label: 'Teams' },
            { value: formatIN(athletes), label: 'Athletes' },
            { value: pad2(unavailable), label: 'Unavailable', tone: 'bad' },
          ]}
        />
      </Band>

      <Band i={3} flush aria-label="Team form">
        <SectionHead title="Form" aside="Fitness status only" />
        <ul className="rows" key={gender}>
          {teams.map((t, i) => (
            <li key={t.id} className="cascade" style={{ ['--i' as string]: i }}>
              <div className={cx('row bt__team', t.support && 'needs')}>
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{tr(t.name)}</span>
                  <span className="M">
                    {tr(t.sport)} · {t.coach}
                  </span>
                  <span className="M">
                    {tr('Ready {r}% · {n} unavailable · {p}% rural', { r: t.readiness, n: t.injured, p: t.ruralShare })}
                    {t.record.w + t.record.l > 0 && ` · ${t.record.w}-${t.record.d}-${t.record.l}`}
                  </span>
                  {t.support && <span className="M tone-coral">{tr('Needs support · {why}', { why: tr(t.support) })}</span>}
                </span>
                <span className="D row__val">{t.form}</span>
                <div className="bt__bar">
                  <Bar value={t.form / 100} tone={formTone(t.form)} thin i={i + 2} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={4} flush aria-label="Coach performance">
        <SectionHead title="Coaches" aside="Dev gain · 6 months" />
        <ul className="rows">
          {coaches.map((c, i) => (
            <li key={c.id}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{c.name}</span>
                  <span className="M">
                    {tr(c.sport)} · {tr('{n} athletes · retention {r}% · {p}% rural', { n: c.athletes, r: c.retention, p: c.ruralShare })}
                  </span>
                </span>
                <span className={cx('D row__val', c.devGain < 3.5 && 'tone-warn')}>+{c.devGain}</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={5} aria-label="Participation by sport">
        <SectionHead title="By sport" aside={tr('{n} athletes', { n: '1,248' })} />
        <ul className="bt__sports">
          {SPORT_PARTICIPATION.map((s, i) => (
            <li key={s.sport}>
              <div className="labelrow">
                <span className="bt__sport">{tr(s.sport)}</span>
                <Label>{formatIN(s.n)}</Label>
              </div>
              <Bar value={s.n / maxSport} thin i={i} />
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}
