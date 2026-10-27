/**
 * Mock Sports SLM. Answers are rule-based and built from the demo data, but the
 * pipeline is the real one: access check → retrieval → answer. The access check
 * runs first, so a question outside a role's scope never reads the data.
 */
import type { SlmRole } from '../data/users';
import { SQUADS } from '../data/squad';
import { PROSPECTS } from '../data/scouting';
import { COACHES } from '../data/union';
import { STATES, ZONES } from '../data/states';
import { SCOPE, sourcesFor } from './sources';
import type { AnswerSection, SlmAnswer } from './types';

export interface AskContext {
  /** First name of the person asking; used to tell "me" from "someone else". */
  firstName?: string;
  /** Today's check-in, index into FEEL_OPTIONS. */
  feel?: number | null;
  /** Coach has approved the third endurance session. */
  tempoApplied?: boolean;
}

const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

/* ---------- Access rules ---------- */

const ATHLETE_OFF_LIMITS = ['scout', 'prospect', 'board', 'budget', 'fund', 'teammate', 'other players', 'other athletes', 'everyone else', 'selection list', 'salary'];
const COACH_OFF_LIMITS = ['budget', 'fund', 'invest', 'programme', 'salary', 'governance', 'board decision', 'other teams', 'other coaches', 'union-wide', 'whole union'];
/** Other training groups and centres in the programme: the board's view, not this coach's. */
const OTHER_TEAMS = ['guwahati', 'imphal centre', 'distance group', 'walk group', 'jumps group', 'throws group', 'other centres', 'other groups'];
const BOARD_MEDICAL = ['medical', 'diagnos', 'physio', 'medication', 'mri', 'scan', 'strain', 'sprain', 'what injury', 'which injury', 'injury detail', 'health record', 'wrong with'];

// Short first names ("Dev") collide with ordinary words ("dev index"), so they are skipped.
const firstNames = (names: string[]) => names.map((n) => norm(n.split(' ')[0])).filter((n) => n.length > 3);

/** Returns a refusal when the question reaches outside the role's scope. */
export function accessCheck(role: SlmRole, question: string, ctx: AskContext = {}): SlmAnswer | null {
  const q = norm(question);
  const words = new Set(q.split(/[^a-z]+/));
  const me = norm(ctx.firstName ?? '');

  if (role === 'athlete') {
    const people = [
      ...SQUADS.men.players.map((p) => p.name),
      ...SQUADS.women.players.map((p) => p.name),
      ...PROSPECTS.map((p) => p.name),
    ];
    const other = firstNames(people).some((n) => n !== me && words.has(n));
    if (other || has(q, ATHLETE_OFF_LIMITS)) {
      return refusal(
        role,
        'Outside your access',
        'I can only use your own profile, your logs and your coach’s plans. Other athletes’ data, scouting and board matters are private to them.',
        ['Ask about your own training, recovery or fuel', 'Ask Coach Ravi about squad decisions'],
      );
    }
  }

  if (role === 'coach') {
    const otherCoach = firstNames(COACHES.filter((c) => c.userId !== 'coach-ravi').map((c) => c.name)).some((n) => words.has(n));
    if (otherCoach || has(q, COACH_OFF_LIMITS) || has(q, OTHER_TEAMS)) {
      return refusal(
        role,
        'Outside your access',
        'I can use your Track Squad U-20 (men and women), scouting and meets. Budgets, governance and other groups are for the board.',
        ['Raise it with the board: Recommend to board on the Squad tab', 'Ask about your own squad'],
      );
    }
  }

  if (role === 'board' && has(q, BOARD_MEDICAL)) {
    return refusal(
      role,
      'Medical detail is private',
      'The board sees fitness status only: fit, managed or unavailable. Diagnoses and physio notes stay with the athlete and their coach.',
      ['Ask about fitness status by event group', 'Ask which event groups need support'],
    );
  }

  return null;
}

function refusal(role: SlmRole, title: string, intro: string, nextSteps: string[]): SlmAnswer {
  return {
    kind: 'refusal',
    title,
    intro,
    sections: [{ heading: 'What I can use', tag: 'ai', items: [SCOPE[role]] }],
    nextSteps,
    confidence: null,
    dataUsed: [],
  };
}

/* ---------- Intents ---------- */

type Builder = (ctx: AskContext) => Omit<SlmAnswer, 'kind' | 'dataUsed'> & { sources: string[] };

