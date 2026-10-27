import { Link } from 'react-router-dom';
import { Band, Label, RowNum, SectionHead, StatStrip, Title } from '../../design/primitives';
import { PATHWAY_BY_GENDER, RURAL_SHARE_BY_STAGE, TARGET_2036_BY_GENDER, UNION_BY_GENDER } from '../../data/inclusion';
import { PATHWAY_STAGES } from '../../data/mission2036';
import { formatIN, pad2 } from '../../lib/format';
import { useT } from '../../i18n';
import { LangSwitch } from '../../design/LangSwitch';
import './mission.css';

const BRIDGE = [
  {
    name: 'Discover',
    text: 'Athletes join from any village. District trials and coach referrals log them with verified data, so nobody depends on who they know.',
  },
  {
    name: 'Develop',
    text: "Coaches track every athlete's training, workload, movement and readiness, and change each plan as the athlete progresses.",
  },
  {
    name: 'Fuel',
    text: 'Diet plans for every sport and position, built on Indian food and respecting veg, eggetarian and allergy needs.',
  },
  {
    name: 'Decide',
    text: 'The board sees data from every district, with men and women analysed separately, and selects for national camps on evidence.',
  },
  {
    name: 'Deliver',
    text: 'An Olympic core for 2036, with every step from grassroots to the Games tracked in one place.',
  },
];

const ROLES = [
  { name: 'Athlete', text: 'Gets seen, gets a coach, logs training and meals, and sees exactly where they stand on the road to 2036.' },
  { name: 'Coach', text: 'Tracks the squad, spots injury risk early, and adjusts plans from real progress data.' },
  { name: 'Guardian', text: 'Sees their child’s summary and stage, and gives or withdraws consent for each use of the data.' },
  { name: 'District officer', text: 'Reviews talent flags from verified tests and confirms trial invitations. Never sees health details.' },
  { name: 'Board', text: 'Finds rural talent, compares men and women fairly, and approves selections with a reason for each.' },
];

const MVP = [
  'Shown with athletics, plus weightlifting in the Tamil Nadu pilot',
  'Age stages 10 to 24: foundation, development, specialisation, performance',
  'Every test result is self-entered, coach-verified or video-verified',
  'Three flag types (performance, progress, potential), each reviewed by a coach and a district officer',
  'Guardian consent by purpose for athletes under 18',
  'Athlete: daily check-in, session logging, Road to 2036, diet plan',
  'Coach: squad workload, plan changes by progress, 2036 pathway',
  'Board: pathway funnel by gender, rural talent, decision deck',
  'Role-based access: each person sees only what they should',
  'Athletes from all 36 states and union territories; Tamil Nadu is the Phase 1 pilot',
  'English and Tamil',
  'Phone OTP sign-in, 15-minute timeout on shared phones, an audit log of every access',
  'Weekly wellbeing check-in with referral to a designated adult, plus an injury log',
  'Food finder by diet, budget and allergy; balanced plate under 18, ranges from 18',
  'Offline test entry for a whole group, synced later; conflicts go to the coach',
  'Coach-approved plans by sport and age stage',
  'Admin: flag rules with versions, pseudonymised CSV export, pilot success measures',
];

const NEXT = [
  'Live band sync through Health Connect and HealthKit, after pilot devices are confirmed',
  'Hockey as the second sport (shares the speed and agility tests); squash in phase 3',
  'Hindi, Telugu, Bengali, Marathi and more regional languages',
  'Real backend in an Indian cloud region, with SMS OTP and encrypted health data',
  'Sports SLM running on-premise, on Indian data',
];

/** Phase 1 release plan from the architecture doc. Everything below is shown in this MVP with demo data. */
const RELEASES = [
  { id: '1A', name: 'Core data loop', text: 'Identity and consent, sites and rosters, profiles, tests with coach verification, flag queue, export' },
  { id: '1B', name: 'Training and health', text: 'Plans by age stage, session logging, health check-ins, injury log, alerts' },
  { id: '1C', name: 'Wearables', text: 'Band permissions per data type, manual fallback; live sync once devices are confirmed' },
  { id: '1D', name: 'Nutrition and wellness', text: 'Food finder, adult ranges, weekly wellbeing check-in and referrals' },
];

