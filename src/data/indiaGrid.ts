/**
 * Tile map of India: one square per state or UT, placed roughly where it sits
 * on the map so every state is the same size and tappable on a phone.
 * [column, row, short code]. Grid is 8 × 9.
 */
export const INDIA_GRID: Record<string, [number, number, string]> = {
  'Jammu and Kashmir': [2, 0, 'JK'],
  Ladakh: [3, 0, 'LA'],
  Punjab: [1, 1, 'PB'],
  Chandigarh: [2, 1, 'CH'],
  'Himachal Pradesh': [3, 1, 'HP'],
  Haryana: [1, 2, 'HR'],
  Delhi: [2, 2, 'DL'],
  Uttarakhand: [3, 2, 'UK'],
  Rajasthan: [1, 3, 'RJ'],
  'Uttar Pradesh': [2, 3, 'UP'],
  Bihar: [3, 3, 'BR'],
  Sikkim: [4, 3, 'SK'],
  'Arunachal Pradesh': [7, 3, 'AR'],
  Gujarat: [0, 4, 'GJ'],
  'Madhya Pradesh': [1, 4, 'MP'],
  Chhattisgarh: [2, 4, 'CG'],
  Jharkhand: [3, 4, 'JH'],
  'West Bengal': [4, 4, 'WB'],
  Meghalaya: [5, 4, 'ML'],
  Assam: [6, 4, 'AS'],
  Nagaland: [7, 4, 'NL'],
  'Dadra and Nagar Haveli and Daman and Diu': [0, 5, 'DD'],
  Maharashtra: [1, 5, 'MH'],
  Telangana: [2, 5, 'TG'],
  Odisha: [3, 5, 'OD'],
  Tripura: [5, 5, 'TR'],
  Mizoram: [6, 5, 'MZ'],
  Manipur: [7, 5, 'MN'],
  Goa: [0, 6, 'GA'],
  Karnataka: [1, 6, 'KA'],
  'Andhra Pradesh': [2, 6, 'AP'],
  Kerala: [1, 7, 'KL'],
  'Tamil Nadu': [2, 7, 'TN'],
  Puducherry: [3, 7, 'PY'],
  Lakshadweep: [0, 8, 'LD'],
  'Andaman and Nicobar Islands': [5, 8, 'AN'],
};
export const GRID_COLS = 8;
export const GRID_ROWS = 9;