interface Intent {
  id: string;
  words: string[];
  build: Builder;
}

const ai = (heading: string, items: string[]): AnswerSection => ({ heading, tag: 'ai', items });
const coach = (heading: string, items: string[]): AnswerSection => ({ heading, tag: 'coach', items });

const ATHLETE_INTENTS: Intent[] = [
  {
    id: 'train',
    words: ['train', 'tomorrow', 'workout', 'session', 'exercise', 'gym', 'track', 'week'],
    build: (ctx) => ({
      title: 'Tomorrow: recovery + mobility',
      intro: 'Wednesday is a planned recovery day after today’s 3 × 300 m. Keep it easy so Friday’s 400 m race simulation is sharp.',
      sections: [
        coach('Coach Ravi’s plan', ['Pool walk, 20 min', 'Hip mobility flow, 15 min', 'Ice bath, 10 min']),
        ai('SLM suggestion', [
          ctx.feel !== null && ctx.feel !== undefined && ctx.feel <= 1
            ? 'You logged sore today: add 10 min of foam rolling on calves and hamstrings'
            : 'Add 10 min of easy cycling if you feel fresh',
          'Your band showed 6.9 h sleep last night: lights out by 22:00',
        ]),
      ],
      nextSteps: ['Check in tomorrow morning', ctx.tempoApplied ? 'Tempo 6 × 200 m is on Saturday 06:30' : 'Saturday: mobility + yoga'],
      confidence: 88,
      sources: ['Training logs', 'Coach plans', 'Daily check-ins'],
    }),
  },
  {
    id: 'injury',
    words: ['injur', 'risk', 'sore', 'pain', 'hurt', 'hamstring', 'acwr', 'load'],
    build: (ctx) => ({
      title: 'Low risk, keep an eye on load',
      intro: 'Your ACWR is 1.18, inside the safe 0.8–1.3 band. Speed-endurance volume is up 15% this block, so the hamstrings need care.',
      sections: [
        ai('Watch for', ['Hamstring tightness at top speed: stop and tell Coach Ravi', 'Two sore check-ins this fortnight']),
        coach('Already in your plan', ['Nordic curls twice a week', 'Full recovery between 300s', 'Recovery day Wednesday']),
      ],
      nextSteps: [ctx.feel === null || ctx.feel === undefined ? 'Do your morning check-in so your coach sees readiness' : 'Your check-in is shared with Coach Ravi', 'Open Train for each exercise’s safety notes'],
      confidence: 84,
      sources: ['Training logs', 'Daily check-ins', 'Performance tests'],
    }),
  },
  {
    id: 'pathway',
    words: ['2036', 'olymp', 'camp', 'national', 'select', 'pathway', 'gate', 'reach', 'improve'],
    build: () => ({
      title: '4 points from the national camp gate',
      intro: 'Your development index is 71; the men’s U-20 national camp gate is 75. At your current rate (+4 in 8 weeks) you reach it by January, before the February 2027 trials.',
      sections: [
        ai('Biggest gains', ['400 m PB 47.62: sub-47.2 moves you up a band', 'Last-100 m drop-off 1.6 s → 1.2 s', 'Consistency is already your strength (88)']),
        coach('Coach Ravi’s focus', ['Strength block, week 3 of 4', 'Speed endurance: 300 m repeats at 92%']),
      ],
      nextSteps: ['Keep completion above 90%', 'U-20 Nationals from 03.11: selectors attend'],
      confidence: 81,
      sources: ['Athlete profile', 'Performance tests', 'Training logs'],
    }),
  },
  {
    id: 'fuel',
    words: ['eat', 'before training', 'before the race', 'food', 'diet', 'meal', 'protein', 'fuel', 'drink', 'water', 'nutrition', 'breakfast'],
    build: () => ({
      title: 'Before training: carbs, light protein',
      intro: 'Eat 2–3 hours before the track. Your sample plan has poha and lassi at 09:30. No peanuts: you are allergic.',
      sections: [
        ai('Good choices', ['Poha (no peanuts) or idli with sambar', 'Banana and a glass of lassi', '500 ml water with a pinch of salt']),
        ai('Avoid before speed work', ['Fried snacks', 'Heavy paneer or meat dishes']),
      ],
      nextSteps: ['Log meals on the Fuel tab', 'Race-week targets: 3,050 kcal'],
      confidence: 79,
      sources: ['Nutrition', 'Athlete profile'],
    }),
  },
  {
    id: 'progress',
    words: ['speed', 'progress', 'stats', '300', 'time trial', 'strength', 'faster', 'better', 'trend', 'changed', 'fitness'],
    build: () => ({
      title: '300 m trial 1.2 s faster in 8 weeks',
      intro: 'Your 300 m time trial went from 37.9 to 36.7 s. GPS top speed rose from 33.1 to 34.6 km/h and trap-bar 4RM from 130 to 145 kg.',
      sections: [ai('What drove it', ['Strength block: +15 kg on the trap bar', 'Block starts: 30 m split 4.21 → 4.12 s', 'Completion 92%'])],
      nextSteps: ['See the full trends on Stats', 'Next time trial 30.10'],
      confidence: 90,
      sources: ['Performance tests', 'Training logs'],
    }),
  },
  {
    id: 'match',
    words: ['race', 'meet', 'nationals', 'bhubaneswar', 'heats', 'competition', 'fixture'],
    build: () => ({
      title: 'U-20 Nationals start 03.11',
      intro: 'Men’s 400 m heats in Bhubaneswar, 09:30. Semi-final 04.11, final 05.11. You travel 01.11 by train.',
      sections: [
        coach('Squad plan', ['Build to 25.10, peak to 30.10, taper to 02.11', '300 m time trial 30.10 picks the 4 × 400 m']),
        ai('For you', ['Heats are at 09:30: practise two morning race simulations', 'First 200 m at 22.6 s, then hold form']),
      ],
      nextSteps: ['Friday: 400 m race simulation', 'Pack electrolytes: 30 °C and humid in Bhubaneswar'],
      confidence: 85,
      sources: ['Fixtures', 'Coach plans'],
    }),
  },
];