/** One athlete, start to finish: the step-by-step story for the presentation. */
const JOURNEY = [
  { step: 'Found', when: '2024', text: 'Arjun Reddy runs 49.8 s for 400 m at district trials near Nandigama, NTR district. The time is logged; he enters the pathway at District.' },
  { step: 'Coached', when: '2025', text: 'Coach Ravi Menon takes him into Track Squad U-20. Every session, check-in and test is recorded in AtheLead.' },
  { step: 'Measured', when: 'Next', text: 'A fitness band adds sleep, heart-rate variability and resting heart rate, so readiness is measured, not guessed.' },
  { step: 'Adjusted', when: 'Oct 2026', text: 'His 300 m time trial drops 1.2 s in eight weeks. The SLM suggests a third endurance session; Ravi approves it.' },
  { step: 'Fuelled', when: 'Daily', text: 'A diet plan for a 400 m sprinter, built on Indian food and his peanut allergy.' },
  { step: 'Selected', when: 'Feb 2027', text: 'PB 47.62, development index 71 of the 75 gate. The board sees verified data and invites him to national camp trials.' },
  { step: '2036', when: 'Home Games', text: 'Ten years of tracked development. Arjun is 29, at a 400 m runner’s peak, when India hosts.' },
];

const WHY_ATHLETICS = [
  'The most medal events at an Olympic Games, each held for men and women',
  'Little equipment needed, so it’s where village talent shows up first',
  'Every result is a time or a distance: progress anyone can read',
];

const BANDS = ['Fitbit', 'WHOOP', 'Noise', 'Garmin', 'boAt', 'Amazfit', 'Apple Watch'];

