import { Link } from 'react-router-dom';
import { Band, Label, PillButton, RowNum, ScreenHeader, SectionHead, Segmented, StatStrip, Title, cx } from '../../design/primitives';
import {
  CHILD_FOOD, CONSENT_PURPOSES, PILOT_DISTRICT, PLAN_TEMPLATES, isMinor, pilotAthlete, stageOf, yearsOf, type PilotAthlete,
} from '../../data/pilot';
import { allFlags, flagState, hasConsent, resultsOf, useAuditView, useCurrentUser, useStore, verificationOf } from '../../state/store';
import { AgeLine, FLAG_STATE_TEXT, FlagBadge, ResultLine, StageCard, useChildPick } from '../pilot/PilotBits';
import { useT } from '../../i18n';
import { BalancedPlate } from '../athlete/FuelMore';

/** The guardian's linked children, and the one in view. */
function useChildren(): { kids: PilotAthlete[]; child: PilotAthlete | undefined; pick: (id: string) => void } {
  const user = useCurrentUser();
  const picked = useChildPick((s) => s.id);
  const pick = useChildPick((s) => s.set);
  const kids = (user?.childIds ?? []).map(pilotAthlete).filter((a): a is PilotAthlete => !!a);
  return { kids, child: kids.find((k) => k.id === picked) ?? kids[0], pick };
}

function Header({ lines }: { lines: [string, string] }) {
  const user = useCurrentUser();
  return (
    <ScreenHeader label="Velora Sports Union — Guardian" initials={user?.initials ?? 'LM'}>
      <Title lines={lines} />
    </ScreenHeader>
  );
}

function ChildPicker({ kids, child, pick }: ReturnType<typeof useChildren>) {
  if (kids.length < 2 || !child) return null;
  return (
    <Band rule="ink" i={2}>
      <Segmented label="Child" options={kids.map((k) => ({ value: k.id, label: k.name.split(' ')[0] }))} value={child.id} onChange={pick} />
    </Band>
  );
}

function NoChild() {
  const t = useT();
  return (
    <Band i={2}>
      <Label>No child linked yet</Label>
      <p className="pb__note">{t('Ask your child’s coach for a link code. Once linked, you see their summary and choose what data is collected.')}</p>
    </Band>
  );
}

/* ---------- Child ---------- */

export function GuardianChild() {
  const ch = useChildren();
  const { child } = ch;
  const t = useT();
  const flags = useStore((s) => s.raisedFlags);
  const reviews = useStore((s) => s.flagReviews);
  const verified = useStore((s) => s.verified);
  const consent = useStore((s) => s.consent);
  const approved = useStore((s) => s.approvedPlans);
  useAuditView('Viewed child summary', child?.name ?? '—');

  if (!child) {
    return (
      <>
        <Header lines={['Your', 'Child.']} />
        <NoChild />
      </>
    );
  }
  const plan = PLAN_TEMPLATES.find((p) => p.sport === child.sport && p.stage === stageOf(yearsOf(child.ageMonths)).id);
  const myFlags = allFlags(flags).filter((f) => f.athleteId === child.id);
  const given = CONSENT_PURPOSES.filter((p) => hasConsent(consent, child.id, p.id)).length;

  return (
    <>
      <Header lines={['Your', 'Child.']} />
      <ChildPicker {...ch} />

      <Band i={3} aria-label="Summary">
        <div className="labelrow">
          <Label>{t('{sport} · {event}', { sport: t(child.sport), event: t(child.event) })}</Label>
          {child.origin === 'rural' && <span className="M tag tag--rural">{t('Rural')}</span>}
        </div>
        <p className="D pb__stagename">{child.name}</p>
        <p className="pb__stagetxt">
          <AgeLine months={child.ageMonths} /> · {child.home}
        </p>
        <p className="pb__stagetxt">{t('Coach Ravi Menon · {district} pilot group', { district: PILOT_DISTRICT })}</p>
      </Band>

      <Band tone="panel" i={4} aria-label="This week">
        <Label>This week</Label>
        <p className="pb__note">
          {plan && approved.includes(plan.id)
            ? t('{plan} · {n} a week · {m} min, approved by the coach.', { plan: t(plan.name), n: plan.perWeek, m: plan.minutes })
            : t('The coach hasn’t approved this term’s plan yet. Nothing starts without approval.')}
        </p>
        <StatStrip
          items={[
            { value: '3 / 3', label: 'Sessions' },
            { value: '5 / 6', label: 'Check-ins' },
            { value: '4.2/5', label: 'Wellbeing', tone: 'ok' },
          ]}
        />
        <p className="pb__note">
          {t(
            child.sport === 'Weightlifting'
              ? 'All lifting sessions are run with the coach present. No maximal lifts at this age.'
              : 'Sessions are short and play-based, with several events each week.',
          )}
        </p>
      </Band>

      <Band rule="ink" i={5} aria-label="Age stage">
        <StageCard months={child.ageMonths} sport={child.sport} />
      </Band>

      <BalancedPlate i={6} kcal={CHILD_FOOD[child.id]?.kcal} protein={CHILD_FOOD[child.id]?.protein} />

      <Band rule="ink" i={6} flush aria-label="Talent flags">
        <SectionHead title="Flags" aside={t('{n} open', { n: myFlags.length })} />
        {myFlags.length === 0 && <p className="pb__empty">{t('No flags this term. Flags come from verified tests and open a trial; they never close a door.')}</p>}
        {myFlags.map((f) => {
          const state = flagState(f, { flagReviews: reviews, verified, consent });
          const s = FLAG_STATE_TEXT[state];
          return (
            <div className="pb__card" key={f.id}>
              <div className="pb__cardhead">
                <FlagBadge type={f.type} />
                <span className={cx('M pb__state', s.tone)}>{t(s.text)}</span>
              </div>
              <p className="pb__reason">{t(f.reason)}</p>
              {state === 'no-consent' && (
                <Link className="M tone-cobalt" to="/guardian/consent">
                  {t('Review consent →')}
                </Link>
              )}
            </div>
          );
        })}
        <p className="pb__empty pb__note">{t('A flag opens an opportunity, such as a trial. It never labels a child as lacking talent.')}</p>
      </Band>

      <Band tone="cobalt" i={7} aria-label="Consent">
        <div className="labelrow">
          <Label>Consent</Label>
          <Label>{t('{n} of {total} given', { n: given, total: CONSENT_PURPOSES.length })}</Label>
        </div>
        <p className="pb__note">
          {t(isMinor(child.ageMonths) ? 'Your consent is needed until {name} turns 18.' : '{name} is an adult and consents for themselves.', {
            name: child.name.split(' ')[0],
          })}
        </p>
      </Band>
    </>
  );
}

