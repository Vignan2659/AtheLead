/**
 * Mission 2036 — the north star. India is bidding to host the 2036 Olympic
 * Games; every athlete, coach and board view tracks progress towards it.
 * Dates are TBC, so countdowns use a placeholder mid-2036 reference.
 */
export const GAMES_2036 = {
  name: 'Olympic Games 2036',
  host: 'India',
  reference: new Date('2036-07-01T00:00:00+05:30'),
};

export const PATHWAY_STAGES = ['Grassroots', 'District', 'State', 'National camp', 'Olympic core'] as const;
export type PathwayStage = (typeof PATHWAY_STAGES)[number];

/** Whole years and months until the 2036 reference date. */
export function timeTo2036(now = new Date()): { years: number; months: number } {
  let months =
    (GAMES_2036.reference.getFullYear() - now.getFullYear()) * 12 +
    (GAMES_2036.reference.getMonth() - now.getMonth());
  if (months < 0) months = 0;
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** Arjun's place on the pathway. Stage is an index into PATHWAY_STAGES. */
export const ATHLETE_PATHWAY = {
  stage: 2,
  devIndex: 71,
  devDelta: 4,
  nextGateIndex: 75,
  nextStep: 'National camp trials · Feb 2027',
};

/** Track Squad U-20 men by pathway stage. */
export const SQUAD_PATHWAY = {
  counts: [0, 3, 7, 2, 0],
  closest: { name: 'Arjun Reddy', devIndex: 71, gate: 75 },
};

/** Union-wide funnel towards the 2036 Olympic core. */
export const UNION_PATHWAY = {
  counts: [1248, 520, 214, 61, 9],
  target2036: 40,
};