export function Mission() {
  const last = PATHWAY_STAGES.length - 1;
  const t = useT();
  return (
    <div className="mi">
      <header className="hdr">
        <div className="hdr__top">
          <Label>Velora Sports Union · India</Label>
          <LangSwitch />
        </div>
        <Title lines={['Mission', '2036.']} className="mi__title" />
        <p className="mi__lede rise" style={{ ['--i' as string]: 2 }}>
          {t('AtheLead is the bridge between rural India’s athletes and the board that selects them, so India wins the most medals it can at the 2036 Olympic Games, which India is bidding to host.')}
        </p>
      </header>

      <Band tone="panel" i={2} aria-label="The gap">
        <Label>The gap</Label>
        <h2 className="D mi__big">
          {t('Talent is in every village.')} <span className="tone-coral">{t('Selection isn’t.')}</span>
        </h2>
        <p className="mi__text">
          {t('A gifted fifteen-year-old in Barmer or Simdega often has no coach tracking them, no data, and no route to the selectors. That talent is lost before anyone knows it existed.')}
        </p>
        <StatStrip
          items={[
            { value: `${RURAL_SHARE_BY_STAGE[0]}%`, label: 'Start rural' },
            { value: `${RURAL_SHARE_BY_STAGE[last]}%`, label: 'Reach Olympic core' },
            { value: formatIN(UNION_BY_GENDER.women), label: 'Women on pathway' },
          ]}
        />
        <p className="M mi__src">Velora Sports Union demo data</p>
      </Band>

      <Band i={3} flush aria-label="The bridge">
        <SectionHead title="The bridge" aside="Village → Games" />
        <ul className="rows">
          {BRIDGE.map((b, i) => (
            <li key={b.name}>
              <div className="row mi__row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">{t(b.name)}</span>
                  <span className="mi__rowtext">{t(b.text)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="panel" i={4} aria-label="Why athletics">
        <Label>MVP sport</Label>
        <h2 className="D mi__big">{t('Shown with athletics.')}</h2>
        <ul className="mi__list mi__list--dark">
          {WHY_ATHLETICS.map((w) => (
            <li key={w}>{t(w)}</li>
          ))}
        </ul>
        <p className="M mi__src">Other Olympic sports follow on the same pathway</p>
      </Band>

      <Band i={4} flush aria-label="Step by step">
        <SectionHead title="Step by step" aside="One athlete · village → Games" />
        <ul className="rows">
          {JOURNEY.map((j, i) => (
            <li key={j.step}>
              <div className="row mi__row">
                <RowNum n={i + 1} />
                <span className="row__main">
                  <span className="row__name">
                    {t(j.step)} <span className="M mi__when">{t(j.when)}</span>
                  </span>
                  <span className="mi__rowtext">{t(j.text)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="cobalt" i={4} aria-label="Who gets what">
        <Label>Five roles, one pathway</Label>
        <ul className="mi__roles">
          {ROLES.map((r) => (
            <li key={r.name}>
              <span className="D mi__role">{t(r.name)}</span>
              <span className="mi__roletext">{t(r.text)}</span>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={5} aria-label="Gender sections">
        <SectionHead title="Men and women" aside="Analysed separately" />
        <p className="mi__text mi__text--ink">
          {t('Olympic events are split by gender, so every ranking, funnel and benchmark is too. Selectors compare like with like, and the women’s pipeline is visible on its own.')}
        </p>
        <StatStrip
          items={[
            { value: formatIN(UNION_BY_GENDER.men), label: 'Men' },
            { value: formatIN(UNION_BY_GENDER.women), label: 'Women' },
            {
              value: pad2(TARGET_2036_BY_GENDER.men + TARGET_2036_BY_GENDER.women),
              label: t('2036 core · {m} M + {w} W', { m: TARGET_2036_BY_GENDER.men, w: TARGET_2036_BY_GENDER.women }),
            },
          ]}
        />
        <p className="M mi__src">
          {t('Olympic core today: {m} men · {w} women', { m: PATHWAY_BY_GENDER.men[last], w: PATHWAY_BY_GENDER.women[last] })}
        </p>
      </Band>

      <Band rule="ink" i={6} aria-label="Fitness bands">
        <SectionHead title="Fitness bands" aside="Next" />
        <p className="mi__text mi__text--ink">
          {t('Linking the bands athletes already wear gives more precise stats for everyone: the athlete sees real recovery and sleep, the coach sets load from measured data, and the board selects on device-verified readiness. Heart and sleep data stay with the athlete and coach.')}
        </p>
        <ul className="mi__chips">
          {BANDS.map((b) => (
            <li key={b} className="M">
              {b}
            </li>
          ))}
        </ul>
      </Band>

      <Band tone="panel" i={6} aria-label="Sports SLM">
        <Label>Sports SLM</Label>
        <h2 className="D mi__big">{t('The AI suggests. People decide.')}</h2>
        <p className="mi__text">
          {t('The Sports SLM reads training, diet, match and tournament data and suggests next steps. Every suggestion shows why. Coaches and board members make the final decision.')}
        </p>
      </Band>

      <Band i={7} flush aria-label="Phase 1 releases">
        <SectionHead title="Phase 1" aside="Tamil Nadu pilot · 6–9 months" />
        <ul className="rows">
          {RELEASES.map((r) => (
            <li key={r.id}>
              <div className="row">
                <span className="D row__num">{r.id}</span>
                <span className="row__main">
                  <span className="row__name">{t(r.name)}</span>
                  <span className="M">{t(r.text)}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band rule="ink" i={7} className="mi__scope" aria-label="What is in this MVP">
        <div>
          <Label className="tone-cobalt">In this MVP</Label>
          <ul className="mi__list">
            {MVP.map((m) => (
              <li key={m}>{t(m)}</li>
            ))}
          </ul>
        </div>
        <div>
          <Label>Next</Label>
          <ul className="mi__list">
            {NEXT.map((m) => (
              <li key={m}>{t(m)}</li>
            ))}
          </ul>
        </div>
      </Band>

      <div className="mi__cta">
        <Link to="/signin" className="pill pill--coral pill--block">
          <span>{t('Try the demo')}</span>
          <span className="pill__arrow" aria-hidden="true">
            →
          </span>
        </Link>
        <Label>Demo password · demo1234</Label>
      </div>
    </div>
  );
}
