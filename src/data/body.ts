/**
 * Body profile for every athlete: age, height, weight, arm span and strong side, from the
 * "Height, weight, arm span" station of the test battery. Selectors use it to compare
 * athletes for an event. All values are fictional, set within typical ranges for each event
 * group, gender and age; Arjun's is written by hand.
 */
import { personOf, type Person } from './roster';

export interface BodyProfile {
  age: number;
  heightCm: number;
  weightKg: number;
  armSpanCm: number;
  /** Strong hand or leg: take-off leg for jumpers, throwing arm for throwers. */
  side: 'Right' | 'Left';
  /** Where it was measured, and when. */
  measuredAt: string;
  measuredOn: string;
}

type Group = 'sprint' | 'distance' | 'jump' | 'throw' | 'lift' | 'youth';

/** Adult ranges per event group: [height min, max] cm and [weight min, max] kg. */
const RANGES: Record<Exclude<Group, 'lift'>, Record<Person['gender'], [[number, number], [number, number]]>> = {
  sprint: { men: [[174, 186], [66, 78]], women: [[160, 172], [52, 61]] },
  distance: { men: [[167, 179], [55, 64]], women: [[155, 166], [44, 52]] },
  jump: { men: [[179, 192], [66, 76]], women: [[166, 178], [52, 60]] },
  throw: { men: [[180, 191], [84, 98]], women: [[166, 176], [68, 82]] },
  youth: { men: [[170, 180], [60, 70]], women: [[158, 168], [48, 56]] },
};

export function groupOf(event: string, sport: string): Group {
  const e = event.toLowerCase();
  if (sport === 'Weightlifting') return 'lift';
  if (/javelin|shot|discus|hammer|throw/.test(e)) return 'throw';
  if (/jump/.test(e) && !/sprint/.test(e)) return 'jump';
  if (/800|1500|5000|10,000|steeple|marathon/.test(e)) return 'distance';
  if (/sprints and jumps/.test(e)) return 'youth';
  return 'sprint';
}

/** A steady pseudo-random number in [0, 1) per athlete and field, so values never change between visits. */
function seeded(name: string, field: string) {
  let h = 2166136261;
  for (const c of name + '|' + field) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}
const within = (name: string, field: string, [lo, hi]: [number, number]) => lo + seeded(name, field) * (hi - lo);

const MEASURED: Record<Person['source'], { measuredAt: string; measuredOn: string }> = {
  squad: { measuredAt: 'Squad test day', measuredOn: '11.10.2026' },
  pilot: { measuredAt: 'Pilot test day', measuredOn: '14.10.2026' },
  rural: { measuredAt: 'District trials', measuredOn: '2026' },
  prospect: { measuredAt: 'Scouting combine', measuredOn: '2026' },
  rising: { measuredAt: 'District trials', measuredOn: '2026' },
};

const HAND_SET: Record<string, BodyProfile> = {
  'Arjun Reddy': { age: 19, heightCm: 181, weightKg: 70, armSpanCm: 186, side: 'Right', ...MEASURED.squad },
};

const CACHE = new Map<string, BodyProfile>();

function build(p: Person): BodyProfile {
  const n = p.name;
  const age = p.age ?? Math.round(17 + seeded(n, 'age') * (p.source === 'squad' ? 2.4 : 4));
  const group = groupOf(p.event, p.sport);
  let height: number;
  let weight: number;
  if (group === 'lift') {
    // The weight class sets the weight: a lifter sits just under the class limit.
    const limit = Number(p.event.match(/\d+/)?.[0] ?? 61);
    weight = limit - 0.4 - seeded(n, 'weight') * 2;
    height = within(n, 'height', p.gender === 'men' ? [152, 168] : [146, 158]) - Math.max(0, 16 - age) * 2.5;
  } else {
    const [h, w] = RANGES[group][p.gender];
    // Under 17, scale toward a child's size: about 3.5% shorter and 7% lighter per year.
    const young = Math.max(0, 17 - age);
    height = within(n, 'height', h) * (1 - young * 0.035);
    weight = within(n, 'weight', w) * (1 - young * 0.07);
  }
  const ratio = group === 'throw' ? [1.02, 1.06] : [0.99, 1.04];
  return {
    age,
    heightCm: Math.round(height),
    weightKg: Math.round(weight * 10) / 10,
    armSpanCm: Math.round(height * within(n, 'span', ratio as [number, number])),
    side: seeded(n, 'side') < 0.14 ? 'Left' : 'Right',
    ...MEASURED[p.source],
  };
}

/** Body profile by athlete id or name. The same person has the same profile on every screen. */
export function bodyOf(idOrName: string | undefined): BodyProfile | undefined {
  const found = personOf(idOrName);
  if (!found) return undefined;
  // Resolve to the first record for this name, so an athlete listed twice gets one profile.
  const p = personOf(found.name) ?? found;
  if (HAND_SET[p.name]) return HAND_SET[p.name];
  let b = CACHE.get(p.name);
  if (!b) CACHE.set(p.name, (b = build(p)));
  return b;
}

/** Ape index: arm span minus height, in cm. Positive helps throwers, swimmers and boxers. */
export const reachOf = (b: BodyProfile) => b.armSpanCm - b.heightCm;
