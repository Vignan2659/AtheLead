export type Role = 'athlete' | 'coach' | 'board' | 'guardian' | 'district';
/** Roles with a Sports SLM chat. Guardians and district officers work from their own screens. */
export type SlmRole = 'athlete' | 'coach' | 'board';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  /** Ten-digit Indian mobile for OTP sign-in. */
  phone?: string;
  role: Role;
  initials: string;
  teamId?: string;
  /** Guardian: the pilot athletes this account is linked to. */
  childIds?: string[];
  /** District officer: the district they review. */
  district?: string;
}

export const DEMO_PASSWORD = 'demo1234';
/** Demo SMS code. A real build sends a one-time code through the SMS provider. */
export const DEMO_OTP = '246810';

export const DEMO_USERS: User[] = [
  {
    id: 'ath-arjun',
    phone: '9848012345',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@velora.demo',
    password: DEMO_PASSWORD,
    role: 'athlete',
    initials: 'AR',
    teamId: 'track-u20',
  },
  {
    id: 'coach-ravi',
    phone: '9840023456',
    name: 'Ravi Menon',
    email: 'ravi.menon@velora.demo',
    password: DEMO_PASSWORD,
    role: 'coach',
    initials: 'RM',
    teamId: 'track-u20',
  },
  {
    id: 'board-meera',
    phone: '9820034567',
    name: 'Meera Iyer',
    email: 'meera.iyer@velora.demo',
    password: DEMO_PASSWORD,
    role: 'board',
    initials: 'MI',
  },
  {
    id: 'grd-lakshmi',
    phone: '9443045678',
    name: 'Lakshmi Murugan',
    email: 'lakshmi.murugan@velora.demo',
    password: DEMO_PASSWORD,
    role: 'guardian',
    initials: 'LM',
    childIds: ['pa-kavin', 'pa-nila'],
  },
  {
    id: 'dist-senthil',
    phone: '9445056789',
    name: 'Senthil Kumar',
    email: 'senthil.kumar@velora.demo',
    password: DEMO_PASSWORD,
    role: 'district',
    initials: 'SK',
    district: 'Madurai',
  },
];

export const ROLES: Role[] = ['athlete', 'coach', 'guardian', 'district', 'board'];
export const SLM_ROLES: SlmRole[] = ['athlete', 'coach', 'board'];
/** Roles that sign up from the app; district officers and the board are invited. */
export const OPEN_ROLES: Role[] = ['athlete', 'coach', 'guardian'];

export const ROLE_META: Record<Role, { label: string; blurb: string; home: string; demoEmail: string }> = {
  athlete: { label: 'Athlete', blurb: 'Train & fuel', home: '/athlete/today', demoEmail: 'arjun.reddy@velora.demo' },
  coach: { label: 'Coach', blurb: 'Squad & scouting', home: '/coach/squad', demoEmail: 'ravi.menon@velora.demo' },
  board: { label: 'Board', blurb: 'Whole union', home: '/board/home', demoEmail: 'meera.iyer@velora.demo' },
  guardian: { label: 'Guardian', blurb: 'Your child & consent', home: '/guardian/child', demoEmail: 'lakshmi.murugan@velora.demo' },
  district: { label: 'District officer', blurb: 'Flags & trials', home: '/district/flags', demoEmail: 'senthil.kumar@velora.demo' },
};

export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
