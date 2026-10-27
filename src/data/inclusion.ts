/**
 * Gender sections and rural reach. Olympic events are gender-split, so
 * selectors compare men and women separately. Origin tracks how far the
 * union reaches beyond the cities. All people and places here are fictional
 * demo data, though the districts are real.
 */
export type Gender = 'men' | 'women';
export type Origin = 'rural' | 'urban';

export const GENDERS: { value: Gender; label: string }[] = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
];

/** Union headcount by gender (sums to 1,248). */
export const UNION_BY_GENDER: Record<Gender, number> = { men: 694, women: 554 };

/** Pathway funnel per gender, aligned with PATHWAY_STAGES. Totals match UNION_PATHWAY. */
export const PATHWAY_BY_GENDER: Record<Gender, number[]> = {
  men: [694, 291, 121, 34, 5],
  women: [554, 229, 93, 27, 4],
};

/** Share of athletes from rural origins at each pathway stage, in %. */
export const RURAL_SHARE_BY_STAGE = [58, 52, 44, 31, 22];

/** Olympic-core target for 2036, by gender (sums to 40). */
export const TARGET_2036_BY_GENDER: Record<Gender, number> = { men: 20, women: 20 };

export interface RuralTalent {
  id: string;
  name: string;
  gender: Gender;
  sport: string;
  event: string;
  village: string;
  district: string;
  state: string;
  devIndex: number;
  trend: number;
  discoveredVia: string;
  stage: number;
}

/** Village athletes found through district trials, now on the pathway. */
export const RURAL_TALENT: RuralTalent[] = [
  { id: 'rt-sunita', name: 'Sunita Meena', gender: 'women', sport: 'Athletics', event: '1500 m · 4:21.6', village: 'Sindhari', district: 'Barmer', state: 'Rajasthan', devIndex: 86, trend: 9, discoveredVia: 'District trials · Jan 2026', stage: 2 },
  { id: 'rt-ramesh', name: 'Ramesh Gond', gender: 'men', sport: 'Athletics', event: 'Steeplechase · 8:54.2', village: 'Kanker', district: 'Kanker', state: 'Chhattisgarh', devIndex: 84, trend: 7, discoveredVia: 'Coach referral', stage: 2 },
  { id: 'rt-pooja', name: 'Pooja Dahiya', gender: 'women', sport: 'Athletics', event: 'Shot put · 14.82 m', village: 'Kharkhoda', district: 'Sonipat', state: 'Haryana', devIndex: 89, trend: 6, discoveredVia: 'School meet', stage: 3 },
  { id: 'rt-lalit', name: 'Lalit Oraon', gender: 'men', sport: 'Athletics', event: '400 m · 48.05', village: 'Simdega', district: 'Simdega', state: 'Jharkhand', devIndex: 82, trend: 8, discoveredVia: 'School league', stage: 2 },
  { id: 'rt-kavya', name: 'Kavya Naik', gender: 'women', sport: 'Athletics', event: '100 m · 12.02', village: 'Ankola', district: 'Uttara Kannada', state: 'Karnataka', devIndex: 80, trend: 11, discoveredVia: 'District trials · Mar 2026', stage: 1 },
  { id: 'rt-muthu', name: 'Muthulakshmi Selvaraj', gender: 'women', sport: 'Athletics', event: '400 m · 55.40', village: 'Usilampatti', district: 'Madurai', state: 'Tamil Nadu', devIndex: 83, trend: 10, discoveredVia: 'Tamil Nadu pilot trials · Sep 2026', stage: 2 },
  { id: 'rt-karthik', name: 'Karthikeyan Murugan', gender: 'men', sport: 'Athletics', event: 'Triple jump · 15.48 m', village: 'Kovilpatti', district: 'Thoothukudi', state: 'Tamil Nadu', devIndex: 80, trend: 9, discoveredVia: 'Sports hostel trials', stage: 1 },
  { id: 'rt-lalrin', name: 'Lalrinpuii Ralte', gender: 'women', sport: 'Athletics', event: '5000 m · 16:48', village: 'Champhai', district: 'Champhai', state: 'Mizoram', devIndex: 79, trend: 8, discoveredVia: 'North-East open trials', stage: 1 },
  { id: 'rt-bhim', name: 'Bhim Thapa', gender: 'men', sport: 'Athletics', event: '10,000 m · 30:12', village: 'Majuli', district: 'Majuli', state: 'Assam', devIndex: 81, trend: 5, discoveredVia: 'Coach referral', stage: 2 },
];
