/**
 * Who plays what: every athlete's sport and event, by name and by id, drawn from the squad,
 * scouting, rural talent, rising list, Tamil Nadu pilot and passports. Screens use it to put the
 * sport right beside an athlete's name.
 */
import { PILOT_ATHLETES } from './pilot';
import { PROSPECTS } from './scouting';
import { RURAL_TALENT } from './inclusion';
import { RISING } from './board';
import { SQUADS } from './squad';
import { DEMO_USERS } from './users';

export interface SportInfo {
  sport: string;
  /** Event or weight class, without the mark: "400 m hurdles", "55 kg youth". */
  event: string;
}

/** "400 m hurdles · PB 52.10" → "400 m hurdles"; "1500 m · 4:21.6" → "1500 m". */
export const eventOf = (text: string) => text.split(' · ')[0].trim();

const BY_NAME = new Map<string, SportInfo>();
const BY_ID = new Map<string, SportInfo>();

function add(id: string, name: string, info: SportInfo) {
  // The first source wins, so the squad's event stays the reference for squad athletes.
  if (!BY_NAME.has(name)) BY_NAME.set(name, info);
  if (!BY_ID.has(id)) BY_ID.set(id, info);
}

// Track Squad U-20 is an athletics squad.
for (const squad of Object.values(SQUADS))
  for (const p of squad.players) {
    const info = { sport: 'Athletics', event: eventOf(p.position) };
    add(p.id, p.name, info);
    if (p.userId) BY_ID.set(p.userId, info);
  }
for (const a of PILOT_ATHLETES) add(a.id, a.name, { sport: a.sport, event: a.event });
for (const r of RURAL_TALENT) add(r.id, r.name, { sport: r.sport, event: eventOf(r.event) });
for (const p of PROSPECTS) add(p.id, p.name, { sport: 'Athletics', event: eventOf(p.role) });
for (const list of Object.values(RISING)) for (const r of list) add(r.id, r.name, { sport: 'Athletics', event: eventOf(r.sport) });
// Athlete accounts resolve through their squad record.
for (const u of DEMO_USERS) if (u.role === 'athlete' && BY_ID.has(u.id)) BY_NAME.set(u.name, BY_ID.get(u.id)!);

/** Sport and event for an athlete, by id (squad, pilot, user) or full name. */
export function sportOf(idOrName: string | undefined): SportInfo | undefined {
  if (!idOrName) return undefined;
  return BY_ID.get(idOrName) ?? BY_NAME.get(idOrName);
}

/** Every athlete the app names, for tests. */
export const ROSTER_NAMES = [...BY_NAME.keys()];
