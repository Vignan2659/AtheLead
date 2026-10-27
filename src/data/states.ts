/**
 * Every state and union territory, so the board sees the whole country.
 * Counts are fictional demo data and sum to UNION_BY_GENDER (694 men, 554 women).
 * Tamil Nadu is the Phase 1 pilot state (athletics, 2–3 sites).
 */
export type Zone = 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East';

export interface StateRow {
  name: string;
  zone: Zone;
  /** Union territory rather than a state. */
  ut?: boolean;
  men: number;
  women: number;
  /** Share of the state's athletes from rural origins, in %. */
  ruralShare: number;
  /** Districts with at least one registered athlete. */
  districts: number;
  pilot?: boolean;
}

export const ZONES: Zone[] = ['North', 'South', 'East', 'West', 'Central', 'North-East'];

export const STATES: StateRow[] = [
  { name: 'Andhra Pradesh', zone: 'South', men: 32, women: 27, ruralShare: 61, districts: 11 },
  { name: 'Arunachal Pradesh', zone: 'North-East', men: 6, women: 5, ruralShare: 78, districts: 4 },
  { name: 'Assam', zone: 'North-East', men: 21, women: 18, ruralShare: 72, districts: 12 },
  { name: 'Bihar', zone: 'East', men: 24, women: 21, ruralShare: 74, districts: 13 },
  { name: 'Chhattisgarh', zone: 'Central', men: 16, women: 11, ruralShare: 79, districts: 9 },
  { name: 'Goa', zone: 'West', men: 5, women: 3, ruralShare: 38, districts: 2 },
  { name: 'Gujarat', zone: 'West', men: 24, women: 18, ruralShare: 49, districts: 12 },
  { name: 'Haryana', zone: 'North', men: 40, women: 29, ruralShare: 63, districts: 15 },
  { name: 'Himachal Pradesh', zone: 'North', men: 9, women: 6, ruralShare: 82, districts: 6 },
  { name: 'Jharkhand', zone: 'East', men: 28, women: 24, ruralShare: 81, districts: 14 },
  { name: 'Karnataka', zone: 'South', men: 35, women: 31, ruralShare: 52, districts: 16 },
  { name: 'Kerala', zone: 'South', men: 36, women: 32, ruralShare: 47, districts: 13 },
  { name: 'Madhya Pradesh', zone: 'Central', men: 26, women: 18, ruralShare: 70, districts: 15 },
  { name: 'Maharashtra', zone: 'West', men: 43, women: 31, ruralShare: 44, districts: 19 },
  { name: 'Manipur', zone: 'North-East', men: 17, women: 15, ruralShare: 66, districts: 7 },
  { name: 'Meghalaya', zone: 'North-East', men: 5, women: 4, ruralShare: 74, districts: 3 },
  { name: 'Mizoram', zone: 'North-East', men: 6, women: 5, ruralShare: 60, districts: 3 },
  { name: 'Nagaland', zone: 'North-East', men: 4, women: 4, ruralShare: 71, districts: 3 },
  { name: 'Odisha', zone: 'East', men: 29, women: 25, ruralShare: 75, districts: 15 },
  { name: 'Punjab', zone: 'North', men: 30, women: 22, ruralShare: 58, districts: 13 },
  { name: 'Rajasthan', zone: 'North', men: 34, women: 25, ruralShare: 73, districts: 17 },
  { name: 'Sikkim', zone: 'North-East', men: 3, women: 3, ruralShare: 80, districts: 2 },
  { name: 'Tamil Nadu', zone: 'South', men: 58, women: 51, ruralShare: 57, districts: 26, pilot: true },
  { name: 'Telangana', zone: 'South', men: 23, women: 20, ruralShare: 46, districts: 10 },
  { name: 'Tripura', zone: 'North-East', men: 5, women: 5, ruralShare: 68, districts: 3 },
  { name: 'Uttar Pradesh', zone: 'North', men: 45, women: 33, ruralShare: 69, districts: 24 },
  { name: 'Uttarakhand', zone: 'North', men: 13, women: 10, ruralShare: 76, districts: 8 },
  { name: 'West Bengal', zone: 'East', men: 27, women: 23, ruralShare: 62, districts: 14 },
  { name: 'Andaman and Nicobar Islands', zone: 'South', ut: true, men: 2, women: 1, ruralShare: 64, districts: 1 },
  { name: 'Chandigarh', zone: 'North', ut: true, men: 5, women: 3, ruralShare: 0, districts: 1 },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', zone: 'West', ut: true, men: 2, women: 1, ruralShare: 55, districts: 1 },
  { name: 'Delhi', zone: 'North', ut: true, men: 22, women: 16, ruralShare: 6, districts: 5 },
  { name: 'Jammu and Kashmir', zone: 'North', ut: true, men: 12, women: 9, ruralShare: 71, districts: 8 },
  { name: 'Ladakh', zone: 'North', ut: true, men: 2, women: 2, ruralShare: 83, districts: 2 },
  { name: 'Lakshadweep', zone: 'South', ut: true, men: 1, women: 0, ruralShare: 100, districts: 1 },
  { name: 'Puducherry', zone: 'South', ut: true, men: 4, women: 3, ruralShare: 35, districts: 2 },
];

export const stateTotal = (s: StateRow) => s.men + s.women;
