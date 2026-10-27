/** Arjun's history: eight weeks and six months, plus his profile against the squad. */

export interface Series {
  id: string;
  label: string;
  unit: string;
  /** Higher is better unless false. */
  higherIsBetter?: boolean;
  decimals: number;
  weekly: number[];
  monthly: number[];
}

export const WEEK_LABELS = ['31.08', '07.09', '14.09', '21.09', '28.09', '05.10', '12.10', '19.10'];
export const MONTH_LABELS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const SERIES: Series[] = [
  { id: 'dev', label: 'Development index', unit: '', decimals: 0, weekly: [61, 63, 64, 66, 67, 68, 70, 71], monthly: [52, 55, 58, 62, 67, 71] },
  { id: 'split', label: '300 m time trial', unit: 's', higherIsBetter: false, decimals: 1, weekly: [37.9, 37.7, 37.6, 37.4, 37.2, 37.0, 36.8, 36.7], monthly: [38.9, 38.6, 38.2, 37.8, 37.2, 36.7] },
  { id: 'speed', label: 'Top speed (GPS)', unit: 'km/h', decimals: 1, weekly: [33.1, 33.3, 33.4, 33.7, 33.9, 34.1, 34.4, 34.6], monthly: [32.0, 32.4, 32.9, 33.4, 33.9, 34.6] },
  { id: 'cmj', label: 'Countermovement jump', unit: 'cm', decimals: 0, weekly: [52, 52, 53, 54, 54, 55, 56, 57], monthly: [48, 49, 51, 52, 54, 57] },
  { id: 'trapbar', label: 'Trap-bar 4RM', unit: 'kg', decimals: 0, weekly: [130, 132.5, 135, 135, 137.5, 140, 142.5, 145], monthly: [115, 120, 125, 130, 137.5, 145] },
  { id: 'load', label: 'Training load', unit: 'AU', decimals: 0, weekly: [2140, 2260, 2380, 2310, 2450, 2520, 2390, 2480], monthly: [8200, 8900, 9300, 9600, 9800, 9900] },
];

export const BODY = { weightKg: 70.4, weightDelta: 0.8, bodyFat: 8.9, bodyFatDelta: -0.7 };

export const ADHERENCE = { training: 92, nutrition: 81, sleepHrs: 7.4 };

/** Profile vs Track Squad U-20 men's average, 0–100. */
export const RADAR_AXES = ['Strength', 'Speed', 'Speed endurance', 'Technique', 'Recovery', 'Consistency'];
export const RADAR_ATHLETE = [78, 74, 82, 70, 66, 88];
export const RADAR_SQUAD = [70, 72, 68, 73, 70, 76];