const COACH_INTENTS: Intent[] = [
  {
    id: 'risk',
    words: ['injur', 'risk', 'acwr', 'load', 'fatigue', 'hamstring', 'rest'],
    build: () => ({
      title: 'Two at risk, one injured',
      intro: 'Men: Yash Malhotra (400 m hurdles) is at ACWR 1.46 with two hamstring-tightness reports. Women: Riya Thakur (400 m) is at 1.38 after two heavy weeks.',
      sections: [
        ai('Act this week', ['Yash: no hurdle reps, flat 150s instead', 'Riya: swap Wednesday’s 150s for recovery', 'Aditya Rao: elbow strain, back 08.11 at the earliest; withdraw the javelin entry']),
        ai('Safe', ['Arjun 1.18, Harsh 1.12, Anjali 1.05: room for load']),
      ],
      nextSteps: ['Approve the caps on the Squad tab', 'Recheck ACWR after Friday’s race simulation'],
      confidence: 87,
      sources: ['Training logs', 'Medical notes', 'Daily check-ins'],
    }),
  },
  {
    id: 'plan',
    words: ['plan', '14-day', '14 day', 'nationals', 'meet', 'taper', 'peak', 'prepare'],
    build: () => ({
      title: '14-day plan for the U-20 Nationals',
      intro: 'Build 20–25.10, peak 26–30.10, taper 31.10–02.11. Men’s 400 m heats 03.11 in Bhubaneswar.',
      sections: [
        ai('Workload', ['400 m group: max 3 × 300 m in Build, 2 × 200 m in Taper', 'Yash: no hurdle reps until ACWR < 1.3']),
        ai('Recovery and fuel', ['Ice bath after every speed-endurance session', 'Carbs up 31.10 – 02.11']),
        ai('Race prep', ['Two morning race simulations for the 09:30 heats', '300 m time trial 30.10 picks the 4 × 400 m']),
      ],
      nextSteps: ['Open Fixtures → Generate 14-day plan to apply and share it'],
      confidence: 84,
      sources: ['Fixtures', 'Training logs', 'Performance tests'],
    }),
  },
  {
    id: 'scout',
    words: ['scout', '400 m', 'relay', 'prospect', 'recruit', 'talent', 'find', 'depth'],
    build: () => ({
      title: '400 m runners for the relay pool',
      intro: 'Your men’s 4 × 400 m pool is one runner short. Two strong rural options came through district trials.',
      sections: [
        ai('Ranked', ['Zaheer Ansari, 19, Adoni (Kurnool): 48.10 on cinder, fit 94, confidence 89%', 'Lalit Oraon, Simdega (Jharkhand): 48.05, dev index 82', 'Women’s 800 m: Lalitha Gowda, 18, Malavalli (Mandya): 2:08.9, fit 93']),
        ai('Watch-outs', ['Zaheer: slow out of the blocks (0.19 s)', 'Lalitha: first season of structured training']),
      ],
      nextSteps: ['Shortlist on the Scout tab', 'Invite Zaheer to the 30.10 time trial'],
      confidence: 89,
      sources: ['Scouting reports', 'Performance tests'],
    }),
  },
  {
    id: 'camp',
    words: ['camp', '2036', 'olymp', 'closest', 'national camp', 'pathway', 'board'],
    build: () => ({
      title: 'Arjun and Anjali are closest',
      intro: 'Arjun Reddy (men’s 400 m, dev 71) and Anjali Munda (women’s 800 m, dev 74) are nearest the national camp gate of 75. Both are rural athletes found at district trials.',
      sections: [ai('To close the gap', ['Arjun: last-100 m drop-off and block starts', 'Anjali: strength block, twice a week'])],
      nextSteps: ['Recommend them to the board from the Squad tab'],
      confidence: 82,
      sources: ['Performance tests', 'Athlete profile'],
    }),
  },
  {
    id: 'support',
    words: ['support', 'women', 'struggl', 'consisten', 'miss', 'help', 'behind'],
    build: () => ({
      title: 'Fatima and Nikhil need support',
      intro: 'Fatima Shaikh (women’s long jump) is at 58% completion with board exams this month. Nikhil Varma (men’s 1500 m) is at 61% with three missed sessions.',
      sections: [
        ai('Suggested', ['Fatima: 25-min home routine, no equipment, until 20.11', 'Nikhil: shorter 40-min sessions and two check-ins a week']),
        ai('Why', ['Both are rural athletes with long travel to the track']),
      ],
      nextSteps: ['Apply the plan changes on the Squad tab', 'Assign the Village home routine on Train'],
      confidence: 80,
      sources: ['Training logs', 'Daily check-ins', 'Athlete profile'],
    }),
  },
];