/* ---------- Tests ---------- */

export function GuardianTests() {
  const ch = useChildren();
  const { child } = ch;
  const t = useT();
  const verified = useStore((s) => s.verified);
  const entered = useStore((s) => s.entered);
  if (!child) {
    return (
      <>
        <Header lines={['Test', 'Results.']} />
        <NoChild />
      </>
    );
  }
  const st = stageOf(yearsOf(child.ageMonths));
  // Foundation stage shows progress against the child's own history only.
  const ownOnly = st.id === 'foundation';
  const results = resultsOf(child.id, entered);
  return (
    <>
      <Header lines={['Test', 'Results.']} />
      <ChildPicker {...ch} />
      <Band i={3} flush aria-label="Results">
        <SectionHead title={child.name.split(' ')[0]} aside={ownOnly ? t('Own history only') : t('Own history · age band')} />
        <ul className="rows">
          {results.map((r, i) => (
            <li key={r.id}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main pb__rowcol">
                  <ResultLine r={r} v={verificationOf(r, verified)} showPct={!ownOnly} />
                </span>
                {r.better && <span className="M tone-ok">{t('▲ better')}</span>}
              </div>
            </li>
          ))}
        </ul>
      </Band>
      <Band tone="panel" i={4} aria-label="How results are checked">
        <Label>How results are checked</Label>
        <p className="pb__note">
          {t('Self-entered results count for your child’s own progress. Only coach- or video-verified results can raise a talent flag. Verified results are read-only; a correction makes a new version with a reason.')}
        </p>
        {ownOnly && <p className="pb__note">{t('At 10 to 12, results are compared only with your child’s own earlier tests, never ranked against others.')}</p>}
      </Band>
    </>
  );
}

/* ---------- Consent ---------- */

export function GuardianConsent() {
  const ch = useChildren();
  const { child } = ch;
  const t = useT();
  const consent = useStore((s) => s.consent);
  const log = useStore((s) => s.consentLog);
  const setConsent = useStore((s) => s.setConsent);
  if (!child) {
    return (
      <>
        <Header lines={['Your', 'Consent.']} />
        <NoChild />
      </>
    );
  }
  const mine = log.filter((l) => l.athleteId === child.id).slice(0, 5);
  return (
    <>
      <Header lines={['Your', 'Consent.']} />
      <ChildPicker {...ch} />
      <Band i={3} flush aria-label="Consent by purpose">
        <SectionHead title={child.name.split(' ')[0]} aside="By purpose" />
        {CONSENT_PURPOSES.map((p) => {
          const on = hasConsent(consent, child.id, p.id);
          return (
            <div className="pb__toggle" key={p.id}>
              <span className="row__name">{t(p.label)}</span>
              <PillButton
                className="pill--sm"
                aria-pressed={on}
                aria-label={t('{purpose}: {state}', { purpose: t(p.label), state: t(on ? 'Given' : 'Not given') })}
                onClick={() => setConsent(child.id, p.id, !on)}
              >
                {on ? 'Given ✓' : 'Give'}
              </PillButton>
              <p>{t(p.text)}</p>
            </div>
          );
        })}
      </Band>
      <Band tone="panel" i={4} aria-label="Your rights">
        <Label>Your rights</Label>
        <p className="pb__note">
          {t('Each purpose is separate. You can withdraw at any time, and collection stops from that moment. The coach is told straight away.')}
        </p>
        <p className="pb__note">{t('Health and wellness details are seen only by your child, you, the coach (summary only) and the designated reviewer.')}</p>
      </Band>
      <Band rule="ink" i={5} flush aria-label="Consent record">
        <SectionHead title="Record" aside="Latest first" />
        {mine.length === 0 && <p className="pb__empty">{t('No changes since the pilot began.')}</p>}
        <ul className="rows">
          {mine.map((l, i) => (
            <li key={l.at + l.purpose}>
              <div className="row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{t(CONSENT_PURPOSES.find((p) => p.id === l.purpose)?.label ?? '')}</span>
                  <span className="M">{new Date(l.at).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </span>
                <span className={cx('M', l.given ? 'tone-ok' : 'tone-warn')}>{t(l.given ? 'Given' : 'Withdrawn')}</span>
              </div>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}
