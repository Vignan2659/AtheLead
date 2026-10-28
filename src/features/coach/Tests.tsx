import { useState } from 'react';
import { SportTag } from '../../design/SportTag';
import { BodyLine } from '../../design/BodyLine';
import { Band, Label, PillButton, ScreenHeader, SectionHead, Segmented, StatStrip, Title, cx } from '../../design/primitives';
import {
  FLAG_META, FLAG_TYPES, PILOT_ATHLETES, PILOT_DISTRICT, PILOT_SPORTS, TEST_BATTERY, stageOf, yearsOf,
  type FlagType, type PilotSport,
} from '../../data/pilot';
import { allFlags, flagState, hasConsent, resultsOf, useAuditView, useCurrentUser, useStore, verificationOf } from '../../state/store';
import { BulkEntry, Conflicts, SquadSelfEntries } from './BulkEntry';
import { StagePlans } from './StagePlans';
import { AgeLine, FLAG_STATE_TEXT, FlagBadge, ResultLine } from '../pilot/PilotBits';
import { useT } from '../../i18n';
import '../pilot/pilot.css';

const SPORTS = PILOT_SPORTS.map((s) => ({ value: s, label: s }));

/** Pilot group tests: verify results, review rule flags, flag an athlete for review. */
export function CoachTests() {
  const user = useCurrentUser();
  const t = useT();
  const [sport, setSport] = useState<PilotSport>('Athletics');
  const [flagging, setFlagging] = useState<string | null>(null);
  const verified = useStore((s) => s.verified);
  const raised = useStore((s) => s.raisedFlags);
  const flagReviews = useStore((s) => s.flagReviews);
  const consent = useStore((s) => s.consent);
  const verify = useStore((s) => s.verifyResult);
  const review = useStore((s) => s.reviewFlag);
  const raise = useStore((s) => s.raiseFlag);

  const athletes = PILOT_ATHLETES.filter((a) => a.sport === sport);
  useAuditView('Viewed pilot results', sport);
  const entered = useStore((s) => s.entered);
  const results = athletes.flatMap((a) => resultsOf(a.id, entered));
  const selfCount = results.filter((r) => verificationOf(r, verified) === 'self').length;
  const flags = allFlags(raised).map((f) => ({ f, state: flagState(f, { flagReviews, verified, consent }) }));
  const forMe = flags.filter((x) => x.state === 'needs-coach' && athletes.some((a) => a.id === x.f.athleteId));
  const battery = TEST_BATTERY.filter((b) => b.sport === 'Both' || b.sport.startsWith(sport) || (sport === 'Weightlifting' && b.sport.includes('optional')));

  return (
    <>
      <ScreenHeader label={t('{district} pilot group — Tests', { district: PILOT_DISTRICT })} initials={user?.initials ?? 'RM'}>
        <Title lines={['Pilot', 'Tests.']} />
      </ScreenHeader>

      <Band rule="ink" i={2}>
        <Segmented label="Sport" options={SPORTS} value={sport} onChange={setSport} />
      </Band>

      <Band tone="panel" i={3} aria-label="Group summary">
        <StatStrip
          items={[
            { value: athletes.length, label: 'Athletes' },
            { value: selfCount, label: 'To verify', tone: selfCount ? 'warn' : 'ok' },
            { value: forMe.length, label: 'Flags to review' },
          ]}
        />
        <p className="pb__note">{t('Only verified results can raise a flag. Verified results are read-only; a correction makes a new version with a reason.')}</p>
      </Band>

      <BulkEntry sport={sport} i={4} />
      <Conflicts i={4} />
      <SquadSelfEntries i={4} />

      <Band rule="ink" i={4} flush aria-label="Flags to review">
        <SectionHead title="Flags" aside="Rules raised · you confirm" />
        {forMe.length === 0 && <p className="pb__empty">{t('No flags waiting for you.')}</p>}
        {forMe.map(({ f }) => {
          const a = PILOT_ATHLETES.find((x) => x.id === f.athleteId)!;
          return (
            <div className="pb__card" key={f.id}>
              <div className="pb__cardhead">
                <FlagBadge type={f.type} />
                <span className="M">{t(stageOf(yearsOf(a.ageMonths)).label)}</span>
              </div>
              <span className="row__name">
                {a.name}
                <SportTag of={a.id} />
              </span>
              <p className="pb__reason">{t(f.reason)}</p>
              <div className="pb__actions">
                <PillButton variant="ink" className="pill--sm" onClick={() => review(f.id, 'coach', 'confirmed')}>
                  Confirm · send to district
                </PillButton>
                <PillButton variant="outline" className="pill--sm" onClick={() => review(f.id, 'coach', 'rejected')}>
                  Not now
                </PillButton>
              </div>
            </div>
          );
        })}
      </Band>

      <Band i={5} flush aria-label="Athletes and results">
        <SectionHead title="Athletes" aside={t(sport)} />
        {athletes.map((a) => {
          const mine = results.filter((r) => r.athleteId === a.id);
          const best = mine.find((r) => verificationOf(r, verified) !== 'self');
          const theirFlags = flags.filter((x) => x.f.athleteId === a.id);
          const canShare = hasConsent(consent, a.id, 'talent');
          return (
            <div className="pb__card" key={a.id}>
              <div className="pb__cardhead">
                <span className="row__name">
                  {a.name}
                  <SportTag of={a.id} sportOnly />
                  {a.origin === 'rural' && <span className="M tag tag--rural">{t('Rural')}</span>}
                </span>
                <span className="M">{t(stageOf(yearsOf(a.ageMonths)).label)}</span>
              </div>
              <span className="M">
                <AgeLine months={a.ageMonths} /> · {t(a.event)}
              </span>
              <BodyLine of={a.id} noAge />
              {mine.map((r) => {
                const v = verificationOf(r, verified);
                return (
                  <div className="pb__rowcol pb__result" key={r.id}>
                    <ResultLine r={r} v={v} />
                    {v === 'self' && (
                      <div className="pb__actions">
                        <PillButton variant="ink" className="pill--sm" onClick={() => verify(r.id, 'coach')}>
                          Verify · I watched it
                        </PillButton>
                        <PillButton variant="outline" className="pill--sm" onClick={() => verify(r.id, 'video')}>
                          Verify from video
                        </PillButton>
                      </div>
                    )}
                  </div>
                );
              })}
              {theirFlags.map(({ f, state }) => (
                <span key={f.id} className="M pb__meta">
                  <FlagBadge type={f.type} /> <span className={cx('pb__state', FLAG_STATE_TEXT[state].tone)}>{t(FLAG_STATE_TEXT[state].text)}</span>
                </span>
              ))}
              {!canShare && <span className="M tone-warn">{t('Guardian has not consented to talent review')}</span>}
              {best && canShare && (
                <div className="pb__actions">
                  {flagging === a.id ? (
                    FLAG_TYPES.map((ty: FlagType) => (
                      <PillButton
                        key={ty}
                        variant="outline"
                        className="pill--sm"
                        disabled={theirFlags.some((x) => x.f.type === ty)}
                        onClick={() => {
                          raise(a.id, ty, best.id);
                          setFlagging(null);
                        }}
                      >
                        {FLAG_META[ty].label}
                      </PillButton>
                    ))
                  ) : (
                    <PillButton variant="outline" className="pill--sm" onClick={() => setFlagging(a.id)}>
                      Flag for review
                    </PillButton>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Band>

      <StagePlans sport={sport} i={6} />

      <Band rule="ink" i={6} aria-label="Test battery">
        <SectionHead title="Battery" aside={t('{sport} · protocol v1.0', { sport: t(sport) })} />
        <ul className="pb__list">
          {battery.map((b) => (
            <li key={b.name}>
              <span className="row__name">{t(b.name)}</span>
              <span className="M">{t(b.equipment)}</span>
            </li>
          ))}
        </ul>
        <Label>Every result records method, conditions, tester and status</Label>
      </Band>
    </>
  );
}
