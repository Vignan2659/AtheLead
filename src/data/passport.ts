import { ATHLETE_PROFILE } from './athlete';
import { ATHLETE_PATHWAY } from './mission2036';
import { RURAL_TALENT, type Gender, type Origin } from './inclusion';

/**
 * Athlete passport: a one-page, shareable record of verified performance.
 * Selectors scan its QR code at trials. Performance data only: health,
 * wellbeing, band and diet data never appear on a passport.
 */
export type VerifiedBy = 'meet' | 'video' | 'coach';

export const VERIFIED_LABEL: Record<VerifiedBy, string> = {
  meet: 'Official meet timing',
  video: 'Video-verified',
  coach: 'Coach-verified',
};

export interface PassportResult {
  label: string;
  value: string;
  date: string;
  by: VerifiedBy;
  where: string;
}

export interface Passport {
  id: string;
  /** Printed on the card, e.g. PL-36-0412. */
  number: string;
  name: string;
  gender: Gender;
  origin: Origin;
  event: string;
  pb: string;
  village: string;
  district: string;
  state: string;
  stage: number;
  devIndex: number;
  trend: number;
  nextGate?: number;
  discovered: string;
  coach: string;
  results: PassportResult[];
  /** PB progression for the chart: seconds or metres, oldest first. */
  progression?: { labels: string[]; values: number[]; unit: 's' | 'm' };
  signedBy: string;
  signedOn: string;
}

const ARJUN: Passport = {
  id: 'ath-arjun',
  number: 'PL-36-0412',
  name: 'Arjun Reddy',
  gender: ATHLETE_PROFILE.gender,
  origin: ATHLETE_PROFILE.origin,
  event: `Men’s ${ATHLETE_PROFILE.event}`,
  pb: ATHLETE_PROFILE.pb,
  village: ATHLETE_PROFILE.village,
  district: ATHLETE_PROFILE.district,
  state: ATHLETE_PROFILE.state,
  stage: ATHLETE_PATHWAY.stage,
  devIndex: ATHLETE_PATHWAY.devIndex,
  trend: ATHLETE_PATHWAY.devDelta,
  nextGate: ATHLETE_PATHWAY.nextGateIndex,
  discovered: ATHLETE_PROFILE.discovered,
  coach: 'Ravi Menon · Track Squad U-20',
  results: [
    { label: '400 m', value: '47.62', date: '14.09.2026', by: 'meet', where: 'AP State Championships, Guntur' },
    { label: '300 m time trial', value: '34.6', date: '20.10.2026', by: 'coach', where: 'Squad session, Vijayawada' },
    { label: '200 m', value: '21.94', date: '02.08.2026', by: 'meet', where: 'Velora Relays, Hyderabad' },
    { label: 'Standing long jump', value: '2.71 m', date: '11.10.2026', by: 'video', where: 'Squad test day' },
    { label: '400 m', value: '49.80', date: '18.11.2024', by: 'meet', where: 'District trials, NTR district' },
  ],
  progression: {
    labels: ['Nov 24', 'Mar 25', 'Sep 25', 'Feb 26', 'Sep 26'],
    values: [49.8, 49.1, 48.62, 48.05, 47.62],
    unit: 's',
  },
  signedBy: 'Coach Ravi Menon',
  signedOn: '21.10.2026',
};

/** Village athletes get a passport as soon as their first result is verified. */
const FROM_VILLAGES: Passport[] = RURAL_TALENT.map((r, i) => {
  const [event, pb] = r.event.split(' · ');
  return {
    id: r.id,
    number: `PL-36-${String(1201 + i * 37).padStart(4, '0')}`,
    name: r.name,
    gender: r.gender,
    origin: 'rural',
    event: `${r.gender === 'men' ? 'Men’s' : 'Women’s'} ${event}`,
    pb,
    village: r.village,
    district: r.district,
    state: r.state,
    stage: r.stage,
    devIndex: r.devIndex,
    trend: r.trend,
    discovered: r.discoveredVia,
    coach: `${r.district} district centre`,
    results: [{ label: event, value: pb, date: '2026', by: 'meet', where: `${r.district}, ${r.state}` }],
    signedBy: `${r.district} district coach`,
    signedOn: '10.2026',
  };
});

export const PASSPORTS: Passport[] = [ARJUN, ...FROM_VILLAGES];

export const passportFor = (id: string | undefined): Passport | undefined => PASSPORTS.find((p) => p.id === id);