const BOARD_INTENTS: Intent[] = [
  {
    id: 'invest',
    words: ['invest', 'fund', 'budget', 'spend', 'programme', 'money'],
    build: () => ({
      title: 'Invest in district trials first',
      intro: 'Rural athletes are 58% of grassroots but only 22% of the Olympic core. The gap opens before anyone is timed.',
      sections: [
        ai('Ranked by impact', ['District trials in 40 more districts: ₹1.8 cr, ~6,000 screened', 'Travel support for rural athletes: ₹45 lakh, 214 athletes', 'Fitness bands for 500 pathway athletes: ₹15 lakh']),
        ai('Gender', ['Women’s middle distance has the best form (88) and the highest rural share; hostels there have the best return per rupee']),
      ],
      nextSteps: ['Review the programmes on the SLM tab', 'Approve or send back each one'],
      confidence: 83,
      sources: ['Union aggregates', 'Programmes and budget', 'Talent pipeline'],
    }),
  },
  {
    id: 'teams',
    words: ['team', 'group', 'support', 'struggl', 'form', 'worst', 'weak'],
    build: () => ({
      title: 'Race walk and women’s jumps need support',
      intro: 'Men’s race walk has the lowest form at 63. Women’s jumps are at 68 with two take-off injuries.',
      sections: [
        ai('Suggested', ['Race walk: technique review; enter only U-18s at the State meet', 'Women’s jumps: a sprung runway at the Chennai centre']),
        ai('Strongest', ['Women: middle distance 88, sprints 86', 'Men: sprints 84']),
      ],
      nextSteps: ['See Teams for form and fitness status by gender'],
      confidence: 85,
      sources: ['Union aggregates', 'Fitness status'],
    }),
  },
  {
    id: 'regions',
    words: ['state', 'region', 'zone', 'north-east', 'north east', 'tamil', 'across india', 'all india', 'country', 'nation-wide', 'nationwide'],
    build: () => {
      const perDistrict = (s: (typeof STATES)[number]) => (s.men + s.women) / s.districts;
      const thin = STATES.filter((s) => !s.ut).sort((a, b) => perDistrict(a) - perDistrict(b)).slice(0, 4);
      const zones = ZONES.map((z) => {
        const rows = STATES.filter((s) => s.zone === z);
        return { z, men: rows.reduce((a, s) => a + s.men, 0), women: rows.reduce((a, s) => a + s.women, 0) };
      });
      const pilot = STATES.find((s) => s.pilot)!;
      return {
        title: `Trials reach least in ${thin[0].name} and ${thin[1].name}`,
        intro: `Athletes come from all ${STATES.length} states and UTs. Ranked by athletes per district, these states are the thinnest, so a trial there finds the most new talent.`,
        sections: [
          ai('Thinnest per district', thin.map((s) => `${s.name}: ${s.men + s.women} athletes in ${s.districts} districts, ${s.ruralShare}% rural`)),
          ai('By zone · men / women', zones.map((z) => `${z.z}: ${z.men} men, ${z.women} women`)),
          ai('Pilot', [`${pilot.name}: ${pilot.men} men, ${pilot.women} women across ${pilot.districts} districts`]),
        ],
        nextSteps: ['Add these states to the district trials programme', 'See Across India on Talent'],
        confidence: 83,
        sources: ['Union aggregates', 'Talent pipeline'],
      };
    },
  },
  {
    id: 'rural',
    words: ['rural', 'village', 'district', 'reach', 'gender', 'women', 'inclusion'],
    build: () => ({
      title: 'Rural reach drops along the pathway',
      intro: 'Rural share is 58% at grassroots, 44% at State and 22% in the Olympic core. Rural retention is 84% against 93% urban.',
      sections: [
        ai('Where it drops', ['State → national camp: 44% → 31%', 'Travel cost is the top reason for missed trials']),
        ai('Women', ['554 women, 694 men. Women lead form in middle distance and sprints']),
      ],
      nextSteps: ['Fund travel support', 'Invite rural risers to trials from Talent'],
      confidence: 86,
      sources: ['Union aggregates', 'Talent pipeline'],
    }),
  },
  {
    id: 'events',
    words: ['event', 'meet', 'calendar', 'compet', 'enter', 'priorit'],
    build: () => ({
      title: 'Prioritise the U-20 Nationals and Barmer trials',
      intro: 'The U-20 Nationals (03–06.11) and the Barmer cross-country trials (18.11) carry the most selection value this season.',
      sections: [ai('Lower priority', ['Velora Relays: rest the Nationals 400 m squad', 'State race walk: enter U-18s only'])],
      nextSteps: ['See Events for the full ranked calendar'],
      confidence: 82,
      sources: ['Fixtures', 'Talent pipeline'],
    }),
  },
  {
    id: 'coaches',
    words: ['coach', 'staff', 'best', 'perform', 'retention'],
    build: () => ({
      title: 'Lakshmi Rao leads on development',
      intro: 'Ranked by average development-index gain per athlete over six months.',
      sections: [ai('Top three', ['Lakshmi Rao, middle distance: +7.4, retention 96%', 'Priya Nair, jumps: +6.8', 'Harjit Singh, long distance: +6.5, 74% rural']), ai('Needs support', ['Arun Kumar, Guwahati sprints: +2.4, retention 79%'])],
      nextSteps: ['Pair Arun with Ravi Menon’s sprint group for one block'],
      confidence: 80,
      sources: ['Union aggregates'],
    }),
  },
];

const INTENTS: Record<SlmRole, Intent[]> = { athlete: ATHLETE_INTENTS, coach: COACH_INTENTS, board: BOARD_INTENTS };

/** Best-matching intent by keyword hits; ties go to the first listed. */
export function matchIntent(role: SlmRole, question: string): Intent | null {
  const q = norm(question);
  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS[role]) {
    const score = intent.words.reduce((n, w) => n + (q.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best;
}

export function askSlm(role: SlmRole, question: string, ctx: AskContext = {}): SlmAnswer {
  const blocked = accessCheck(role, question, ctx);
  if (blocked) return blocked;

  const allowed = new Set(sourcesFor(role).map((s) => s.label));
  const intent = matchIntent(role, question);
  if (!intent) {
    return {
      kind: 'answer',
      title: 'Try one of these',
      intro: `I answer questions about ${SCOPE[role].charAt(0).toLowerCase()}${SCOPE[role].slice(1)}`,
      sections: [],
      nextSteps: [],
      confidence: null,
      dataUsed: [],
    };
  }
  const { sources, ...rest } = intent.build(ctx);
  // Retrieval only ever touches sources the role may read.
  return { kind: 'answer', ...rest, dataUsed: sources.filter((s) => allowed.has(s)) };
}
